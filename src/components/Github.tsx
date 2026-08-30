import { useCallback, useEffect, useState } from "react";
import { ROBOT } from "../lib/ascii";
import { useStore } from "../lib/store";
import { Chip, IcExternal, IcFork, IcStar, PlatformGlyph, Reveal, Scramble, SectionHead } from "./ui";

interface GhRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  sample?: boolean;
}

interface GhEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
}

const LANG_COLORS: Record<string, string> = {
  Python: "#3d5bd9",
  JavaScript: "#c07f10",
  TypeScript: "#3d5bd9",
  Jupyter: "#c07f10",
  "Jupyter Notebook": "#c07f10",
  C: "#47435a",
  "C++": "#6c4bd3",
  HTML: "#e8503a",
  CSS: "#17835a",
  Shell: "#17835a",
  Java: "#e8503a",
};

const SAMPLE_REPOS: GhRepo[] = [
  { id: 1, name: "neuroquery", description: "RAG document intelligence over 40k+ policy docs — FAISS, Llama 3.1, FastAPI.", html_url: "https://github.com", stargazers_count: 148, forks_count: 23, language: "Python", pushed_at: "2026-01-18", sample: true },
  { id: 2, name: "signspeak", description: "Real-time sign-language translation with MediaPipe + BiLSTM, 24 fps on CPU.", html_url: "https://github.com", stargazers_count: 96, forks_count: 14, language: "Python", pushed_at: "2026-01-02", sample: true },
  { id: 3, name: "promptforge", description: "A/B prompt evaluation playground with cost & latency accounting.", html_url: "https://github.com", stargazers_count: 61, forks_count: 8, language: "Python", pushed_at: "2025-12-20", sample: true },
  { id: 4, name: "sentinelvision", description: "CCTV anomaly detection — YOLOv8 + DeepSORT with per-zone rule engine.", html_url: "https://github.com", stargazers_count: 44, forks_count: 9, language: "Python", pushed_at: "2025-11-30", sample: true },
  { id: 5, name: "gitpulse", description: "One-command GitHub health report: streaks, language drift, burnout flags.", html_url: "https://github.com", stargazers_count: 38, forks_count: 4, language: "Python", pushed_at: "2025-11-12", sample: true },
  { id: 6, name: "vit-from-scratch", description: "Vision Transformer built by hand — patches, attention, no library internals.", html_url: "https://github.com", stargazers_count: 27, forks_count: 6, language: "Jupyter Notebook", pushed_at: "2025-10-08", sample: true },
];

function timeAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 3600) return `${Math.max(1, Math.floor(d / 60))}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  if (d < 86400 * 30) return `${Math.floor(d / 86400)}d ago`;
  return `${Math.floor(d / (86400 * 30))}mo ago`;
}

function RepoCard({ r, delay }: { r: GhRepo; delay: number }) {
  return (
    <Reveal delay={delay}>
      <a
        href={r.html_url}
        target="_blank"
        rel="noreferrer"
        className="group block h-full border border-ink/15 bg-card p-5 card-lift relative overflow-hidden"
      >
        {r.sample && (
          <span className="absolute top-3 right-3 font-mono text-[8.5px] tracking-[0.14em] border border-amber/50 text-amber px-1.5 py-0.5 bg-paper">
            SAMPLE
          </span>
        )}
        <div className="flex items-center gap-2 font-mono text-[11px] text-mut">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="2" /><path d="M8 8h3v3H8zM13 13h3v3h-3zM11 9.5h2.5V13" /></svg>
          {r.name}
        </div>
        <p className="text-[13.5px] text-ink2 mt-2.5 leading-relaxed min-h-[40px]">
          {r.description || "No description."}
        </p>
        <div className="mt-4 flex items-center gap-4 font-mono text-[10.5px] text-mut">
          {r.language && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: LANG_COLORS[r.language] ?? "#7d7891" }} />
              {r.language}
            </span>
          )}
          <span className="flex items-center gap-1"><IcStar className="w-3 h-3" /> {r.stargazers_count}</span>
          <span className="flex items-center gap-1"><IcFork className="w-3 h-3" /> {r.forks_count}</span>
          <span className="ml-auto group-hover:text-coral transition-colors">{timeAgo(r.pushed_at)}</span>
        </div>
        <span className="absolute bottom-0 left-0 h-[2.5px] w-full bg-coral scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-400" aria-hidden />
      </a>
    </Reveal>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-ink/15 bg-card p-5 animate-pulse">
      <div className="h-3 w-28 bg-ink/10" />
      <div className="h-3 w-full bg-ink/8 mt-4" />
      <div className="h-3 w-3/4 bg-ink/8 mt-2" />
      <div className="flex gap-3 mt-5">
        <div className="h-3 w-14 bg-ink/8" />
        <div className="h-3 w-10 bg-ink/8" />
        <div className="h-3 w-10 bg-ink/8" />
      </div>
    </div>
  );
}

export default function Github() {
  const { content } = useStore();
  const username = content.profile.githubUsername.trim();
  const [repos, setRepos] = useState<GhRepo[] | null>(null);
  const [events, setEvents] = useState<GhEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<"recent" | "stars" | "active">("recent");
  const [count, setCount] = useState(6);

  const fetchAll = useCallback(
    async (user: string) => {
      setLoading(true);
      setError("");
      setRepos(null);
      try {
        const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=60&sort=pushed`);
        if (!res.ok) throw new Error(res.status === 404 ? `GitHub user "${user}" was not found.` : `GitHub API responded ${res.status}.`);
        const data = (await res.json()) as GhRepo[];
        setRepos(data.filter((r) => !(r as unknown as { fork?: boolean }).fork));
        fetch(`https://api.github.com/users/${encodeURIComponent(user)}/events/public?per_page=8`)
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((e: GhEvent[]) => setEvents(e))
          .catch(() => setEvents(null));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not reach the GitHub API.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (username) fetchAll(username);
    else {
      setRepos(null);
      setError("");
    }
  }, [username, fetchAll]);

  const sorted = (list: GhRepo[]) => {
    const l = [...list];
    if (sort === "stars") l.sort((a, b) => b.stargazers_count - a.stargazers_count);
    else if (sort === "active") l.sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());
    else l.sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());
    return l.slice(0, count);
  };

  const shown = repos ? sorted(repos) : null;
  const isSample = shown?.[0]?.sample;

  return (
    <section id="github" className="relative py-20 sm:py-28 bg-paper2/50 border-y border-ink/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            num="04"
            label="OPEN SOURCE / CODE"
            title={
              <>
                Straight from <em className="italic text-coral font-display">GitHub</em>.
              </>
            }
            sub="Live from the API — repositories, languages, stars and recent activity. No inflated numbers."
          />
          <Reveal delay={140} className="flex flex-wrap items-center gap-2 pb-2">
            {(
              [
                ["recent", "MOST RECENT"],
                ["stars", "MOST STARS"],
                ["active", "MOST ACTIVE"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSort(k)}
                className={`font-mono text-[10px] tracking-[0.14em] px-3 py-1.5 border transition-all ${
                  sort === k ? "bg-ink text-paper border-ink" : "border-ink/20 text-ink2 hover:border-ink"
                }`}
              >
                {label}
              </button>
            ))}
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="bg-card border border-ink/20 rounded-md px-2.5 py-1.5 text-[11px] font-mono text-ink"
              aria-label="Number of repositories to show"
            >
              {[6, 9, 12].map((n) => (
                <option key={n} value={n}>{n} repos</option>
              ))}
            </select>
          </Reveal>
        </div>

        <div className="mt-12">
          {!username && !repos && (
            <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center border border-dashed border-ink/25 bg-card px-6 sm:px-10 py-10">
              <pre className="ascii text-[10.5px] text-ink2 hidden sm:block" aria-hidden>{ROBOT}</pre>
              <div>
                <div className="font-mono text-[10.5px] text-mut">$ github --connect</div>
                <h3 className="font-display text-2xl font-semibold mt-2">This shelf is waiting for a username.</h3>
                <p className="text-ink2 mt-2 max-w-xl text-[14.5px]">
                  Set the GitHub username in <a href="#/admin" className="link-underline text-coral font-mono text-[13px]">/admin → Settings</a> and
                  repositories load here automatically from the public API. Until then, preview the layout with clearly-labelled sample data:
                </p>
                <button
                  onClick={() => setRepos(SAMPLE_REPOS)}
                  className="mt-5 font-mono text-[11px] tracking-[0.14em] border border-ink/25 px-4 py-2.5 hover:bg-ink hover:text-paper transition-colors"
                >
                  LOAD LABELLED SAMPLE →
                </button>
              </div>
            </div>
          )}

          {username && loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {username && error && !loading && (
            <div className="border border-coral/40 bg-coral/[0.05] px-6 py-8 text-center">
              <div className="font-mono text-xs text-coral">⚠ {error}</div>
              <p className="text-ink2 text-sm mt-2">
                Fix the username in <a href="#/admin" className="link-underline text-coral">/admin → Settings</a>, or retry.
              </p>
              <button onClick={() => fetchAll(username)} className="mt-4 font-mono text-[11px] border border-ink/25 px-4 py-2 hover:bg-ink hover:text-paper transition-colors">
                RETRY ↻
              </button>
            </div>
          )}

          {shown && (
            <>
              {isSample && (
                <div className="font-mono text-[10.5px] text-amber mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber rounded-full" /> SAMPLE DATA — set your GitHub username in /admin → Settings to load live repositories.
                </div>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shown.map((r, i) => (
                  <RepoCard key={r.id} r={r} delay={(i % 3) * 70} />
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={username && !isSample ? `https://github.com/${username}` : "https://github.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] bg-ink text-paper px-5 py-3 hover:bg-coral transition-colors"
                >
                  FULL PROFILE <IcExternal className="w-3 h-3" />
                </a>
                {events && events.length > 0 && !isSample && (
                  <div className="flex-1 min-w-[260px] font-mono text-[10.5px] text-mut border border-ink/12 bg-card px-4 py-2.5 overflow-x-auto whitespace-nowrap">
                    <span className="text-iris">recent activity:</span>{" "}
                    {events.slice(0, 5).map((e) => (
                      <span key={e.id} className="mr-4">
                        <span className="text-ink2">{e.type.replace("Event", "")}</span> · {e.repo.name} · {timeAgo(e.created_at)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <CodingActivity />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Coding activity                                                     */
/* ------------------------------------------------------------------ */

interface CfUser { handle: string; rating: number; maxRating: number; rank: string }

function CodeforcesCard() {
  const { content } = useStore();
  const handle = content.profile.codeforces.trim();
  const [user, setUser] = useState<CfUser | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");

  useEffect(() => {
    if (!handle) return;
    setState("loading");
    fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: { result: CfUser[] }) => {
        setUser(j.result[0]);
        setState("ok");
      })
      .catch(() => setState("err"));
  }, [handle]);

  return (
    <div className="border border-ink/15 bg-card p-5 card-lift">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-ink"><PlatformGlyph platform="codeforces" /> <span className="font-mono text-xs font-semibold">Codeforces</span></span>
        <Chip tone="cobalt">OFFICIAL API</Chip>
      </div>
      {!handle && <p className="font-mono text-[11px] text-mut mt-3">handle not set — add it in /admin → Settings</p>}
      {handle && state === "loading" && <p className="font-mono text-[11px] text-mut mt-3 animate-pulse">$ codeforces --user {handle} …</p>}
      {handle && state === "err" && <p className="font-mono text-[11px] text-coral mt-3">handle "{handle}" not found on Codeforces</p>}
      {handle && state === "ok" && user && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div><div className="font-display text-2xl font-semibold">{user.rating}</div><div className="font-mono text-[9.5px] text-mut uppercase tracking-wider">rating</div></div>
          <div><div className="font-display text-2xl font-semibold text-cobalt">{user.maxRating}</div><div className="font-mono text-[9.5px] text-mut uppercase tracking-wider">max</div></div>
          <div><div className="font-display text-2xl font-semibold capitalize">{user.rank}</div><div className="font-mono text-[9.5px] text-mut uppercase tracking-wider">rank</div></div>
        </div>
      )}
      <a href={`https://codeforces.com/profile/${handle || ""}`} target="_blank" rel="noreferrer" className="mt-4 inline-block font-mono text-[10.5px] tracking-[0.12em] text-ink2 link-underline">
        PROFILE →
      </a>
    </div>
  );
}

export function CodingActivity() {
  const { content } = useStore();
  const p = content.profile;
  const platforms = [
    { name: "LeetCode", handle: p.leetcode, url: `https://leetcode.com/u/${p.leetcode}`, note: "stats on profile — no stable public API" },
    { name: "HackerRank", handle: p.hackerrank, url: `https://www.hackerrank.com/profile/${p.hackerrank}`, note: "badges & certificates on profile" },
    { name: "Kaggle", handle: p.kaggle, url: `https://www.kaggle.com/${p.kaggle}`, note: "competitions, datasets, notebooks" },
  ];
  return (
    <div id="coding" className="mt-20">
      <Reveal>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] tracking-[0.22em] text-coral">04.b</span>
          <span className="font-mono text-[11px] tracking-[0.22em] text-ink2 uppercase"><Scramble text="CODING ACTIVITY" /></span>
          <span className="rule-tick text-line flex-1 max-w-[140px]" aria-hidden />
        </div>
      </Reveal>
      <Reveal delay={80}>
        <h3 className="font-display text-2xl sm:text-3xl font-semibold mt-3">
          Reps, <em className="italic text-coral font-display">ratings</em> & rabbit holes.
        </h3>
      </Reveal>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Reveal delay={60}><CodeforcesCard /></Reveal>
        {platforms.map((pl, i) => (
          <Reveal key={pl.name} delay={120 + i * 70}>
            <div className="border border-ink/15 bg-card p-5 card-lift h-full flex flex-col">
              <div className="flex items-center gap-2 text-ink">
                <PlatformGlyph platform={pl.name} />
                <span className="font-mono text-xs font-semibold">{pl.name}</span>
              </div>
              <p className="font-mono text-[10.5px] text-mut mt-3 leading-relaxed flex-1">{pl.note}</p>
              <a
                href={pl.handle ? pl.url : "#/admin"}
                target={pl.handle ? "_blank" : undefined}
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.12em] text-ink2 link-underline"
              >
                {pl.handle ? `@${pl.handle} →` : "SET HANDLE IN /ADMIN →"}
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
