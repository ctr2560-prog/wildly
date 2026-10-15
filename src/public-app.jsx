import React, { useEffect, useMemo, useRef, useState } from "react";
import "../landing.css";
import WildlyHome from "./home-page.jsx";
import TrackaPage from "./tracka-page.jsx";
import { SchoolsPage, AboutPage } from "./education-pages.jsx";
import "./public-design.css";
import { subjectImage } from "./subject-identity.js";
import LoadingScreen from "./wildly-loader.jsx";

const basePath = import.meta.env.BASE_URL;
const routePath = (path = "") => `${basePath}#${path}`;
const assetPath = (path) => `${basePath}${path}`;
const teacherRoute = (path = "") => routePath(path ? `teacher/${path}` : "teacher");
const teacherPreviewRoute = () => teacherRoute("preview");
const studentRoute = (path = "") => routePath(path ? `student/${path}` : "student");
const loginRoute = () => routePath("login");
const signupRoute = () => routePath("get-started");

const assets = {
  wildlyLogo: assetPath("assets/wildly-logo-transparent.png"),
  trackaLogo: assetPath("assets/taronga-tracka-logo-colour.png"),
  heroKoala: assetPath("assets/hero-koala.jpg"),
  koala: assetPath("assets/koala.jpg"),
  river: assetPath("assets/river.png"),
  rhino: assetPath("assets/rhino.jpg"),
  giraffe: assetPath("assets/giraffe.jpg"),
  binturong: assetPath("assets/binturong.jpg"),
  gorilla: assetPath("assets/gorilla.jpg"),
  tvScreenshot: assetPath("assets/TV-Screenshot.png"),
  dashboardScreenshot: assetPath("assets/wildly-dashboard-homepage.png"),
  homeVideo: assetPath("assets/wildly-home-giraffe.mp4"),
  homeVideoPoster: assetPath("assets/wildly-home-giraffe-poster.jpg"),
  tarongaClassroom: assetPath("assets/taronga-habitat-classroom.jpg"),
  tarongaBushland: assetPath("assets/taronga-bushland-classroom.jpg"),
  tarongaOutdoor: assetPath("assets/taronga-outdoor-learning.jpg"),
  tarongaPlLectureTheatre: assetPath("assets/taronga-pl-lecture-theatre.jpg"),
  tarongaKeeperTortoise: assetPath("assets/taronga-education-keeper-tortoise.webp"),
  tarongaRainforestClassroom: assetPath("assets/taronga-education-rainforest-classroom.webp"),
};

const subjects = [
  ["Science", "science", "Discover the living world and our place in it."],
  ["English", "english", "Communicate, create and explore ideas that matter."],
  ["Literacy & Numeracy", "litnum", "Build core literacy and numeracy capability through real-world, nature-based learning."],
  ["Mathematics", "maths", "Make sense of patterns, numbers and the world around you."],
  ["HSIE", "hsie", "Understand people, places, histories and how we shape society."],
  ["PDHPE", "pdhpe", "Build wellbeing, strong relationships and healthy communities."],
  ["CAPA", "capa", "Imagine, express and connect through creativity."],
  ["Technology & STEM", "stem", "Design, innovate and solve real-world challenges."],
  ["Early Years", "earlyyears", "Play-based, story-led and sensory learning for pre-school and Early Stage 1."],
];

const defaultContentItems = [
  { id: "adaptations-australian-animals", title: "Adaptations of Australian Animals", type: "Lesson", subject: "Science", stage: "Stage 2", progress: 65, imageKey: "river", summary: "Stage 2 science lesson with teacher guide and student prompts.", description: "Explore animal adaptations through observation, vocabulary and evidence-based explanation.", status: "Published", order: 1 },
  { id: "first-nations-cultures-country", title: "First Nations Cultures and Country", type: "Resource", subject: "HSIE", stage: "Stage 3", progress: 40, imageKey: "rhino", summary: "First Nations perspectives for Stage 3 inquiry.", description: "Support respectful inquiry into Country, culture and conservation connections.", status: "Published", order: 2 },
  { id: "sustainable-futures", title: "Sustainable Futures", type: "Learning Path", subject: "Technology & STEM", stage: "Stage 4", progress: 25, imageKey: "binturong", summary: "8 lessons across Science, HSIE and Technology & STEM.", description: "Build a sequence around conservation design, systems thinking and action planning.", status: "Published", order: 3 },
  { id: "persuasive-texts-wildlife-action", title: "Persuasive Texts for Wildlife Action", type: "Lesson", subject: "English", stage: "Stage 3", progress: 15, imageKey: "koala", summary: "Writing task with model texts and scaffolds.", description: "Use wildlife conservation contexts to plan, draft and refine persuasive writing.", status: "Draft", order: 4 },
  { id: "animal-movement-data-patterns", title: "Animal Movement and Data Patterns", type: "Resource", subject: "Mathematics", stage: "Stage 3", progress: 55, imageKey: "giraffe", summary: "Data activity using animal movement and habitat observations.", description: "Interpret data patterns and represent findings using classroom-friendly datasets.", status: "Published", order: 5 },
  { id: "wellbeing-through-nature", title: "Wellbeing Through Nature Connection", type: "Lesson", subject: "PDHPE", stage: "Stage 2", progress: 80, imageKey: "gorilla", summary: "Reflection lesson connecting wellbeing, nature and community.", description: "Guide students through reflective prompts about nature connection and wellbeing.", status: "Review", order: 6 },
];

