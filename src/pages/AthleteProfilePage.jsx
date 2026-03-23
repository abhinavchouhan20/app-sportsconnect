import { Link, useParams } from "react-router-dom";
import { FaMapMarkerAlt, FaMedal, FaPaperPlane, FaRunning, FaStar, FaVideo } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import StatBar from "../components/StatBar";
import VideoCard from "../components/VideoCard";

export default function AthleteProfilePage() {
  const { athleteId } = useParams();
  const { athletes, currentUser } = useApp();
  const athlete = athletes.find((item) => item.id === athleteId);

  if (!athlete) {
    return <div className="glass-card p-8">Athlete not found.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-hero p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/15 text-2xl font-bold">
                {athlete.fullName
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-white/70">Athlete Profile</p>
                <h1 className="mt-2 font-display text-4xl font-bold">{athlete.fullName}</h1>
                <p className="mt-2 text-white/80">
                  {athlete.sport} • {athlete.skillLevel}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/85">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt />
                {athlete.location}
              </span>
              <span className="flex items-center gap-2">
                <FaRunning />
                AI speed {athlete.analysis?.speed || 0}/10
              </span>
            </div>
          </div>

          {currentUser?.role === "coach" ? (
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/messages?user=${athlete.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-brand-teal"
              >
                <FaPaperPlane />
                Message
              </Link>
              <Link
                to={`/messages?user=${athlete.id}`}
                className="rounded-full border border-white/25 px-5 py-3 font-semibold text-white"
              >
                Connect
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card p-6">
          <h2 className="section-title">Profile Overview</h2>
          <p className="mt-4 leading-7 text-slate-600">{athlete.bio}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="metric-card">
              <p className="text-sm text-slate-500">Sport</p>
              <p className="mt-2 text-lg font-semibold">{athlete.sport}</p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-slate-500">Skill Level</p>
              <p className="mt-2 text-lg font-semibold">{athlete.skillLevel}</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <FaMedal className="text-brand-teal" />
              <h3 className="font-semibold text-brand-dark">Achievements</h3>
            </div>
            <div className="mt-4 space-y-3">
              {athlete.achievements?.map((achievement) => (
                <div key={achievement} className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                  {achievement}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-soft p-3 text-brand-teal">
              <FaStar />
            </div>
            <div>
              <h2 className="section-title">Performance Stats</h2>
              <p className="mt-1 text-sm text-slate-500">AI-assisted evaluation based on uploaded footage.</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <StatBar label="Power Score" value={athlete.analysis?.power || 0} />
            <StatBar label="Accuracy" value={athlete.analysis?.accuracy || 0} accent="bg-brand-mint" />
            <StatBar label="Speed" value={athlete.analysis?.speed || 0} accent="bg-brand-dark" />
          </div>

          <div className="mt-6 rounded-3xl bg-brand-soft p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-teal">Feedback</p>
            <p className="mt-2 leading-7 text-slate-700">{athlete.analysis?.feedback}</p>
          </div>
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-soft p-3 text-brand-teal">
            <FaVideo />
          </div>
          <div>
            <h2 className="section-title">Video Library</h2>
            <p className="mt-1 text-sm text-slate-500">Clips coaches can evaluate immediately.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {(athlete.videos || []).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
}
