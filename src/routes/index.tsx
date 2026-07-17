import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { supabase } from "@/integrations/supabase/client";

// TanStack Start Route registration
export const Route = createFileRoute("/")({
  component: LandingPage,
});

// Audio synth engine built using Web Audio API
class AudioEngine {
  ctx: AudioContext | null = null;
  droneOsc1: OscillatorNode | null = null;
  droneOsc2: OscillatorNode | null = null;
  droneGain: GainNode | null = null;
  isMuted = true;

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();

      this.droneOsc1.type = "sine";
      this.droneOsc1.frequency.value = 55; // Low A
      this.droneOsc2.type = "sine";
      this.droneOsc2.frequency.value = 110; // Octave A

      this.droneGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.droneOsc1.connect(this.droneGain);
      this.droneOsc2.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.droneOsc1.start();
      this.droneOsc2.start();

      // Default mute or low volume
      this.droneGain.gain.linearRampToValueAtTime(this.isMuted ? 0.0 : 0.08, this.ctx.currentTime + 1.0);
    } catch (e) {
      console.warn("AudioContext failed to initialize:", e);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.ctx) this.init();
    if (!this.ctx || !this.droneGain) return;
    
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    
    const targetGain = muted ? 0.0 : 0.08;
    this.droneGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
  }

  playClick() {
    if (this.isMuted || !this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(500, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.07);
  }

  playSpark() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(1400 + Math.random() * 600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.02 + Math.random() * 0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }
}

type BootState =
  | "void"
  | "signal"
  | "grid"
  | "neural-activity"
  | "core-forming"
  | "pulse"
  | "interface-online";

type BrainState = "idle" | "curious" | "excited" | "observing";

const NARRATIVE_LOGS: Record<BootState, string> = {
  void: "SYSTEM: Sensory grid offline.",
  signal: "SYSTEM: Observer signature detected. Reconnecting bridge...",
  grid: "SYSTEM: Mapping local workspace dimensions...",
  "neural-activity": "SYSTEM: Loading core cognitive synapse maps...",
  "core-forming": "SYSTEM: Assembling neural lattice projection...",
  pulse: "SYSTEM: Consciousness threshold crossed. Initializing stabilization...",
  "interface-online": "SYSTEM: Stabilization complete. Interface online."
};

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  stage: number;
  speed: number;
  size: number;
  color: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// 2D Particle interface for background engine
interface Particle2D {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  parallax: number;
}

// Click ripple interface
interface ClickRipple2D {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

// Background Orb interface
interface Orb2D {
  x: number;
  y: number;
  baseRadius: number;
  color: string;
  vx: number;
  vy: number;
  parallax: number;
}

// Bubble interface
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

// Operations launcher tools configuration
const JUDGE_TOOLS = [
  {
    id: "dashboard",
    name: "System Dashboard",
    path: "/dashboard",
    icon: "dashboard",
    color: "#8b5cf6",
    badge: "CORE ONLINE",
    desc: "Central operations panel. View case summaries, ingestion rates, and system alerts."
  },
  {
    id: "cases",
    name: "Multimodal Ingestion",
    path: "/cases",
    icon: "cloud_upload",
    color: "#cbd5e1",
    badge: "INGEST ACTIVE",
    desc: "Upload unstructured PDFs, transcripts, and audio files to extract semantic records."
  },
  {
    id: "graph",
    name: "Lattice Node Graph",
    path: "/graph",
    icon: "account_tree",
    color: "#cbd5e1",
    badge: "142 NODES ACTIVE",
    desc: "Interactive network mapping entities, locations, and contradictions dynamically."
  },
  {
    id: "timeline",
    name: "Synaptic Timeline",
    path: "/timeline",
    icon: "timeline",
    color: "#cbd5e1",
    badge: "CHRONO ONLINE",
    desc: "Chronological sequence mapping events extracted across different documents."
  },
  {
    id: "chat",
    name: "AI Transmission Chat",
    path: "/chat",
    icon: "forum",
    color: "#cbd5e1",
    badge: "SYNAPSE READY",
    desc: "Query the unified knowledge base with citation-grounded conversational answers."
  },
  {
    id: "contradictions",
    name: "Contradiction Analyzer",
    path: "/contradictions",
    icon: "rule",
    color: "#cbd5e1",
    badge: "0 DETECTED",
    desc: "Cross-examine multi-source testimonies to flag contradictions and inconsistencies."
  },
  {
    id: "analytics",
    name: "Neural Analytics",
    path: "/analytics",
    icon: "auto_graph",
    color: "#cbd5e1",
    badge: "METRICS ONLINE",
    desc: "Analyze extraction confidence metrics, token distributions, and system health."
  },
  {
    id: "settings",
    name: "System Settings",
    path: "/settings",
    icon: "settings",
    color: "#cbd5e1",
    badge: "CONF REGISTERED",
    desc: "Manage API keys, extraction rules, models, and custom taxonomies."
  }
];

function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeRef = useRef<HTMLDivElement | null>(null);
  const pipelineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const typewriterIntervalRef = useRef<number | null>(null);
  
  // Audio engine
  const audioRef = useRef<AudioEngine | null>(null);

