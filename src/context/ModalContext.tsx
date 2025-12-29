import React, { createContext, useContext, useState } from 'react';
import { Octo } from '@/types';

interface ModalContent {
  title: string;
  content: React.ReactNode;
}

interface DetailModalOptions {
  startInEditMode?: boolean;
  onSaveCallback?: () => void;
}

interface DetailModalState {
  octo: Octo;
  startInEditMode: boolean;
  onSaveCallback?: () => void;
}

interface ModalContextType {
  isDetailModalOpen: boolean;
  detailModalOcto: Octo | null;
  detailModalOptions: DetailModalOptions;
  openDetailModal: (octo: Octo, options?: DetailModalOptions) => void;
  closeDetailModal: () => void;
  modal: ModalContent | null;
  openModal: (content: ModalContent | null) => void;
}

const ModalContext = createContext<ModalContextType>({
  isDetailModalOpen: false,
  detailModalOcto: null,
  detailModalOptions: {},
  openDetailModal: () => {},
  closeDetailModal: () => {},
  modal: null,
  openModal: () => {},
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalState, setDetailModalState] = useState<DetailModalState | null>(null);
  const [modal, setModal] = useState<ModalContent | null>(null);

  const openDetailModal = (octo: Octo, options: DetailModalOptions = {}) => {
    setDetailModalState({
      octo,
      startInEditMode: options.startInEditMode || false,
      onSaveCallback: options.onSaveCallback
    });
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailModalState(null);
  };

  const openModal = (content: ModalContent | null) => {
    setModal(content);
  };

  const value = {
    isDetailModalOpen,
    detailModalOcto: detailModalState?.octo || null,
    detailModalOptions: {
      startInEditMode: detailModalState?.startInEditMode || false,
      onSaveCallback: detailModalState?.onSaveCallback
    },
    openDetailModal,
    closeDetailModal,
    modal,
    openModal,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};