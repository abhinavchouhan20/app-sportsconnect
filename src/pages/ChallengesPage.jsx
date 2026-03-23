import { useState } from "react";
import { FaMedal, FaTrophy } from "react-icons/fa";
import { useApp } from "../context/AppContext";

export default function ChallengesPage() {
  const { challenges, usersById, currentUser, submitChallengeEntry } = useApp();
  const [scores, setScores] = useState({});

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-hero p-8 text-white">
        <p className="text-sm uppercase tracking-[0.25em] text-white/70">Talent Challenges</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Weekly competitions that keep athletes visible.</h1>
        <p className="mt-4 max-w-3xl text-white/85">
          Athletes can submit challenge entries, climb leaderboards, and give coaches a live view of competitive form.
        </p>
      </section>

      <section className="grid gap-6">
        {challenges.map((challenge) => {
          const sorted = [...challenge.leaderboard].sort((a, b) => b.score - a.score);
          return (
            <div key={challenge.id} className="glass-card p-6">
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-brand-teal">{challenge.sport}</p>
                      <h2 className="mt-2 text-2xl font-bold text-brand-dark">{challenge.title}</h2>
                    </div>
                    <div className="rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-teal">
                      {challenge.deadline}
                    </div>
                  </div>
                  <p className="mt-4 leading-7 text-slate-600">{challenge.description}</p>

                  {currentUser.role === "athlete" ? (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        submitChallengeEntry({ challengeId: challenge.id, score: scores[challenge.id] || 0 });
                        setScores((current) => ({ ...current, [challenge.id]: "" }));
                      }}
                      className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row"
                    >
                      <input
                        type="number"
                        max="100"
                        min="1"
                        placeholder="Enter your score"
                        value={scores[challenge.id] || ""}
                        onChange={(event) =>
                          setScores((current) => ({ ...current, [challenge.id]: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
                      />
                      <button className="rounded-2xl bg-brand-teal px-6 py-3 font-semibold text-white transition hover:bg-brand-dark">
                        Submit Entry
                      </button>
                    </form>
                  ) : null}
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-brand-soft p-3 text-brand-teal">
                      <FaTrophy />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-dark">Leaderboard</h3>
                      <p className="text-sm text-slate-500">Top performers ranked by challenge score.</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {sorted.map((entry, index) => (
                      <div key={`${challenge.id}-${entry.userId}`} className="flex items-center justify-between rounded-3xl border border-slate-200 p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft font-bold text-brand-teal">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-brand-dark">{usersById[entry.userId]?.fullName}</p>
                            <p className="text-sm text-slate-500">{usersById[entry.userId]?.sport}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-600">
                          <FaMedal />
                          {entry.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
