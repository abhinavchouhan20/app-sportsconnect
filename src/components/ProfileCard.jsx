import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

export default function ProfileCard({ user, actionLabel, actionTo, secondaryLabel, secondaryTo, children }) {
  return (
    <div className="glass-card animate-fade-in overflow-hidden p-5 shadow-lg shadow-slate-200/70">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-hero text-2xl font-bold text-white">
          {user.fullName
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-brand-dark">{user.fullName}</h3>
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-teal">
              {user.sport}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{user.expertise || user.skillLevel}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-brand-mint" />
              {user.location}
            </span>
            {user.experienceYears ? (
              <span className="flex items-center gap-2">
                <FaStar className="text-amber-400" />
                {user.experienceYears} years exp.
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{user.bio}</p>

      {children ? <div className="mt-4">{children}</div> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to={actionTo}
          className="rounded-full bg-brand-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          {actionLabel}
        </Link>
        {secondaryLabel && secondaryTo ? (
          <Link
            to={secondaryTo}
            className="rounded-full border border-brand-teal/20 px-4 py-2 text-sm font-semibold text-brand-teal transition hover:border-brand-teal hover:bg-brand-soft"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
