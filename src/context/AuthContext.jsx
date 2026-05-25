import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, hasSupabase } from "../lib/supabase";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  async function loadProfile(u) {
    if (!u) return setProfile(null);
    const { data } = await supabase.from("profiles").select("*").eq("id", u.id).single();
    setProfile(data || null);
  }

  useEffect(() => {
    if (!hasSupabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      loadProfile(data.session?.user ?? null).finally(() => setReady(true));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = profile?.role === "admin";
  const isApproved = isAdmin || profile?.status === "approved";
  const displayName = profile?.name || user?.user_metadata?.name || (user?.email ? user.email.split("@")[0] : "");

  const value = {
    user,
    profile,
    ready,
    isAdmin,
    isApproved,
    displayName,
    hasSupabase,
    reloadProfile: () => loadProfile(user),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, name) =>
      supabase.auth.signUp({ email, password, options: { data: { name } } }),
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
