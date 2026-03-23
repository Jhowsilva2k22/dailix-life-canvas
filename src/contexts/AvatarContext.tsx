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

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return (
    <AvatarContext.Provider
      value={{ avatarUrl, displayName, plano, refreshAvatar: fetchProfile }}
    >
      {children}
    </AvatarContext.Provider>
  );
};
