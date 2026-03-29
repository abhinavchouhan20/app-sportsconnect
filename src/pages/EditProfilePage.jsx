import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave } from "react-icons/fa";
import { skillLevels, sports } from "../data/mockData";
import { useApp } from "../context/AppContext";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useApp();
  const [form, setForm] = useState({
    fullName: currentUser.fullName || "",
    sport: currentUser.sport || sports[0],
    skillLevel: currentUser.skillLevel || "Intermediate",
    location: currentUser.location || "",
    bio: currentUser.bio || "",
    expertise: currentUser.expertise || "",
    experienceYears: currentUser.experienceYears || 0,
    hourlyRate: currentUser.hourlyRate || 0,
    achievementsText: (currentUser.achievements || []).join("\n"),
    certificationsText: (currentUser.certifications || []).join("\n"),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    updateProfile({
      fullName: form.fullName,
      sport: form.sport,
      skillLevel: currentUser.role === "athlete" ? form.skillLevel : currentUser.skillLevel,
      location: form.location,
      bio: form.bio,
      expertise: currentUser.role === "coach" ? form.expertise : currentUser.expertise,
      experienceYears: currentUser.role === "coach" ? Number(form.experienceYears) || 0 : currentUser.experienceYears,
      hourlyRate: currentUser.role === "coach" ? Number(form.hourlyRate) || 0 : currentUser.hourlyRate,
      achievements:
        currentUser.role === "athlete"
          ? form.achievementsText.split("\n").map((item) => item.trim()).filter(Boolean)
          : currentUser.achievements,
      certifications:
        currentUser.role === "coach"
          ? form.certificationsText.split("\n").map((item) => item.trim()).filter(Boolean)
          : currentUser.certifications,
    });
    navigate("/dashboard");
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Edit Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Keep your SportMatch profile sharp and pitch-ready.</p>
        </div>
        <div className="rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-teal capitalize">
          {currentUser.role}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Full Name</span>
            <input
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Sport</span>
            <select
              value={form.sport}
              onChange={(event) => setForm((current) => ({ ...current, sport: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
            >
              {sports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {currentUser.role === "athlete" ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Skill Level</span>
              <select
                value={form.skillLevel}
                onChange={(event) => setForm((current) => ({ ...current, skillLevel: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
              >
                {skillLevels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </label>
          ) : (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Expertise</span>
              <input
                value={form.expertise}
                onChange={(event) => setForm((current) => ({ ...current, expertise: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Location</span>
            <input
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
            />
          </label>
        </div>

        {currentUser.role === "coach" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Experience Years</span>
              <input
                type="number"
                value={form.experienceYears}
                onChange={(event) => setForm((current) => ({ ...current, experienceYears: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Hourly Rate (EUR)</span>
              <input
                type="number"
                value={form.hourlyRate}
                onChange={(event) => setForm((current) => ({ ...current, hourlyRate: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
              />
            </label>
          </div>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Bio</span>
          <textarea
            rows="5"
            value={form.bio}
            onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
          />
        </label>

        {currentUser.role === "athlete" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Achievements (one per line)</span>
            <textarea
              rows="5"
              value={form.achievementsText}
              onChange={(event) => setForm((current) => ({ ...current, achievementsText: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
            />
          </label>
        ) : (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Certifications (one per line)</span>
            <textarea
              rows="5"
              value={form.certificationsText}
              onChange={(event) => setForm((current) => ({ ...current, certificationsText: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
            />
          </label>
        )}

        <button className="inline-flex items-center gap-2 rounded-2xl bg-brand-teal px-6 py-3 font-semibold text-white transition hover:bg-brand-dark">
          <FaSave />
          Save Changes
        </button>
      </form>
    </div>
  );
}
