import { useMemo, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { FaBars, FaBolt, FaComments, FaCogs, FaHome, FaSignOutAlt, FaTrophy, FaUserEdit } from "react-icons/fa";
import { useApp } from "../context/AppContext";

const linkBase =
  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition";

export default function AppLayout() {
  const { currentUser, logout } = useApp();
  const [open, setOpen] = useState(false);
  const dashboardPath = currentUser?.role === "coach" ? "/coach/dashboard" : "/athlete/dashboard";
  const sectionLabel = currentUser?.role === "coach" ? "Coach Section" : "Athlete Section";

  const links = useMemo(
    () => [
      { to: dashboardPath, label: "Dashboard", icon: <FaHome /> },
      { to: "/profile/edit", label: "Edit Profile", icon: <FaUserEdit /> },
      { to: "/messages", label: "Messages", icon: <FaComments /> },
      { to: "/challenges", label: "Challenges", icon: <FaTrophy /> },
      { to: "/settings", label: "Settings", icon: <FaCogs /> },
    ],
    [dashboardPath],
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to={dashboardPath} className="flex items-center gap-3">
            <div className="rounded-2xl bg-hero p-3 text-white shadow-glow">
              <FaBolt />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-brand-dark">SportMatch</p>
              <p className="text-xs text-slate-500">{sectionLabel}</p>
            </div>
          </Link>

          <div className="hidden items-center gap-4 lg:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-brand-dark">{currentUser?.fullName}</p>
              <p className="text-xs text-slate-500 capitalize">{currentUser?.role}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-teal hover:text-brand-teal"
            >
              Logout
            </button>
          </div>

          <button
            onClick={() => setOpen((current) => !current)}
            className="rounded-2xl border border-slate-200 p-3 text-slate-700 lg:hidden"
            aria-label="Toggle navigation"
          >
            <FaBars />
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className={`${open ? "block" : "hidden"} glass-card h-fit w-full p-4 lg:block lg:w-72`}>
          <div className="mb-6 rounded-3xl bg-hero p-5 text-white">
            <p className="text-sm opacity-90">{sectionLabel}</p>
            <h2 className="mt-1 font-display text-2xl font-bold">{currentUser?.fullName}</h2>
            <p className="mt-2 text-sm opacity-90">
              {currentUser?.role === "athlete"
                ? "Showcase your skill and connect with the right coaches."
                : "Scout standout athletes and grow your roster."}
            </p>
          </div>

          <nav className="space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? "bg-brand-soft text-brand-teal" : "text-slate-600 hover:bg-slate-100"}`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={logout}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-brand-teal hover:text-brand-teal lg:hidden"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-slate-200/70 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 SportMatch. Connect with coaches. Discover opportunities.</p>
          <div className="flex gap-4">
            <span>Pitch Demo</span>
            <span>Privacy</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
