import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Play,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  Avatar,
  Card,
  LogoMark,
  PrimaryButton,
  ProgressBar,
  SecondaryButton
} from "../components/ui.jsx";

const sampleUsers = [
  { name: "Emma Johnson", avatar: { bg: "linear-gradient(135deg, #f9a8d4, #fb7185)" } },
  { name: "James Park", avatar: { bg: "linear-gradient(135deg, #93c5fd, #2563eb)" } },
  { name: "Olivia Rhye", avatar: { bg: "linear-gradient(135deg, #fbcfe8, #e879f9)" } },
  { name: "William Kim", avatar: { bg: "linear-gradient(135deg, #86efac, #16a34a)" } }
];

const featureStrip = [
  {
    title: "Task Management",
    description: "Create, assign, and track tasks effortlessly.",
    icon: CheckCircle2,
    tone: "from-brand-100 to-brand-50 text-brand-600"
  },
  {
    title: "Team Collaboration",
    description: "Communicate and collaborate in real-time.",
    icon: Users,
    tone: "from-pink-100 to-rose-50 text-pink-500"
  },
  {
    title: "Progress Tracking",
    description: "Monitor progress with beautiful insights.",
    icon: BarChart3,
    tone: "from-blue-100 to-sky-50 text-blue-500"
  },
  {
    title: "Deadline Management",
    description: "Never miss a deadline with smart reminders.",
    icon: Calendar,
    tone: "from-amber-100 to-orange-50 text-amber-500"
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-hero-orb px-4 py-6 sm:px-8 lg:px-6">
      <div className="mx-auto max-w-[1520px] rounded-[36px] border border-white/70 bg-white/80 shadow-glow backdrop-blur-xl">
        <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-8 sm:px-10 lg:px-16">
          <LogoMark />
          <nav className="hidden items-center gap-12 text-lg font-semibold text-ink lg:flex">
            <a href="#features">Features</a>
            <a href="#solutions">Solutions</a>
            <a href="#pricing">Pricing</a>
            <a href="#resources">Resources</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <SecondaryButton className="px-8">Log in</SecondaryButton>
            </Link>
            <Link to="/signup">
              <PrimaryButton className="px-8">Get Started</PrimaryButton>
            </Link>
          </div>
        </header>

        <section className="grid gap-14 px-6 pb-8 pt-6 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:pt-8">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-3 rounded-full bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-600">
              <span className="rounded-full bg-white px-2 py-0.5 text-xs">New</span>
              Smarter way to manage teamwork
            </div>

            <h1 className="mt-10 text-5xl font-extrabold tracking-tight text-ink sm:text-6xl lg:text-[5.4rem] lg:leading-[1.02]">
              Manage Your
              <br />
              Teamwork <span className="text-brand-500">Smarter</span>
            </h1>

            <p className="mt-7 max-w-xl text-xl leading-9 text-soft">
              Plan projects, assign tasks, track progress, and collaborate
              seamlessly with your team, all in one polished workspace.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link to="/signup">
                <PrimaryButton className="min-w-[240px] justify-between rounded-full px-8 py-5 text-lg">
                  Get Started
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </PrimaryButton>
              </Link>
              <button className="inline-flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-100 bg-white text-brand-500 shadow-lg shadow-brand-200/40">
                  <Play className="ml-1 h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xl font-semibold text-ink">View Workflow</span>
                  <span className="text-soft">Product tour</span>
                </span>
              </button>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-5">
              <div className="flex items-center">
                {sampleUsers.map((user, index) => (
                  <div key={user.name} className={index ? "-ml-2.5" : ""}>
                    <Avatar user={user} size="lg" />
                  </div>
                ))}
                <span className="-ml-2.5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  +2K
                </span>
              </div>
              <div>
                <div className="text-2xl tracking-[0.3em] text-amber-400">★★★★★</div>
                <p className="mt-2 text-xl text-soft">
                  Trusted by 2,000+ teams worldwide
                </p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -left-6 top-1/2 hidden h-20 w-20 -translate-y-1/2 animate-float items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-300 text-white shadow-lg shadow-brand-500/30 lg:flex">
              <ArrowRight className="h-8 w-8 rotate-[-45deg]" />
            </div>
            <div className="absolute right-6 top-6 hidden h-24 w-24 animate-float items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400 to-brand-500 text-white shadow-lg shadow-brand-500/30 lg:flex">
              <CheckCircle2 className="h-11 w-11" />
            </div>
            <div className="absolute -right-2 top-1/3 hidden h-20 w-20 animate-float items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-lg shadow-rose-300/30 lg:flex">
              <Users className="h-9 w-9" />
            </div>
            <div className="absolute bottom-20 right-0 hidden h-20 w-20 animate-float items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-sky-500 text-white shadow-lg shadow-sky-300/30 lg:flex">
              <BarChart3 className="h-9 w-9" />
            </div>

            <div className="relative overflow-hidden rounded-[36px] border border-white/60 bg-gradient-to-br from-brand-200/15 via-white to-white p-5 shadow-[0_30px_90px_rgba(124,58,237,0.16)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.08),transparent_60%)]" />
              <div className="relative grid min-h-[560px] place-items-center">
                <div className="flex w-full max-w-[620px] rounded-[34px] border border-brand-100 bg-white/95 shadow-[0_24px_70px_rgba(124,58,237,0.18)]">
                  <div className="w-20 rounded-l-[34px] bg-gradient-to-b from-brand-500 to-brand-300 p-4 text-white">
                    <div className="space-y-6 pt-6">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={index}
                          className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20"
                        >
                          {index === 0 ? <HomeStub /> : <CardStub />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 p-7">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-ink">Dashboard</div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-100 text-soft">
                        <Calendar className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      {[
                        { label: "Total Tasks", value: 128, note: "+12%" },
                        { label: "In Progress", value: 45, note: "+8%" },
                        { label: "Completed", value: 83, note: "+16%" }
                      ].map((item) => (
                        <Card key={item.label} className="p-5">
                          <div className="text-sm text-soft">{item.label}</div>
                          <div className="mt-3 text-4xl font-extrabold">{item.value}</div>
                          <div className="mt-2 text-sm text-emerald-500">{item.note}</div>
                        </Card>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                      <Card className="p-6">
                        <div className="text-xl font-bold">Project Progress</div>
                        <div className="mt-6 space-y-6">
                          {[
                            ["Website Redesign", 75, "#7c3aed"],
                            ["Mobile App", 60, "#3b82f6"],
                            ["Marketing Campaign", 30, "#f59e0b"]
                          ].map(([label, value, color]) => (
                            <div key={label} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>{label}</span>
                                <span>{value}%</span>
                              </div>
                              <ProgressBar value={value} color={color} />
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-6">
                        <div className="text-xl font-bold">Team Activity</div>
                        <div className="mt-5 space-y-4">
                          {[
                            "Emma completed Design System",
                            "James updated Homepage",
                            "Olivia created new task"
                          ].map((item, index) => (
                            <div key={item} className="flex items-center gap-3">
                              <Avatar user={sampleUsers[index]} size="sm" />
                              <div className="text-sm text-soft">{item}</div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="features" className="px-6 pb-10 pt-4 sm:px-10 lg:px-16">
          <div className="grid gap-4 rounded-[30px] border border-brand-100 bg-white p-4 shadow-card lg:grid-cols-4 lg:p-6">
            {featureStrip.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-start gap-4 rounded-[24px] px-4 py-5">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${feature.tone}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-ink">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-lg leading-8 text-soft">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function HomeStub() {
  return <div className="h-4 w-4 rounded-sm border-2 border-white" />;
}

function CardStub() {
  return (
    <div className="grid gap-1">
      <span className="h-1.5 w-4 rounded-full bg-white/90" />
      <span className="h-1.5 w-4 rounded-full bg-white/70" />
      <span className="h-1.5 w-4 rounded-full bg-white/50" />
    </div>
  );
}
