import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaPaperPlane, FaSearch } from "react-icons/fa";
import { useApp } from "../context/AppContext";

export default function MessagesPage() {
  const { currentUser, messages, usersById, ensureConversation, sendMessage } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  const threaded = useMemo(
    () =>
      messages
        .filter((thread) => thread.participants.includes(currentUser.id))
        .map((thread) => ({
          ...thread,
          otherUser: usersById[thread.participants.find((id) => id !== currentUser.id)],
        }))
        .filter((thread) =>
          !search ? true : thread.otherUser?.fullName.toLowerCase().includes(search.toLowerCase()),
        ),
    [currentUser.id, messages, search, usersById],
  );

  useEffect(() => {
    const requestedUser = searchParams.get("user");
    const requestedThread = searchParams.get("thread");

    if (requestedUser && !requestedThread) {
      const id = ensureConversation(requestedUser);
      if (id) {
        setSearchParams({ thread: id });
      }
      return;
    }

    if (!requestedThread && threaded[0]) {
      setSearchParams({ thread: threaded[0].id });
    }
  }, [ensureConversation, searchParams, setSearchParams, threaded]);

  const activeThreadId = searchParams.get("thread");
  const activeThread = threaded.find((thread) => thread.id === activeThreadId) || threaded[0];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!activeThread) return;
    sendMessage({ conversationId: activeThread.id, text: draft });
    setDraft("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="glass-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="section-title">Messages</h1>
            <p className="mt-1 text-sm text-slate-500">Chat list with your active scouting conversations.</p>
          </div>
          <div className="rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-teal">
            {threaded.length} threads
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
          <FaSearch className="text-slate-400" />
          <input
            placeholder="Search conversations"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full outline-none"
          />
        </div>

        <div className="mt-5 space-y-3">
          {threaded.map((thread) => {
            const last = thread.messages[thread.messages.length - 1];
            const isActive = thread.id === activeThread?.id;
            return (
              <button
                key={thread.id}
                onClick={() => setSearchParams({ thread: thread.id })}
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  isActive ? "border-brand-teal bg-brand-soft" : "border-slate-200 bg-white hover:border-brand-teal/25"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-brand-dark">{thread.otherUser?.fullName}</p>
                  <span className="text-xs text-slate-400">{last?.timestamp}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{thread.otherUser?.sport}</p>
                <p className="mt-3 text-sm text-slate-600">{last?.text || "Start a new conversation"}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="glass-card flex min-h-[70vh] flex-col p-6">
        {activeThread ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark">{activeThread.otherUser?.fullName}</h2>
                <p className="mt-1 text-sm text-slate-500 capitalize">
                  {activeThread.otherUser?.role} • {activeThread.otherUser?.sport}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto py-6">
              {activeThread.messages.map((message) => {
                const mine = message.senderId === currentUser.id;
                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-[1.5rem] px-4 py-3 ${
                        mine ? "bg-brand-teal text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <p className="leading-6">{message.text}</p>
                      <p className={`mt-2 text-xs ${mine ? "text-white/70" : "text-slate-400"}`}>{message.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your message"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-teal"
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-teal px-6 py-3 font-semibold text-white transition hover:bg-brand-dark">
                <FaPaperPlane />
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">No conversations yet.</div>
        )}
      </section>
    </div>
  );
}
