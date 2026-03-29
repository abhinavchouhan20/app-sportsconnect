"use client";

import { useContext, useState } from "react";
import { AppContext } from "@/components/client-providers";
import { consumeChatQuestion, getRemainingChatQuestions } from "@/lib/plans";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatExperience() {
  const { user, setUser } = useContext(AppContext);
  const hasBirthProfile =
    Boolean(user.birthProfile.dateOfBirth) &&
    Boolean(user.birthProfile.timeOfBirth) &&
    Boolean(user.birthProfile.placeOfBirth || (user.birthProfile.latitude && user.birthProfile.longitude));
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        hasBirthProfile
          ? "Ask one question about your path, timing, relationships, or career. Your saved birth profile is active here, so I can answer with kundli-aware guidance."
          : "Ask one question about your path, timing, relationships, or career. If you save your birth date, birth time, and birthplace in Profile, this chat can answer from your kundli too."
    }
  ]);
  const [draft, setDraft] = useState("");
  const remaining = getRemainingChatQuestions(user);

  const ask = async () => {
    if (!draft.trim()) return;
    if (remaining !== null && remaining <= 0) {
      setMessages([
        ...messages,
        {
          role: "assistant",
          content: "You have used today’s chat allowance on the free tier. Upgrade or switch to a higher plan to continue asking questions today."
        }
      ]);
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, content: draft }];
    setMessages(nextMessages);
    setUser(consumeChatQuestion(user));
    setDraft("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: draft,
        plan: user.plan,
        userName: user.name,
        birthProfile: user.birthProfile
      })
    });
    const data = (await response.json()) as { content: string };
    setMessages([...nextMessages, { role: "assistant", content: data.content }]);
  };

  return (
    <div className="glass card">
      <div className="badge">AI astrologer chat</div>
      <p className="section-copy" style={{ marginTop: 16 }}>
        {remaining === null ? "Unlimited questions available on your current plan." : `${remaining} question(s) remaining today.`}
      </p>
      <p className="section-copy">
        {hasBirthProfile
          ? `Using saved birth profile: ${user.birthProfile.dateOfBirth} • ${user.birthProfile.timeOfBirth} • ${user.birthProfile.placeOfBirth || "Custom coordinates"}`
          : "No saved birth profile is active yet. Add DOB, TOB, and POB in Profile for personalized chart-based answers."}
      </p>
      <div className="grid" style={{ marginTop: 20 }}>
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            style={{
              maxWidth: "82%",
              justifySelf: message.role === "user" ? "end" : "start",
              padding: 16,
              borderRadius: 22,
              background: message.role === "user" ? "rgba(240,197,109,0.15)" : "rgba(255,255,255,0.05)"
            }}
          >
            {message.content}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <input
          className="input"
          placeholder={remaining === 0 ? "Today's chat limit reached" : "Ask your next question"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={remaining === 0}
        />
        <button className="primary-btn" onClick={ask} disabled={remaining === 0}>
          Send
        </button>
      </div>
    </div>
  );
}