  // States
  const [bootState, setBootState] = useState<BootState>("void");
  const [logText, setLogText] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGlitch, setIsGlitch] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [awarenessText, setAwarenessText] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // Force dark theme as default
    const root = window.document.documentElement;
    root.classList.add("dark");
    root.classList.remove("light");
  }, []);

  // Sync returning user state to localStorage safely to prevent overlapping timeline triggers
  const [returningUser] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const hasSeen = localStorage.getItem("chimera_seen") === "true";
      if (!hasSeen) {
        localStorage.setItem("chimera_seen", "true");
      }
      return hasSeen;
    }
    return false;
  });

  // Mutable refs for RAF performance optimization
  const stateRef = useRef<{
    bootState: BootState;
    brainState: BrainState;
    time: number;
    mouse: { x: number; y: number; smoothedX: number; smoothedY: number; speed: number };
    click: { x: number; y: number; time: number };
    scroll: { speed: number; position: number };
    idleTime: number;
    isStillnessActive: boolean;
  }>({
    bootState: "void",
    brainState: "idle",
    time: 0,
    mouse: { x: 0.5, y: 0.5, smoothedX: 0.5, smoothedY: 0.5, speed: 0 },
    click: { x: -10, y: -10, time: -100 },
    scroll: { speed: 0, position: 0 },
    idleTime: 0,
    isStillnessActive: false,
  });

  // Check auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setIsAuthenticated(true);
    });

    // Initialize audio instance
    audioRef.current = new AudioEngine();
  }, []);

  // Boot Timeline State Machine
  useEffect(() => {
    stateRef.current.bootState = "void";
    setBootState("void");

    const bootTimeline = [
      { state: "signal", delay: 200 },
      { state: "grid", delay: returningUser ? 500 : 900 },
      { state: "neural-activity", delay: returningUser ? 800 : 1600 },
      { state: "core-forming", delay: returningUser ? 1000 : 2300 },
      { state: "pulse", delay: returningUser ? 1100 : 2900 },
      { state: "interface-online", delay: returningUser ? 1200 : 3600 }
    ];

    const timers = bootTimeline.map(({ state, delay }) => {
      return setTimeout(() => {
        stateRef.current.bootState = state as BootState;
        setBootState(state as BootState);

        // Play synapse spark sound randomly during boot
        if (audioRef.current && !isMuted && (state === "neural-activity" || state === "core-forming" || state === "pulse")) {
          audioRef.current.playSpark();
        }

        // Add post-pulse freeze
        if (state === "pulse") {
          stateRef.current.isStillnessActive = true;
          setTimeout(() => {
            stateRef.current.isStillnessActive = false;
          }, 300);
        }
      }, delay);
    });

    return () => timers.forEach(clearTimeout);
  }, [returningUser]);

  // Fix typewriter text bug (drops first letter) by slicing string dynamically
  useEffect(() => {
    const currentText = returningUser && bootState === "interface-online"
      ? "SYSTEM: Session restored. Reconnecting to neural bridge..."
      : NARRATIVE_LOGS[bootState] || "";
    
    setLogText("");
    let i = 0;
    
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
    }

    typewriterIntervalRef.current = window.setInterval(() => {
      i++;
      setLogText(currentText.slice(0, i));
      if (i >= currentText.length) {
        if (typewriterIntervalRef.current) {
          clearInterval(typewriterIntervalRef.current);
          typewriterIntervalRef.current = null;
        }
      }
    }, 15);

    return () => {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
      }
    };
  }, [bootState, returningUser]);

  // System Awareness Moment after 5s idle
  useEffect(() => {
    const checkIdle = setInterval(() => {
      if (bootState === "interface-online") {
        stateRef.current.idleTime += 1;
        if (stateRef.current.idleTime >= 5) {
          // Pause node animation briefly before text reveal
          stateRef.current.brainState = "observing";
          setAwarenessText(Math.random() < 0.5 ? "You're still here..." : "Interaction required.");
        } else {
          setAwarenessText("");
        }
      }
    }, 1000);

    return () => clearInterval(checkIdle);
  }, [bootState]);

  // High-End Interactive Parallax Particle + Orb Canvas Background Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let isMobile = width < 768;

    let particles: Particle2D[] = [];
    let ripples: ClickRipple2D[] = [];
    let orbs: Orb2D[] = [];
    let bubbles: Bubble2D[] = [];
    let time = 0;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const initEngine = () => {
      particles = [];
      ripples = [];
      orbs = [];
      bubbles = [];
      isMobile = window.innerWidth < 768;

      // 1. Create 3 large glowing gradient background orbs
      orbs.push({
        x: width * 0.2,
        y: height * 0.3,
        baseRadius: isMobile ? 150 : 320,
        color: "rgba(139, 92, 246, 0.14)", // neon purple
        vx: 0.25, vy: 0.12,
        parallax: 0.02
      });
      orbs.push({
        x: width * 0.8,
        y: height * 0.7,
        baseRadius: isMobile ? 180 : 380,
        color: "rgba(6, 182, 212, 0.11)", // neon cyan
        vx: -0.18, vy: 0.18,
        parallax: 0.03
      });
      orbs.push({
        x: width * 0.5,
        y: height * 0.5,
        baseRadius: isMobile ? 120 : 280,
        color: "rgba(251, 171, 255, 0.09)", // neon pink
        vx: 0.12, vy: -0.12,
        parallax: 0.015
      });

      // 2. Populate interactive connected network particles
      const count = isMobile ? 22 : 80;
      for (let i = 0; i < count; i++) {
        let color = Math.random() < 0.4 ? "#06b6d4" : Math.random() < 0.75 ? "#8b5cf6" : "#fbabff";
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          size: Math.random() * 2 + 1,
          color: color,
          alpha: Math.random() * 0.45 + 0.3,
          parallax: Math.random() * 0.08 + 0.04
        });
      }

      // 3. Populate moving bubbles
      const bubbleCount = isMobile ? 12 : 35;
      for (let i = 0; i < bubbleCount; i++) {
        bubbles.push({
          x: Math.random() * width,
          y: Math.random() * height + height, // start at various vertical positions, some below screen
          vx: (Math.random() - 0.5) * 0.15, // slow horizontal drift
          vy: -(Math.random() * 0.35 + 0.15), // float upwards
          radius: Math.random() * 16 + 5, // radius between 5 and 21
          alpha: Math.random() * 0.2 + 0.08,
          parallax: Math.random() * 0.04 + 0.02,
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

    const handleGlobalClick = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: isMobile ? 140 : 350,
        alpha: 1.0,
        speed: isMobile ? 3.5 : 6.0
      });
    };
    window.addEventListener("click", handleGlobalClick);

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

      ctx.fillStyle = "#111319";
      ctx.fillRect(0, 0, width, height);

      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      ctx.globalCompositeOperation = "screen";
      orbs.forEach(orb => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.baseRadius) orb.x = width + orb.baseRadius;
        if (orb.x > width + orb.baseRadius) orb.x = -orb.baseRadius;
        if (orb.y < -orb.baseRadius) orb.y = height + orb.baseRadius;
        if (orb.y > height + orb.baseRadius) orb.y = -orb.baseRadius;

        const ox = orb.x + (mouseX - width / 2) * orb.parallax;
        const oy = orb.y + (mouseY - height / 2) * orb.parallax;

        const breathe = Math.sin(time * 2.5) * 20;
        const radius = orb.baseRadius + breathe;

        const gradient = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ox, oy, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";

      ripples = ripples.filter(ripple => {
        ripple.radius += ripple.speed;
        ripple.alpha = 1.0 - ripple.radius / ripple.maxRadius;

        particles.forEach(p => {
          const px = p.x + (mouseX - width / 2) * p.parallax;
          const py = p.y + (mouseY - height / 2) * p.parallax;
          const dx = px - ripple.x;
          const dy = py - ripple.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (Math.abs(dist - ripple.radius) < 20) {
            const pushFactor = (1.0 - ripple.radius / ripple.maxRadius) * 3.0;
            p.vx += (dx / (dist || 1)) * pushFactor;
            p.vy += (dy / (dist || 1)) * pushFactor;
          }
        });

        return ripple.radius < ripple.maxRadius;
      });

      if (!isMobile) {
        ctx.lineWidth = 0.6;
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          const p1x = p1.x + (mouseX - width / 2) * p1.parallax;
          const p1y = p1.y + (mouseY - height / 2) * p1.parallax;

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const p2x = p2.x + (mouseX - width / 2) * p2.parallax;
            const p2y = p2.y + (mouseY - height / 2) * p2.parallax;

            const dx = p1x - p2x;
            const dy = p1y - p2y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 125) {
              const alpha = (1.0 - dist / 125) * 0.16;
              ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(p1x, p1y);
              ctx.lineTo(p2x, p2y);
              ctx.stroke();
            }
          }
        }
      }

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.97;
        p.vy *= 0.97;

        if (Math.abs(p.vx) < 0.04) p.vx += (Math.random() - 0.5) * 0.04;
        if (Math.abs(p.vy) < 0.04) p.vy += (Math.random() - 0.5) * 0.04;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const px = p.x + (mouseX - width / 2) * p.parallax;
        const py = p.y + (mouseY - height / 2) * p.parallax;
        const dx = px - mouseX;
        const dy = py - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 160) {
          const force = (160 - dist) / 160;
          const dirX = dx / (dist || 1);
          const dirY = dy / (dist || 1);

          if (dist < 55) {
            p.x += dirX * force * 1.5;
            p.y += dirY * force * 1.5;
          } else {
            p.x -= dirX * force * 0.5;
            p.y -= dirY * force * 0.5;
          }
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw Bubbles
      bubbles.forEach(b => {
        b.y += b.vy;
        const wobble = Math.sin(time * 100 * b.wobbleSpeed + b.wobbleOffset) * b.wobbleAmount * 0.05;
        b.x += b.vx + wobble;

        if (b.y < -b.radius * 2) {
          b.y = height + b.radius * 2;
          b.x = Math.random() * width;
        }
        if (b.x < -b.radius * 2) b.x = width + b.radius * 2;
        if (b.x > width + b.radius * 2) b.x = -b.radius * 2;

        const bx = b.x + (mouseX - width / 2) * b.parallax;
        const by = b.y + (mouseY - height / 2) * b.parallax;

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

        ctx.strokeStyle = b.color;
        ctx.beginPath();
        ctx.arc(finalX, finalY, b.radius, 0, Math.PI * 2);
        ctx.stroke();

        const radGrad = ctx.createRadialGradient(
          finalX - b.radius * 0.3,
          finalY - b.radius * 0.3,
          b.radius * 0.05,
          finalX,
          finalY,
          b.radius
        );
        radGrad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
        radGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.02)");
        radGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(finalX, finalY, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.beginPath();
        ctx.arc(finalX - b.radius * 0.35, finalY - b.radius * 0.35, b.radius * 0.12, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      ripples.forEach(ripple => {
        ctx.strokeStyle = `rgba(6, 182, 212, ${ripple.alpha})`;
        ctx.lineWidth = 2.0;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(6, 182, 212, 0.3)";
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleGlobalClick);
      document.removeEventListener("visibilitychange", handleVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMuted]);

  // Three.js Neural Core (Living Brain)
  useEffect(() => {
    if (!threeRef.current) return;
    const container = threeRef.current;

    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const nodeCount = 42;
    const geometry = new THREE.SphereGeometry(0.045, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
    const instancedMesh = new THREE.InstancedMesh(geometry, material, nodeCount);
    scene.add(instancedMesh);

    const nodePositions: THREE.Vector3[] = [];
    const dummy = new THREE.Object3D();
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const radius = 1.6;
      const pos = new THREE.Vector3().setFromSphericalCoords(radius, phi, theta);
      nodePositions.push(pos);

      dummy.position.copy(pos);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;

    const linePairs: { i: number; j: number; line: THREE.Line }[] = [];
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.15
    });

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 1.3) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            nodePositions[i],
            nodePositions[j]
          ]);
          const line = new THREE.Line(lineGeo, lineMat.clone());
          scene.add(line);
          linePairs.push({ i, j, line });
        }
      }
    }

    const ringCount = 100;
    const ringGeo = new THREE.BufferGeometry();
    const ringPositions = new Float32Array(ringCount * 3);
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const r = 2.2 + Math.random() * 0.15;
      ringPositions[i * 3] = Math.cos(angle) * r;
      ringPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      ringPositions[i * 3 + 2] = Math.sin(angle) * r;
    }
    ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
    const ringMat = new THREE.PointsMaterial({
      color: 0xfbabff,
      size: 0.02,
      transparent: true,
      opacity: 0.4
    });
    const rings = new THREE.Points(ringGeo, ringMat);
    rings.rotation.x = 0.5;
    scene.add(rings);

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      if (stateRef.current.isStillnessActive) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const elapsed = clock.getElapsedTime();
      const stateVal = stateRef.current;

      let rotationSpeed = 0.25;
      let heartbeatScale = 1.0;
      
      if (stateVal.bootState === "void") {
        instancedMesh.visible = false;
        rings.visible = false;
        linePairs.forEach(p => p.line.visible = false);
      } else {
        instancedMesh.visible = true;
        rings.visible = true;
        linePairs.forEach(p => p.line.visible = true);

        let assembleScale = 0.01;
        if (stateVal.bootState === "core-forming") assembleScale = 0.6;
        else if (stateVal.bootState !== "void" && stateVal.bootState !== "signal" && stateVal.bootState !== "grid" && stateVal.bootState !== "neural-activity") assembleScale = 1.0;

        if (stateVal.brainState === "excited") {
          rotationSpeed = 0.8;
          heartbeatScale = 1.0 + Math.sin(elapsed * 6.5) * 0.12;
        } else if (stateVal.brainState === "observing") {
          rotationSpeed = 0.05;
          heartbeatScale = 1.0 + Math.sin(elapsed * 1.5) * 0.02;
        } else {
          rotationSpeed = 0.2;
          heartbeatScale = 1.0 + Math.sin(elapsed * 3.0) * 0.045;
        }

        instancedMesh.scale.setScalar(heartbeatScale * assembleScale);
        rings.scale.setScalar(assembleScale);
        rings.rotation.y += 0.005 * rotationSpeed;

        const targetRotX = (stateVal.mouse.smoothedY - 0.5) * 0.45;
        const targetRotY = (stateVal.mouse.smoothedX - 0.5) * 0.45;
        instancedMesh.rotation.x = THREE.MathUtils.lerp(instancedMesh.rotation.x, targetRotX, 0.04);
        instancedMesh.rotation.y = THREE.MathUtils.lerp(instancedMesh.rotation.y, targetRotY, 0.04);
        instancedMesh.rotation.y += 0.003;

        linePairs.forEach(pair => {
          const mat = pair.line.material as THREE.LineBasicMaterial;
          if (stateVal.brainState === "excited" && Math.random() < 0.035) {
            mat.opacity = 0.75;
            if (audioRef.current && !isMuted && Math.random() < 0.025) audioRef.current.playSpark();
          } else if (Math.random() < 0.006) {
            mat.opacity = 0.55;
            if (audioRef.current && !isMuted && Math.random() < 0.015) audioRef.current.playSpark();
          } else {
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.1, 0.1);
          }
        });
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isMuted]);

  // Canvas Pipeline Data Packet Simulation Hook
  useEffect(() => {
    if (!pipelineCanvasRef.current) return;
    const canvas = pipelineCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let packets: Particle[] = [];
    let sparks: Spark[] = [];

    const getNodesCoords = () => {
      const containerRect = canvas.getBoundingClientRect();
      
      const nodeEntropy = document.getElementById("node-entropy");
      const nodeLattice = document.getElementById("node-lattice");
      const nodeEmergence = document.getElementById("node-emergence");

      if (!nodeEntropy || !nodeLattice || !nodeEmergence) return null;

      const rect1 = nodeEntropy.getBoundingClientRect();
      const rect2 = nodeLattice.getBoundingClientRect();
      const rect3 = nodeEmergence.getBoundingClientRect();

      return {
        n1: { x: rect1.left - containerRect.left + rect1.width / 2, y: rect1.top - containerRect.top + rect1.height / 2 },
        n2: { x: rect2.left - containerRect.left + rect2.width / 2, y: rect2.top - containerRect.top + rect2.height / 2 },
        n3: { x: rect3.left - containerRect.left + rect3.width / 2, y: rect3.top - containerRect.top + rect3.height / 2 }
      };
    };

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animatePipeline = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const coords = getNodesCoords();
      if (!coords) {
        animationId = requestAnimationFrame(animatePipeline);
        return;
      }

      const { n1, n2, n3 } = coords;

      if (Math.random() < 0.05 + stateRef.current.scroll.speed * 0.05) {
        packets.push({
          x: n1.x,
          y: n1.y,
          targetX: n2.x,
          targetY: n2.y,
          progress: 0,
          stage: 1,
          speed: 0.005 + Math.random() * 0.005,
          size: 2 + Math.random() * 3,
          color: Math.random() < 0.5 ? "#06b6d4" : "#8b5cf6"
        });
      }

      const scrollSpeed = stateRef.current.scroll.speed;
      const scrollDirection = window.scrollY - stateRef.current.scroll.position >= 0 ? 1 : -1;

      packets = packets.filter(p => {
        const multiplier = 1.0 + scrollSpeed * 2.0;
        const currentSpeed = p.speed * multiplier;
        
        p.progress += currentSpeed * scrollDirection;

        if (p.progress < 0) {
          if (p.stage === 2) {
            p.stage = 1;
            p.progress = 1.0;
            p.targetX = n2.x;
            p.targetY = n2.y;
          } else {
            return false;
          }
        }

        if (p.progress > 1.0) {
          if (p.stage === 1) {
            p.stage = 2;
            p.progress = 0;
            p.targetX = n3.x;
            p.targetY = n3.y;

            for (let i = 0; i < 4; i++) {
              sparks.push({
                x: n2.x,
                y: n2.y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 0,
                maxLife: 30 + Math.random() * 20,
                color: "#8b5cf6",
                size: 1.5 + Math.random() * 2
              });
            }
          } else {
            for (let i = 0; i < 4; i++) {
              sparks.push({
                x: n3.x,
                y: n3.y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 0,
                maxLife: 30 + Math.random() * 20,
                color: "#fbabff",
                size: 1.5 + Math.random() * 2
              });
            }
            return false;
          }
        }

        const startX = p.stage === 1 ? n1.x : n2.x;
        const startY = p.stage === 1 ? n1.y : n2.y;
        p.x = startX + (p.targetX - startX) * p.progress;
        p.y = startY + (p.targetY - startY) * p.progress;

        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      sparks = sparks.filter(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        
        ctx.shadowBlur = 6;
        ctx.shadowColor = s.color;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 1.0 - s.life / s.maxLife;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        return s.life < s.maxLife;
      });

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(139, 92, 246, 0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.lineTo(n3.x, n3.y);
      ctx.stroke();

      animationId = requestAnimationFrame(animatePipeline);
    };

    animatePipeline();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Audio Toggle Controller
  const handleAudioToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.setMuted(nextMute);
      if (!nextMute) {
        audioRef.current.playClick();
      }
    }
  };

  // Gated Navigation Gateway (Only allows routing to main /dashboard or /auth from landing page)
  const handleNavigationAction = (path: string, forceDashboard = false) => {
    if (audioRef.current && !isMuted) audioRef.current.playClick();
    
    // Gating check: only let them enter the main dashboard route
    if (forceDashboard || path === "/dashboard" || path === "/auth" || path === "/") {
      if (isAuthenticated) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/auth" });
      }
    } else {
      // Trigger temporary sci-fi lock alert toast
      setToastMessage("ACCESS CONTROL: Click the 'System Dashboard' button to unlock this module.");
      const activeTimer = setTimeout(() => setToastMessage(""), 4200);
      return () => clearTimeout(activeTimer);
    }
  };

  const handleInitialize = () => {
    handleNavigationAction("/dashboard", true);
  };

  // Glass card tilt calculations
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (centerY - y) / 10;
    const rotateY = (x - centerX) / 10;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 35px rgba(139, 92, 246, 0.15)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
    card.style.boxShadow = "none";
  };

  return (
    <div className={`text-on-surface font-body-md overflow-x-hidden selection:bg-primary/30 min-h-screen relative bg-[#111319] ${isGlitch ? "skew-x-1 opacity-90 brightness-150" : ""}`}>
      {/* Signature Cursor Aura */}
      <div className="cursor-aura hidden md:block" id="cursor-aura" />

      {/* Upgraded High-End Interactive Parallax Canvas Background */}
      <canvas ref={canvasRef} className="bg-shader z-0 pointer-events-none" />

      {/* Subtle Noise / Film Grain Overlay for Depth */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025] bg-repeat z-10 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />

      {/* Beautiful Glowing Sci-Fi Access Gated Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-[1000] max-w-sm glass-premium border border-[#fbabff]/30 p-6 rounded-2xl bg-[#111319]/90 backdrop-blur-2xl shadow-[0_0_30px_rgba(251,171,255,0.2)] transition-all animate-[bounce_1s_ease-out_1]">
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-[#fbabff] animate-pulse">lock</span>
            <div>
              <h4 className="font-tech text-xs tracking-wider uppercase font-bold text-[#fbabff] mb-1">Access Gateway Gated</h4>
              <p className="text-xs text-on-surface-variant/80 font-sans leading-relaxed">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Invocation Header */}
      <header className="bg-[#111319]/20 backdrop-blur-3xl text-primary font-tech flex justify-between items-center px-6 md:px-12 w-full h-20 fixed top-0 z-50 border-b border-white/5">
        <Link to="/" className="font-display text-3xl font-extrabold tracking-wider text-primary hover:scale-105 transition-transform">CHIMERA</Link>
        <nav className="hidden md:flex items-center gap-10">
          <a className="text-primary font-tech uppercase tracking-[0.2em] text-xs font-semibold border-b border-primary" href="#hero">Invocation</a>
          <a className="text-[#fbabff] font-tech uppercase tracking-[0.2em] text-xs font-bold border border-[#fbabff]/35 px-4 py-1.5 rounded bg-[#fbabff]/5 hover:bg-[#fbabff]/20 hover:scale-105 transition-all cursor-pointer shadow-[0_0_12px_rgba(251,171,255,0.15)]" href="#operations-console">Operations Console</a>
          <a className="text-on-surface-variant/70 hover:text-on-surface transition-colors font-tech uppercase tracking-[0.2em] text-xs font-semibold" href="#features">Capabilities</a>
          <a className="text-on-surface-variant/70 hover:text-on-surface transition-colors font-tech uppercase tracking-[0.2em] text-xs font-semibold" href="#transformation">Transformation</a>
          <a className="text-on-surface-variant/70 hover:text-on-surface transition-colors font-tech uppercase tracking-[0.2em] text-xs font-semibold" href="#emergence">Emergence</a>
        </nav>
        <div className="flex items-center gap-6">
          {/* Audio Telemetry hum toggle */}
          <button 
            onClick={handleAudioToggle} 
            className="flex items-center justify-center p-2 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/20 hover:border-primary/50 text-primary transition-all cursor-pointer"
            title={isMuted ? "Unmute Neural Drone" : "Mute Neural Drone"}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMuted ? "volume_off" : "volume_up"}
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
            <span className="font-tech text-[10px] text-[#06b6d4] tracking-widest uppercase font-bold">Neural Sync Active</span>
          </div>

          {/* Third Pic Fix: Stopped notifications and avatar from navigating to dashboard */}
          <button 
            onClick={() => {
              if (audioRef.current && !isMuted) audioRef.current.playClick();
              setToastMessage("NOTIFICATIONS: Enter the System Dashboard to check operational messages.");
            }} 
            className="material-symbols-outlined text-on-surface-variant/60 hover:text-primary transition-all cursor-pointer"
          >
            notifications
          </button>
          
          <button 
            onClick={() => {
              if (audioRef.current && !isMuted) audioRef.current.playClick();
              setToastMessage("PROFILE: Profile controls gated on landing page. Enter the System Dashboard to view settings.");
            }} 
            className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 bg-surface-container hover:border-primary/50 transition-all cursor-pointer"
          >
            <img className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6x8e9vp0XtSbWbmbI_Nny-DV8w_8KA9hmAAPKKoFmemA88nB6qy5fr4vGFOOWWABWo51bsx6_ZeZ-zsbujtrRFgzU1k_83kIo_a0UmKzjHroqB0_pXl5zseZ1REtQEiKS51gKFt22Q63MyPlGuCHJI1Q_jcWpcFnWgyvbxE9ViWEb9tUSNgfT4g-pkkvSy6S1H3AWmzaQXbo_rEQSYCztx6IQxd8lfKC-aiETht7ZtKIXvo-bIudBIXecE7cyl5lh6Sd4yIh7QrEU" alt="User avatar" />
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-80px)] w-full flex items-center justify-center overflow-hidden" id="hero">
          <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* System Awakening Terminal Logs */}
            <div className="hero-content flex flex-col justify-center">
              <div className="mb-6 font-mono text-xs text-[#06b6d4] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-ping"></span>
                <span>{logText || "SYSTEM: Awaiting command..."}</span>
              </div>

              <h1 className="font-display text-5xl lg:text-7xl leading-[1.05] text-on-surface mb-8 font-extrabold tracking-tight">
                Build. Evolve. <br/>
                <span className="gradient-text-animate">Transform</span> <br/>
                with Chimera
              </h1>
              
              <p className="text-on-surface-variant/80 font-sans text-lg mb-12 max-w-lg leading-relaxed">
                The neural substrate for tomorrow's architects. Orchestrate multimodal workflows with mathematical elegance and cinematic precision.
              </p>
              
              <div className="flex flex-wrap gap-6 font-tech">
                <button 
                  onClick={handleInitialize}
                  className="cta-glass px-10 py-5 rounded-lg text-primary font-bold uppercase tracking-wider flex items-center gap-4 cursor-pointer hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                >
                  Initialize
                  <span className="material-symbols-outlined">bolt</span>
                </button>
                <button
                  onClick={() => handleNavigationAction("/dashboard", true)}
                  className="px-10 py-5 rounded-lg border border-white/10 hover:border-primary/40 text-on-surface-variant font-label-sm uppercase tracking-wider font-bold transition-all hover:scale-105 bg-white/5 backdrop-blur-md flex items-center justify-center cursor-pointer"
                >
                  Dashboard
                </button>
              </div>
            </div>

            {/* Three.js Neural Core */}
            <div className="relative h-[480px] lg:h-[600px] w-full flex items-center justify-center">
              {awarenessText && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 font-mono text-[11px] tracking-[0.4em] uppercase text-[#06b6d4] bg-[#111319]/85 px-4 py-2 border border-secondary/20 rounded backdrop-blur-sm animate-pulse">
                  {awarenessText}
                </div>
              )}
              <div ref={threeRef} className="w-full h-full" />
            </div>

          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-on-surface-variant/40">
            <span className="font-tech uppercase tracking-[0.5em] text-[10px] font-bold text-muted-foreground">Lattice Protocol</span>
            <div className="w-px h-16 bg-gradient-to-b from-primary/50 to-transparent"></div>
          </div>
        </section>

        {/* Operations Command Center (Interactive modules quick launchpad) */}
        <section className="py-24 relative z-10 border-t border-white/5" id="operations-console">
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="glass-premium rounded-[2.5rem] p-12 lg:p-16 border border-[#fbabff]/20 bg-[#111319]/50 backdrop-blur-2xl relative">
              <div className="absolute -top-4 left-10 px-4 py-1 bg-gradient-to-r from-primary to-[#fbabff] rounded-full text-white font-tech uppercase text-[10px] tracking-[0.25em] font-bold shadow-lg">
                Auditor Toolkit
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                  <h2 className="font-display text-3xl lg:text-4xl font-extrabold text-white mb-2">Operations Command Center</h2>
                  <p className="text-on-surface-variant/75 text-sm font-sans max-w-xl">
                    1-Click dashboard operations gateway. Select System Dashboard below to launch into the live workspaces.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#fbabff] animate-ping"></div>
                  <span className="font-tech text-xs tracking-widest text-[#fbabff] uppercase font-semibold">ALL SYSTEMS READY</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {JUDGE_TOOLS.map(tool => (
                  <div 
                    key={tool.id}
                    onClick={() => handleNavigationAction(tool.path, tool.id === "dashboard")}
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    className={`p-6 rounded-xl border bg-white/5 cursor-pointer flex flex-col justify-between group transition-all duration-300 hover:scale-[1.03] ${tool.id === "dashboard" ? "border-primary/40 hover:border-primary/80 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]" : "border-white/5 hover:border-[#fbabff]/40 hover:shadow-[0_0_20px_rgba(251,171,255,0.1)]"}`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" style={{ color: tool.id === "dashboard" ? "#8b5cf6" : "#cbd5e1" }}>
                          {tool.icon}
                        </span>
                        <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded border uppercase ${tool.id === "dashboard" ? "border-primary/30 text-primary" : "border-white/10 text-on-surface-variant/70"}`}>
                          {tool.badge}
                        </span>
                      </div>
                      <h3 className="font-display text-lg text-white font-bold mb-2">{tool.name}</h3>
                      <p className="text-xs text-on-surface-variant/65 leading-relaxed mb-6 font-sans">
                        {tool.desc}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-tech group-hover:translate-x-1.5 transition-transform uppercase font-bold tracking-wider ${tool.id === "dashboard" ? "text-primary" : "text-muted-foreground/60"}`}>
                      {tool.id === "dashboard" ? "Launch Workspace" : "Gated Preview"}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Chimera SaaS Core Features Section (Capabilities grid) */}
        <section className="py-24 relative z-10 border-t border-white/5" id="features">
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-tech text-[#06b6d4] uppercase tracking-[0.4em] mb-4 block text-xs font-bold">Engine Capabilities</span>
              <h2 className="font-display text-4xl lg:text-5xl font-extrabold">Enterprise AI Intelligence</h2>
              <p className="text-on-surface-variant/60 max-w-2xl mx-auto mt-4 text-lg font-sans">
                Harness high-fidelity analysis architectures designed to organize, correlate, and index unstructured data streams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div 
                onClick={() => handleNavigationAction("/graph")}
                className="p-8 rounded-2xl glass-premium border border-white/5 hover:border-primary/30 transition-all flex flex-col tilt-card cursor-pointer group hover:scale-[1.03]"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <span className="material-symbols-outlined text-[#8b5cf6] text-4xl mb-6 group-hover:scale-110 transition-transform">
                  account_tree
                </span>
                <h3 className="font-display text-xl text-white mb-3 font-bold">Lattice Node Graphs</h3>
                <p className="text-sm text-on-surface-variant/70 leading-relaxed font-sans">
                  Map high-dimensional relationship networks linking entities, locations, and actions in a unified graph plane.
                </p>
              </div>

              {/* Feature 2 */}
              <div 
                onClick={() => handleNavigationAction("/timeline")}
                className="p-8 rounded-2xl glass-premium border border-white/5 hover:border-secondary/30 transition-all flex flex-col tilt-card cursor-pointer group hover:scale-[1.03]"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <span className="material-symbols-outlined text-[#06b6d4] text-4xl mb-6 group-hover:scale-110 transition-transform">
                  timeline
                </span>
                <h3 className="font-display text-xl text-white mb-3 font-bold">Synaptic Timelines</h3>
                <p className="text-sm text-on-surface-variant/70 leading-relaxed font-sans">
                  Correlate cross-platform logs and document timestamps into logical, visual chronological sequences.
                </p>
              </div>

              {/* Feature 3 */}
              <div 
                onClick={() => handleNavigationAction("/evidence")}
                className="p-8 rounded-2xl glass-premium border border-white/5 hover:border-tertiary/30 transition-all flex flex-col tilt-card cursor-pointer group hover:scale-[1.03]"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <span className="material-symbols-outlined text-[#fbabff] text-4xl mb-6 group-hover:scale-110 transition-transform">
                  verified
                </span>
                <h3 className="font-display text-xl text-white mb-3 font-bold">Explainable Inference</h3>
                <p className="text-sm text-on-surface-variant/70 leading-relaxed font-sans">
                  Every answer has provenance. AI output grounds claims to primary evidence sources with full verify-links.
                </p>
              </div>

              {/* Feature 4 */}
              <div 
                onClick={() => handleNavigationAction("/cases")}
                className="p-8 rounded-2xl glass-premium border border-white/5 hover:border-primary/30 transition-all flex flex-col tilt-card cursor-pointer group hover:scale-[1.03]"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <span className="material-symbols-outlined text-[#8b5cf6] text-4xl mb-6 group-hover:scale-110 transition-transform">
                  cloud_upload
                </span>
                <h3 className="font-display text-xl text-white mb-3 font-bold">Multimodal Ingestion</h3>
                <p className="text-sm text-on-surface-variant/70 leading-relaxed font-sans">
                  Extract searchable meta-layers from audio transcripts, image arrays, and scattered PDFs instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Transformation Section */}
        <section className="py-24 relative z-10 border-t border-white/5" id="transformation">
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="glass-premium rounded-[2rem] p-12 lg:p-20 relative overflow-hidden border border-secondary/20 bg-[#111319]/40 backdrop-blur-xl">
              
              <div className="absolute top-8 right-8 flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="font-tech text-[10px] uppercase tracking-widest text-[#06b6d4]/60 font-bold">Reality Fusion Rate</span>
                  <span className="font-display text-2xl font-bold text-[#06b6d4]">98.4%</span>
                </div>
                <div className="w-12 h-12 rounded-full border border-secondary/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] animate-ping"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                  <h2 className="font-display text-4xl lg:text-5xl mb-8 font-extrabold">Fusion of <span className="text-[#06b6d4]">Realities</span></h2>
                  <p className="text-on-surface-variant/70 text-lg mb-10 leading-relaxed font-sans">
                    Chimera transforms abstract potential into concrete manifestation. Our synthesis engine bridges the gap between digital ideation and physical realization.
                  </p>
                  
                  <div className="space-y-6">
                    <div 
                      onClick={() => handleNavigationAction("/graph")}
                      className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-secondary/40 transition-all group tilt-card cursor-pointer hover:scale-[1.02]"
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                    >
                      <div className="flex items-start gap-5">
                        <span className="material-symbols-outlined text-[#06b6d4] text-3xl">filter_tilt_shift</span>
                        <div>
                          <h4 className="font-display text-lg mb-1 group-hover:text-[#06b6d4] transition-colors font-bold">Neural Remapping</h4>
                          <p className="text-sm text-on-surface-variant/60 font-sans">Dynamic conversion of high-dimensional data into intuitive interaction planes.</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => handleNavigationAction("/contradictions")}
                      className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all group tilt-card cursor-pointer hover:scale-[1.02]"
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                    >
                      <div className="flex items-start gap-5">
                        <span className="material-symbols-outlined text-[#8b5cf6] text-3xl">token</span>
                        <div>
                          <h4 className="font-display text-lg mb-1 group-hover:text-primary transition-colors font-bold">Synthetic Logic</h4>
                          <p className="text-sm text-on-surface-variant/60 font-sans">Auto-generated inference chains that predict architectural weaknesses.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div 
                    onClick={() => handleNavigationAction("/graph")}
                    className="aspect-square rounded-full border border-secondary/20 p-8 flex items-center justify-center relative max-w-[400px] mx-auto cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="absolute inset-0 bg-[#06b6d4]/5 rounded-full blur-[100px]"></div>
                    <div className="w-full h-full rounded-full status-scan border border-[#06b6d4]/40 flex items-center justify-center overflow-hidden bg-surface-container-low">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-7xl text-[#06b6d4] mb-4 opacity-50 animate-spin" style={{ animationDuration: "12s" }}>cyclone</span>
                        <p className="font-tech uppercase tracking-[0.3em] text-[#06b6d4] text-[11px] font-bold">Processing...</p>
                      </div>
                    </div>
                    
                    <div className="absolute top-1/4 -right-4 w-16 h-16 glass-premium rounded-xl flex items-center justify-center border-secondary/30 floating">
                      <span className="material-symbols-outlined text-[#06b6d4]">memory</span>
                    </div>
                    <div className="absolute bottom-1/4 -left-4 w-16 h-16 glass-premium rounded-xl flex items-center justify-center border-primary/30 floating" style={{ animationDelay: "-3s" }}>
                      <span className="material-symbols-outlined text-primary">data_thresholding</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Emergence Section */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5" id="emergence">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl lg:text-5xl mb-6 font-extrabold">The Path to <span className="text-[#fbabff]">Emergence</span></h2>
            <p className="text-on-surface-variant/60 max-w-2xl mx-auto text-lg font-sans">Witness the evolution of intelligence through the three critical thresholds of the Chimera protocol.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Phase 1 */}
            <div className="group cursor-pointer" onClick={() => handleNavigationAction("/cases")}>
              <div 
                className="relative rounded-2xl overflow-hidden aspect-[4/5] mb-8 border border-white/5 tilt-card"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <img alt="The First Spark" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAP2DTslGeIz-d00rhi0RYBuPiyoXqPrJVXdAnfedfkWQV_EH6Is_werEjWH5BZZsY7OW9cSHBxx7suxpXLHwDO34LlMJDQ4AhiENhj0kU_-BJsIfXOXXWFtpmqL6pU49fKCK-IsZrHIxIXafxKIm7i6UOI-lHG1OSKt9Rmr15asNlxxjes4y2mgdVwbrd_D3iiTq1itDnMVmnk7wHPZA7iKeD6j6Dp18Le5T_KGgL87uK9ZcEsl6_eaUnCDyuPTynktJLHWfae3YQ" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111319] to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <span className="px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-[10px] text-[#06b6d4] uppercase tracking-widest font-bold font-mono">Phase 01</span>
                </div>
              </div>
              <h3 className="font-display text-2xl mb-4 text-[#06b6d4] font-bold group-hover:text-white transition-colors">The First Spark</h3>
              <p className="text-on-surface-variant/75 leading-relaxed font-sans">The initial ignition of neural connectivity. Identifying patterns in the noise and crystallizing raw intent.</p>
            </div>

            {/* Phase 2 */}
            <div className="group cursor-pointer" onClick={() => handleNavigationAction("/timeline")}>
              <div 
                className="relative rounded-2xl overflow-hidden aspect-[4/5] mb-8 border border-white/5 tilt-card"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <img alt="Digital Echoes" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3z-TxQ61gKvuHRQtqBJakTl9qTYJYk8408rH1Xjjv1eTd3xi_0qqxFX8uMfkcBHD1gKkGajJkYSzPsLQcSMgDdMaQ2Pup83VX4Sq0Or0IrQTCZh21VxDvQntfLL5vqioA_rcHtrT18WTY18QQN5iTyxaIvNDul3KdiL_o41KHhdGwnJVX1tEoPAlA62veIaiSvbVg-3X-XdTcFeIFcaF1PYyttNooZKWywxF78I8xPX7CjiqVpR9WACtXfLyyh6v6SsGKn5fSaOEI" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111319] to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] text-primary uppercase tracking-widest font-bold font-mono">Phase 02</span>
                </div>
              </div>
              <h3 className="font-display text-2xl mb-4 text-primary font-bold group-hover:text-white transition-colors">Digital Echoes</h3>
              <p className="text-on-surface-variant/75 leading-relaxed font-sans">The expansion of consciousness. Signals resonate across the lattice, building complex multi-layered memory structures.</p>
            </div>

            {/* Phase 3 */}
            <div className="group cursor-pointer" onClick={() => handleNavigationAction("/graph")}>
              <div 
                className="relative rounded-2xl overflow-hidden aspect-[4/5] mb-8 border border-white/5 tilt-card"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <img alt="Evolution" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOLw-Dvx6aiD4nGLuuxUsfeWqNC3a6I1IEwd9ljOgwKCVtiT-pDIVGSxcPTPXA0OTYWtsDIr6syR7QTvN6fziWXPnpovL5ykVNCO6vbOwyvMBaTbCWjgKeMpdBeFRet_PlG8j6J3mMT9kkbv4t70d02Ya6qx8pryfIZVJm8upFSioJ8xOXjEPZnUW-fE40V89vXcjzPinOBKDelg1mrVIXDG3UPDc96fUOpvPwtj78O4qckKZ4UVHNwOwdOrHenIsCQ-4pBwOvUsVa" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111319] to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <span className="px-3 py-1 rounded-full bg-tertiary/20 border border-tertiary/30 text-[10px] text-[#fbabff] uppercase tracking-widest font-bold font-mono">Phase 03</span>
                </div>
              </div>
              <h3 className="font-display text-2xl mb-4 text-[#fbabff] font-bold group-hover:text-white transition-colors">Evolution</h3>
              <p className="text-on-surface-variant/75 leading-relaxed font-sans">The final synthesis. A self-sustaining intelligence loop that transcends its original constraints.</p>
            </div>

          </div>
        </section>

        {/* Synthesis Pipeline with Canvas Flow Animation */}
        <section className="py-24 relative overflow-hidden border-t border-white/5">
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center font-tech">
              
              <div className="lg:col-span-4">
                <h2 className="font-display text-4xl mb-8 leading-tight font-extrabold text-white">The <span className="text-primary">Synthesis</span> Pipeline</h2>
                <p className="text-on-surface-variant/70 mb-10 text-lg leading-relaxed font-sans">A four-stage lattice designed to extract structured intelligence from high-entropy datasets.</p>
                
                <div className="space-y-6" id="pipeline-controls">
                  <div 
                    className={`pipeline-step group cursor-pointer transition-all duration-300 ${pipelineStep === 1 ? "active text-primary opacity-100 scale-105" : "opacity-40 hover:opacity-100"}`}
                    onClick={() => {
                      setPipelineStep(1);
                      setTimeout(() => handleNavigationAction("/cases"), 400);
                    }}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-3 h-3 rounded-full transition-all ${pipelineStep === 1 ? "bg-primary shadow-[0_0_15px_#8b5cf6] scale-150" : "bg-on-surface-variant"}`}></div>
                      <span className="font-tech uppercase tracking-widest font-bold text-[11px]">01 Ingestion</span>
                    </div>
                  </div>

                  <div 
                    className={`pipeline-step group cursor-pointer transition-all duration-300 ${pipelineStep === 2 ? "active text-[#06b6d4] opacity-100 scale-105" : "opacity-40 hover:opacity-100"}`}
                    onClick={() => {
                      setPipelineStep(2);
                      setTimeout(() => handleNavigationAction("/graph"), 400);
                    }}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-3 h-3 rounded-full transition-all ${pipelineStep === 2 ? "bg-[#06b6d4] shadow-[0_0_15px_#06b6d4] scale-150" : "bg-on-surface-variant"}`}></div>
                      <span className="font-tech uppercase tracking-widest font-bold text-[11px]">02 Mapping</span>
                    </div>
                  </div>

                  <div 
                    className={`pipeline-step group cursor-pointer transition-all duration-300 ${pipelineStep === 3 ? "active text-[#fbabff] opacity-100 scale-105" : "opacity-40 hover:opacity-100"}`}
                    onClick={() => {
                      setPipelineStep(3);
                      setTimeout(() => handleNavigationAction("/reports"), 400);
                    }}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-3 h-3 rounded-full transition-all ${pipelineStep === 3 ? "bg-[#fbabff] shadow-[0_0_15px_#fbabff] scale-150" : "bg-on-surface-variant"}`}></div>
                      <span className="font-tech uppercase tracking-widest font-bold text-[11px]">03 Synthesis</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glowing Pipeline Simulation Canvas Container */}
              <div className="lg:col-span-8 relative" id="pipeline-canvas-container">
                <canvas 
                  ref={pipelineCanvasRef} 
                  className="absolute inset-0 w-full h-full pointer-events-none z-10" 
                />

                <div className="glass-premium rounded-[2.5rem] p-12 lg:p-16 relative overflow-hidden border border-white/5 bg-[#111319]/40 backdrop-blur-xl">
                  <div className="flex flex-col md:flex-row justify-between items-center relative z-20 gap-16">
                    
                    {/* Ingestion */}
                    <div 
                      id="node-entropy" 
                      onClick={() => handleNavigationAction("/cases")}
                      className={`flex flex-col items-center gap-6 group transition-all duration-500 cursor-pointer ${pipelineStep === 1 ? "scale-110" : "opacity-50"}`}
                    >
                      <div className={`w-24 h-24 rounded-full glass-premium flex items-center justify-center transition-all ${pipelineStep === 1 ? "text-primary border-primary shadow-[0_0_30px_rgba(139,92,246,0.2)]" : "text-muted-foreground border-white/10 group-hover:border-primary/50"}`}>
                        <span className="material-symbols-outlined text-4xl">input</span>
                      </div>
                      <span className={`font-tech uppercase tracking-widest text-[10px] font-bold ${pipelineStep === 1 ? "text-primary" : "text-on-surface-variant/60 group-hover:text-primary"}`}>Entropy</span>
                    </div>

                    {/* Empty Space for Canvas Lines */}
                    <div className="flex-grow h-20 hidden md:block w-24"></div>

                    {/* Process */}
                    <div 
                      id="node-lattice" 
                      onClick={() => handleNavigationAction("/graph")}
                      className={`flex flex-col items-center gap-6 group transition-all duration-500 cursor-pointer ${pipelineStep === 2 ? "scale-115" : "opacity-50"}`}
                    >
                      <div className={`w-32 h-32 rounded-full glass-premium flex items-center justify-center relative transition-all ${pipelineStep === 2 ? "text-secondary border-secondary shadow-[0_0_40px_rgba(6,182,212,0.25)]" : "text-muted-foreground border-white/10 group-hover:border-secondary/50"}`}>
                        <span className="material-symbols-outlined text-6xl animate-spin" style={{ animationDuration: "12s" }}>settings_suggest</span>
                        <div className="absolute inset-0 rounded-full border border-secondary/20 animate-ping opacity-20"></div>
                      </div>
                      <span className={`font-tech uppercase tracking-widest text-[10px] font-bold ${pipelineStep === 2 ? "text-secondary" : "text-on-surface-variant/60 group-hover:text-secondary"}`}>Lattice</span>
                    </div>

                    {/* Empty Space for Canvas Lines */}
                    <div className="flex-grow h-20 hidden md:block w-24"></div>

                    {/* Result */}
                    <div 
                      id="node-emergence" 
                      onClick={() => handleNavigationAction("/reports")}
                      className={`flex flex-col items-center gap-6 group transition-all duration-500 cursor-pointer ${pipelineStep === 3 ? "scale-110" : "opacity-50"}`}
                    >
                      <div className={`w-24 h-24 rounded-full glass-premium flex items-center justify-center transition-all ${pipelineStep === 3 ? "text-tertiary border-tertiary shadow-[0_0_30px_rgba(251,171,255,0.2)]" : "text-muted-foreground border-white/10 group-hover:border-tertiary/50"}`}>
                        <span className="material-symbols-outlined text-4xl">auto_awesome</span>
                      </div>
                      <span className={`font-tech uppercase tracking-widest text-[10px] font-bold ${pipelineStep === 3 ? "text-tertiary" : "text-on-surface-variant/60 group-hover:text-tertiary"}`}>Emergence</span>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#111319]/80 backdrop-blur-3xl text-on-surface-variant/50 font-tech flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-12 w-full border-t border-white/5 relative z-10">
        <Link to="/" className="font-display text-xl text-primary mb-6 md:mb-0 font-bold hover:scale-105 transition-transform">CHIMERA</Link>
        <div className="flex gap-10 mb-6 md:mb-0 uppercase tracking-widest text-[9px] font-bold">
          <a className="hover:text-primary transition-colors" href="/help">Security</a>
          <a className="hover:text-primary transition-colors" href="/graph">Lattice Protocol</a>
          <a className="hover:text-primary transition-colors" href="/settings">Neural Ethics</a>
        </div>
        <div className="uppercase tracking-[0.2em] text-[9px] font-bold text-muted-foreground">
          © 2026 NEURAL SYNTHESIS SYSTEMS — DESIGNED FOR THE SINGULARITY
        </div>
      </footer>

      {/* Telemetry Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-surface-container-highest z-[100] overflow-hidden">
        <div className="h-full bg-primary animate-[telemetry_3s_infinite_linear]" style={{ width: "30%" }}></div>
      </div>
    </div>
  );
}
