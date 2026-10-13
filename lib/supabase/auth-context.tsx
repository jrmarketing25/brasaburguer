"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { StoreMembership } from "./auth";

interface AdminAuthContextType {
  user: User | null;
  membership: StoreMembership | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  membership: null,
  isLoading: true,
  isAdmin: false,
  signOut: async () => {},
  refreshSession: async () => {},
});

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "a0000000-0000-0000-0000-000000000001";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<StoreMembership | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkUserAndMembership = useCallback(async () => {
    setIsLoading(true);
    const client = getSupabaseBrowserClient();
    if (!client) {
      setUser(null);
      setMembership(null);
      setIsLoading(false);
      return;
    }

    try {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!session?.user) {
        setUser(null);
        setMembership(null);
        setIsLoading(false);
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      // Consulta de filiação à loja
      const { data: memberData, error } = await client
        .from("store_members")
        .select("id, store_id, user_id, role")
        .eq("store_id", STORE_ID)
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (error || !memberData) {
        setMembership(null);
      } else {
        setMembership({
          id: memberData.id,
          storeId: memberData.store_id,
          userId: memberData.user_id,
          role: memberData.role,
        });
      }
    } catch (err) {
      console.error("Erro ao validar sessão de admin:", err);
      setUser(null);
      setMembership(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserAndMembership();

    const client = getSupabaseBrowserClient();
    if (!client) return;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => {
      checkUserAndMembership();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUserAndMembership]);

  const signOut = async () => {
    const client = getSupabaseBrowserClient();
    if (client) {
      await client.auth.signOut();
    }
    setUser(null);
    setMembership(null);
  };

  const isAdmin = Boolean(membership && ["owner", "admin"].includes(membership.role));

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        membership,
        isLoading,
        isAdmin,
        signOut,
        refreshSession: checkUserAndMembership,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

