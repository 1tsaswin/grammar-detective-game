"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { useHaptic } from "@/hooks/useHaptic";
import { DetectiveID } from "@/components/DetectiveID";
import { AnimatedButton } from "@/components/AnimatedButton";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { GameLayout } from "@/components/GameLayout";
import { CasesTab } from "@/components/hub/CasesTab";
import { EvidenceTab } from "@/components/hub/EvidenceTab";
import { IdTab } from "@/components/hub/IdTab";
import { AchievementsTab } from "@/components/hub/AchievementsTab";
import type { HubTab } from "@/components/BottomNav";
import { CASES, rankForLevel, type HistoryEntry } from "@/lib/cases";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useSettingsStore } from "@/store/settingsStore";
import { useToastStore } from "@/store/toastStore";
import { pageVariants } from "@/lib/animations";
import { videoSrc } from "@/lib/video";

// Client-only: seeds Math.random() motes on mount, so it must never render
// during SSR (would cause a hydration mismatch).
const AmbientParticles = dynamic(
  () => import("@/components/AmbientParticles").then((m) => m.AmbientParticles),
  { ssr: false },
);

type Screen = "entry" | "profile" | "hub" | "casedetail" | "play" | "analyzing" | "closed";
type DetectiveTitle = "Rookie" | "Investigator" | "Sherlock";
type Feedback = "wrongsuspect" | "wrongword" | "wrongguess" | null;
type Selection = { suspectId: string; wordIdx: number } | null;
type ScreenTransitionStyle = "video" | "flash-white" | "flash-black" | "fade";

// Only the two moments with real narrative weight (first arrival at the
// agency, cracking a case) get the video sting. Every other screen change
// is a quick flash/fade cut so the same clip isn't playing on every tap.
const SCREEN_TRANSITIONS: Partial<Record<`${Screen}->${Screen}`, ScreenTransitionStyle>> = {
  "entry->profile": "fade",
  "profile->hub": "video",
  "hub->casedetail": "flash-white",
  "casedetail->play": "flash-black",
  "play->analyzing": "fade",
  "analyzing->closed": "video",
  "closed->hub": "flash-white",
};

// Feedback intensity mirrors visual weight: the two video moments get a
// full success chime + buzz, flashes get a light tap, and the black-cut
// uses the low "error" tone purely for its dramatic register (not a
// failure signal) — fades stay silent since they're the throwaway cuts.
const TRANSITION_FEEDBACK: Record<
  ScreenTransitionStyle,
  { sound?: "tap" | "success" | "error" | "levelup"; haptic?: "tap" | "success" | "error" }
> = {
  video: { sound: "success", haptic: "success" },
  "flash-white": { sound: "tap", haptic: "tap" },
  "flash-black": { sound: "error", haptic: "tap" },
  fade: {},
};

const AVATAR_TINTS = [
  "var(--secondary-noir)",
  "var(--crime-scene-red-dark)",
  "var(--secondary-noir-light)",
];

const POLAROID_ROT = [-3, 2, -2];
const STICKY_ROT = [2, -3, 1];

const TITLE_BASE =
  "flex-1 text-center py-2.5 px-1 text-[11px] rounded-sm border border-black/25 bg-bone text-ink cursor-pointer transition-transform hover:scale-105";
const TITLE_SELECTED =
  "flex-1 text-center py-2.5 px-1 text-[11px] rounded-sm border border-crime-scene-red bg-crime-scene-red text-bone cursor-pointer transition-transform hover:scale-105";

const ZOOM_BY_TEXT_SIZE = { sm: 0.92, md: 1, lg: 1.15 } as const;

const stripPunct = (w: string) => w.replace(/[.,!?]$/, "");

