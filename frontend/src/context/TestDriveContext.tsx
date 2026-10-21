"use client";

import React, { createContext, useContext, useState } from "react";

interface TestDriveCar {
  id: number;
  name: string;
}

interface TestDriveContextType {
  isOpen: boolean;
  selectedCar: TestDriveCar | null;
  openModal: (car?: TestDriveCar) => void;
  closeModal: () => void;
}

const TestDriveContext = createContext<TestDriveContextType | undefined>(undefined);

export function TestDriveProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<TestDriveCar | null>(null);

  const openModal = (car?: TestDriveCar) => {
    setSelectedCar(car || null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedCar(null);
  };

  return (
    <TestDriveContext.Provider value={{ isOpen, selectedCar, openModal, closeModal }}>
      {children}
    </TestDriveContext.Provider>
  );
}

export function useTestDrive() {
  const context = useContext(TestDriveContext);
  if (!context) {
    throw new Error("useTestDrive must be used within a TestDriveProvider");
  }
  return context;
}
