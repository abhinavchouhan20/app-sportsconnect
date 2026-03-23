import { Link, useParams } from "react-router-dom";
import { FaAward, FaMapMarkerAlt, FaPaperPlane, FaStar, FaVideo } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import VideoCard from "../components/VideoCard";

export default function CoachProfilePage() {
  const { coachId } = useParams();
  const { coaches, currentUser, offers } = useApp();
  const coach = coaches.find((item) => item.id === coachId);

  if (!coach) {
    return <div className="glass-card p-8">Coach not found.</div>;
  }

  const coachOffers = offers.filter((offer) => offer.coachId === coach.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-brand-dark p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/10 text-2xl font-bold">
                {coach.fullName
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-white/70">Coach Profile</p>
                <h1 className="mt-2 font-display text-4xl font-bold">{coach.fullName}</h1>
                <p className="mt-2 text-white/80">{coach.expertise}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/85">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt />
                {coach.location}
              </span>
              <span className="flex items-center gap-2">
                <FaAward />
                {coach.experienceYears} years experience
              </span>
            </div>
          </div>

          {currentUser?.role === "athlete" ? (
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/messages?user=${coach.id}`}
                className="rounded-full bg-brand-mint px-5 py-3 font-semibold text-brand-dark"
              >
                Book Session
              </Link>
              <Link
                to={`/messages?user=${coach.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 font-semibold text-white"
              >
                <FaPaperPlane />
                Message
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="glass-card p-6">
          <h2 className="section-title">Coach Overview</h2>
          <p className="mt-4 leading-7 text-slate-600">{coach.bio}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="metric-card">
              <p className="text-sm text-slate-500">Sport</p>
              <p className="mt-2 text-lg font-semibold">{coach.sport}</p>
            </div>
            <div className="metric-card">
              <p className="text-sm text-slate-500">Hourly Rate</p>
              <p className="mt-2 text-lg font-semibold">${coach.hourlyRate}</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="font-semibold text-brand-dark">Experience and Certifications</p>
            <div className="mt-4 space-y-3">
              {(coach.certifications || []).map((certification) => (
                <div key={certification} className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                  {certification}
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
              <h2 className="section-title">Reviews & Ratings</h2>
              <p className="mt-1 text-sm text-slate-500">Mock social proof for pitch-ready trust.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {(coach.reviews || []).map((review) => (
              <div key={review.id} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-brand-dark">{review.name}</p>
                  <span className="text-sm font-semibold text-amber-500">{review.rating}.0 ★</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{review.text}</p>
              </div>
            ))}
          </div>

          {coachOffers.length ? (
            <div className="mt-6 rounded-3xl bg-brand-soft p-5">
              <p className="font-semibold text-brand-dark">Programs Available</p>
              <div className="mt-4 space-y-3">
                {coachOffers.map((offer) => (
                  <div key={offer.id} className="rounded-2xl bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-brand-dark">{offer.title}</p>
                        <p className="mt-2 text-sm text-slate-600">{offer.description}</p>
                      </div>
                      <span className="rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-teal">
                        ${offer.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-soft p-3 text-brand-teal">
            <FaVideo />
          </div>
          <div>
            <h2 className="section-title">Coach Media</h2>
            <p className="mt-1 text-sm text-slate-500">Preview methodology and training philosophy.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {(coach.videos || []).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
}
