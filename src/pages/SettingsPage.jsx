import { Link } from "react-router-dom";
import { FaRedo, FaSignOutAlt, FaUserCog } from "react-icons/fa";
import { useApp } from "../context/AppContext";

export default function SettingsPage() {
  const { currentUser, logout, resetDemo } = useApp();

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-soft p-3 text-brand-teal">
            <FaUserCog />
          </div>
          <div>
            <h1 className="section-title">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your profile, demo data, and session settings.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="metric-card">
            <p className="text-sm text-slate-500">Signed in as</p>
            <p className="mt-2 text-lg font-semibold">{currentUser.fullName}</p>
          </div>
          <div className="metric-card">
            <p className="text-sm text-slate-500">User type</p>
            <p className="mt-2 text-lg font-semibold capitalize">{currentUser.role}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Link
            to="/profile/edit"
            className="rounded-3xl border border-slate-200 p-5 transition hover:border-brand-teal/30 hover:bg-brand-soft/40"
          >
            <p className="font-semibold text-brand-dark">Edit Profile</p>
            <p className="mt-2 text-sm text-slate-500">Update your public details, bio, expertise, and sport data.</p>
          </Link>
          <button
            onClick={resetDemo}
            className="rounded-3xl border border-slate-200 p-5 text-left transition hover:border-brand-teal/30 hover:bg-brand-soft/40"
          >
            <p className="flex items-center gap-2 font-semibold text-brand-dark">
              <FaRedo />
              Reset Demo Data
            </p>
            <p className="mt-2 text-sm text-slate-500">Restore the original seeded athletes, coaches, messages, and challenges.</p>
          </button>
          <button
            onClick={logout}
            className="rounded-3xl border border-slate-200 p-5 text-left transition hover:border-rose-300 hover:bg-rose-50"
          >
            <p className="flex items-center gap-2 font-semibold text-brand-dark">
              <FaSignOutAlt />
              Logout
            </p>
            <p className="mt-2 text-sm text-slate-500">Sign out and return to the landing page or switch accounts.</p>
          </button>
        </div>
      </section>
    </div>
  );
}
