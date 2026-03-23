import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { sampleChallenges, sampleMessages, sampleOffers, sampleUsers, skillLevels } from "../data/mockData";
import { loadState, saveState } from "../utils/storage";

const AppContext = createContext(null);

const createInitialState = () => ({
  users: sampleUsers,
  challenges: sampleChallenges,
  messages: sampleMessages,
  offers: sampleOffers,
  currentUserId: null,
});

const slug = () => Math.random().toString(36).slice(2, 10);

export function AppProvider({ children }) {
  const [state, setState] = useState(() => loadState() || createInitialState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const usersById = useMemo(
    () => Object.fromEntries(state.users.map((user) => [user.id, user])),
    [state.users],
  );

  const currentUser = state.users.find((user) => user.id === state.currentUserId) || null;

  const athletes = state.users.filter((user) => user.role === "athlete");
  const coaches = state.users.filter((user) => user.role === "coach");

  const signup = ({ role, email, password, fullName, sport }) => {
    const existing = state.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { ok: false, message: "An account with this email already exists." };
    }

    const newUser = {
      id: `${role}-${slug()}`,
      role,
      email,
      password,
      fullName,
      sport,
      skillLevel: role === "athlete" ? "Intermediate" : skillLevels[2],
      location: "Set your location",
      bio:
        role === "athlete"
          ? "Ambitious athlete building a standout profile to connect with coaches."
          : "Dedicated coach helping athletes unlock the next level of performance.",
      expertise: role === "coach" ? `${sport} development` : "",
      experienceYears: role === "coach" ? 5 : 0,
      hourlyRate: role === "coach" ? 75 : 0,
      achievements: role === "athlete" ? ["New SportMatch member"] : [],
      certifications: role === "coach" ? ["Verified SportMatch Coach"] : [],
      analysis:
        role === "athlete"
          ? {
              power: 7,
              accuracy: 7,
              speed: 7,
              feedback: "Balanced profile. Add more recent clips to unlock deeper scouting insights.",
            }
          : null,
      videos: [],
      reviews: [],
      photo: "",
      connections: [],
    };

    setState((current) => ({
      ...current,
      users: [...current.users, newUser],
      currentUserId: newUser.id,
    }));

    return { ok: true, user: newUser };
  };

  const login = ({ email, password }) => {
    const user = state.users.find(
      (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password,
    );

    if (!user) {
      return { ok: false, message: "Invalid email or password." };
    }

    setState((current) => ({ ...current, currentUserId: user.id }));
    return { ok: true, user };
  };

  const logout = () => {
    setState((current) => ({ ...current, currentUserId: null }));
  };

  const updateProfile = (updates) => {
    if (!currentUser) return;
    setState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === current.currentUserId ? { ...user, ...updates } : user,
      ),
    }));
  };

  const addVideo = ({ title, url, type = "youtube" }) => {
    if (!currentUser) return;
    const video = { id: `video-${slug()}`, title, url, type };
    setState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === current.currentUserId ? { ...user, videos: [video, ...(user.videos || [])] } : user,
      ),
    }));
  };

  const postOffer = ({ title, description, price }) => {
    if (!currentUser) return;
    const offer = { id: `offer-${slug()}`, coachId: currentUser.id, title, description, price: Number(price) || 0 };
    setState((current) => ({ ...current, offers: [offer, ...current.offers] }));
  };

  const submitChallengeEntry = ({ challengeId, score }) => {
    if (!currentUser) return;
    setState((current) => ({
      ...current,
      challenges: current.challenges.map((challenge) => {
        if (challenge.id !== challengeId) return challenge;
        const withoutCurrent = challenge.leaderboard.filter((entry) => entry.userId !== current.currentUserId);
        return {
          ...challenge,
          leaderboard: [...withoutCurrent, { userId: current.currentUserId, score: Number(score) || 0 }].sort(
            (a, b) => b.score - a.score,
          ),
        };
      }),
    }));
  };

  const ensureConversation = (otherUserId) => {
    if (!currentUser) return null;
    const existing = state.messages.find(
      (conversation) =>
        conversation.participants.includes(currentUser.id) && conversation.participants.includes(otherUserId),
    );
    if (existing) return existing.id;

    const conversationId = `thread-${slug()}`;
    setState((current) => ({
      ...current,
      messages: [
        {
          id: conversationId,
          participants: [current.currentUserId, otherUserId],
          messages: [],
        },
        ...current.messages,
      ],
    }));
    return conversationId;
  };

  const sendMessage = ({ conversationId, otherUserId, text }) => {
    if (!currentUser || !text.trim()) return null;
    const finalConversationId = conversationId || ensureConversation(otherUserId);
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setState((current) => ({
      ...current,
      messages: current.messages.map((conversation) =>
        conversation.id === finalConversationId
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                { id: `chat-${slug()}`, senderId: current.currentUserId, text: text.trim(), timestamp },
              ],
            }
          : conversation,
      ),
    }));

    return finalConversationId;
  };

  const resetDemo = () => setState(createInitialState());

  const value = {
    ...state,
    usersById,
    currentUser,
    athletes,
    coaches,
    signup,
    login,
    logout,
    updateProfile,
    addVideo,
    postOffer,
    submitChallengeEntry,
    ensureConversation,
    sendMessage,
    resetDemo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
