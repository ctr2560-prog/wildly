import React, { useEffect, useMemo, useRef, useState } from "react";
import "../landing.css";

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
  const headerRef = useRef(null);
  const menuToggleRef = useRef(null);
  const navItems = [
    ["learning-paths", "Learning Paths"],
    ["tracka", "Taronga Tracka"],
    ["schools", "For Schools"],
    ["about", "About"],
  ];
  const mobileItems = [["subjects", "Explore Resources"], ...navItems];

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
    <header ref={headerRef} className={`site-header ${menuOpen ? "menu-open" : ""}`}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <a className="site-logo" href={routePath()} aria-label="Wildly by Taronga home"><img src={assets.wildlyLogo} alt="Wildly by Taronga" width="1144" height="520" /></a>
      <nav className="site-nav" aria-label="Main navigation">
        <a className={active === "subjects" ? "selected" : ""} href={routePath("subjects")}>Discover Wildly</a>
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

const homePlatformViews = [
  {
    id: "plan",
    step: "01",
    label: "Plan",
    eyebrow: "Teacher workspace",
    title: "Find the right learning quickly.",
    copy: "Browse by subject, stage and teaching purpose, then see the sequence, outcomes and supporting materials before you commit.",
    points: ["Classroom-ready resources", "Clear curriculum context", "Whole-unit Learning Paths"],
    image: assets.dashboardScreenshot,
    imageAlt: "Wildly teacher workspace showing resources and learning paths",
    width: 2922,
    height: 1592,
    href: routePath("subjects"),
    action: "Explore resources",
    tone: "plan",
  },
  {
    id: "experience",
    step: "02",
    label: "Experience",
    eyebrow: "Taronga Tracka",
    title: "Turn an encounter into active discovery.",
    copy: "Students follow place-aware missions, observe real animals and gather useful context during zoo and Taronga digital experiences.",
    points: ["Guided wildlife missions", "Observation in context", "Teacher progress views"],
    image: assetPath("assets/tracka/mode-zoo.jpg"),
    imageAlt: "Students using Taronga Tracka during a zoo experience",
    width: 1200,
    height: 772,
    href: routePath("tracka"),
    action: "See Taronga Tracka",
    tone: "experience",
  },
  {
    id: "extend",
    step: "03",
    label: "Extend",
    eyebrow: "Recommended next steps",
    title: "Bring the experience back into learning.",
    copy: "Wildly uses the Tracka context to surface relevant resources for reflection, deeper inquiry and conservation action.",
    points: ["Context-aware recommendations", "Connected follow-up lessons", "A clear path into student action"],
    image: assetPath("assets/tracka/app-wildly.jpg"),
    imageAlt: "Wildly resource recommendations connected to Taronga Tracka",
    width: 1600,
    height: 869,
    href: routePath("learning-paths"),
    action: "Explore Learning Paths",
    tone: "extend",
  },
];

function HomeExtendPreview() {
  return (
    <div className="home-extend-preview" aria-label="Wildly follow-up recommendation preview">
      <div className="home-extend-preview-top">
        <strong>Wildly</strong>
        <span>Recommended next</span>
      </div>
      <div className="home-extend-preview-context">
        <span>From your Taronga Tracka visit</span>
        <strong>Giraffe habitat mission</strong>
      </div>
      <div className="home-extend-preview-resource">
        <img src={assets.giraffe} alt="" width="710" height="400" />
        <div>
          <span>Stage 2 · Science</span>
          <h4>How habitats support survival</h4>
          <small>Lesson · 45 minutes</small>
        </div>
      </div>
      <div className="home-extend-preview-sequence" aria-hidden="true">
        <span>Observe</span><Icon type="arrowRight" /><span>Explain</span><Icon type="arrowRight" /><span>Act</span>
      </div>
    </div>
  );
}

function HomePlatformShowcase() {
  return (
    <section className="home-platform-section" aria-labelledby="home-platform-heading">
      <div className="home-platform-heading">
        <span className="audience-pill">Inside Wildly</span>
        <h2 id="home-platform-heading">One platform. <span>The whole learning journey.</span></h2>
        <p>Plan clearly, make every experience count and carry the learning into what comes next.</p>
      </div>
      <div className="home-platform-journey" aria-label="Wildly learning journey">
        {homePlatformViews.map((view) => (
          <article className={`home-platform-chapter tone-${view.tone}`} key={view.id}>
            <div className="home-platform-chapter-media">
              {view.id === "extend" ? (
                <HomeExtendPreview />
              ) : (
                <img src={view.image} alt={view.imageAlt} width={view.width} height={view.height} loading="lazy" />
              )}
            </div>
            <div className="home-platform-chapter-label">
              <span>{view.step}</span>
              <strong>{view.label}</strong>
            </div>
            <h3>{view.title}</h3>
            <p>{view.copy}</p>
            <a className="home-platform-action animated-link" href={view.href}><span>{view.action}</span><Icon type="arrowRight" /></a>
          </article>
        ))}
      </div>
    </section>
  );
}

const landingFlagshipSteps = [
  ["01", "Discover the challenge", "Meet a real conservation question through Taronga stories and species."],
  ["02", "Investigate systems", "Build curriculum knowledge with structured lessons, media and teacher prompts."],
  ["03", "Gather evidence", "Use observations from Taronga Tracka, a zoo visit or a digital experience."],
  ["04", "Design for change", "Turn evidence into a student-led response, prototype or action project."],
  ["05", "Reflect and act", "Consolidate learning and connect classroom choices to conservation impact."],
];

function FlagshipPathPreview() {
  const [activeStep, setActiveStep] = useState(0);
  const [number, title] = landingFlagshipSteps[activeStep];

  return (
    <div className="flagship-path-panel" style={{ "--path-progress": `${((activeStep + 1) / landingFlagshipSteps.length) * 100}%` }}>
      <div className="flagship-path-cover">
        <img src={assets.giraffe} alt="Giraffes at Taronga" width="710" height="400" loading="lazy" />
        <div>
          <span>Technology &amp; STEM · Stages 4–5</span>
          <h3>Sustainable Futures</h3>
          <p key={`${number}-${title}`}>Step {number} · {title}</p>
        </div>
      </div>
      <div className="flagship-path-progress" aria-hidden="true"><span></span></div>
      <div className="flagship-path-steps">
        {landingFlagshipSteps.map(([stepNumber, stepTitle, copy], index) => (
          <button
            type="button"
            key={stepNumber}
            className={index === activeStep ? "active" : ""}
            aria-pressed={index === activeStep}
            onClick={() => setActiveStep(index)}
            onPointerEnter={() => setActiveStep(index)}
            onFocus={() => setActiveStep(index)}
          >
            <span>{stepNumber}</span>
            <div><h3>{stepTitle}</h3><p>{copy}</p></div>
            <Icon type="arrowRight" />
          </button>
        ))}
      </div>
    </div>
  );
}