function Icon({ type, className = "nav-svg" }) {
  const icons = {
    grid: <><rect x="3" y="4" width="7" height="7" rx="1.5" /><rect x="14" y="4" width="7" height="7" rx="1.5" /><rect x="3" y="15" width="7" height="5" rx="1.5" /><rect x="14" y="15" width="7" height="5" rx="1.5" /></>,
    users: <><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3.5 19c.7-3.4 2.3-5 4.5-5s3.8 1.6 4.5 5" /><path d="M13.5 18.8c.5-2.5 1.8-3.8 3.7-3.8 1.6 0 2.8 1 3.3 3.8" /></>,
    cap: <><path d="M3 8.5 12 4l9 4.5-9 4.5L3 8.5Z" /><path d="M7 11v4.5c1.2 1.3 2.9 2 5 2s3.8-.7 5-2V11" /><path d="M20 9v5" /></>,
    report: <><path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h9L19 7.5V20H5Z" /><path d="M15 4v4h4" /><path d="M8 16v-3" /><path d="M12 16v-6" /><path d="M16 16v-4" /></>,
    bookmark: <path d="M7 4h10v16l-5-3-5 3V4Z" />,
    book: <><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5v-16Z" /><path d="M5 5.5A2.5 2.5 0 0 1 7.5 8H20" /><path d="M8 12h8" /><path d="M8 15h6" /></>,
    blocks: <><rect x="4" y="11" width="7" height="7" rx="1.4" /><rect x="13" y="11" width="7" height="7" rx="1.4" /><path d="M8.5 11V6.5A2.5 2.5 0 0 1 11 4h2a2.5 2.5 0 0 1 2.5 2.5V11" /><path d="M6.5 15h2" /><path d="M15.5 15h2" /><path d="M10 7h4" /></>,
    calendar: <><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M8 3.5v4" /><path d="M16 3.5v4" /><path d="M4 10h16" /><path d="M8 14h2" /><path d="M13 14h2" /></>,
    leaf: <><path d="M20 4C10 4 5 9 5 19c10 0 15-5 15-15Z" /><path d="M5 19c3.8-4.6 7.5-7.5 12-9" /></>,
    speech: <><path d="M5 6.5h9a4 4 0 0 1 4 4v6H9l-4 3v-13Z" /><path d="M8 10h7" /><path d="M8 13h5" /></>,
    calc: <><rect x="5" y="3.5" width="14" height="17" rx="2" /><path d="M8 8h8" /><path d="M8 12h2" /><path d="M14 12h2" /><path d="M8 16h2" /><path d="M14 16h2" /></>,
    globe: <><circle cx="12" cy="12" r="8" /><path d="M4 12h16" /><path d="M12 4c2 2.2 3 4.9 3 8s-1 5.8-3 8" /><path d="M12 4c-2 2.2-3 4.9-3 8s1 5.8 3 8" /></>,
    heart: <><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /><path d="M7.5 12h2l1.2-2.2 2.2 4.2 1.3-2h2.3" /></>,
    palette: <><path d="M12 4a8 8 0 0 0 0 16h1.5a2 2 0 0 0 1.3-3.5c-.7-.6-.3-1.8.7-1.8H17A4 4 0 0 0 21 11c0-3.9-4-7-9-7Z" /><circle cx="8.5" cy="10" r=".9" /><circle cx="11.5" cy="8" r=".9" /><circle cx="14.5" cy="10" r=".9" /></>,
    code: <><path d="m8 8-4 4 4 4" /><path d="m16 8 4 4-4 4" /><path d="m13.5 5-3 14" /></>,
    path: <><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 6h4a3 3 0 0 1 0 6h-1a3 3 0 0 0 0 6h5" /></>,
    pin: <><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.4" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="M12 2v4" /><path d="M12 18v4" /><path d="M2 12h4" /><path d="M18 12h4" /></>,
    bell: <><path d="M18 9.5a6 6 0 0 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
    monitor: <><rect x="4" y="5" width="16" height="12" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><path d="M8 9h4" /><path d="M8 13h8" /></>,
    play: <><rect x="4" y="5" width="16" height="14" rx="2" /><path d="m10 9 5 3.5-5 3.5Z" /></>,
    mediaPlay: <path d="m9 6 9 6-9 6V6Z" />,
    pause: <><path d="M9 6v12" /><path d="M15 6v12" /></>,
    arrowRight: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    link: <><path d="M10.5 13.5 13.5 10.5" /><path d="M8.2 16.8 6.7 18.3a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0" /><path d="m15.8 7.2 1.5-1.5a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0" /></>,
    chevron: <path d="m7 9.5 5 5 5-5" />,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  };
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true">{icons[type]}</svg>;
}

