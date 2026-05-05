import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, UserRound, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { enableGuestMode } from "@/hooks/useAuth";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Account created! Check your inbox to confirm.");
        const { data } = await supabase.auth.getSession();
        if (data.session) navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Auth failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden raincast-aurora">
      {/* Grain */}
      <div className="absolute inset-0 raincast-grain pointer-events-none" />

      {/* Subtle orbs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-12 h-12 rounded-2xl raincast-orb mb-4" />
          <h1 className="font-display text-4xl leading-none tracking-tight">
            RAIN<span className="italic text-primary">CAST</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mt-2">
            Vibe coding, at the speed of thought
          </p>
        </div>

        <div className="raincast-panel p-6">
          <h2 className="text-base font-semibold mb-1">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            {mode === "signin"
              ? "Sign in to pick up where you left off."
              : "Build apps just by describing them."}
          </p>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border mt-1.5 h-10"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border mt-1.5 h-10"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 shadow-[var(--shadow-glow)] hover:brightness-110 transition-all group"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {mode === "signin" ? "Sign in" : "Create account"}
              {!loading && (
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
              )}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-panel px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-10 border-border bg-background/50 hover:bg-secondary hover:border-primary/40 transition-all"
            onClick={() => {
              enableGuestMode();
              toast.success("Continuing as guest — projects won't be saved");
              navigate("/");
            }}
          >
            <UserRound className="w-4 h-4 mr-2" />
            Continue as guest
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Try RAINCAST instantly. Sign in later to save your projects.
          </p>

          <div className="text-center mt-5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() =>
                setMode((m) => (m === "signin" ? "signup" : "signin"))
              }
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "signin"
                ? "Don't have an account? "
                : "Already have an account? "}
              <span className="text-primary font-medium">
                {mode === "signin" ? "Sign up" : "Sign in"}
              </span>
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          Built with Lovable · Powered by Lovable AI
        </p>
      </div>
    </div>
  );
}
