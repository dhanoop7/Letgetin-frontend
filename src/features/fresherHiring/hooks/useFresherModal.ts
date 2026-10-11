import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { CreateType } from "../types";

interface FresherModalContextType {
  createType: CreateType | null;
  openCreate: (type: CreateType) => void;
  closeCreate: () => void;
}

export const FresherModalContext = createContext<FresherModalContextType>({
  createType: null,
  openCreate: () => {},
  closeCreate: () => {},
});

export function useFresherModal() {
  return useContext(FresherModalContext);
}
