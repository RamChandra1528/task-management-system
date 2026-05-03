import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import {
  Field,
  Input,
  LogoMark,
  PrimaryButton,
  SecondaryButton
} from "../components/ui.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      await login(form);
      navigate(location.state?.from || "/app/overview", { replace: true });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-hero-orb lg:grid-cols-[0.92fr_1.08fr]">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-12 text-white lg:flex">
        <LogoMark compact />
        <div>
          <div className="max-w-lg text-5xl font-extrabold leading-tight">
            Welcome back to your team's command center.
          </div>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">
            Sign in with your workspace account to manage projects, people, tasks, files, and reports.
          </p>
        </div>
        <div className="text-sm text-white/70">TaskPro Workspace Access</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-xl rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-glow backdrop-blur-xl sm:p-10">
          <LogoMark />
          <h1 className="mt-10 text-4xl font-extrabold tracking-tight text-ink">
            Log in
          </h1>
          <p className="mt-3 text-soft">
            Continue to the workspace and pick up where the team left off.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className="pl-12"
                  placeholder="you@company.com"
                />
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  className="pl-12"
                  placeholder="Enter your password"
                />
              </div>
            </Field>

            {error ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-500">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <PrimaryButton type="submit" className="flex-1" icon={ArrowRight}>
                {pending ? "Logging in..." : "Log In"}
              </PrimaryButton>
              <Link to="/">
                <SecondaryButton>Back Home</SecondaryButton>
              </Link>
            </div>
          </form>

          <p className="mt-6 text-sm text-soft">
            Need an account?{" "}
            <Link to="/signup" className="font-semibold text-brand-500">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
