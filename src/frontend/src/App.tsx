import CRMDashboard from "@/components/CRMDashboard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import {
  ActivityIcon,
  Apple,
  BedDouble,
  ChevronRight,
  DropletIcon,
  Facebook,
  FootprintsIcon,
  Instagram,
  Leaf,
  Moon,
  Twitter,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface BMIRecord {
  bmi: number;
  category: string;
  date: string;
  weight: number;
  height: number;
}

interface WellnessData {
  steps: number;
  water: number;
  sleep: number;
  activeMinutes: number;
}

type AppView = "wellness" | "crm";

// ─── Constants ────────────────────────────────────────────────────────────────
const WELLNESS_TIPS = [
  {
    tip: "Drink a glass of water right after waking up to kickstart hydration.",
    icon: "💧",
  },
  {
    tip: "Take a 10-minute walk after meals to aid digestion and blood sugar.",
    icon: "🚶",
  },
  {
    tip: "Aim for 7–9 hours of quality sleep each night for optimal recovery.",
    icon: "😴",
  },
  {
    tip: "Include at least 5 servings of vegetables and fruits in your daily diet.",
    icon: "🥦",
  },
  {
    tip: "Practice deep breathing for 5 minutes to reduce stress hormones.",
    icon: "🧘",
  },
  { tip: "Stand up and stretch every hour if you work at a desk.", icon: "🙆" },
  {
    tip: "Replace sugary drinks with herbal teas or infused water.",
    icon: "🍵",
  },
  {
    tip: "Set a consistent sleep schedule—even on weekends—for better rest.",
    icon: "🌙",
  },
  {
    tip: "Eat slowly and mindfully; it takes 20 minutes to feel full.",
    icon: "🍽️",
  },
  {
    tip: "Start your morning with a protein-rich breakfast to fuel your day.",
    icon: "🥚",
  },
  {
    tip: "Spend 15 minutes outdoors daily for natural vitamin D synthesis.",
    icon: "☀️",
  },
  {
    tip: "Limit screen time 1 hour before bed to improve sleep quality.",
    icon: "📵",
  },
];

const WELLNESS_GOALS = {
  steps: 10000,
  water: 2.5,
  sleep: 8,
  activeMinutes: 30,
};

// ─── BMI Helpers ────────────────────────────────────────────────────────────────
function calcBMI(weightKg: number, heightCm: number): number {
  const hm = heightCm / 100;
  return weightKg / (hm * hm);
}