const tabDomId = (groupId, itemId) => `${groupId}-tab-${String(itemId).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

function AccessibleTabs({
  id,
  items,
  activeId,
  onChange,
  ariaLabel,
  className,
  getItemId = (item) => item.id,
  getClassName = () => "",
  renderItem,
}) {
  const tabRefs = useRef([]);

  function handleKeyDown(event, index) {
    const direction = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    let nextIndex = index;
    if (direction) nextIndex = (index + direction + items.length) % items.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = items.length - 1;
    else return;

    event.preventDefault();
    const nextItem = items[nextIndex];
    onChange(getItemId(nextItem));
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className={className} role="tablist" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const itemId = getItemId(item, index);
        const selected = itemId === activeId;
        return (
          <button
            key={itemId}
            ref={(node) => { tabRefs.current[index] = node; }}
            id={tabDomId(id, itemId)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${id}-panel`}
            tabIndex={selected ? 0 : -1}
            className={getClassName(item, selected)}
            onClick={() => onChange(itemId)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {renderItem(item, selected)}
          </button>
        );
      })}
    </div>
  );
}

function Reveal({ as: Tag = "div", children, className = "", delay = 0, variant = "up", style, ...props }) {
  const revealRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = revealRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={revealRef}
      className={`motion-reveal motion-reveal-${variant}${isVisible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={{ ...style, "--reveal-delay": `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  );
}

// Adds an `is-visible` class when scrolled into view, without applying any
// transform/opacity of its own — used to trigger opacity-only child staggers
// (e.g. the platform cards, which have their own hover/offset transforms that a
// full motion-reveal would fight with).
function InView({ as: Tag = "div", children, className = "", ...props }) {
  const nodeRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={nodeRef} className={`${className}${isVisible ? " is-visible" : ""}`} {...props}>
      {children}
    </Tag>
  );
}

function subjectIconType(label) {
  return {
    Science: "leaf",
    English: "speech",
    "Literacy & Numeracy": "book",
    Mathematics: "calc",
    HSIE: "globe",
    PDHPE: "heart",
    CAPA: "palette",
    "Technology & STEM": "code",
    "Early Years": "blocks",
  }[label];
}

const appLinks = {
  tracka: "https://tarongatracka.com.au",
  demoBooking: routePath("demo-booking"),
  support: routePath("support"),
  excursions: "https://taronga.org.au/education/sydney-excursions",
  professionalLearning: teacherRoute("professional-learning"),
};


function normalizeEditorialStatus(status = "", fallback = "Draft") {
  const value = String(status || "").trim().toLowerCase();
  if (value === "published") return "Published";
  if (value === "review") return "Review";
  if (value === "draft") return "Draft";
  return fallback;
}

function resolvePublicContentItem(item = {}) {
  return {
    progress: 0,
    status: "Draft",
    type: "Resource",
    subject: "Science",
    stage: "Stage 2",
    ...item,
    image: item.image || assets[item.imageKey] || assets.heroKoala,
  };
}