const trackaModes = [
  { id: "zoo", label: "Zoo", tagline: "GPS-guided animal tracking and live missions during your Taronga Zoo excursion.", img: assetPath("assets/tracka/mode-zoo.jpg"), width: 1200, height: 772 },
  { id: "zoosnooz", label: "ZooSnooz", tagline: "Taronga's overnight experience with after-dark keeper missions and documentary making.", img: assetPath("assets/tracka/mode-zoosnooz.jpg"), width: 1200, height: 750 },
  { id: "school", label: "School", tagline: "A virtual zoo that brings the full Taronga experience into your classroom.", img: assetPath("assets/tracka/mode-school.jpg"), width: 1200, height: 675, comingSoon: true },
];

const trackaFeatures = [
  { title: "GPS Technology", sub: "Find every animal, every time.", desc: "Live GPS guides students to each animal zone across the zoo, helping the class stay oriented and make every encounter count.", img: assetPath("assets/tracka/app-map.jpg"), width: 1400, height: 1173, mediaClass: "map" },
  { title: "Missions & Games", sub: "Learning through play.", desc: "Students engage through observation games, hands-on activities and documentary making at each animal.", imgs: [[1, 475, 520], [2, 520, 291], [3, 520, 436], [4, 303, 520]].map(([number, width, height]) => ({ src: assetPath(`assets/tracka/mission-${number}.jpg`), width, height })), mediaClass: "missions" },
  { title: "Badge Collection", sub: "Every visit tells a story.", desc: "Completed missions unlock animal badges that build each student's personal wildlife collection.", img: assetPath("assets/tracka/app-collection.jpg"), width: 1400, height: 761, mediaClass: "collection" },
  { title: "Wildly Recommendations", sub: "Extend the impact beyond the visit.", desc: "Tracka passes the experience context to Wildly, helping teachers find relevant curriculum resources for what students explored.", img: assetPath("assets/tracka/app-wildly.jpg"), width: 1600, height: 869, mediaClass: "wildly" },
];

const trackaSteps = [
  { num: "01", who: "teacher", title: "Create a Class", desc: "Set up your class in the teacher portal and receive a unique join code in seconds." },
  { num: "02", who: "student", title: "Students Join", desc: "Students enter the class code on arrival to connect instantly to your group." },
  { num: "03", who: "student", title: "Explore the Zoo", desc: "GPS technology guides students to each animal zone at their own pace." },
  { num: "04", who: "student", title: "Complete Missions", desc: "Students engage through games, hands-on activities and documentary making." },
  { num: "05", who: "student", title: "Earn Badges", desc: "Completed missions unlock badges that build each student's wildlife collection." },
  { num: "06", who: "teacher", title: "Extend the Learning", desc: "Use the experience context to move into recommended Wildly resources, reflection and classroom action." },
];

const trackaPortalSlides = [
  { title: "Class Overview", desc: "See how students are progressing across animal missions.", img: assetPath("assets/tracka/portal-slide-4.jpg"), width: 1600, height: 866 },
  { title: "Student Writing", desc: "Review student writing from observation and documentary tasks.", img: assetPath("assets/tracka/portal-slide-1.jpg"), width: 1600, height: 801 },
  { title: "Student Observations", desc: "Review individual student observations, images and responses from the zoo.", img: assetPath("assets/tracka/portal-slide-2.jpg"), width: 1600, height: 787 },
  { title: "ZooSnooz Portal", desc: "Manage overnight groups, keeper interactions and mission updates.", img: assetPath("assets/tracka/portal-slide-3.jpg"), width: 1600, height: 866 },
];

const trackaAnimals = [
  { img: assetPath("assets/tracka/lion.jpg"), width: 710, height: 347, name: "African Lion", badge: assetPath("assets/tracka/badge-lion.png"), badgeWidth: 500, badgeHeight: 500 },
  { img: assetPath("assets/tracka/giraffe.jpg"), width: 1200, height: 630, name: "Giraffe", badge: assetPath("assets/tracka/badge-giraffe.png"), badgeWidth: 500, badgeHeight: 500 },
  { img: assetPath("assets/tracka/gorilla.jpg"), width: 2880, height: 1400, name: "Gorilla", badge: assetPath("assets/tracka/badge-gorilla.png"), badgeWidth: 500, badgeHeight: 500 },
  { img: assetPath("assets/tracka/koala.jpg"), width: 1000, height: 818, name: "Koala", badge: assetPath("assets/tracka/badge-koala.png"), badgeWidth: 500, badgeHeight: 500 },
  { img: assetPath("assets/tracka/tiger.jpg"), width: 1200, height: 630, name: "Sumatran Tiger", badge: assetPath("assets/tracka/badge-tiger.png"), badgeWidth: 500, badgeHeight: 500 },
  { img: assetPath("assets/tracka/rhino.jpg"), width: 1500, height: 1000, name: "White Rhino", badge: assetPath("assets/tracka/badge-rhino.png"), badgeWidth: 1024, badgeHeight: 1536 },
];

function SiteFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-main">
        <div className="public-footer-brand">
          <img src={assets.wildlyLogo} alt="Wildly by Taronga" width="1144" height="520" loading="lazy" />
          <p>Curriculum-connected learning through nature, backed by Taronga.</p>
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
          <strong>Ready for your next lesson?</strong>
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

function HomeTrustPanel({ icon, title, copy }) {
  const panelRef = useRef(null);
  const boundsRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  function handlePointerEnter(event) {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    boundsRef.current = panelRef.current?.getBoundingClientRect() || null;
    panelRef.current?.setAttribute("data-active", "true");
  }

  function handlePointerMove(event) {
    const panel = panelRef.current;
    const bounds = boundsRef.current;
    if (!panel || !bounds || event.pointerType === "touch") return;

    const horizontal = ((event.clientX - bounds.left) / bounds.width) - 0.5;
    const vertical = ((event.clientY - bounds.top) / bounds.height) - 0.5;

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      panel.style.setProperty("--trust-rotate-x", `${(-vertical * 4).toFixed(2)}deg`);
      panel.style.setProperty("--trust-rotate-y", `${(horizontal * 4).toFixed(2)}deg`);
    });
  }

  function handlePointerLeave() {
    cancelAnimationFrame(frameRef.current);
    boundsRef.current = null;
    const panel = panelRef.current;
    if (!panel) return;
    panel.setAttribute("data-active", "false");
    panel.style.setProperty("--trust-rotate-x", "0deg");
    panel.style.setProperty("--trust-rotate-y", "0deg");
  }

  return (
    <article
      ref={panelRef}
      className="homepage-trust-item"
      data-active="false"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className="homepage-trust-icon" aria-hidden="true"><Icon type={icon} /></span>
      <span><strong>{title}</strong><small>{copy}</small></span>
    </article>
  );
}

