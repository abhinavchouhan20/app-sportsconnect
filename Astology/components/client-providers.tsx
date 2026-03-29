"use client";

import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { defaultUserState, type UserState } from "@/lib/types";
import { normalizeUserState } from "@/lib/plans";

type AppContextValue = {
  user: UserState;
  setUser: (next: UserState) => void;
};

export const AppContext = createContext<AppContextValue>({
  user: defaultUserState,
  setUser: () => undefined
});

export function ClientProviders({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserState>(defaultUserState);

  useEffect(() => {
    const raw = window.localStorage.getItem("astology-user");
    if (raw) {
      setUserState(normalizeUserState(JSON.parse(raw) as UserState));
    }
  }, []);

  const setUser = (next: UserState) => {
    const normalized = normalizeUserState(next);
    setUserState(normalized);
    window.localStorage.setItem("astology-user", JSON.stringify(normalized));
  };

  return <AppContext.Provider value={{ user, setUser }}>{children}</AppContext.Provider>;
}
