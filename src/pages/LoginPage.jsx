import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFutbol, FaLock, FaSignInAlt, FaUserTie } from "react-icons/fa";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [form, setForm] = useState({ email: "maya@sportmatch.ai", password: "demo123" });
  const [error, setError] = useState("");
  const [roleHint, setRoleHint] = useState("athlete");

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate(result.user.role === "coach" ? "/coach/dashboard" : "/athlete/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-300/40 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-hero p-10 text-white">
          <p className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur w-fit">
            Demo login prefilled
          </p>
          <h1 className="mt-8 font-display text-5xl font-bold">Welcome back to SportMatch.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-white/85">
            Step back into your scouting workflow, talent pipeline, and conversations with one secure login.
          </p>
          <div className="mt-12 rounded-3xl bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-white/75">Try these sample accounts</p>
            <div className="mt-4 space-y-3 text-sm">
              <p>`maya@sportmatch.ai` / `demo123`</p>
              <p>`elena@sportmatch.ai` / `demo123`</p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="w-fit rounded-2xl bg-brand-soft p-4 text-brand-teal">
            <FaLock size={24} />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-brand-dark">Log in</h2>
          <p className="mt-2 text-slate-500">Choose your section and we’ll send you to the right dashboard.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setRoleHint("athlete");
                setForm({ email: "maya@sportmatch.ai", password: "demo123" });
              }}
              className={`rounded-2xl border p-4 text-left transition ${
                roleHint === "athlete" ? "border-brand-teal bg-brand-soft text-brand-teal" : "border-slate-200 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <FaFutbol />
                <span className="font-semibold">Player Section</span>
              </div>
              <p className="mt-2 text-sm">Use an athlete login and enter the player dashboard.</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleHint("coach");
                setForm({ email: "elena@sportmatch.ai", password: "demo123" });
              }}
              className={`rounded-2xl border p-4 text-left transition ${
                roleHint === "coach" ? "border-brand-teal bg-brand-soft text-brand-teal" : "border-slate-200 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <FaUserTie />
                <span className="font-semibold">Coach Section</span>
              </div>
              <p className="mt-2 text-sm">Use a coach login and enter the coach dashboard.</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-teal"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-teal"
                required
              />
            </label>

            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-teal px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              <FaSignInAlt />
              Enter {roleHint === "coach" ? "Coach" : "Player"} Section
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Need an account?{" "}
            <Link to="/signup" className="font-semibold text-brand-teal">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