function useContentItems() {
  const [items, setItems] = useState(defaultContentItems.map(resolvePublicContentItem));
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};

    async function connect() {
      try {
        const [{ db }, { collection, onSnapshot }] = await Promise.all([
          import("./firebase.js"),
          import("firebase/firestore"),
        ]);
        if (cancelled) return;

        unsubscribe = onSnapshot(
          collection(db, "contentItems"),
          (snapshot) => {
            if (snapshot.empty) {
              setItems(defaultContentItems.map(resolvePublicContentItem));
              setStatus("missing");
              return;
            }
            const nextItems = snapshot.docs
              .map((snapshotDoc) => resolvePublicContentItem({ id: snapshotDoc.id, ...snapshotDoc.data() }))
              .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
            setItems(nextItems);
            setStatus("live");
          },
          (error) => {
            console.error("Unable to load public content collection", error);
            setItems(defaultContentItems.map(resolvePublicContentItem));
            setStatus(error.code === "permission-denied" ? "fallback" : "error");
          },
        );
      } catch (error) {
        console.error("Unable to initialise public content collection", error);
        if (!cancelled) {
          setItems(defaultContentItems.map(resolvePublicContentItem));
          setStatus("error");
        }
      }
    }

    connect();
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { items, status };
}

function SiteHeader({ active = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const menuToggleRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 16));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  const navItems = [
    ["learning-paths", "Learning Paths"],
    ["tracka", "Taronga Tracka"],
    ["schools", "For Schools"],
    ["about", "About"],
  ];
  const mobileItems = [["subjects", "Teaching resources"], ...navItems];

  useEffect(() => {
    function dismissNavigation(event) {
      if (event.key === "Escape") {
        if (menuOpen) {
          setMenuOpen(false);
          menuToggleRef.current?.focus();
        }
        return;
      }

      if (menuOpen && !headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", dismissNavigation);
    document.addEventListener("pointerdown", dismissNavigation);
    return () => {
      document.removeEventListener("keydown", dismissNavigation);
      document.removeEventListener("pointerdown", dismissNavigation);
    };
  }, [menuOpen]);

  function closeNavigation() {
    setMenuOpen(false);
  }

  return (
    <header ref={headerRef} className={`site-header ${menuOpen ? "menu-open" : ""} ${scrolled ? "is-scrolled" : ""}`}>
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); const main = document.getElementById("main-content"); main?.focus(); main?.scrollIntoView(); }}>Skip to main content</a>
      <a className="site-logo" href={routePath()} aria-label="Wildly by Taronga home"><img src={assets.wildlyLogo} alt="Wildly by Taronga" width="1144" height="520" /></a>
      <nav className="site-nav" aria-label="Main navigation">
        <a className={active === "subjects" ? "selected" : ""} href={routePath("subjects")}>Teaching resources</a>
        {navItems.map(([path, label]) => (
          <a key={path} className={active === path ? "selected" : ""} href={routePath(path)}>{label}</a>
        ))}
      </nav>
      <div className="header-actions"><a className="login-link" href={loginRoute()}>Log in</a><a className="start-link" href={signupRoute()}>Get started free</a></div>
      <button
        ref={menuToggleRef}
        className="public-menu-toggle"
        type="button"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        aria-controls="public-mobile-navigation"
        onClick={() => setMenuOpen((current) => !current)}
      >
        <span></span><span></span><span></span>
      </button>
      <div className="public-mobile-menu" id="public-mobile-navigation">
        <nav aria-label="Mobile navigation">
          {mobileItems.map(([path, label]) => (
            <a key={path} className={active === path ? "selected" : ""} href={routePath(path)} onClick={closeNavigation}>{label}</a>
          ))}
        </nav>
        <div className="public-mobile-actions"><a className="login-link" href={loginRoute()} onClick={closeNavigation}>Log in</a><a className="start-link" href={signupRoute()} onClick={closeNavigation}>Get started free</a></div>
      </div>
    </header>
  );
}

function ProductBrowserFrame({ src, alt, children, className = "" }) {
  return (
    <div className={`product-browser-frame ${className}`.trim()}>
      <div className="product-browser-bar" aria-hidden="true">
        <span></span><span></span><span></span>
        <strong>Wildly teacher workspace</strong>
      </div>
      <img src={src} alt={alt} width="2922" height="1592" fetchPriority="high" />
      {children}
    </div>
  );
}


function SiteFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-main">
        <div className="public-footer-brand">
          <img src={assets.wildlyLogo} alt="Wildly by Taronga" width="1144" height="520" loading="lazy" />
          <p>Teaching resources from Taronga Conservation Society Australia.</p>
        </div>
        <div className="public-footer-column">
          <strong>Explore</strong>
          <a href={routePath("subjects")}>Resources</a>
          <a href={routePath("learning-paths")}>Learning Paths</a>
          <a href={routePath("tracka")}>Taronga Tracka</a>
        </div>
        <div className="public-footer-column">
          <strong>Wildly</strong>
          <a href={routePath("about")}>About</a>
          <a href={routePath("schools")}>For schools</a>
          <a href={appLinks.excursions} target="_blank" rel="noreferrer">Taronga excursions</a>
        </div>
        <div className="public-footer-cta">
          <strong>Your Wildly account</strong>
          <a className="start-link" href={signupRoute()}>Get started free</a>
          <a href={loginRoute()}>Already have an account? Log in</a>
        </div>
      </div>
      <div className="public-footer-bottom">
        <span>© Taronga Conservation Society Australia</span>
        <a className="staff-login" href={routePath("staff")}>Taronga staff login</a>
      </div>
    </footer>
  );
}

function StudentHeroPhonePreview({ variant = "hero" }) {
  const isHero = variant === "hero";
  return (
    <div className={`phone student-phone ${isHero ? "hero-student-phone" : "live-student-phone"}`}>
      <div className="student-phone-bar">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="student-phone-screen">
        <span className="student-phone-pill">{isHero ? "Live lesson" : "Student-paced"}</span>
        <h3>{isHero ? "Adaptations of Australian Animals" : "Rainforest Detectives"}</h3>
        <p>{isHero ? "Step 2 of 5" : "Animal observation task"}</p>
        {isHero ? (
          <>
            <div className="student-phone-question">
              <strong>Which feature helps a koala live in trees?</strong>
            </div>
            <div className="student-phone-options">
              <span>Sharp claws for climbing</span>
              <span>Bright feathers for display</span>
              <span>Gills for swimming</span>
            </div>
            <a href={studentRoute()} className="student-phone-cta">Submit</a>
          </>
        ) : (
          <>
            <div className="student-phone-animal">
              <img src={assets.koala} alt="Koala" />
            </div>
            <div className="student-phone-question">
              <strong>Watch, pause and note one adaptation you notice.</strong>
            </div>
            <a href={studentRoute()} className="student-phone-cta">Join lesson</a>
          </>
        )}
      </div>
    </div>
  );
}

function HeroSecondaryLaptopPreview() {
  return (
    <div className="secondary-laptop">
      <div className="secondary-laptop-screen">
        <div className="secondary-laptop-toolbar">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="secondary-laptop-body">
          <span className="student-phone-pill">Live lesson</span>
          <h3>Adaptations of Australian Animals</h3>
          <p>Student view on device</p>
          <div className="student-phone-question">
            <strong>Which feature helps a koala live in trees?</strong>
          </div>
          <a href={studentRoute()} className="student-phone-cta">Submit</a>
        </div>
      </div>
      <div className="secondary-laptop-base"></div>
    </div>
  );
}

