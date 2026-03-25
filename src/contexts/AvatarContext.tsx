import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface AvatarContextType {
  avatarUrl: string | null;
  displayName: string | null;
  plano: string;
  refreshAvatar: () => void;
}

const AvatarContext = createContext<AvatarContextType>({
  avatarUrl: null,
  displayName: null,
  plano: "free",
  refreshAvatar: () => {},
});

export const useAvatar = () => useContext(AvatarContext);

export const AvatarProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [plano, setPlano] = useState("free");

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name, plano, avatar_url")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setDisplayName(data.display_name);
      setPlano(data.plano);
      setAvatarUrl(data.avatar_url);
    }
  };

  // Fetch on mount and whenever user changes
  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Auto-refresh on visibility change (handles Pix pending → founder)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchProfile();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [user]);

  // Periodic refresh every 30s for Pix pending users
  useEffect(() => {
    if (!user || plano === "fundador") return;
    const interval = setInterval(fetchProfile, 30_000);
    return () => clearInterval(interval);
  }, [user, plano]);

  return (
    <AvatarContext.Provider
      value={{ avatarUrl, displayName, plano, refreshAvatar: fetchProfile }}
    >
      {children}
    </AvatarContext.Provider>
  );
};
