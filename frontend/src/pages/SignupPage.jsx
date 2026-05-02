import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User2 } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import {
  Field,
  Input,
  LogoMark,
  PrimaryButton,
  SecondaryButton
} from "../components/ui.jsx";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    workspaceName: "Aurora Workspace"
  });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      await signup(form);
      navigate("/app/overview", { replace: true });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-hero-orb lg:grid-cols-[1fr_0.96fr]">
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-xl rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-glow backdrop-blur-xl sm:p-10">
          <LogoMark />
          <h1 className="mt-10 text-4xl font-extrabold tracking-tight text-ink">
            Create your account
          </h1>
          <p className="mt-3 text-soft">
            Join the workspace and start shipping with a cleaner team system.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Field label="Full name">
              <div className="relative">
                <User2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="pl-12"
                  placeholder="Emma Johnson"
                />
              </div>
            </Field>

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

            <div className="grid gap-5 sm:grid-cols-2">
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
                    placeholder="At least 6 characters"
                  />
                </div>
              </Field>
              <Field label="Workspace">
                <Input
                  value={form.workspaceName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      workspaceName: event.target.value
                    }))
                  }
                />
              </Field>
            </div>

            {error ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-500">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <PrimaryButton type="submit" className="flex-1" icon={ArrowRight}>
                {pending ? "Creating..." : "Create Account"}
              </PrimaryButton>
              <Link to="/">
                <SecondaryButton>Back Home</SecondaryButton>
              </Link>
            </div>
          </form>

          <p className="mt-6 text-sm text-soft">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-500">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden bg-gradient-to-br from-white to-brand-50 p-12 lg:flex lg:flex-col lg:justify-between">
        <LogoMark />
        <div>
          <div className="max-w-lg text-5xl font-extrabold tracking-tight text-ink">
            One workspace for projects, tasks, conversations, and clarity.
          </div>
          <p className="mt-6 max-w-lg text-lg leading-8 text-soft">
            New signups join the seeded workspace so you can immediately explore
            the complete product experience with real API-backed data.
          </p>
        </div>
        <div className="rounded-[30px] border border-brand-100 bg-white p-6 shadow-card">
          <div className="text-sm font-bold uppercase tracking-[0.3em] text-brand-500">
            Included
          </div>
          <div className="mt-4 grid gap-4 text-soft">
            <div>JWT authentication and role-based access</div>
            <div>Projects, tasks, files, reports, and messaging</div>
            <div>Seeded Aurora Workspace for immediate testing</div>
          </div>
        </div>
      </div>
    </div>
  );
}