function LandingSubjectStrip() {
  const [flippedSubject, setFlippedSubject] = useState("");

  return (
    <div className="subject-strip-scroll" aria-label="Subject overview">
      {subjects.map(([label, cls, copy]) => {
        const isFlipped = flippedSubject === label;
        return (
          <button
            type="button"
            className={`subject-flip-card ${cls} ${isFlipped ? "flipped" : ""}`}
            key={label}
            onClick={() => setFlippedSubject(isFlipped ? "" : label)}
            aria-pressed={isFlipped}
          >
            <span className="subject-flip-inner">
              <span className="subject-flip-face subject-flip-front">
                <Icon type={subjectIconType(label)} className="" />
                <strong>{label}</strong>
              </span>
              <span className="subject-flip-face subject-flip-back">
                <strong>{label}</strong>
                <span>{copy}</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LandingTarongaTvPreview() {
  return (
    <div className="landing-tv-screenshot-card" aria-label="Taronga TV preview">
      <img src={assets.tvScreenshot} alt="Taronga TV teacher-side preview" width="2280" height="1248" loading="lazy" />
    </div>
  );
}

function TrackaMarketingPage() {
  return <TrackaPage SiteHeader={SiteHeader} SiteFooter={SiteFooter} AccessibleTabs={AccessibleTabs} tabDomId={tabDomId} Icon={Icon} assets={assets} appLinks={appLinks} routePath={routePath} />;
}


function LearningPathsMarketingPage() {
  const LAYERS = [
    ["blocks", "acc-green", "Learning Path", "The whole unit — duration, curriculum outcomes, planning materials and every lesson in order."],
    ["target", "acc-teal", "Lesson", "A single teaching block with its own objectives, timing and notes. Works inside a path or on its own."],
    ["link", "acc-amber", "Resource", "The file, link, worksheet, video or activity — attached to the exact lesson it belongs to."],
  ];

  const FEATURES = [
    ["grid", "Plan the whole unit at once", "Open a path and see the full sequence — outcomes, timing and every lesson from start to finish, in one place."],
    ["cap", "Teach one lesson at a time", "Each lesson stands on its own with clear objectives, so you always know the next move in front of the class."],
    ["bookmark", "Resources where they belong", "Files and links live on the lesson they support — no hunting through folders in the middle of teaching."],
  ];

  const CONNECT = [
    ["Before", "Build the vocabulary, background knowledge and a clear question worth investigating."],
    ["During", "Head to the zoo or a digital experience with Taronga Tracka to observe, explore and gather real context."],
    ["After", "Come back to the path to reflect, dig deeper and turn the experience into student action."],
  ];

  return (
    <>
      <SiteHeader active="learning-paths" />
      <main className="lp-page lp2-page" id="main-content" tabIndex="-1">

        <section className="lp2-hero">
          <div className="lp2-hero-copy">
          <span className="audience-pill">Learning Paths</span>
          <h1>Plan the whole unit. Teach one lesson at a time.</h1>
          <p className="lp2-hero-lead">Learning Paths connect outcomes, lessons and resources into one sequence you can plan from and teach week by week.</p>
          <div className="hero-actions">
            <a className="primary-action animated-link" href={signupRoute()}><span>Get started free</span><Icon type="arrowRight" /></a>
            <a className="secondary-action" href={routePath("subjects")}>Explore resources</a>
          </div>
          </div>
          <img className="lp2-hero-photo" src={assets.tarongaBushland} alt="Students learning together in a Taronga bushland classroom" width="1423" height="1067" fetchPriority="high" />
        </section>

        <section className="lp2-band lp2-model">
          <Reveal className="public-section-heading">
            <span className="audience-pill">How a path fits together</span>
            <h2>One path. Three layers that connect.</h2>
            <p>A path holds the big picture, each lesson makes the next teaching move clear, and every resource sits where it is actually used.</p>
          </Reveal>
          <InView className="lp2-model-grid">
            {LAYERS.map(([icon, accent, label, desc], index) => (
              <article key={label} className={`lp2-node ${accent}`} style={{ "--card-index": index }}>
                <span className="lp2-node-icon" aria-hidden="true"><Icon type={icon} className="" /></span>
                <h3>{label}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </InView>
        </section>

        <section className="lp2-features">
          <Reveal className="public-section-heading">
            <span className="audience-pill">Built for how you teach</span>
            <h2>Everything in the right place, every time.</h2>
          </Reveal>
          <InView className="lp2-feature-grid">
            {FEATURES.map(([icon, title, desc], index) => (
              <article key={title} className="lp2-feature" style={{ "--card-index": index }}>
                <span className="lp2-feature-icon" aria-hidden="true"><Icon type={icon} className="" /></span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </InView>
        </section>

        <section className="lp2-band lp2-connect">
          <Reveal className="public-section-heading">
            <span className="audience-pill">Classroom to Taronga and back</span>
            <h2>A sequence that reaches beyond the classroom.</h2>
            <p>A path can prepare a class for a zoo or digital Tracka experience, then use that experience as evidence for deeper inquiry.</p>
          </Reveal>
          <InView className="lp2-connect-grid">
            {CONNECT.map(([title, desc], index) => (
              <article key={title} className="lp2-step" style={{ "--card-index": index }}>
                <span className="lp2-step-num">{index + 1}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </InView>
        </section>

        <Reveal as="section" className="lp2-cta-band" variant="scale">
          <span className="subjects-soon-badge"><span className="subject-soon-dot" aria-hidden="true"></span>In development</span>
          <h2>The first learning paths are on their way.</h2>
          <p>We are building complete, curriculum-aligned units with the Taronga education team. Create a free account and they will be waiting in your dashboard as each one is ready.</p>
          <div className="hero-actions">
            <a className="primary-action animated-link" href={signupRoute()}><span>Get started free</span><Icon type="arrowRight" /></a>
            <a className="secondary-action" href={teacherPreviewRoute()}>Preview the dashboard</a>
          </div>
        </Reveal>

        <SiteFooter />
      </main>
    </>
  );
}

function SchoolsMarketingPage() {
  return <SchoolsPage SiteHeader={SiteHeader} SiteFooter={SiteFooter} assets={assets} routePath={routePath} Icon={Icon} />;
}

function AboutMarketingPage() {
  return <AboutPage SiteHeader={SiteHeader} SiteFooter={SiteFooter} assets={assets} routePath={routePath} Icon={Icon} appLinks={appLinks} />;
}

function SubjectsMarketingPage({ initialSubject = "" }) {
  const { items: contentItems, status } = useContentItems();
  const [activeSubject, setActiveSubject] = useState(initialSubject);
  const imageBySubject = Object.fromEntries(subjects.map(([label]) => [label, subjectImage(label)]));

  // Never present fallback samples as published resources. Collection errors
  // and genuinely empty collections have different, actionable messages.
  const publishedItems = useMemo(() => (
    status === "live"
      ? contentItems.filter((item) => (
          normalizeEditorialStatus(item.status, "Draft") === "Published"
          && !/^test\b/i.test(String(item.title || "").trim())
        ))
      : []
  ), [contentItems, status]);

  const availableCount = (label) => publishedItems.filter((item) => item.subject === label).length;
  const firstAvailableSubject = subjects.find(([label]) => availableCount(label) > 0)?.[0] || "";
  const selectedSubject = activeSubject || firstAvailableSubject || "Science";
  const visibleItems = selectedSubject ? publishedItems.filter((item) => item.subject === selectedSubject) : [];

  function handleSelectSubject(label) {
    setActiveSubject(label);
    window.history.replaceState(null, "", routePath(`subjects/${encodeURIComponent(label)}`));
    requestAnimationFrame(() => {
      const panel = document.getElementById("subject-collection-panel");
      panel?.focus({ preventScroll: true });
      panel?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
  }

  return (
    <>
      <SiteHeader active="subjects" />
      <main className="marketing-page subjects-page public-subjects-page" id="main-content" tabIndex="-1">
        <section className="subjects-hero public-subjects-hero">
          <div className="subjects-hero-copy">
            <span className="audience-pill">The Wildly library</span>
            <h1>{activeSubject || "A living world of learning."}</h1>
            <p className="hero-subtitle">Nine curriculum areas, each grounded in nature, real conservation and Taronga expertise.</p>
            <div className="hero-actions">
              <a className="primary-action" href={signupRoute()}>Get started free</a>
              <a className="secondary-action" href={routePath("learning-paths")}>See Learning Paths</a>
            </div>
          </div>
          <figure className="public-subjects-media">
            <img src={assets.tarongaOutdoor} alt="Students observing animals during an outdoor learning experience at Taronga" width="2000" height="1335" fetchPriority="high" />
          </figure>
        </section>

        <section className="subjects-explorer">
          <Reveal className="public-section-heading">
            <span className="audience-pill">Curriculum areas</span>
            <h2>Explore by subject</h2>
            <p>Choose a curriculum area to explore its collection and classroom connections.</p>
          </Reveal>
          <InView className="subjects-explorer-grid" aria-label="Curriculum subjects">
            {subjects.map(([label, cls, copy], index) => {
              const count = availableCount(label);
              const isActive = selectedSubject === label;
              const inner = (
                <>
                  <img className="subject-explore-photo" src={imageBySubject[label]} alt="" width="710" height="400" loading="lazy" />
                  <span className="subject-explore-icon" aria-hidden="true"><Icon type={subjectIconType(label)} className="" /></span>
                  <h3>{label}</h3>
                  <p>{copy}</p>
                  <span className="subject-explore-status">
                    {count
                      ? <>{count} {count === 1 ? "resource" : "resources"}<Icon type="arrowRight" /></>
                      : <>Explore subject<Icon type="arrowRight" /></>}
                  </span>
                </>
              );
              return (
                <button
                  type="button"
                  key={label}
                  className={`subject-explore-card ${cls} has-content${isActive ? " active" : ""}`}
                  style={{ "--card-index": index }}
                  onClick={() => handleSelectSubject(label)}
                  aria-pressed={isActive}
                  aria-label={`Explore ${label}`}
                >
                  {inner}
                </button>
              );
            })}
          </InView>
        </section>

        {selectedSubject && (
          <section className="public-catalogue-section" id="subject-collection-panel" tabIndex="-1" aria-live="polite">
            <div className="public-catalogue-heading">
              <div><span className="about-kicker">{selectedSubject}</span><h2>{visibleItems.length ? "Ready to explore" : "Connect your classroom"}</h2></div>
              {visibleItems.length ? <span className="catalogue-status">{`${visibleItems.length} published ${visibleItems.length === 1 ? "item" : "items"}`}</span> : null}
            </div>
            {visibleItems.length ? (
              <div className="public-resource-grid">
                {visibleItems.map((item, index) => (
                  <Reveal as="article" className="public-resource-card" key={item.id} delay={index * 70}>
                    <img src={item.image || imageBySubject[item.subject] || assets.heroKoala} alt="" width="1200" height="630" loading="lazy" />
                    <div className="public-resource-card-body">
                      <div className="subjects-preview-topline"><span className="subjects-type-chip">{item.type}</span><span>{item.stage || "All stages"}</span></div>
                      <h3>{item.title}</h3>
                      <p>{item.summary || item.description || "A Taronga-connected teaching resource ready to explore in Wildly."}</p>
                      <a className="text-action animated-link" href={signupRoute()}><span>Open in teacher workspace</span><Icon type="arrowRight" /></a>
                    </div>
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="public-subject-empty">
                <img src={imageBySubject[selectedSubject] || assets.heroKoala} alt="" width="1200" height="630" loading="lazy" />
                <div><h3>{subjects.find(([label]) => label === selectedSubject)?.[2]}</h3><p role="status">{status === "loading" ? "Loading the public collection…" : status === "fallback" || status === "error" ? "The public catalogue is unavailable right now. Sign in to check your teacher library, or explore the workspace preview." : "There are no published resources in this collection yet. You can explore the teacher workspace while the collection grows."}</p><div className="hero-actions"><a className="primary-action" href={loginRoute()}>Open teacher library</a><a className="secondary-action" href={teacherPreviewRoute()}>Preview workspace</a></div></div>
              </div>
            )}
          </section>
        )}
        <SiteFooter />
      </main>
    </>
  );
}


function getPublicRoutePath() {
  const hashPath = window.location.hash.replace(/^#\/?/, "");
  return hashPath || window.location.pathname.replace(basePath, "").replace(/^\//, "").replace(/\/$/, "");
}

// On first arrival, hold the branded loader until the logo and the page's
// first-screen image have loaded, so the site appears fully formed (same idea
// as the teacher side's boot). Capped so it can never hang.
function useFirstScreenReady(path) {
  const [ready, setReady] = useState(false);
  const firstPathRef = useRef(path);
  useEffect(() => {
    const urls = [assets.wildlyLogo, firstPathRef.current === "" ? assets.homeVideoPoster : null].filter(Boolean);
    let done = false;
    const finish = () => { if (!done) { done = true; setReady(true); } };
    const cap = window.setTimeout(finish, 4000);
    Promise.all(urls.map((src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    }))).then(() => {
      // Let the animation play at least briefly instead of flashing.
      window.setTimeout(finish, Math.max(0, 900 - performance.now()));
    });
    return () => window.clearTimeout(cap);
  }, []);
  return ready;
}

export default function PublicApp() {
  const [path, setPath] = useState(getPublicRoutePath);
  const ready = useFirstScreenReady(path);

  useEffect(() => {
    const syncRoute = () => setPath(getPublicRoutePath());
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);
    return () => {
      window.removeEventListener("hashchange", syncRoute);
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);

  if (!ready) return <LoadingScreen label="Loading Wildly…" />;
  if (path === "about") return <AboutMarketingPage />;
  if (path === "subjects" || path.startsWith("subjects/")) return <SubjectsMarketingPage key={path} initialSubject={subjects.find(([label]) => encodeURIComponent(label) === path.split("/")[1])?.[0] || ""} />;
  if (path === "learning-paths") return <LearningPathsMarketingPage />;
  if (path === "tracka") return <TrackaMarketingPage />;
  if (path === "schools") return <SchoolsMarketingPage />;
  return <WildlyHome SiteHeader={SiteHeader} SiteFooter={SiteFooter} Icon={Icon} assets={assets} routePath={routePath} />;
}
