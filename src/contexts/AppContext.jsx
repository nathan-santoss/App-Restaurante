import { createContext, useContext } from 'react';
import { useAppController } from '../controllers/useAppController.js';

// Crio um ponto de encontro para as telas acessarem o mesmo estado do aplicativo.
export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Inicio o Controller só neste Provider, assim compartilho um único carrinho.
  const controlador = useAppController();
  // Com children, mantenho dentro do Provider todos os componentes que ele envolve.
  return <AppContext.Provider value={controlador}>{children}</AppContext.Provider>;
}

export function useApp() {
  // Com useContext, busco o valor que o Provider colocou à disposição das telas.
  const contexto = useContext(AppContext);
  if (Boolean(contexto) === false) {
    // Converto o contexto em verdadeiro ou falso para reconhecer quando o Provider está faltando.
    // Aviso sobre o uso fora do Provider para facilitar a localização desse erro.
    throw new Error('useApp precisa estar dentro de AppProvider.');
  }
  return contexto;
}
