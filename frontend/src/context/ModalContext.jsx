import { createContext, useContext, useState, useCallback } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modals, setModals] = useState({});

  const openModal = useCallback((modalId, data = null) => {
    setModals((prev) => ({
      ...prev,
      [modalId]: { open: true, data }
    }));
  }, []);

  const closeModal = useCallback((modalId) => {
    setModals((prev) => ({
      ...prev,
      [modalId]: { open: false, data: null }
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals({});
  }, []);

  const getModalState = useCallback((modalId) => {
    return modals[modalId] || { open: false, data: null };
  }, [modals]);

  const value = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    getModalState
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
}