function bmiCategory(bmi: number): {
  label: string;
  color: string;
  position: number;
} {
  if (bmi < 18.5)
    return {
      label: "Underweight",
      color: "#3B82F6",
      position: (bmi / 18.5) * 25,
    };
  if (bmi < 25)
    return {
      label: "Normal",
      color: "#34B57A",
      position: 25 + ((bmi - 18.5) / 6.5) * 25,
    };
  if (bmi < 30)
    return {
      label: "Overweight",
      color: "#F2994A",
      position: 50 + ((bmi - 25) / 5) * 25,
    };
  return {
    label: "Obese",
    color: "#EB5757",
    position: Math.min(75 + ((bmi - 30) / 10) * 25, 97),
  };
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({
  view,
  onViewChange,
}: {
  view: AppView;
  onViewChange: (v: AppView) => void;
}) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">
            VitalPath
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {view === "wellness" &&
            [
              { label: "Dashboard", id: "dashboard" },
              { label: "BMI Calculator", id: "bmi" },
              { label: "Wellness Hub", id: "hub" },
            ].map(({ label, id }) => (
              <button
                key={id}
                data-ocid={`nav.${id}.link`}
                onClick={() => scrollTo(id)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
                type="button"
              >
                {label}
              </button>
            ))}
          <button
            type="button"
            data-ocid="nav.crm.link"
            onClick={() => onViewChange(view === "crm" ? "wellness" : "crm")}
            className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ml-1 ${
              view === "crm"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Users className="w-4 h-4" />
            CRM
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {/* Mobile CRM toggle */}
          <button
            type="button"
            data-ocid="nav.crm.toggle"
            onClick={() => onViewChange(view === "crm" ? "wellness" : "crm")}
            className={`md:hidden flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md transition-colors ${
              view === "crm"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            CRM
          </button>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              AR
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium text-foreground">
            Alex R.
          </span>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────────
function Hero({ onCTA }: { onCTA: () => void }) {
  return (
    <section className="bg-gradient-to-br from-[oklch(0.94_0.02_245)] to-[oklch(0.97_0.01_220)] py-16 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-medium">
            Your Personal Wellness Companion
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            Track Your <span className="text-primary">Health</span> Journey
          </h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Monitor your BMI, track daily wellness goals, and get personalized
            tips to build healthier habits — all in one place.
          </p>
          <Button
            size="lg"
            data-ocid="hero.primary_button"
            onClick={onCTA}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 rounded-xl shadow-md"
          >
            Calculate Your BMI Now
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex justify-center"
        >
          <img
            src="/assets/generated/hero-health-illustration.dim_480x400.png"
            alt="Health and wellness illustration"
            className="w-full max-w-sm rounded-2xl shadow-card"
          />
        </motion.div>
      </div>
    </section>
  );
}

// ─── BMI Calculator ──────────────────────────────────────────────────────────────────
function BMICalculator() {
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<{
    bmi: number;
    cat: ReturnType<typeof bmiCategory>;
  } | null>(null);
  const [history, setHistory] = useState<BMIRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("bmi-history") || "[]");
    } catch {
      return [];
    }
  });

  const calculate = useCallback(() => {
    let hCm = 0;
    if (heightUnit === "cm") {
      hCm = Number.parseFloat(heightCm);
    } else {
      hCm =
        Number.parseFloat(heightFt) * 30.48 +
        Number.parseFloat(heightIn || "0") * 2.54;
    }
    let wKg = Number.parseFloat(weight);
    if (weightUnit === "lbs") wKg = wKg * 0.453592;

    if (!hCm || !wKg || hCm <= 0 || wKg <= 0) return;

    const bmi = Number.parseFloat(calcBMI(wKg, hCm).toFixed(1));
    const cat = bmiCategory(bmi);
    setResult({ bmi, cat });

    const record: BMIRecord = {
      bmi,
      category: cat.label,
      date: new Date().toLocaleDateString(),
      weight: Number.parseFloat(weight),
      height:
        heightUnit === "cm"
          ? Number.parseFloat(heightCm)
          : Number.parseFloat(heightFt),
    };
    const newHistory = [record, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("bmi-history", JSON.stringify(newHistory));
  }, [heightUnit, heightCm, heightFt, heightIn, weightUnit, weight, history]);

  return (
    <Card className="shadow-card border-border" id="bmi">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">
          BMI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Height */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Height</Label>
            <div className="flex rounded-lg border border-border overflow-hidden text-xs">
              {(["cm", "ft"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  data-ocid={`bmi.height_${u}.toggle`}
                  onClick={() => setHeightUnit(u)}
                  className={`px-3 py-1 font-medium transition-colors ${
                    heightUnit === u
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {heightUnit === "cm" ? (
            <Input
              data-ocid="bmi.height_cm.input"
              type="number"
              placeholder="e.g. 175"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
          ) : (
            <div className="flex gap-2">
              <Input
                data-ocid="bmi.height_ft.input"
                type="number"
                placeholder="ft"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
              />
              <Input
                data-ocid="bmi.height_in.input"
                type="number"
                placeholder="in"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Weight</Label>
            <div className="flex rounded-lg border border-border overflow-hidden text-xs">
              {(["kg", "lbs"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  data-ocid={`bmi.weight_${u}.toggle`}
                  onClick={() => setWeightUnit(u)}
                  className={`px-3 py-1 font-medium transition-colors ${
                    weightUnit === u
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <Input
            data-ocid="bmi.weight.input"
            type="number"
            placeholder={weightUnit === "kg" ? "e.g. 70" : "e.g. 154"}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        <Button
          type="button"
          data-ocid="bmi.calculate.primary_button"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
          onClick={calculate}
        >
          Calculate BMI
        </Button>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="bmi.result.card"
            className="rounded-xl border border-border p-4 bg-muted space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-foreground">
                {result.bmi}
              </span>
              <Badge
                style={{
                  backgroundColor: `${result.cat.color}22`,
                  color: result.cat.color,
                  borderColor: `${result.cat.color}44`,
                }}
                className="font-semibold text-sm border"
              >
                {result.cat.label}
              </Badge>
            </div>
            {/* Category bar */}
            <div className="relative">
              <div className="flex h-3 rounded-full overflow-hidden">
                <div className="flex-1 bg-blue-400" />
                <div className="flex-1 bg-green-400" />
                <div className="flex-1 bg-orange-400" />
                <div className="flex-1 bg-red-400" />
              </div>
              <div
                className="absolute top-0 w-3 h-3 rounded-full bg-white border-2 border-foreground shadow-sm transition-all"
                style={{ left: `calc(${result.cat.position}% - 6px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
          </motion.div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent History
            </p>
            {history.map((r, i) => (
              <div
                key={`${r.date}-${i}`}
                data-ocid={`bmi.history.item.${i + 1}`}
                className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0"
              >
                <span className="text-muted-foreground">{r.date}</span>
                <span className="font-semibold text-foreground">{r.bmi}</span>
                <Badge variant="outline" className="text-xs">
                  {r.category}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Wellness Progress ────────────────────────────────────────────────────────────────
function WellnessProgress() {
  const [data, setData] = useState<WellnessData>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("wellness-data") || "null") || {
          steps: 7240,
          water: 1.8,
          sleep: 7.2,
          activeMinutes: 22,
        }
      );
    } catch {
      return { steps: 7240, water: 1.8, sleep: 7.2, activeMinutes: 22 };
    }
  });

  const update = (key: keyof WellnessData, val: number) => {
    setData((prev) => {
      const next = { ...prev, [key]: val };
      localStorage.setItem("wellness-data", JSON.stringify(next));
      return next;
    });
  };

  const metrics = [
    {
      key: "steps" as const,
      label: "Daily Steps",
      icon: FootprintsIcon,
      goal: WELLNESS_GOALS.steps,
      unit: "steps",
      step: 100,
      max: 15000,
      color: "bg-primary",
    },
    {
      key: "water" as const,
      label: "Hydration",
      icon: DropletIcon,
      goal: WELLNESS_GOALS.water,
      unit: "L",
      step: 0.1,
      max: 5,
      color: "bg-secondary",
    },
    {
      key: "sleep" as const,
      label: "Sleep",
      icon: BedDouble,
      goal: WELLNESS_GOALS.sleep,
      unit: "hrs",
      step: 0.5,
      max: 12,
      color: "bg-[oklch(0.65_0.15_280)]",
    },
    {
      key: "activeMinutes" as const,
      label: "Active Minutes",
      icon: ActivityIcon,
      goal: WELLNESS_GOALS.activeMinutes,
      unit: "min",
      step: 1,
      max: 120,
      color: "bg-warning",
    },
  ];

  return (
    <Card className="shadow-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">
          Weekly Wellness Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {metrics.map(
          ({ key, label, icon: Icon, goal, unit, step, max, color }) => {
            const pct = Math.min((data[key] / goal) * 100, 100);
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      data-ocid={`wellness.${key}.input`}
                      type="number"
                      value={data[key]}
                      step={step}
                      min={0}
                      max={max}
                      onChange={(e) =>
                        update(key, Number.parseFloat(e.target.value) || 0)
                      }
                      className="w-20 h-7 text-sm text-right"
                    />
                    <span className="text-xs text-muted-foreground w-6">
                      {unit}
                    </span>
                  </div>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`absolute left-0 top-0 h-full rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(pct)}% of goal</span>
                  <span>
                    Goal: {goal} {unit}
                  </span>
                </div>
              </div>
            );
          },
        )}
      </CardContent>
    </Card>
  );
}

// ─── Daily Tips ─────────────────────────────────────────────────────────────────────
function DailyTips() {
  const dayIndex = new Date().getDate() % WELLNESS_TIPS.length;
  const tips = [
    WELLNESS_TIPS[dayIndex % WELLNESS_TIPS.length],
    WELLNESS_TIPS[(dayIndex + 1) % WELLNESS_TIPS.length],
    WELLNESS_TIPS[(dayIndex + 2) % WELLNESS_TIPS.length],
  ];

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Daily Wellness Tips
        </h2>
        <p className="text-muted-foreground mb-6">
          Refreshed daily to keep your habits fresh.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((t, i) => (
            <motion.div
              key={t.tip.slice(0, 20)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                data-ocid={`tips.item.${i + 1}`}
                className="shadow-card border-border h-full hover:shadow-card-hover transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="text-3xl mb-3">{t.icon}</div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {t.tip}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Wellness Hub ───────────────────────────────────────────────────────────────────
function WellnessHub() {
  const features = [
    {
      icon: Apple,
      title: "Nutrition Guide",
      desc: "Explore balanced meal plans, macro tracking, and evidence-based nutritional advice tailored to your BMI goals.",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      icon: Zap,
      title: "Exercise Plans",
      desc: "From beginner bodyweight circuits to advanced training splits — find a plan that fits your schedule and fitness level.",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Moon,
      title: "Sleep Tracker",
      desc: "Optimize your recovery with sleep science tips, bedtime routines, and insights into how sleep impacts your health metrics.",
      color: "text-[oklch(0.55_0.18_280)]",
      bg: "bg-[oklch(0.55_0.18_280)]/10",
    },
  ];

  return (
    <section id="hub" className="py-12 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Explore Our Wellness Hub
        </h2>
        <p className="text-muted-foreground mb-6">
          Deepen your health knowledge with curated resources.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Card
                data-ocid={`hub.item.${i + 1}`}
                className="shadow-card border-border h-full hover:shadow-card-hover transition-shadow cursor-pointer group"
              >
                <CardContent className="pt-6 space-y-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <h3 className="font-bold text-foreground text-base">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${color} group-hover:gap-2 transition-all`}
                  >
                    Learn more <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  const featureLinks = [
    "BMI Calculator",
    "Wellness Tracker",
    "Daily Tips",
    "Wellness Hub",
    "CRM",
  ];
  const resourceLinks = [
    "Health Blog",
    "BMI Guide",
    "Nutrition Tips",
    "Sleep Science",
  ];

  return (
    <footer className="bg-card border-t border-border py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">VitalPath</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Your personal wellness companion. Track, improve, and celebrate
            every step of your health journey.
          </p>
          <div className="flex gap-3 mt-2">
            {[Twitter, Instagram, Facebook].map((Icon, i) => (
              <button
                key={["twitter", "instagram", "facebook"][i]}
                type="button"
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-muted-foreground"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-sm text-foreground mb-3">Features</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {featureLinks.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  className="hover:text-foreground transition-colors text-left"
                >
                  {l}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground mb-3">
            Resources
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {resourceLinks.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  className="hover:text-foreground transition-colors text-left"
                >
                  {l}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © {year}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </div>
    </footer>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<AppView>("wellness");

  const scrollToBMI = () => {
    document.getElementById("bmi")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Navbar view={view} onViewChange={setView} />

      {view === "wellness" ? (
        <motion.div
          key="wellness"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Hero onCTA={scrollToBMI} />

          <section id="dashboard" className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Dashboard
              </h2>
              <p className="text-muted-foreground mb-6">
                Your health at a glance.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BMICalculator />
                <WellnessProgress />
              </div>
            </div>
          </section>

          <DailyTips />
          <WellnessHub />
        </motion.div>
      ) : (
        <motion.div
          key="crm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CRMDashboard />
        </motion.div>
      )}

      <Footer />
    </div>
  );
}
