import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

interface Bubble2D {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  parallax: number;
  wobbleSpeed: number;
  wobbleAmount: number;
  wobbleOffset: number;
  color: string;
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Chimera" },
      {
        name: "description",
        content:
          "Sign in to Chimera, the AI Evidence Intelligence Platform. Access your investigations, evidence library, and AI analysis.",
      },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Background bubbles animation engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let isMobile = width < 768;

    let bubbles: Bubble2D[] = [];
    let time = 0;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const initEngine = () => {
      bubbles = [];
      isMobile = window.innerWidth < 768;

      const bubbleCount = isMobile ? 12 : 30;
      for (let i = 0; i < bubbleCount; i++) {
        bubbles.push({
          x: Math.random() * width,
          y: Math.random() * height + height * 0.5, // Distribute across vertical space and below screen
          vx: (Math.random() - 0.5) * 0.15,
          vy: -(Math.random() * 0.35 + 0.15),
          radius: Math.random() * 18 + 6,
          alpha: Math.random() * 0.16 + 0.06, // Soft transparent alphas
          parallax: Math.random() * 0.05 + 0.02,
          wobbleSpeed: Math.random() * 0.015 + 0.008,
          wobbleAmount: Math.random() * 3 + 1.5,
          wobbleOffset: Math.random() * Math.PI * 2,
          color: Math.random() < 0.4 ? "#06b6d4" : Math.random() < 0.7 ? "#8b5cf6" : "#fbabff"
        });
      }
    };

    initEngine();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initEngine();
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    let isVisible = true;

    const handleVisibility = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const drawLoop = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(drawLoop);
        return;
      }

      time += 0.004;

      // Clear with very slight transparency to prevent trails
      ctx.clearRect(0, 0, width, height);

      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      // Draw Bubbles
      bubbles.forEach(b => {
        b.y += b.vy;
        const wobble = Math.sin(time * 100 * b.wobbleSpeed + b.wobbleOffset) * b.wobbleAmount * 0.05;
        b.x += b.vx + wobble;

        // Reset bubble when it floats off screen top
        if (b.y < -b.radius * 2) {
          b.y = height + b.radius * 2;
          b.x = Math.random() * width;
        }
        if (b.x < -b.radius * 2) b.x = width + b.radius * 2;
        if (b.x > width + b.radius * 2) b.x = -b.radius * 2;

        const bx = b.x + (mouseX - width / 2) * b.parallax;
        const by = b.y + (mouseY - height / 2) * b.parallax;

        // Mouse repulsion
        const dx = bx - mouseX;
        const dy = by - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let pushX = 0;
        let pushY = 0;
        if (dist < 150) {
          const force = (150 - dist) / 150;
          pushX = (dx / (dist || 1)) * force * 2.5;
          pushY = (dy / (dist || 1)) * force * 2.5;
        }

        const finalX = bx + pushX;
        const finalY = by + pushY;

        ctx.save();
        ctx.globalAlpha = b.alpha;
        ctx.lineWidth = 1.0;

        // Outline stroke color (soft cyan/purple/pink)
        ctx.strokeStyle = b.color;
        ctx.beginPath();
        ctx.arc(finalX, finalY, b.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Shiny radial reflection gradient
        const radGrad = ctx.createRadialGradient(
          finalX - b.radius * 0.3,
          finalY - b.radius * 0.3,
          b.radius * 0.05,
          finalX,
          finalY,
          b.radius
        );
        radGrad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
        radGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.01)");
        radGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(finalX, finalY, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Bubble highlight reflection glint
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.beginPath();
        ctx.arc(finalX - b.radius * 0.35, finalY - b.radius * 0.35, b.radius * 0.12, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate({ to: "/dashboard", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (tab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      // If not redirected, session is set — navigate.
      if (!result.redirected) navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4 py-8 text-foreground overflow-hidden">
      {/* Dynamic Transparent Canvas Bubbles Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40 z-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px] z-0"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[480px] z-10">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_24px] shadow-primary/40">
            <span className="font-mono text-sm font-bold">X</span>
          </div>
          <div>
            <div className="font-semibold tracking-tight text-lg">Chimera</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Evidence Intelligence
            </div>
          </div>
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">Sign in to Chimera</h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Access your investigations, evidence, and AI analysis.
            </p>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            {(["signin", "signup"] as const).map((k) => (
              <TabsContent key={k} value={k} className="mt-4">
                <form onSubmit={handleEmail} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor={`email-${k}`} className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      id={`email-${k}`}
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 text-sm px-4"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`password-${k}`} className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      Password
                    </Label>
                    <Input
                      id={`password-${k}`}
                      type="password"
                      autoComplete={k === "signin" ? "current-password" : "new-password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 text-sm px-4"
                    />
                  </div>
                  <Button type="submit" className="h-11 w-full gap-2 text-sm mt-2" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {k === "signin" ? "Sign in" : "Create account"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          By continuing you agree to Chimera's demo terms. This is a hackathon build — do not upload real PII.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.98 6.98 0 0 1 5.47 12c0-.73.13-1.44.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