function LandingPage() {
  const videoRef = useRef(null);
  const [isVideoPaused, setIsVideoPaused] = useState(() => (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));

  useEffect(() => {
    if (isVideoPaused) videoRef.current?.pause();
  }, [isVideoPaused]);

  function toggleHeroVideo() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsVideoPaused(false)).catch(() => setIsVideoPaused(true));
    } else {
      video.pause();
      setIsVideoPaused(true);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="public-home" id="main-content" tabIndex="-1">
        <section className="hero-section public-home-hero" id="about">
          <video
            ref={videoRef}
            className="home-hero-video"
            autoPlay={!isVideoPaused}
            muted
            loop
            playsInline
            preload="metadata"
            poster={assets.homeVideoPoster}
            aria-hidden="true"
            tabIndex="-1"
          >
            <source src={assets.homeVideo} type="video/mp4" />
          </video>
          <div className="home-hero-scrim" aria-hidden="true"></div>
          <div className="hero-copy">
            <span className="audience-pill">Wildly by Taronga</span>
            <h1>Bring the living world into every lesson.</h1>
            <p className="hero-subtitle">Curriculum-connected learning, real conservation stories and Taronga experiences, brought together for teachers.</p>
            <div className="hero-actions">
              <a className="primary-action animated-link" href={signupRoute()}><span>Get started free</span><Icon type="arrowRight" /></a>
              <a className="secondary-action" href={routePath("subjects")}>Explore resources</a>
            </div>
          </div>
          <button className="home-hero-video-control" type="button" onClick={toggleHeroVideo} aria-label={isVideoPaused ? "Play background video" : "Pause background video"}>
            <Icon type={isVideoPaused ? "mediaPlay" : "pause"} />
          </button>
        </section>

        <section className="homepage-trust-bar" aria-label="Why teachers use Wildly">
          {[
            ["leaf", "Built with Taronga educators", "Conservation expertise shaped for teaching"],
            ["book", "Curriculum-connected", "Clear subject, stage and learning purpose"],
            ["link", "Classroom · Zoo · Digital", "One journey across every learning context"],
          ].map(([icon, title, copy]) => (
            <HomeTrustPanel key={title} icon={icon} title={title} copy={copy} />
          ))}
        </section>

        <HomePlatformShowcase />

        <Reveal as="section" className="flagship-path-section">
          <div className="flagship-path-intro">
            <span className="audience-pill">Featured pathway preview</span>
            <h2>One question. A complete learning journey.</h2>
            <p><strong>Sustainable Futures</strong> shows how Wildly can connect curriculum, Taronga experiences and student action in one coherent sequence.</p>
            <div className="flagship-path-tags"><span>Systems thinking</span><span>Inquiry learning</span><span>Conservation action</span></div>
            <a className="text-action animated-link" href={routePath("learning-paths")}><span>Explore Learning Paths</span><Icon type="arrowRight" /></a>
          </div>
          <FlagshipPathPreview />
        </Reveal>

        <section className="ecosystem-section">
          <Reveal className="ecosystem-visual" variant="scale">
            <img src={assets.tarongaBushland} alt="Students learning with a Taronga educator in a bushland habitat classroom" width="1423" height="1067" loading="lazy" />
            <div className="ecosystem-product-mark">
              <div className="ecosystem-tracka-brand"><img className="tracka-mark" src={assetPath("assets/tracka/tracka-logo.png")} alt="" width="500" height="500" /><strong>Taronga Tracka</strong></div>
              <span>connected with</span>
              <img src={assets.wildlyLogo} alt="Wildly by Taronga" width="1144" height="520" />
            </div>
          </Reveal>
          <Reveal className="ecosystem-copy" delay={100}>
            <span className="audience-pill">A connected recommendation</span>
            <h2>What students encounter becomes what teachers can teach next.</h2>
            <p>After a Tracka experience, Wildly can surface the most relevant classroom follow-up using the animals, habitats and missions the class explored.</p>
            <div className="ecosystem-example" aria-label="Example Wildly recommendation from Taronga Tracka">
              <span>For example</span>
              <p>A giraffe habitat mission can lead directly into a Stage 2 science lesson on how habitats support survival.</p>
            </div>
            <a className="text-action animated-link" href={routePath("tracka")}><span>See how Tracka connects</span><Icon type="arrowRight" /></a>
          </Reveal>
        </section>

        <Reveal as="section" className="marketing-band homepage-pl-band">
          <div className="marketing-split professional-learning-band">
            <img className="marketing-split-image" src={assets.tarongaBushland} alt="Taronga educator leading learning in a bushland habitat classroom" width="1423" height="1067" loading="lazy" />
            <div className="marketing-split-copy">
              <div className="section-heading compact-heading">
                <div>
                  <h2>Exclusive professional learning opportunities</h2>
                  <p>Learn with Taronga educators through practical sessions grounded in nature-connected pedagogy, curriculum planning and classroom implementation.</p>
                </div>
              </div>
              <p className="professional-learning-formats">Virtual, at your school or on-site at Taronga Zoo Sydney and Taronga Western Plains Zoo Dubbo.</p>
              <a className="text-action animated-link" href={appLinks.professionalLearning}><span>Explore professional learning</span><Icon type="arrowRight" /></a>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="homepage-final-cta" id="schools" variant="scale">
          <img src={assets.heroKoala} alt="Koala with joey" className="homepage-cta-image" width="710" height="400" loading="lazy" />
          <div className="homepage-cta-content">
            <h2>Bring learning to life through nature.</h2>
            <p>Start with a classroom-ready resource, then build towards a deeper Taronga-connected learning journey.</p>
            <div className="hero-actions">
              <a className="primary-action animated-link" href={signupRoute()}><span>Get started free</span><Icon type="arrowRight" /></a>
              <a className="secondary-action" href={routePath("subjects")}>Explore resources</a>
            </div>
          </div>
        </Reveal>

        <SiteFooter />
      </main>
    </>
  );
}

