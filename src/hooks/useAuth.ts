import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const GUEST_KEY = "raincast_guest";

export function isGuestMode(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(GUEST_KEY) === "1";
}

export function enableGuestMode() {
  localStorage.setItem(GUEST_KEY, "1");
  window.dispatchEvent(new Event("raincast-guest-change"));
}

export function disableGuestMode() {
  localStorage.removeItem(GUEST_KEY);
  window.dispatchEvent(new Event("raincast-guest-change"));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [guest, setGuest] = useState<boolean>(isGuestMode());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const onGuest = () => setGuest(isGuestMode());
    window.addEventListener("raincast-guest-change", onGuest);
    window.addEventListener("storage", onGuest);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("raincast-guest-change", onGuest);
      window.removeEventListener("storage", onGuest);
    };
  }, []);

  return {
    user,
    guest,
    loading,
    // A single flag gating access to the app
    hasAccess: !!user || guest,
  };
}
