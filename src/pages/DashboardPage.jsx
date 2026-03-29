import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBolt,
  FaChartLine,
  FaFilter,
  FaPlus,
  FaSearch,
  FaTrophy,
} from "react-icons/fa";
import { skillLevels, sports } from "../data/mockData";
import { useApp } from "../context/AppContext";
import ProfileCard from "../components/ProfileCard";
import StatBar from "../components/StatBar";
import VideoCard from "../components/VideoCard";

const getPreviewUrl = (video) => {
  if (!video?.url) return "";
  if (video.type === "file") return video.url;
  if (video.url.includes("youtube.com/embed/")) return video.url;
  const match = video.url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : video.url;
};

function AthleteDashboard() {
  const { currentUser, coaches, challenges, addVideo, messages, usersById } = useApp();
  const [filters, setFilters] = useState({ search: "", sport: "All" });
  const [videoForm, setVideoForm] = useState({ title: "", url: "" });
  const [videoFile, setVideoFile] = useState(null);

  const filteredCoaches = useMemo(
    () =>
      coaches.filter((coach) => {
        const matchesText =
          !filters.search ||
          [coach.fullName, coach.expertise, coach.location].join(" ").toLowerCase().includes(filters.search.toLowerCase());
        const matchesSport = filters.sport === "All" || coach.sport === filters.sport;
        return matchesText && matchesSport;
      }),
    [coaches, filters],
  );

  const myThreads = messages.filter((thread) => thread.participants.includes(currentUser.id)).slice(0, 3);

  const handleVideoSubmit = (event) => {
    event.preventDefault();
    if (videoFile) {
      const reader = new FileReader();
      reader.onload = () => {
        addVideo({ title: videoForm.title || videoFile.name, url: reader.result, type: "file" });
        setVideoForm({ title: "", url: "" });
        setVideoFile(null);
      };
      reader.readAsDataURL(videoFile);
      return;
    }

    addVideo(videoForm);
    setVideoForm({ title: "", url: "" });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-hero p-8 text-white shadow-glow">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/75">Athlete Dashboard</p>
            <h1 className="mt-3 font-display text-4xl font-bold">Build a profile coaches want to contact.</h1>
            <p className="mt-4 max-w-2xl text-white/85">
              Show your clips, highlight your performance metrics, and keep momentum with weekly challenges and direct
              coach conversations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/profile/edit"
                className="rounded-full bg-white px-5 py-3 font-semibold text-brand-teal transition hover:bg-brand-soft"
              >
                Edit Profile
              </Link>
              <Link
                to="/messages"
                className="rounded-full border border-white/25 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Open Messages
              </Link>
            </div>
          </div>

          <div className="glass-card grid gap-4 p-5 text-brand-dark sm:grid-cols-3">
            <div className="metric-card">
              <p className="text-sm text-slate-500">Profile strength</p>
              <p className="mt-3 text-3xl font-bold">{currentUser.analysis ? "92%" : "70%"}</p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-slate-500">Videos uploaded</p>
              <p className="mt-3 text-3xl font-bold">{currentUser.videos?.length || 0}</p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-slate-500">Coach matches</p>
              <p className="mt-3 text-3xl font-bold">{filteredCoaches.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Your Profile</h2>
              <p className="mt-1 text-sm text-slate-500">Everything coaches care about at a glance.</p>
            </div>
            <Link to={`/athletes/${currentUser.id}`} className="text-sm font-semibold text-brand-teal">
              View public profile
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="metric-card">
              <p className="text-sm text-slate-500">Name</p>
              <p className="mt-2 text-lg font-semibold">{currentUser.fullName}</p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-slate-500">Sport</p>
              <p className="mt-2 text-lg font-semibold">{currentUser.sport}</p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-slate-500">Skill level</p>
              <p className="mt-2 text-lg font-semibold">{currentUser.skillLevel}</p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-slate-500">Location</p>
              <p className="mt-2 text-lg font-semibold">{currentUser.location}</p>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-700">Bio</p>
            <p className="mt-2 leading-7 text-slate-600">{currentUser.bio}</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-soft p-3 text-brand-teal">
              <FaChartLine />
            </div>
            <div>
              <h2 className="section-title">AI Skill Analysis</h2>
              <p className="mt-1 text-sm text-slate-500">Scouting-style feedback from your latest performance set.</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <StatBar label="Power Score" value={currentUser.analysis?.power || 7} />
            <StatBar label="Accuracy" value={currentUser.analysis?.accuracy || 7} accent="bg-brand-mint" />
            <StatBar label="Speed" value={currentUser.analysis?.speed || 7} accent="bg-brand-dark" />
          </div>

          <div className="mt-6 rounded-3xl bg-brand-soft p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-teal">Coachable Insight</p>
            <p className="mt-2 leading-7 text-slate-700">{currentUser.analysis?.feedback}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="section-title">Video Portfolio</h2>
              <p className="mt-1 text-sm text-slate-500">Upload YouTube clips to strengthen your recruiting story.</p>
            </div>
            <div className="rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-teal">
              {currentUser.videos?.length || 0} clips live
            </div>
          </div>

          <form onSubmit={handleVideoSubmit} className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
            <input
              placeholder="Video title"
              value={videoForm.title}
              onChange={(event) => setVideoForm((current) => ({ ...current, title: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
              required={Boolean(videoFile)}
            />
            <input
              placeholder="YouTube URL"
              value={videoForm.url}
              onChange={(event) => setVideoForm((current) => ({ ...current, url: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
              required={!videoFile}
            />
            <input
              type="file"
              accept="video/*"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setVideoFile(file);
                if (file) {
                  setVideoForm((current) => ({ ...current, title: current.title || file.name, url: "" }));
                }
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:font-semibold file:text-brand-teal"
            />
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-teal px-5 py-3 font-semibold text-white transition hover:bg-brand-dark">
              <FaPlus />
              Upload Clip
            </button>
          </form>
          <p className="mt-3 text-sm text-slate-500">Add either a YouTube URL or a local video file for demo playback.</p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {(currentUser.videos || []).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title">Weekly Challenges</h2>
                <p className="mt-1 text-sm text-slate-500">Stay visible with ranked performance entries.</p>
              </div>
              <Link to="/challenges" className="text-sm font-semibold text-brand-teal">
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {challenges.slice(0, 3).map((challenge) => (
                <div key={challenge.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-brand-dark">{challenge.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{challenge.description}</p>
                    </div>
                    <div className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-teal">
                      {challenge.deadline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title">Recent Messages</h2>
                <p className="mt-1 text-sm text-slate-500">Stay on top of active coach conversations.</p>
              </div>
              <Link to="/messages" className="text-sm font-semibold text-brand-teal">
                Open inbox
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {myThreads.map((thread) => {
                const other = usersById[thread.participants.find((id) => id !== currentUser.id)];
                const lastMessage = thread.messages[thread.messages.length - 1];
                return (
                  <Link
                    key={thread.id}
                    to={`/messages?thread=${thread.id}`}
                    className="block rounded-3xl border border-slate-200 p-4 transition hover:border-brand-teal/30 hover:bg-brand-soft/40"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-brand-dark">{other?.fullName}</p>
                      <span className="text-xs text-slate-400">{lastMessage?.timestamp}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{lastMessage?.text || "Start the conversation"}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="section-title">Browse Coaches</h2>
            <p className="mt-1 text-sm text-slate-500">Filter by sport or search by expertise and location.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <FaSearch className="text-slate-400" />
              <input
                placeholder="Search coaches"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                className="w-40 outline-none md:w-56"
              />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <FaFilter className="text-slate-400" />
              <select
                value={filters.sport}
                onChange={(event) => setFilters((current) => ({ ...current, sport: event.target.value }))}
                className="bg-transparent outline-none"
              >
                <option>All</option>
                {sports.map((sport) => (
                  <option key={sport}>{sport}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {filteredCoaches.map((coach) => (
            <ProfileCard
              key={coach.id}
              user={coach}
              actionLabel="View Profile"
              actionTo={`/coaches/${coach.id}`}
              secondaryLabel="Message"
              secondaryTo={`/messages?user=${coach.id}`}
            >
              <p className="text-sm font-semibold text-slate-600">Rate: EUR {coach.hourlyRate}/hour</p>
            </ProfileCard>
          ))}
        </div>
      </section>
    </div>
  );
}

function CoachDashboard() {
  const { currentUser, athletes, offers, postOffer, messages, usersById } = useApp();
  const [filters, setFilters] = useState({ sport: "All", skillLevel: "All", location: "" });
  const [offerForm, setOfferForm] = useState({ title: "", description: "", price: "" });

  const filteredAthletes = useMemo(
    () =>
      athletes.filter((athlete) => {
        const matchesSport = filters.sport === "All" || athlete.sport === filters.sport;
        const matchesLevel = filters.skillLevel === "All" || athlete.skillLevel === filters.skillLevel;
        const matchesLocation =
          !filters.location || athlete.location.toLowerCase().includes(filters.location.toLowerCase());
        return matchesSport && matchesLevel && matchesLocation;
      }),
    [athletes, filters],
  );

  const myOffers = offers.filter((offer) => offer.coachId === currentUser.id);
  const myThreads = messages.filter((thread) => thread.participants.includes(currentUser.id)).slice(0, 4);

  const handleOfferSubmit = (event) => {
    event.preventDefault();
    postOffer(offerForm);
    setOfferForm({ title: "", description: "", price: "" });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-brand-dark p-8 text-white">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/70">Coach Dashboard</p>
            <h1 className="mt-3 font-display text-4xl font-bold">Scout, message, and recruit standout athletes.</h1>
            <p className="mt-4 max-w-2xl text-white/80">
              Build your pipeline with powerful filters, profile-ready video previews, direct messaging, and premium
              coaching offers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/profile/edit"
                className="rounded-full bg-brand-mint px-5 py-3 font-semibold text-brand-dark transition hover:bg-white"
              >
                Edit Coach Profile
              </Link>
              <Link
                to="/messages"
                className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Open Inbox
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="metric-card bg-white/90">
              <p className="text-sm text-slate-500">Athlete matches</p>
              <p className="mt-3 text-3xl font-bold text-brand-dark">{filteredAthletes.length}</p>
            </div>
            <div className="metric-card bg-white/90">
              <p className="text-sm text-slate-500">Active offers</p>
              <p className="mt-3 text-3xl font-bold text-brand-dark">{myOffers.length}</p>
            </div>
            <div className="metric-card bg-white/90">
              <p className="text-sm text-slate-500">Live threads</p>
              <p className="mt-3 text-3xl font-bold text-brand-dark">{myThreads.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Coach Profile</h2>
              <p className="mt-1 text-sm text-slate-500">Your public recruiting and trust-building card.</p>
            </div>
            <Link to={`/coaches/${currentUser.id}`} className="text-sm font-semibold text-brand-teal">
              View public profile
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            <div className="metric-card">
              <p className="text-sm text-slate-500">Expertise</p>
              <p className="mt-2 text-lg font-semibold">{currentUser.expertise}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="metric-card">
                <p className="text-sm text-slate-500">Experience</p>
                <p className="mt-2 text-lg font-semibold">{currentUser.experienceYears} years</p>
              </div>
              <div className="metric-card">
                <p className="text-sm text-slate-500">Hourly Rate</p>
                <p className="mt-2 text-lg font-semibold">EUR {currentUser.hourlyRate}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-700">Bio</p>
              <p className="mt-2 leading-7 text-slate-600">{currentUser.bio}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-soft p-3 text-brand-teal">
              <FaFilter />
            </div>
            <div>
              <h2 className="section-title">Search Athletes</h2>
              <p className="mt-1 text-sm text-slate-500">Filter by sport, skill level, and location.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <select
              value={filters.sport}
              onChange={(event) => setFilters((current) => ({ ...current, sport: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
            >
              <option>All</option>
              {sports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </select>
            <select
              value={filters.skillLevel}
              onChange={(event) => setFilters((current) => ({ ...current, skillLevel: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
            >
              <option>All</option>
              {skillLevels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
            <input
              placeholder="Search location"
              value={filters.location}
              onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
            />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {filteredAthletes.map((athlete) => (
              <ProfileCard
                key={athlete.id}
                user={athlete}
                actionLabel="View Profile"
                actionTo={`/athletes/${athlete.id}`}
                secondaryLabel="Message"
                secondaryTo={`/messages?user=${athlete.id}`}
              >
                {athlete.videos?.[0] ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                    {athlete.videos[0].type === "file" ? (
                      <video className="aspect-video w-full" src={athlete.videos[0].url} controls />
                    ) : (
                      <iframe
                        className="aspect-video w-full"
                        src={getPreviewUrl(athlete.videos[0])}
                        title={athlete.videos[0].title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    <p className="font-semibold text-brand-dark">Latest clip</p>
                    <p className="mt-1">Video ready</p>
                  </div>
                )}
              </ProfileCard>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Post Coaching Offer</h2>
              <p className="mt-1 text-sm text-slate-500">Turn profile interest into a structured program.</p>
            </div>
            <FaBolt className="text-brand-teal" />
          </div>

          <form onSubmit={handleOfferSubmit} className="mt-6 space-y-4">
            <input
              placeholder="Program title"
              value={offerForm.title}
              onChange={(event) => setOfferForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
              required
            />
            <textarea
              placeholder="Describe the coaching offer"
              rows="4"
              value={offerForm.description}
              onChange={(event) => setOfferForm((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
              required
            />
            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                placeholder="Price"
                type="number"
                value={offerForm.price}
                onChange={(event) => setOfferForm((current) => ({ ...current, price: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
                required
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-teal px-6 py-3 font-semibold text-white transition hover:bg-brand-dark">
                <FaPlus />
                Publish Program
              </button>
            </div>
          </form>

          <div className="mt-6 grid gap-4">
            {myOffers.map((offer) => (
              <div key={offer.id} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-brand-dark">{offer.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{offer.description}</p>
                  </div>
                  <span className="rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-teal">
                    EUR {offer.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title">Messages</h2>
                <p className="mt-1 text-sm text-slate-500">Recent athlete conversations and follow-ups.</p>
              </div>
              <Link to="/messages" className="text-sm font-semibold text-brand-teal">
                See all
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {myThreads.map((thread) => {
                const other = usersById[thread.participants.find((id) => id !== currentUser.id)];
                const last = thread.messages[thread.messages.length - 1];
                return (
                  <Link key={thread.id} to={`/messages?thread=${thread.id}`} className="block rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-brand-dark">{other?.fullName}</p>
                      <span className="text-xs text-slate-400">{last?.timestamp}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{last?.text || "No messages yet"}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title">My Recruits</h2>
                <p className="mt-1 text-sm text-slate-500">Strong current fits based on activity and performance.</p>
              </div>
              <FaTrophy className="text-brand-teal" />
            </div>
            <div className="mt-5 space-y-4">
              {filteredAthletes.slice(0, 4).map((athlete) => (
                <div key={athlete.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-brand-dark">{athlete.fullName}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {athlete.sport} • {athlete.skillLevel}
                      </p>
                    </div>
                    <Link to={`/athletes/${athlete.id}`} className="text-sm font-semibold text-brand-teal">
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser } = useApp();
  return currentUser?.role === "coach" ? <CoachDashboard /> : <AthleteDashboard />;
}
