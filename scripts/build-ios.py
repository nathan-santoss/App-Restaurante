"""Compilo no macOS e empacoto um IPA de dispositivo para assinatura posterior."""

import json
import os
import plistlib
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


def exigir(condicao, mensagem):
    # Interrompo o build no ponto da falha para impedir a publicação de um IPA incompleto.
    if not condicao:
        raise RuntimeError(mensagem)


def executar(argumentos):
    print("+ " + " ".join(map(str, argumentos)), flush=True)
    return subprocess.check_output(argumentos, text=True).strip()


def unico(candidatos, descricao):
    # Recuso escolhas ambíguas em vez de adivinhar workspace, scheme ou produto.
    encontrados = list(candidatos)
    exigir(len(encontrados) == 1, descricao + ": esperava um resultado; encontrei " + str(encontrados))
    return encontrados[0]


def referencia_app(scheme, projeto):
    referencias = ET.parse(scheme).findall(".//BuildableReference")
    def pertence_ao_app(referencia):
        if not referencia.get("BuildableName", "").endswith(".app"):
            return False
        return referencia.get("ReferencedContainer") == "container:" + projeto.name
    return next(filter(pertence_ao_app, referencias), None)


def compilar(argumentos, log):
    # Registro a saída do Xcode no console e no arquivo usado para investigar possíveis erros.
    with log.open("w", encoding="utf-8") as arquivo:
        processo = subprocess.Popen(argumentos, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        while True:
            linha = processo.stdout.readline()
            if not linha:
                break
            print(linha, end="", flush=True)
            arquivo.write(linha)
        codigo = processo.wait()
    exigir(codigo == 0, "xcodebuild falhou; consulte build.log. Código: " + str(codigo))


def principal():
    exigir(sys.platform == "darwin", "Execute este script no runner macOS, onde existe Xcode.")
    raiz = Path(__file__).resolve().parent.parent
    os.chdir(raiz)
    destino = raiz / "build" / "ios-unsigned"
    destino.mkdir(parents=True, exist_ok=True)
    derivados = destino / "DerivedData"
    config = json.loads((raiz / "app.json").read_text(encoding="utf-8"))["expo"]
    bundle_id = config["ios"]["bundleIdentifier"]
    exigir(re.fullmatch(r"[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+", bundle_id), "Bundle identifier inválido.")

    # Descubro apenas os projetos da raiz de ios, evitando o projeto interno dos Pods.
    workspace = unico((raiz / "ios").glob("*.xcworkspace"), "Workspace")
    projeto = unico((raiz / "ios").glob("*.xcodeproj"), "Projeto")
    schemes = (projeto / "xcshareddata" / "xcschemes").glob("*.xcscheme")
    scheme_file = unico(filter(lambda item: referencia_app(item, projeto) is not None, schemes), "Scheme do aplicativo")
    scheme = scheme_file.stem
    alvo = referencia_app(scheme_file, projeto).get("BlueprintName")
    lista = json.loads(executar(["xcodebuild", "-list", "-json", "-workspace", str(workspace)]))
    exigir(scheme in lista["workspace"]["schemes"], "Scheme não disponível no workspace.")
    print("Workspace:", workspace)
    print("Projeto:", projeto)
    print("Scheme:", scheme)

    # Seleciono Release para incorporar o JavaScript e funcionar sem servidor Metro ou Expo Go.
    opcoes = [
        "xcodebuild", "-workspace", str(workspace), "-scheme", scheme,
        "-configuration", "Release", "-sdk", "iphoneos",
        "-destination", "generic/platform=iOS", "-derivedDataPath", str(derivados),
        "ARCHS=arm64", "ONLY_ACTIVE_ARCH=NO",
        "CODE_SIGNING_ALLOWED=NO", "CODE_SIGNING_REQUIRED=NO",
        "CODE_SIGN_IDENTITY=", "DEVELOPMENT_TEAM=",
    ]
    ajustes = json.loads(executar(opcoes + ["-showBuildSettings", "-json"]))
    def eh_aplicativo(item):
        if item.get("target") != alvo:
            return False
        return item["buildSettings"].get("WRAPPER_EXTENSION") == "app"
    parametros = unico(filter(eh_aplicativo, ajustes), "Configuração do aplicativo")["buildSettings"]
    exigir(parametros["PRODUCT_BUNDLE_IDENTIFIER"] == bundle_id, "Expo e Xcode usam identificadores diferentes.")
    app = Path(parametros["TARGET_BUILD_DIR"]) / parametros["FULL_PRODUCT_NAME"]
    exigir(app.resolve().is_relative_to(derivados.resolve()), "Produto fora da pasta de build.")
    exigir(app.suffix == ".app", "O produto selecionado não é um aplicativo.")
    print("Produto:", app.name)
    print("Caminho do .app:", app)
    compilar(opcoes + ["build"], destino / "build.log")

    # Verifico o bundle e o executável antes de montar a estrutura Payload.
    exigir(app.is_dir(), "O Xcode não gerou o .app esperado.")
    info_path = app / "Info.plist"
    exigir(info_path.is_file(), "Info.plist não encontrado.")
    with info_path.open("rb") as arquivo:
        info = plistlib.load(arquivo)
    exigir(info.get("CFBundleIdentifier") == bundle_id, "Bundle identifier final incorreto.")
    exigir(info.get("CFBundlePackageType") == "APPL", "O bundle não é do tipo APPL.")
    exigir("iPhoneOS" in info.get("CFBundleSupportedPlatforms", []), "O aplicativo não foi gerado para iPhone.")
    nome_executavel = info.get("CFBundleExecutable", "")
    exigir(bool(nome_executavel), "Nome do executável ausente no Info.plist.")
    executavel = app / nome_executavel
    exigir(executavel.is_file(), "Executável não encontrado.")
    exigir(os.access(executavel, os.X_OK), "O arquivo principal não tem permissão de execução.")
    arquiteturas = executar(["xcrun", "lipo", "-archs", str(executavel)]).split()
    exigir(arquiteturas == ["arm64"], "Esperava apenas arm64; encontrei " + str(arquiteturas))
    plataforma = executar(["xcrun", "vtool", "-show-build", str(executavel)])
    exigir(re.search(r"platform\s+IOS\b", plataforma), "O binário não é da plataforma iOS de dispositivo.")
    exigir((app / "main.jsbundle").is_file(), "Bundle JavaScript ausente; o app dependeria do Metro.")
    exigir((app / "main.jsbundle").stat().st_size > 0, "Bundle JavaScript vazio.")

    # Copio o app com ditto para preservar permissões e links dos frameworks.
    payload = destino / "Payload"
    exigir(not payload.exists(), "Payload já existe; use um workspace limpo para este build.")
    payload.mkdir()
    app_empacotado = payload / app.name
    executar(["ditto", str(app), str(app_empacotado)])
    ipa = destino / (app.stem + ".ipa")
    executar(["ditto", "-c", "-k", "--keepParent", str(payload), str(ipa)])
    exigir(ipa.is_file(), "IPA não foi criado.")
    exigir(ipa.stat().st_size > 0, "IPA vazio.")

    # Abro o ZIP para conferir integridade e os caminhos que o instalador vai encontrar.
    prefixo = "Payload/" + app.name + "/"
    with zipfile.ZipFile(ipa) as pacote:
        exigir(pacote.testzip() is None, "O IPA contém um arquivo ZIP corrompido.")
        nomes = pacote.namelist()
        exigir(prefixo + "Info.plist" in nomes, "Info.plist ausente no Payload do IPA.")
        exigir(prefixo + nome_executavel in nomes, "Executável ausente no Payload do IPA.")
        exigir(prefixo + "main.jsbundle" in nomes, "JavaScript ausente no Payload do IPA.")
        exigir(all(map(lambda nome: nome.startswith("Payload/"), nomes)), "Estrutura inesperada na raiz do IPA.")
        plist_final = plistlib.loads(pacote.read(prefixo + "Info.plist"))
        exigir(plist_final["CFBundleIdentifier"] == bundle_id, "Identificador divergente dentro do IPA.")

    resumo = {
        "workspace": workspace.name, "scheme": scheme, "app": app.name,
        "bundleIdentifier": bundle_id, "minimumIOS": info.get("MinimumOSVersion"),
        "architectures": arquiteturas, "configuration": "Release", "sdk": "iphoneos",
        "ipa": ipa.name, "bytes": ipa.stat().st_size, "signing": "Reassinar no AltStore/AltServer",
    }
    (destino / "build-summary.json").write_text(json.dumps(resumo, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(resumo, ensure_ascii=False, indent=2))
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as arquivo:
            arquivo.write("## IPA compilado para iPhone\n\n")
            arquivo.write("- Arquivo: " + ipa.name + "\n")
            arquivo.write("- Tamanho: " + str(round(ipa.stat().st_size / 1024 / 1024, 1)) + " MiB\n")
            arquivo.write("- iOS mínimo: " + str(info.get("MinimumOSVersion")) + "\n")
            arquivo.write("- Release / iphoneos / arm64; JavaScript incorporado.\n")
            arquivo.write("- Baixe o artifact iFome-iOS e reassine pelo AltStore/AltServer.\n")
            arquivo.write("- Compilação validada; instalação e execução no iPhone ainda precisam de teste.\n")


if __name__ == "__main__":
    try:
        principal()
    except Exception as erro:
        print("::error::" + str(erro), file=sys.stderr)
        sys.exit(1)