function TrackaMarketingPage() {
  const [activeMode, setActiveMode] = useState("zoo");
  const [activeSlide, setActiveSlide] = useState(0);
  const currentMode = trackaModes.find((mode) => mode.id === activeMode) || trackaModes[0];

  return (
    <>
      <SiteHeader active="tracka" />
      <main className="tracka-page premium-tracka-page" id="main-content" tabIndex="-1">

        <section className="tracka-hero">
          <div className="tracka-hero-copy">
            <div className="tracka-hero-brand"><div className="tracka-logo-hero-wrap"><img className="tracka-logo-hero" src={assetPath("assets/tracka/tracka-logo.png")} alt="" width="500" height="500" /></div><span>Taronga Tracka</span></div>
            <h1>Real animals.<br />Real missions.<br />Real learning.</h1>
            <p className="tracka-hero-lead">A guided discovery experience for the zoo and the classroom, with Wildly ready to recommend what teachers can explore next.</p>
            <div className="hero-actions">
              <a className="primary-action" href={appLinks.tracka} target="_blank" rel="noopener noreferrer">Open Taronga Tracka</a>
              <a className="secondary-action" href={appLinks.excursions}>Plan an excursion</a>
            </div>
            <p className="tracka-hero-note"><Icon type="pin" />Designed around real Taronga places, species and learning moments.</p>
          </div>
          <div className="tracka-hero-scene" aria-label="Students using Taronga Tracka at the zoo">
            <img className="tracka-hero-photo" src={assetPath("assets/tracka/mode-zoo.jpg")} alt="Students using Taronga Tracka while observing a tiger at Taronga Zoo" width="1200" height="772" fetchPriority="high" />
            <div className="tracka-phone-device">
              <span className="tracka-phone-speaker" aria-hidden="true"></span>
              <img src={assetPath("assets/tracka/app-home.jpg")} alt="Taronga Tracka app home screen" width="647" height="1400" />
            </div>
            <div className="tracka-scene-label"><span>Zoo mode</span><strong>Observe · Complete missions · Earn badges</strong></div>
          </div>
        </section>

        <section className="tracka-stats-bar">
          {[
            ["At the zoo", "Guided wildlife missions"],
            ["Digital", "Taronga experiences from school"],
            ["Observe", "Evidence gathered in context"],
            ["Extend", "Recommended Wildly resources"],
          ].map(([stat, desc]) => (
            <div key={stat} className="tracka-stat">
              <strong>{stat}</strong>
              <span>{desc}</span>
            </div>
          ))}
        </section>

        <section className="tracka-modes-section">
          <div className="tracka-section-header">
            <span className="audience-pill">Choose the experience</span>
            <h2>One app. Every Taronga experience.</h2>
            <p>Tracka adapts to how your class meets Taronga, from a day excursion to an overnight ZooSnooz or a digital classroom journey.</p>
          </div>
          <AccessibleTabs
            id="tracka-mode"
            items={trackaModes}
            activeId={activeMode}
            onChange={setActiveMode}
            ariaLabel="Taronga Tracka experience modes"
            className="tracka-mode-tabs"
            getClassName={(_, selected) => `tracka-mode-tab${selected ? " active" : ""}`}
            renderItem={(mode) => <>{mode.label}{mode.comingSoon ? <span className="tracka-coming-soon">Soon</span> : null}</>}
          />
          <div className="tracka-mode-display" id="tracka-mode-panel" role="tabpanel" aria-labelledby={tabDomId("tracka-mode", currentMode.id)} tabIndex="0">
            <div className="tracka-mode-img-wrap">
              <img src={currentMode.img} alt={`${currentMode.label} mode experience`} width={currentMode.width} height={currentMode.height} loading="lazy" />
            </div>
            <div className="tracka-mode-desc">
              <span>{currentMode.comingSoon ? "In development" : "Available experience"}</span>
              <h3>{currentMode.label} mode</h3>
              <p>{currentMode.tagline}</p>
              <div className="tracka-mode-points">
                {(currentMode.id === "zoo" ? ["Location-aware discovery", "Animal missions", "Class progress"] : currentMode.id === "zoosnooz" ? ["After-dark exploration", "Documentary making", "Keeper-led context"] : ["Digital wildlife encounters", "School-ground missions", "Wildly follow-up"]).map((point) => <span key={point}><Icon type="plus" />{point}</span>)}
              </div>
            </div>
          </div>
        </section>

        <section className="tracka-features-section">
          <div className="tracka-section-header">
            <span className="audience-pill">Inside Tracka</span>
            <h2>The app turns looking into active discovery.</h2>
            <p>Every feature has a learning purpose: orient the class, focus observation, invite a response and carry useful context forward.</p>
          </div>
          <div className="tracka-features-showcase">
            {trackaFeatures.map((f, i) => (
              <article key={f.title} className={`tracka-feature-showcase-card${i % 2 === 1 ? " reversed" : ""}`}>
                <div className={`tracka-feature-showcase-media ${f.mediaClass}`}>
                  {f.imgs ? (
                    <div className="tracka-mission-grid">
                      {f.imgs.map((image, j) => <img key={image.src} src={image.src} alt={`Tracka mission interface ${j + 1}`} width={image.width} height={image.height} loading="lazy" />)}
                    </div>
                  ) : (
                    <img src={f.img} alt={`${f.title} interface in Taronga Tracka`} width={f.width} height={f.height} loading="lazy" />
                  )}
                </div>
                <div className="tracka-feature-showcase-copy">
                  <span className="tracka-feature-number">0{i + 1}</span>
                  <h3>{f.title}</h3>
                  <p className="tracka-feature-sub">{f.sub}</p>
                  <p>{f.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="tracka-steps-section">
          <div className="tracka-section-header">
            <span className="audience-pill">From setup to follow-up</span>
            <h2>Six steps from classroom to collection</h2>
          </div>
          <div className="tracka-steps-grid">
            {trackaSteps.map(s => (
              <article key={s.num} className="tracka-step-card">
                <div className="tracka-step-top">
                  <span className="tracka-step-num">{s.num}</span>
                  <span className={`tracka-step-who ${s.who}`}>{s.who === "teacher" ? "Teacher" : "Student"}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tracka-portal-section">
          <div className="tracka-portal-inner">
            <div className="tracka-section-header light">
              <span className="audience-pill">For Educators</span>
              <h2>Teacher Portal</h2>
              <p>Student observations, mission progress and wildlife documentaries in one place.</p>
            </div>
            <div className="tracka-portal-demo">
            <AccessibleTabs
              id="tracka-portal"
              items={trackaPortalSlides}
              activeId={String(activeSlide)}
              onChange={(nextId) => setActiveSlide(Number(nextId))}
              ariaLabel="Tracka teacher portal views"
              className="tracka-portal-tabs"
              getItemId={(_, index) => String(index)}
              getClassName={(_, selected) => `tracka-portal-tab${selected ? " active" : ""}`}
              renderItem={(slide) => slide.title}
            />
            <div className="tracka-portal-slide" id="tracka-portal-panel" role="tabpanel" aria-labelledby={tabDomId("tracka-portal", activeSlide)} tabIndex="0">
                <img src={trackaPortalSlides[activeSlide].img} alt={`${trackaPortalSlides[activeSlide].title} view in the Tracka teacher portal`} width={trackaPortalSlides[activeSlide].width} height={trackaPortalSlides[activeSlide].height} loading="lazy" />
                <p className="tracka-portal-caption">{trackaPortalSlides[activeSlide].desc}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="tracka-animals-section">
          <div className="section-heading">
            <div>
              <h2>Discover wildlife missions</h2>
              <p>Students explore real animals through guided discovery tasks — from enclosures to ecosystems.</p>
            </div>
            <a href={appLinks.tracka} target="_blank" rel="noopener noreferrer">Open Tracka</a>
          </div>
          <div className="tracka-animal-grid">
            {trackaAnimals.map(a => (
              <article key={a.name} className="tracka-animal-card">
                <div className="tracka-animal-img-wrap">
                  <img src={a.img} alt={a.name} width={a.width} height={a.height} loading="lazy" />
                  <img src={a.badge} alt={`${a.name} badge`} className="tracka-animal-badge" width={a.badgeWidth} height={a.badgeHeight} loading="lazy" />
                </div>
                <div className="tracka-animal-info">
                  <strong>{a.name}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="tracka-integration-section">
          <div className="tracka-integration-inner">
            <div className="tracka-integration-copy">
              <span className="audience-pill">Wildly + Tracka</span>
              <h2>Tracka captures the experience. Wildly helps teachers take it further.</h2>
              <p>Whether students explore at the zoo or through a Taronga digital experience, Tracka gives Wildly the context needed to recommend relevant next steps.</p>
              <div className="tracka-learning-loop">
                <article><span>1</span><div><h3>Explore with Tracka</h3><p>Students complete missions, encounter species and gather observations in context.</p></div></article>
                <article><span>2</span><div><h3>Share the context</h3><p>Tracka tells Wildly which experience, animals and themes the class explored.</p></div></article>
                <article><span>3</span><div><h3>Continue in Wildly</h3><p>Teachers receive curriculum-connected resource recommendations for reflection, inquiry and action.</p></div></article>
              </div>
              <div className="hero-actions tracka-integration-actions">
                <a className="primary-action" href={signupRoute()}>Get started with Wildly</a>
                <a className="secondary-action" href={appLinks.tracka} target="_blank" rel="noopener noreferrer">Open Tracka</a>
              </div>
            </div>
            <div className="tracka-recommendation-preview" aria-label="Example Tracka to Wildly recommendation">
              <div className="tracka-recommendation-header">
                <div><img src={assetPath("assets/tracka/tracka-logo.png")} alt="" width="500" height="500" /><span>Tracka experience</span></div>
                <Icon type="link" />
                <div><img src={assets.wildlyLogo} alt="" width="320" height="86" /><span>Wildly recommendation</span></div>
              </div>
              <div className="tracka-context-panel">
                <span className="tracka-preview-label">Experience context received</span>
                <h3>Zoo discovery · Tiger Trek</h3>
                <div><span>Sumatran tiger</span><span>Habitat</span><span>Threats</span><span>Observation</span></div>
              </div>
              <div className="tracka-preview-connector" aria-hidden="true"><span></span><Icon type="link" /><span></span></div>
              <div className="tracka-resource-recommendation">
                <img src={assets.giraffe} alt="Giraffe representing a Wildly learning recommendation" width="710" height="400" loading="lazy" />
                <div><span className="tracka-preview-label">Recommended in Wildly</span><h3>How habitats support survival</h3><p>Science · Stage 2 · Classroom resource</p><strong>Continue the learning</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section" id="excursions">
          <img src={assets.heroKoala} alt="Koala with joey" width="710" height="400" loading="lazy" />
          <div>
            <h2>Ready to take your class to the zoo?</h2>
            <p>Explore with Tracka, then let Wildly help you turn the experience into deeper classroom learning.</p>
            <div className="hero-actions">
              <a className="primary-action" href={appLinks.excursions}>Book an excursion</a>
              <a className="secondary-action" href={appLinks.tracka} target="_blank" rel="noopener noreferrer">Open Taronga Tracka</a>
            </div>
          </div>
        </section>
        <SiteFooter />
      </main>
    </>
  );
}

function LearningPathFeaturePreview({ type }) {
  if (type === "lesson") {
    return (
      <div className="lp-feature-ui lp-lesson-ui" aria-label="Wildly lesson workspace preview">
        <div className="lp-ui-toolbar"><span>Lesson 03</span><strong>Gather real-world evidence</strong><small className="lp-ui-action">Teach lesson</small></div>
        <div className="lp-lesson-meta"><span>60 min</span><span>Stage 4</span><span>Teacher-led</span></div>
        <div className="lp-lesson-objective"><small>Learning intention</small><p>We are learning to collect and interpret evidence from a real conservation context.</p></div>
        <div className="lp-lesson-blocks">
          <div><span>01</span><strong>Launch the question</strong><small>10 minutes</small></div>
          <div><span>02</span><strong>Investigate the evidence</strong><small>30 minutes</small></div>
          <div><span>03</span><strong>Reflect and connect</strong><small>20 minutes</small></div>
        </div>
      </div>
    );
  }

  if (type === "resources") {
    return (
      <div className="lp-feature-ui lp-resources-ui" aria-label="Wildly lesson resources preview">
        <div className="lp-ui-toolbar"><span>Lesson resources</span><strong>Everything for this lesson</strong></div>
        <div className="lp-resource-row"><span className="lp-resource-icon teacher"><Icon type="book" /></span><div><strong>Teacher guide</strong><small>PDF · 12 pages</small></div><span>Open</span></div>
        <div className="lp-resource-row"><span className="lp-resource-icon student"><Icon type="report" /></span><div><strong>Student field notes</strong><small>Editable worksheet</small></div><span>Open</span></div>
        <div className="lp-resource-row"><span className="lp-resource-icon video"><Icon type="play" /></span><div><strong>Habitat evidence</strong><small>Taronga TV · 6 min</small></div><span>Watch</span></div>
        <div className="lp-resource-ready"><Icon type="link" /><span><strong>Attached to Lesson 03</strong><small>Available exactly where it is taught</small></span></div>
      </div>
    );
  }

  return (
    <div className="lp-feature-ui lp-sequence-ui" aria-label="Wildly learning path sequence preview">
      <div className="lp-ui-toolbar"><span>Learning Path</span><strong>Sustainable Futures</strong><small>6 weeks</small></div>
      <div className="lp-sequence-progress"><span style={{ width: "48%" }}></span></div>
      <div className="lp-sequence-weeks">
        {[
          ["01", "Discover the challenge", "Ready"],
          ["02", "Investigate systems", "Ready"],
          ["03", "Gather real-world evidence", "Current"],
          ["04", "Design for change", "Next"],
        ].map(([number, title, state]) => <div className={state === "Current" ? "current" : ""} key={number}><span>{number}</span><strong>{title}</strong><small>{state}</small></div>)}
      </div>
      <div className="lp-sequence-footer"><span><strong>8</strong> lessons</span><span><strong>5</strong> outcomes</span><span><strong>18</strong> resources</span></div>
    </div>
  );
}

function LearningPathsMarketingPage() {
  const ARCH = [
    { icon: <Icon type="blocks" />, label: "Learning Path", desc: "Holds the unit structure — duration, curriculum outcomes, administration materials and every lesson in sequence." },
    { icon: <Icon type="target" />, label: "Lesson", desc: "The teaching block. Sits inside a path or stands alone. Includes objectives, timing and teaching notes." },
    { icon: <Icon type="link" />, label: "Resource", desc: "The specific file, link, worksheet, video or embed teachers use with students." },
  ];

  const FEATURES = [
    {
      title: "Plan your whole unit in one place",
      sub: "Week-by-week sequencing.",
      desc: "A learning path holds your unit structure — duration, curriculum outcomes, admin materials and every lesson in sequence. Open it once and have everything your class needs for the term.",
      preview: "sequence",
    },
    {
      title: "Teach lesson by lesson",
      sub: "Clear objectives, every time.",
      desc: "Each lesson has its own objectives, timing and teaching notes. Assign the full lesson, share a specific resource, or jump straight to the download — whatever fits the moment.",
      preview: "lesson",
    },
    {
      title: "Resources right where they belong",
      sub: "No more searching.",
      desc: "Files, links, worksheets, videos and guides are attached to the lesson they support. Students and teachers always find what they need without leaving the page.",
      preview: "resources",
    },
  ];

  const STEPS = [
    { num: "01", who: "teacher", title: "Find a path", desc: "Browse learning paths by subject, year group or curriculum focus in the teacher dashboard." },
    { num: "02", who: "teacher", title: "Review the sequence", desc: "Open the path to see the full unit — duration, outcomes and every lesson laid out in order." },
    { num: "03", who: "teacher", title: "Open any lesson", desc: "Click into a lesson to see teaching notes, objectives and all linked resources at a glance." },
    { num: "04", who: "teacher", title: "Share with your class", desc: "Download resources, share links or assign a lesson directly from the dashboard." },
    { num: "05", who: "teacher", title: "Move through the unit", desc: "Return to the path each lesson to pick up where you left off — the sequence holds your place." },
    { num: "06", who: "teacher", title: "Connect to Tracka", desc: "Pair your unit with a Taronga Tracka excursion for before, during and after learning." },
  ];

  return (
    <>
      <SiteHeader active="learning-paths" />
      <main className="lp-page" id="main-content" tabIndex="-1">

        <section className="lp-hero">
          <div className="lp-hero-copy">
            <span className="audience-pill">Learning Paths</span>
            <h1>Plan the whole unit. Teach one lesson at a time.</h1>
            <p className="lp-hero-lead">Learning Paths connect outcomes, lessons and resources into a sequence teachers can understand at a glance and use week by week.</p>
            <div className="hero-actions">
              <a className="primary-action" href={signupRoute()}>Get started free</a>
              <a className="secondary-action" href={routePath("subjects")}>Explore resources</a>
            </div>
          </div>
          <div className="lp-hero-visual lp-product-frame">
            <div className="product-browser-bar" aria-hidden="true"><span></span><span></span><span></span><strong>Wildly Learning Path</strong></div>
            <div className="path-sequence-preview">
              <div className="path-sequence-header"><span>Technology &amp; STEM · Stages 4–5</span><h2>Sustainable Futures</h2><p>A connected inquiry from conservation challenge to student action.</p></div>
              <div className="path-sequence-list">
                {["Discover the challenge", "Investigate systems", "Gather real-world evidence", "Design for change", "Reflect and act"].map((title, index) => <div key={title}><span>{index + 1}</span><strong>{title}</strong>{index < 4 ? <i></i> : null}</div>)}
              </div>
            </div>
            <div className="lp-product-meta"><span><strong>8</strong> lessons</span><span><strong>5</strong> outcomes</span><span><strong>6 weeks</strong> suggested</span></div>
          </div>
        </section>

        <section className="lp-arch-section">
          <div className="tracka-section-header">
            <span className="audience-pill">Clear by design</span>
            <h2>One journey. Three useful layers.</h2>
            <p>A path gives the big picture, each lesson makes the next teaching move clear, and each resource sits where it will actually be used.</p>
          </div>
          <div className="lp-arch-flow">
            {ARCH.map((item, i) => (
              <React.Fragment key={item.label}>
                <div className="lp-arch-card">
                  <div className="lp-arch-icon">{item.icon}</div>
                  <h3>{item.label}</h3>
                  <p>{item.desc}</p>
                </div>
                {i < ARCH.length - 1 && <div className="lp-arch-arrow"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="tracka-features-section">
          <div className="tracka-section-header">
            <span className="audience-pill">How it helps teachers</span>
            <h2>Everything in the right place, every time</h2>
          </div>
          <div className="tracka-features-showcase">
            {FEATURES.map((f, i) => (
              <article key={f.title} className={`tracka-feature-showcase-card${i % 2 === 1 ? " reversed" : ""}`}>
                <div className="tracka-feature-showcase-media">
                  <LearningPathFeaturePreview type={f.preview} />
                </div>
                <div className="tracka-feature-showcase-copy">
                  <h3>{f.title}</h3>
                  <p className="tracka-feature-sub">{f.sub}</p>
                  <p>{f.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="tracka-steps-section lp-connection-section">
          <div className="tracka-section-header">
            <span className="audience-pill">Classroom to Taronga and back</span>
            <h2>A sequence that can move beyond the classroom</h2>
            <p>Learning Paths can prepare students for a zoo or digital Tracka experience, then use that experience as evidence for deeper inquiry.</p>
          </div>
          <div className="tracka-steps-grid lp-three-step-grid">
            {[
              { num: "01", who: "teacher", title: "Before", desc: "Build vocabulary, background knowledge and a clear question worth investigating." },
              { num: "02", who: "teacher", title: "During", desc: "Use Tracka at the zoo or through a digital experience to observe, explore and gather context." },
              { num: "03", who: "teacher", title: "After", desc: "Continue in Wildly with recommended resources, reflection and student action." },
            ].map(s => (
              <article key={s.num} className="tracka-step-card">
                <div className="tracka-step-top">
                  <span className="tracka-step-num">{s.num}</span>
                  <span className={`tracka-step-who ${s.who}`}>{s.who === "teacher" ? "Teacher" : "Student"}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <img src={assets.heroKoala} alt="Koala with joey" width="710" height="400" loading="lazy" />
          <div>
            <h2>Ready to plan your next unit?</h2>
            <p>Browse curriculum-aligned learning paths built by the Taronga education team — and start teaching with confidence.</p>
            <div className="hero-actions">
              <a className="primary-action" href={signupRoute()}>Get started free</a>
              <a className="secondary-action" href={teacherPreviewRoute()}>Preview the dashboard</a>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}

function SchoolsMarketingPage() {
  return (
    <>
      <SiteHeader active="schools" />
      <main className="marketing-page marketing-page-schools public-schools-page" id="main-content" tabIndex="-1">
        <section className="schools-hero public-schools-hero">
          <div className="schools-hero-copy">
            <span className="audience-pill">For schools</span>
            <h1>Bring Taronga-connected learning to your school.</h1>
            <p className="hero-subtitle">Give teachers a clear place to find trusted resources, plan connected learning and extend zoo or digital experiences.</p>
            <div className="hero-actions"><a className="primary-action" href={signupRoute()}>Get started free</a><a className="secondary-action" href={teacherPreviewRoute()}>Preview teacher workspace</a></div>
          </div>
          <div className="schools-hero-visual"><img src={assets.tarongaClassroom} alt="Students learning with a Taronga educator in an immersive habitat classroom" width="2400" height="1200" fetchPriority="high" /></div>
        </section>

        <section className="schools-stats-strip public-schools-values">
          {["Teacher-first", "Curriculum-connected", "Taronga-backed", "Flexible to use"].map((value) => <div className="schools-stat" key={value}><Icon type="leaf" /><strong>{value}</strong></div>)}
        </section>

        <section className="schools-steps-band">
          <div className="schools-steps-header"><span className="about-kicker">A simple starting point</span><h2>Useful from the first lesson.</h2><p>Wildly can begin as a practical teacher resource and become a shared way for your school to connect curriculum with nature.</p></div>
          <div className="schools-steps-grid">
            {[
              ["01", "Access", "Teachers create an account and enter a calm workspace built for finding and planning learning."],
              ["02", "Find", "Browse by subject and stage, then open the teaching notes and resources that are ready now."],
              ["03", "Extend", "Connect classroom work with Taronga Tracka, zoo experiences, digital exploration and professional learning."],
            ].map(([number, title, copy]) => <article className="schools-step-card" key={number}><span className="schools-step-number">{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </section>

        <section className="schools-why-band public-schools-why">
          <div className="schools-why-media"><img src={assets.heroKoala} alt="Koala with joey at Taronga" width="710" height="400" loading="lazy" /></div>
          <div className="schools-why-copy">
            <span className="about-kicker">Why it belongs in schools</span><h2>Real context. Less planning friction.</h2>
            <ul className="about-checklist">
              {["Resources make their subject, stage and purpose clear.", "Learning paths connect individual materials into a coherent sequence.", "Taronga expertise gives familiar curriculum ideas a compelling real-world context.", "Tracka can recommend the right Wildly follow-up after zoo and digital experiences.", "Professional learning supports teachers to use nature-connected pedagogy with confidence."].map((reason) => <li key={reason}><span><Icon type="plus" className="about-check-icon" /></span><p>{reason}</p></li>)}
            </ul>
          </div>
        </section>

        <section className="schools-cta-band">
          <div className="schools-cta-copy"><h2>Start with your next lesson.</h2><p>Create a teacher account and explore the published Wildly collection. No student login is needed to begin.</p></div>
          <div className="hero-actions"><a className="primary-action schools-cta-primary" href={signupRoute()}>Get started free</a><a className="secondary-action schools-cta-secondary" href={routePath("subjects")}>Explore resources</a></div>
        </section>
        <SiteFooter />
      </main>
    </>
  );
}

function AboutMarketingPage() {
  const principles = [
    ["Teacher-first", "Useful content should be easy to scan, understand and take into a real classroom."],
    ["Learning through nature", "Animals, habitats and conservation make curriculum ideas tangible and worth caring about."],
    ["Connected experiences", "Classroom resources, zoo visits and Taronga digital experiences should strengthen one another."],
    ["Action with purpose", "Learning is deeper when students can reflect, make decisions and contribute to positive change."],
  ];

  return (
    <>
      <SiteHeader active="about" />
      <main className="marketing-page marketing-page-about-rich public-about-page" id="main-content" tabIndex="-1">
        <section className="about-hero public-about-hero">
          <div className="about-hero-copy">
            <span className="audience-pill">About Wildly</span>
            <h1>Built by educators. Inspired by nature.</h1>
            <p className="hero-subtitle">Wildly helps teachers turn Taronga’s conservation knowledge and experiences into purposeful classroom learning.</p>
            <div className="hero-actions"><a className="primary-action" href={signupRoute()}>Get started free</a><a className="secondary-action" href={routePath("subjects")}>Explore resources</a></div>
          </div>
          <div className="about-hero-media"><img src={assets.tarongaBushland} alt="Taronga educator leading students through a bushland habitat learning experience" width="1423" height="1067" fetchPriority="high" /></div>
        </section>

        <section className="about-purpose-band">
          <div><span className="audience-pill">Why Wildly exists</span><h2>Nature gives learning a reason to matter.</h2></div>
          <div><p>Teachers do not need another folder of disconnected downloads. They need trusted content, clear curriculum context and a practical way to move from a compelling idea into a complete learning experience.</p><p>Wildly is Taronga’s place to make that connection: from conservation expertise and real animal stories to lessons that work in classrooms.</p></div>
        </section>

        <section className="about-principles-section">
          <div className="public-section-heading"><span className="audience-pill">Our approach</span><h2>Designed around what makes learning work</h2></div>
          <div className="about-principles-grid">
            {principles.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </section>

        <section className="about-ecosystem public-about-ecosystem">
          <div className="about-ecosystem-media"><img src={assetPath("assets/tracka/mode-zoo.jpg")} alt="Students using Taronga Tracka during a zoo learning experience" width="1200" height="772" loading="lazy" /></div>
          <div className="about-ecosystem-copy">
            <span className="about-kicker">The Taronga connection</span>
            <h2>From experience to understanding.</h2>
            <p>Taronga Tracka supports discovery during zoo and digital experiences. Wildly extends that experience by recommending relevant curriculum resources for what the class encountered.</p>
            <ul className="about-checklist">
              {["Prepare students before an experience.", "Connect observations to curriculum ideas.", "Continue with reflection, inquiry and conservation action."].map((point) => <li key={point}><span><Icon type="plus" className="about-check-icon" /></span><p>{point}</p></li>)}
            </ul>
            <a className="text-action" href={routePath("tracka")}>Explore Wildly + Tracka</a>
          </div>
        </section>

        <section className="about-taronga-band">
          <img src={assets.tarongaOutdoor} alt="Students observing animals during an outdoor learning experience at Taronga" width="2000" height="1335" loading="lazy" />
          <div><span className="audience-pill">Backed by Taronga</span><h2>Conservation expertise, shaped for education.</h2><p>Wildly grows from Taronga’s work with wildlife, educators and communities. The goal is not to replace a teacher’s judgement, but to give it stronger material: real contexts, thoughtful sequences and practical resources.</p><a className="primary-action" href={signupRoute()}>Start exploring Wildly</a></div>
        </section>
        <SiteFooter />
      </main>
    </>
  );
}

function SubjectsMarketingPage() {
  const { items: contentItems, status } = useContentItems();
  const [activeSubject, setActiveSubject] = useState("");
  const imageBySubject = {
    Science: assets.heroKoala,
    English: assets.koala,
    "Literacy & Numeracy": assets.tarongaClassroom,
    Mathematics: assets.giraffe,
    HSIE: assets.rhino,
    PDHPE: assets.tarongaOutdoor,
    CAPA: assets.binturong,
    "Technology & STEM": assets.tarongaClassroom,
    "Early Years": assets.tarongaBushland,
  };
  const publishedItems = useMemo(() => contentItems.filter((item) => (
    normalizeEditorialStatus(item.status, "Draft") === "Published"
    && !/^test\b/i.test(String(item.title || "").trim())
  )), [contentItems]);
  const firstAvailableSubject = subjects.find(([label]) => publishedItems.some((item) => item.subject === label))?.[0] || "";
  const selectedSubject = activeSubject || firstAvailableSubject || "Technology & STEM";
  const visibleItems = publishedItems.filter((item) => item.subject === selectedSubject);
  const availableCount = (label) => publishedItems.filter((item) => item.subject === label).length;

  return (
    <>
      <SiteHeader active="subjects" />
      <main className="marketing-page subjects-page public-subjects-page" id="main-content" tabIndex="-1">
        <section className="subjects-hero public-subjects-hero">
          <div className="subjects-hero-copy">
            <span className="audience-pill">Explore Wildly</span>
            <h1>Find a meaningful place to begin.</h1>
            <p className="hero-subtitle">Browse classroom-ready learning connected to nature, curriculum and Taronga expertise.</p>
            <div className="hero-actions">
              <a className="primary-action" href={signupRoute()}>Get started free</a>
              <a className="secondary-action" href={routePath("learning-paths")}>See Learning Paths</a>
            </div>
          </div>
          <div className="public-subjects-media">
            <img src={assets.tarongaOutdoor} alt="Students observing animals during an outdoor learning experience at Taronga" width="2000" height="1335" fetchPriority="high" />
            <div><span>Explore by</span><strong>subject · stage · resource type</strong></div>
          </div>
        </section>

        <section className="subjects-filter-band public-subject-filter">
          <div className="public-section-heading">
            <span className="audience-pill">Published collection</span>
            <h2>Explore by subject</h2>
            <p>Choose a curriculum area to see what is available now. Subjects still being developed are shown clearly.</p>
          </div>
          <AccessibleTabs
            id="subject-collection"
            items={subjects}
            activeId={selectedSubject}
            onChange={setActiveSubject}
            ariaLabel="Subjects"
            className="subjects-filter-row"
            getItemId={([label]) => label}
            getClassName={([, cls], selected) => `subjects-filter-chip ${cls}${selected ? " active" : ""}`}
            renderItem={([label]) => {
              const count = availableCount(label);
              return <><Icon type={subjectIconType(label)} className="subjects-filter-icon" /><span>{label}</span><small>{count ? `${count} available` : "Coming soon"}</small></>;
            }}
          />
        </section>

        <section className="public-catalogue-section" id="subject-collection-panel" role="tabpanel" aria-labelledby={tabDomId("subject-collection", selectedSubject)} tabIndex="0" aria-live="polite">
          <div className="public-catalogue-heading">
            <div><span className="about-kicker">{selectedSubject}</span><h2>{visibleItems.length ? "Ready to explore" : "Growing this collection"}</h2></div>
            <span className="catalogue-status">{status === "loading" ? "Loading collection..." : `${visibleItems.length} published ${visibleItems.length === 1 ? "item" : "items"}`}</span>
          </div>
          {visibleItems.length ? (
            <div className="public-resource-grid">
              {visibleItems.map((item) => (
                <article className="public-resource-card" key={item.id}>
                  <img src={item.image || imageBySubject[item.subject] || assets.heroKoala} alt="" width="1200" height="630" loading="lazy" />
                  <div className="public-resource-card-body">
                    <div className="subjects-preview-topline"><span className="subjects-type-chip">{item.type}</span><span>{item.stage || "All stages"}</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.summary || item.description || "A Taronga-connected teaching resource ready to explore in Wildly."}</p>
                    <a className="text-action" href={signupRoute()}>Open in teacher workspace</a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="public-subject-empty">
              <img src={imageBySubject[selectedSubject] || assets.heroKoala} alt="" width="1200" height="630" loading="lazy" />
              <div><h3>{selectedSubject} resources are being prepared.</h3><p>We are building this collection carefully with curriculum and classroom use in mind. Explore a published subject now or create an account to follow Wildly as it grows.</p><a className="secondary-action" href={signupRoute()}>Get started free</a></div>
            </div>
          )}
        </section>

        <section className="subjects-principles-band">
          {[
            ["Clear before you open", "See the subject, stage and resource type before entering the teacher workspace."],
            ["Connected, not isolated", "Resources can sit inside lessons and complete learning paths."],
            ["Grounded in the real world", "Taronga stories and experiences give curriculum learning a meaningful context."],
          ].map(([title, copy]) => <article key={title}><Icon type="leaf" /><h3>{title}</h3><p>{copy}</p></article>)}
        </section>
        <SiteFooter />
      </main>
    </>
  );
}


function getPublicRoutePath() {
  const hashPath = window.location.hash.replace(/^#\/?/, "");
  return hashPath || window.location.pathname.replace(basePath, "").replace(/^\//, "").replace(/\/$/, "");
}

export default function PublicApp() {
  const [path, setPath] = useState(getPublicRoutePath);

  useEffect(() => {
    const syncRoute = () => setPath(getPublicRoutePath());
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);
    return () => {
      window.removeEventListener("hashchange", syncRoute);
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);

  if (path === "about") return <AboutMarketingPage />;
  if (path === "subjects") return <SubjectsMarketingPage />;
  if (path === "learning-paths") return <LearningPathsMarketingPage />;
  if (path === "tracka") return <TrackaMarketingPage />;
  if (path === "schools") return <SchoolsMarketingPage />;
  return <LandingPage />;
}