export default function Home() {
  const [screen, setScreen] = useState<Screen>("entry");
  const [hubTab, setHubTab] = useState<HubTab>("id");
  const [name, setName] = useState("");
  const [title, setTitle] = useState<DetectiveTitle>("Rookie");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [xp, setXp] = useState(0);
  const [caseHistory, setCaseHistory] = useState<HistoryEntry[]>([]);
  const [currentCaseId, setCurrentCaseId] = useState<number | null>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [deniedCase, setDeniedCase] = useState<number | null>(null);
  const [confettiKey, setConfettiKey] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [transitionStyle, setTransitionStyle] = useState<ScreenTransitionStyle | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const isFirstScreenRender = useRef(true);
  const prevScreenRef = useRef<Screen>("entry");
  const guessLenRef = useRef(0);

  const { play } = useSound();
  const { vibrate } = useHaptic();
  const brightness = useSettingsStore((s) => s.brightness);
  const vignetteStrength = useSettingsStore((s) => s.vignetteStrength);
  const textSize = useSettingsStore((s) => s.textSize);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const pushToast = useToastStore((s) => s.push);

  const level = 1 + Math.floor(xp / 100);
  const xpIntoLevel = xp % 100;
  const previewName = name || "A. Reyes";
  const avatarTint = AVATAR_TINTS[avatarIdx];
  const currentCase = CASES.find((c) => c.id === currentCaseId) ?? null;
  const guiltySuspect = currentCase?.suspects.find((s) => s.id === currentCase.guiltySuspectId) ?? null;
  const rankName = rankForLevel(level);
  const lastSolved = caseHistory.length > 0 ? caseHistory[caseHistory.length - 1] : null;
  const accuracy = attempts > 0 ? Math.round((correctAttempts / attempts) * 100) : null;

  useEffect(() => {
    if (isFirstScreenRender.current) {
      isFirstScreenRender.current = false;
      prevScreenRef.current = screen;
      return;
    }
    const style = SCREEN_TRANSITIONS[`${prevScreenRef.current}->${screen}`] ?? "fade";
    prevScreenRef.current = screen;

    const feedback = TRANSITION_FEEDBACK[style];
    if (feedback.sound) play(feedback.sound);
    if (feedback.haptic) vibrate(feedback.haptic);

    if (!reduceMotion) setTransitionStyle(style);
  }, [screen, reduceMotion, play, vibrate]);

  function goHub(tab: HubTab = "id") {
    setScreen("hub");
    setHubTab(tab);
  }

  function goPlay() {
    setScreen("play");
    setSelection(null);
    setGuess("");
    setFeedback(null);
  }

  function openCase(id: number, requiredLevel: number) {
    if (level >= requiredLevel) {
      setCurrentCaseId(id);
      setScreen("casedetail");
      return;
    }
    setDeniedCase(id);
    setTimeout(() => setDeniedCase(null), 400);
  }

  function selectTitle(t: DetectiveTitle) {
    play("tap");
    vibrate("tap");
    setTitle(t);
  }

  function selectAvatar(i: number) {
    play("tap");
    vibrate("tap");
    setAvatarIdx(i);
  }

  function handleGuessChange(value: string) {
    if (Math.abs(value.length - guessLenRef.current) === 1) play("type");
    guessLenRef.current = value.length;
    setGuess(value);
  }

  function handleWordClick(suspectId: string, wordIdx: number) {
    play("select");
    vibrate("tap");
    setSelection({ suspectId, wordIdx });
    setGuess("");
    setFeedback(null);
  }

  function handleSubmitGuess() {
    if (!currentCase || !selection || !guiltySuspect) return;
    if (selection.suspectId !== guiltySuspect.id) {
      play("error");
      vibrate("error");
      setFeedback("wrongsuspect");
      setAttempts((n) => n + 1);
      setStreak(0);
      return;
    }
    if (selection.wordIdx !== guiltySuspect.errorIdx) {
      play("error");
      vibrate("error");
      setFeedback("wrongword");
      setAttempts((n) => n + 1);
      setStreak(0);
      return;
    }
    if (stripPunct(guess.trim().toLowerCase()) !== (guiltySuspect.correctWord ?? "").toLowerCase()) {
      play("error");
      vibrate("error");
      setFeedback("wrongguess");
      setAttempts((n) => n + 1);
      setStreak(0);
      return;
    }
    play("correct");
    vibrate("success");
    setFeedback(null);

    const prevLevel = level;
    const prevCount = caseHistory.length;
    const newXp = xp + currentCase.xp;
    const newLevel = 1 + Math.floor(newXp / 100);
    const newCount = prevCount + 1;
    const solvedCase = currentCase;
    const newStreak = streak + 1;

    setAttempts((n) => n + 1);
    setCorrectAttempts((n) => n + 1);
    setStreak(newStreak);
    setLongestStreak((prev) => Math.max(prev, newStreak));
    setXp(newXp);
    setCaseHistory((prev) => [
      ...prev,
      {
        id: solvedCase.id,
        title: solvedCase.title,
        xp: solvedCase.xp,
        grammarType: solvedCase.grammarType,
        usage: solvedCase.usage,
      },
    ]);
    setScreen("analyzing");

    setTimeout(() => {
      setScreen("closed");
      setTimeout(() => play("stamp"), 260);
      pushToast({ kind: "xp", title: `+${solvedCase.xp} XP`, subtitle: solvedCase.title });

      if (newLevel > prevLevel) {
        pushToast({ kind: "levelup", title: `LEVEL ${newLevel}`, subtitle: rankForLevel(newLevel) });
        setConfettiKey(Date.now());
        setTimeout(() => setConfettiKey(null), 2200);

        CASES.forEach((c) => {
          if (prevLevel < c.level && newLevel >= c.level) {
            pushToast({ kind: "info", title: "New Case Available", subtitle: c.title });
          }
        });
      }

      ACHIEVEMENTS.forEach((a) => {
        const was = a.isUnlocked({ level: prevLevel, caseHistoryCount: prevCount, totalCases: CASES.length });
        const now = a.isUnlocked({ level: newLevel, caseHistoryCount: newCount, totalCases: CASES.length });
        if (!was && now) {
          play("achievement");
          pushToast({ kind: "achievement", title: a.title, subtitle: a.description });
        }
      });
    }, 1000);
  }

  function finishCase() {
    goHub("cases");
    setCurrentCaseId(null);
    setSelection(null);
    setGuess("");
    setFeedback(null);
  }

  const vignetteAlphaMid = ((vignetteStrength / 100) * 0.3).toFixed(2);
  const vignetteAlphaEdge = ((vignetteStrength / 100) * 0.85).toFixed(2);

  return (
    <div
      className="bg-corkboard relative flex h-dvh w-full justify-center overflow-x-hidden overflow-y-auto box-border"
      style={{ filter: `brightness(${brightness}%)` }}
    >
      <AmbientParticles />
      <AnimatePresence>
        {showIntro && !reduceMotion && (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[99] bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
          >
            <video
              autoPlay
              muted
              playsInline
              onEnded={() => setShowIntro(false)}
              className="h-full w-full object-cover"
              src={videoSrc("trailer.mp4")}
            />
            <button
              type="button"
              onClick={() => setShowIntro(false)}
              className="absolute right-4 font-typewriter text-xs tracking-[1px] text-bone/70 hover:text-bone"
              style={{ top: "calc(env(safe-area-inset-top) + 16px)" }}
            >
              SKIP →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {transitionStyle === "video" && (
          <motion.video
            key="transition-video"
            autoPlay
            muted
            playsInline
            onEnded={() => setTransitionStyle(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            className="pointer-events-none fixed inset-0 z-[95] h-full w-full object-cover"
            src={videoSrc("transition-particles.mp4")}
          />
        )}
        {(transitionStyle === "flash-white" || transitionStyle === "flash-black") && (
          <motion.div
            key="transition-flash"
            className={`pointer-events-none fixed inset-0 z-[95] ${
              transitionStyle === "flash-white" ? "bg-bone" : "bg-black"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], transition: { duration: 0.36, times: [0, 0.2, 1], ease: "easeOut" } }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => setTransitionStyle(null)}
          />
        )}
        {transitionStyle === "fade" && (
          <motion.div
            key="transition-fade"
            className="pointer-events-none fixed inset-0 z-[95] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0], transition: { duration: 0.46, times: [0, 0.5, 1], ease: "easeInOut" } }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => setTransitionStyle(null)}
          />
        )}
      </AnimatePresence>
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: `radial-gradient(ellipse at center, transparent, rgba(0,0,0,${vignetteAlphaMid}) 55%, rgba(0,0,0,${vignetteAlphaEdge}) 100%)`,
        }}
      />
      <div
        className="relative z-[2] flex w-full max-w-[430px] min-h-dvh flex-col box-border font-officials"
        style={{ zoom: ZOOM_BY_TEXT_SIZE[textSize] }}
      >
        {screen === "hub" && (
          <motion.div
            key="hub"
            variants={pageVariants(reduceMotion)}
            initial="initial"
            animate="animate"
            className="absolute inset-0 flex flex-col overflow-y-auto"
          >
            <GameLayout rankName={rankName} level={level} xpIntoLevel={xpIntoLevel} activeTab={hubTab} onTabChange={setHubTab}>
              {hubTab === "cases" && (
                <CasesTab
                  cases={CASES}
                  level={level}
                  solvedIds={caseHistory.map((h) => h.id)}
                  deniedCase={deniedCase}
                  onOpenCase={openCase}
                />
              )}
              {hubTab === "evidence" && <EvidenceTab caseHistory={caseHistory} />}
              {hubTab === "id" && (
                <IdTab
                  previewName={previewName}
                  title={title}
                  avatarTint={avatarTint}
                  rankName={rankName}
                  casesSolvedCount={caseHistory.length}
                  level={level}
                  xp={xp}
                  xpIntoLevel={xpIntoLevel}
                  accuracy={accuracy}
                  longestStreak={longestStreak}
                  lastSolved={lastSolved}
                  onViewEvidence={() => setHubTab("evidence")}
                />
              )}
              {hubTab === "achievements" && (
                <AchievementsTab
                  state={{ level, caseHistoryCount: caseHistory.length, totalCases: CASES.length }}
                />
              )}
            </GameLayout>
          </motion.div>
        )}

        {screen !== "hub" && (
          <motion.div
            key={screen}
            variants={pageVariants(reduceMotion)}
            initial="initial"
            animate="animate"
            className="absolute inset-0 flex flex-col overflow-y-auto box-border px-5"
            style={{
              paddingTop: "calc(env(safe-area-inset-top) + 24px)",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 32px)",
            }}
          >
            {screen === "entry" && (
              <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden text-center">
                {!reduceMotion && (
                  <>
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
                      src={videoSrc("home-loop.mp4")}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/35" />
                  </>
                )}
                <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
                  <div
                    className="font-typewriter leading-[1.15] tracking-[2px] text-bone"
                    style={{ fontSize: "clamp(28px,9vw,38px)", animation: "fadeInUp 0.6s ease-out" }}
                  >
                    GRAMMAR
                    <br />
                    DETECTIVE
                  </div>
                  <div
                    className="mt-[22px] font-handwriting text-crime-scene-red-bright"
                    style={{
                      fontSize: "clamp(22px,7vw,28px)",
                      transform: "rotate(-3deg)",
                      animation: "stampIn 0.6s 0.35s ease-out backwards",
                    }}
                  >
                    The Alibi Error
                  </div>
                  <AnimatedButton
                    onClick={() => setScreen("profile")}
                    className="mt-14 w-full rounded-[3px] bg-primary-noir p-4 text-center font-typewriter text-[15px] tracking-[1px] text-bone shadow-pin-drop hover:brightness-110"
                    style={{
                      animation:
                        "fadeInUp 0.5s 0.55s ease-out backwards, glowPulse 2.4s 1.3s ease-in-out infinite",
                    }}
                  >
                    ENTER THE AGENCY
                  </AnimatedButton>
                </div>
              </div>
            )}

            {screen === "profile" && (
              <div className="flex flex-1 flex-col gap-[18px] pt-2">
                <div className="font-typewriter text-[13px] tracking-[1px] text-bone/80">
                  NEW DETECTIVE INTAKE FORM
                </div>
                <div className="flex justify-center" style={{ animation: "noteSettle 0.5s ease-out" }}>
                  <DetectiveID
                    detectiveName={previewName}
                    title={title}
                    badgeNumber="GD-0001"
                    joinDate="Est. 2026"
                    avatarTint={avatarTint}
                  />
                </div>
                <div
                  className="box-border flex flex-col gap-4 rounded-md bg-aged-paper-light p-5 shadow-lifted"
                  style={{ animation: "fadeInUp 0.5s 0.15s ease-out backwards" }}
                >
                  <div>
                    <label className="mb-1.5 block text-[11px] text-ink/65">DISPLAY NAME</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="A. Reyes"
                      className="w-full box-border rounded-sm border border-black/20 bg-bone px-2.5 py-2.5 font-officials text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] text-ink/65">DETECTIVE TITLE</label>
                    <div className="flex gap-2">
                      {(["Rookie", "Investigator", "Sherlock"] as const).map((t) => (
                        <div
                          key={t}
                          onClick={() => selectTitle(t)}
                          className={title === t ? TITLE_SELECTED : TITLE_BASE}
                        >
                          {t.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] text-ink/65">AVATAR</label>
                    <div className="flex gap-3">
                      {AVATAR_TINTS.map((tint, i) => (
                        <div
                          key={i}
                          onClick={() => selectAvatar(i)}
                          className="cursor-pointer rounded-[2px] bg-bone p-1 shadow-photo transition-transform hover:scale-105"
                          style={{
                            outline: avatarIdx === i ? "2px solid var(--crime-scene-red-bright)" : "2px solid transparent",
                            outlineOffset: 2,
                          }}
                        >
                          <div className="h-9 w-9 rounded-[1px]" style={{ background: tint }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <AnimatedButton
                  onClick={() => goHub("id")}
                  sound="none"
                  haptic="none"
                  className="mt-auto w-full rounded-[3px] bg-primary-noir p-4 text-center font-typewriter text-[15px] tracking-[1px] text-bone shadow-pin-drop hover:brightness-110"
                  style={{ animation: "fadeInUp 0.5s 0.3s ease-out backwards" }}
                >
                  ENTER LOBBY
                </AnimatedButton>
              </div>
            )}

            {screen === "casedetail" && currentCase && (
              <div className="flex flex-1 flex-col gap-5 pt-2">
                <div
                  onClick={() => {
                    play("tap");
                    vibrate("tap");
                    goHub("cases");
                  }}
                  className="cursor-pointer text-xs text-bone/60"
                >
                  ← CASE FILES
                </div>
                <div
                  className="bg-aged-paper p-5 font-typewriter text-ink shadow-photo"
                  style={{ animation: "noteSettle 0.45s ease-out" }}
                >
                  <div className="mb-2 text-[11px] tracking-[1px] text-crime-scene-red">{currentCase.label}</div>
                  <div className="mb-2.5 text-[17px] font-semibold">{currentCase.title}</div>
                  <div className="text-[13px] leading-[1.6]">{currentCase.briefing}</div>
                </div>
                <AnimatedButton
                  onClick={goPlay}
                  sound="none"
                  haptic="none"
                  className="w-full rounded-[3px] bg-primary-noir p-4 text-center font-typewriter text-[15px] tracking-[1px] text-bone shadow-pin-drop hover:brightness-110"
                  style={{ animation: "fadeInUp 0.5s 0.15s ease-out backwards" }}
                >
                  START INVESTIGATION
                </AnimatedButton>
              </div>
            )}

            {screen === "play" && currentCase && (
              <div className="flex flex-1 flex-col gap-4 pt-2">
                <div
                  onClick={() => {
                    play("tap");
                    vibrate("tap");
                    setScreen("casedetail");
                  }}
                  className="cursor-pointer self-start text-xs text-bone/60"
                >
                  ← {currentCase.title}
                </div>

                <div className="font-typewriter text-[10px] tracking-[1px] text-bone/45">
                  WITNESS STATEMENTS — SWIPE TO COMPARE →
                </div>

                <div className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-3 pt-2">
                  {currentCase.suspects.map((s, i) => {
                    const words = s.statement.split(" ");
                    return (
                      <div
                        key={s.id}
                        className="w-[178px] shrink-0 snap-center"
                        style={{ animation: `fadeInUp 0.45s ${i * 0.12}s ease-out backwards` }}
                      >
                        <div
                          className="relative mx-auto w-[150px] bg-white p-2 pb-9 shadow-xl shadow-black/50"
                          style={{ transform: `rotate(${POLAROID_ROT[i]}deg)` }}
                        >
                          <div className="absolute left-1/2 -top-2.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-crime-scene-red-bright shadow-pin-drop" />
                          <div
                            className="h-[105px] w-full"
                            style={{ background: "linear-gradient(160deg,#3a3a3a,#1a1a1a)" }}
                            aria-label={`${s.name} silhouette placeholder`}
                          />
                          <div className="absolute bottom-4 left-2.5 font-handwriting text-sm font-semibold text-ink">
                            {s.name}
                          </div>
                        </div>
                        <div
                          className="relative -mt-3 ml-4 w-[170px] bg-post-it-yellow px-3.5 pb-3 pt-4 shadow-xl shadow-black/40"
                          style={{ transform: `rotate(${STICKY_ROT[i]}deg)` }}
                        >
                          <p className="font-handwriting text-[17px] leading-snug" style={{ color: "#1c2b4a" }}>
                            {words.map((word, wi) => {
                              const selected = selection?.suspectId === s.id && selection.wordIdx === wi;
                              return (
                                <span
                                  key={wi}
                                  onClick={() => handleWordClick(s.id, wi)}
                                  className="cursor-pointer hover:underline hover:decoration-dotted"
                                  style={{
                                    textDecoration: selected ? "underline" : undefined,
                                    textDecorationStyle: selected ? "wavy" : undefined,
                                    textDecorationColor: selected ? "var(--crime-scene-red)" : undefined,
                                    color: selected ? "var(--crime-scene-red-bright)" : undefined,
                                  }}
                                >
                                  {word}{" "}
                                </span>
                              );
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selection && (
                  <div
                    className="box-border w-full rounded-sm bg-aged-paper px-4 py-4 shadow-lifted"
                    style={{ transform: "rotate(-0.4deg)", animation: "fadeInUp 0.35s ease-out" }}
                  >
                    <div className="mb-1 font-typewriter text-[11px] tracking-[1px] text-ink/60">
                      TYPE THE CORRECTION:
                    </div>
                    <input
                      value={guess}
                      onChange={(e) => handleGuessChange(e.target.value)}
                      placeholder="……………"
                      className="w-full border-0 border-b-2 border-ink/30 bg-transparent px-1 py-2 font-typewriter text-base tracking-wide text-ink placeholder:text-ink/30 focus:border-crime-scene-red focus:outline-none"
                    />
                    <AnimatedButton
                      onClick={handleSubmitGuess}
                      sound="none"
                      haptic="none"
                      className="mt-3 w-full rounded-[3px] bg-primary-noir p-3 text-center font-typewriter text-[13px] tracking-[1px] text-bone hover:brightness-[1.15]"
                      style={{ animation: "glowPulse 2s ease-in-out infinite" }}
                    >
                      SUBMIT CORRECTION
                    </AnimatedButton>
                  </div>
                )}

                {feedback === "wrongsuspect" && (
                  <div
                    className="text-center font-typewriter text-[13px] text-crime-scene-red-bright"
                    style={{ animation: "shakeX 0.4s ease-in-out" }}
                  >
                    That alibi checks out — look elsewhere.
                  </div>
                )}
                {feedback === "wrongword" && (
                  <div
                    className="text-center font-typewriter text-[13px] text-crime-scene-red-bright"
                    style={{ animation: "shakeX 0.4s ease-in-out" }}
                  >
                    That word looks fine — pick the one that&apos;s actually wrong.
                  </div>
                )}
                {feedback === "wrongguess" && (
                  <div
                    className="text-center font-typewriter text-[13px] text-crime-scene-red-bright"
                    style={{ animation: "shakeX 0.4s ease-in-out" }}
                  >
                    Close — check the spelling/tense and try again.
                  </div>
                )}
              </div>
            )}

            {screen === "analyzing" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <div className="font-typewriter text-sm tracking-[3px] text-crime-scene-red-bright animate-pulse">
                  ANALYZING EVIDENCE…
                </div>
                <div className="font-typewriter text-[11px] tracking-[1px] text-bone/40">
                  Cross-referencing statements
                </div>
              </div>
            )}

            {screen === "closed" && currentCase && guiltySuspect && (
              <div className="relative flex flex-1 flex-col overflow-hidden">
                {!reduceMotion && (
                  <>
                    <video
                      autoPlay
                      muted
                      playsInline
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80"
                      src={videoSrc("level-complete.mp4")}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/45" />
                  </>
                )}
                <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 text-center">
                  <div
                    className="font-typewriter text-3xl tracking-[2px] text-crime-scene-red-bright"
                    style={{
                      border: "4px double var(--crime-scene-red-bright)",
                      padding: "14px 20px",
                      transform: "rotate(-6deg)",
                      animation: "stampSlam 0.6s ease-out",
                    }}
                  >
                    CASE SOLVED
                  </div>
                  <div
                    className="max-w-[300px] font-officials text-[13px] leading-[1.6] text-bone/85"
                    style={{ animation: "fadeInUp 0.5s 0.4s ease-out backwards" }}
                  >
                    &quot;{stripPunct(guiltySuspect.statement.split(" ")[guiltySuspect.errorIdx!])}&quot; should
                    be{" "}
                    <span className="font-semibold text-crime-scene-red-bright">
                      &quot;{guiltySuspect.correctWord}&quot;
                    </span>
                    . {currentCase.explanation}
                  </div>
                  <div
                    className="box-border w-full border border-black/15 bg-aged-paper px-4 py-3.5 text-left"
                    style={{ animation: "fadeInUp 0.5s 0.5s ease-out backwards" }}
                  >
                    <div className="font-typewriter text-[10px] tracking-[1px] text-crime-scene-red">
                      GRAMMAR FILE: {currentCase.grammarType}
                    </div>
                    <div className="mt-[5px] font-officials text-xs leading-[1.5] text-ink">
                      {currentCase.usage}
                    </div>
                  </div>
                  <div
                    className="font-typewriter text-[13px] text-post-it-yellow"
                    style={{ animation: "fadeInUp 0.5s 0.6s ease-out backwards" }}
                  >
                    +{currentCase.xp} XP
                  </div>
                  <AnimatedButton
                    onClick={finishCase}
                    sound="none"
                    haptic="none"
                    className="w-full rounded-[3px] bg-primary-noir p-[15px] text-center font-typewriter text-sm tracking-[1px] text-bone shadow-pin-drop hover:brightness-110"
                    style={{ animation: "fadeInUp 0.5s 0.8s ease-out backwards" }}
                  >
                    BACK TO CASE FILES
                  </AnimatedButton>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {confettiKey !== null && <ConfettiBurst key={confettiKey} />}
    </div>
  );
}
