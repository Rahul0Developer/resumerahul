import { lazy, Suspense, useEffect, useState } from "react";
import { StoreProvider } from "./lib/store";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import { Experience, Education } from "./components/Experience";
import Projects from "./components/Projects";
import Github from "./components/Github";
import Lab from "./components/Lab";
import Skills, { Achievements } from "./components/Skills";
import { Certificates, Resume } from "./components/Creds";
import { Socials, Contact } from "./components/Contact";
import { Cursor, ScrollProgress } from "./components/ui";

const Admin = lazy(() => import("./components/Admin"));

function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => {
      setHash(window.location.hash);
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return hash;
}

function Home() {
  return (
    <div className="relative dot-grid-faint">
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Github />
        <Lab />
        <Skills />
        <Certificates />
        <Achievements />
        <Education />
        <Resume />
        <Socials />
        <Contact />
      </main>
    </div>
  );
}

function AdminFallback() {
  return (
    <div className="min-h-screen bg-ink grid place-items-center">
      <div className="font-mono text-xs text-paper/60 caret">$ loading admin desk</div>
    </div>
  );
}

export default function App() {
  const route = useHashRoute();
  const isAdmin = route.startsWith("#/admin");

  return (
    <StoreProvider>
      <div className="min-h-screen bg-paper text-ink selection:bg-coral">
        {isAdmin ? (
          <Suspense fallback={<AdminFallback />}>
            <Admin />
          </Suspense>
        ) : (
          <>
            <Home />
            <Cursor />
            <ScrollProgress />
          </>
        )}
        <div className="noise-layer" aria-hidden />
      </div>
    </StoreProvider>
  );
}
