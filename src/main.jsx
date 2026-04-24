import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import "../landing.css";
import "../styles.css";
import "../staff.css";

const basePath = import.meta.env.BASE_URL;
const routePath = (path = "") => `${basePath}#${path}`;
const assetPath = (path) => `${basePath}${path}`;

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
};

const stockImages = [
  { label: "Koala with joey", subject: "Animals", key: "heroKoala", src: assets.heroKoala },
  { label: "Koala portrait", subject: "Animals", key: "koala", src: assets.koala },
  { label: "River habitat", subject: "Habitats", key: "river", src: assets.river },
  { label: "Rhino habitat", subject: "Animals", key: "rhino", src: assets.rhino },
  { label: "Giraffe", subject: "Animals", key: "giraffe", src: assets.giraffe },
  { label: "Binturong", subject: "Animals", key: "binturong", src: assets.binturong },
  { label: "Gorilla", subject: "Animals", key: "gorilla", src: assets.gorilla },
  { label: "Rainforest canopy", subject: "Habitats", src: "https://loremflickr.com/900/520/rainforest,nature?lock=21" },
  { label: "Ocean conservation", subject: "Science", src: "https://loremflickr.com/900/520/ocean,conservation?lock=22" },
  { label: "Australian bushland", subject: "Habitats", src: "https://loremflickr.com/900/520/australian,bushland?lock=23" },
  { label: "Wildlife camera", subject: "Technology & STEM", src: "https://loremflickr.com/900/520/wildlife,camera?lock=24" },
  { label: "Students outdoors", subject: "Learning", src: "https://loremflickr.com/900/520/students,nature?lock=25" },
  { label: "Animal tracks", subject: "Science", src: "https://loremflickr.com/900/520/animal,tracks?lock=26" },
  { label: "Forest data collection", subject: "Mathematics", src: "https://loremflickr.com/900/520/fieldwork,data?lock=27" },
  { label: "Wetlands", subject: "Geography", src: "https://loremflickr.com/900/520/wetland,wildlife?lock=28" },
  { label: "Native plants", subject: "Science", src: "https://loremflickr.com/900/520/native,plants?lock=29" },
  { label: "Conservation action", subject: "HSIE", src: "https://loremflickr.com/900/520/conservation,volunteer?lock=30" },
  { label: "STEM design", subject: "Technology & STEM", src: "https://loremflickr.com/900/520/stem,design?lock=31" },
  { label: "Creative nature art", subject: "CAPA", src: "https://loremflickr.com/900/520/nature,art?lock=32" },
  { label: "Wellbeing in nature", subject: "PDHPE", src: "https://loremflickr.com/900/520/nature,wellbeing?lock=33" },
];

const subjects = [
  ["Science", "science", "Discover the living world and our place in it."],
  ["English", "english", "Communicate, create and explore ideas that matter."],
  ["Mathematics", "maths", "Make sense of patterns, numbers and the world around you."],
  ["HSIE", "hsie", "Understand people, places, histories and how we shape society."],
  ["PDHPE", "pdhpe", "Build wellbeing, strong relationships and healthy communities."],
  ["CAPA", "capa", "Imagine, express and connect through creativity."],
  ["Technology & STEM", "stem", "Design, innovate and solve real-world challenges."],
];

const defaultContentItems = [
  { id: "adaptations-australian-animals", title: "Adaptations of Australian Animals", type: "Lesson", subject: "Science", stage: "Stage 2", progress: 65, imageKey: "river", summary: "Stage 2 science lesson with teacher guide and student prompts.", description: "Explore animal adaptations through observation, vocabulary and evidence-based explanation.", status: "Published", order: 1 },
  { id: "first-nations-cultures-country", title: "First Nations Cultures and Country", type: "Resource", subject: "HSIE", stage: "Stage 3", progress: 40, imageKey: "rhino", summary: "First Nations perspectives for Stage 3 inquiry.", description: "Support respectful inquiry into Country, culture and conservation connections.", status: "Published", order: 2 },
  { id: "sustainable-futures", title: "Sustainable Futures", type: "Learning Path", subject: "Technology & STEM", stage: "Stage 4", progress: 25, imageKey: "binturong", summary: "8 lessons across Science, HSIE and Technology & STEM.", description: "Build a sequence around conservation design, systems thinking and action planning.", status: "Published", order: 3 },
  { id: "persuasive-texts-wildlife-action", title: "Persuasive Texts for Wildlife Action", type: "Lesson", subject: "English", stage: "Stage 3", progress: 15, imageKey: "koala", summary: "Writing task with model texts and scaffolds.", description: "Use wildlife conservation contexts to plan, draft and refine persuasive writing.", status: "Draft", order: 4 },
  { id: "animal-movement-data-patterns", title: "Animal Movement and Data Patterns", type: "Resource", subject: "Mathematics", stage: "Stage 3", progress: 55, imageKey: "giraffe", summary: "Data activity using animal movement and habitat observations.", description: "Interpret data patterns and represent findings using classroom-friendly datasets.", status: "Published", order: 5 },
  { id: "wellbeing-through-nature", title: "Wellbeing Through Nature Connection", type: "Lesson", subject: "PDHPE", stage: "Stage 2", progress: 80, imageKey: "gorilla", summary: "Reflection lesson connecting wellbeing, nature and community.", description: "Guide students through reflective prompts about nature connection and wellbeing.", status: "Review", order: 6 },
];

const staffPassword = "admin";
const staffSessionKey = "wildly-staff-session";

function listFromText(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function createContentDraft(type = "Lesson") {
  return {
    title: "",
    type,
    subject: "Science",
    stage: "Stage 2",
    summary: "",
    description: "",
    imageKey: "heroKoala",
    image: "",
    customImageUrl: "",
    uploadedImageDataUrl: "",
    progress: 0,
    status: "Draft",
    durationMinutes: type === "Lesson" ? 45 : 0,
    durationWeeks: type === "Learning Path" ? 6 : 0,
    outcomeCodes: "",
    activityPrompts: "",
    canvaEmbedUrl: "",
    teacherGuideUrl: "",
    studentWorksheetUrl: "",
    videoUrl: "",
    teacherAdminUrl: "",
    unitPlanUrl: "",
    lessonPlanUrl: "",
    resourceUrl: "",
    resourceLinks: "",
    learningPathId: "",
    lessonId: "",
    lessonIds: [],
    resourceIds: [],
  };
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Unable to load image file."));
      image.onload = () => {
        const maxWidth = 1000;
        const maxHeight = 620;
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.76));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

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
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  };
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true">{icons[type]}</svg>;
}

function subjectIconType(label) {
  return {
    Science: "leaf",
    English: "speech",
    Mathematics: "calc",
    HSIE: "globe",
    PDHPE: "heart",
    CAPA: "palette",
    "Technology & STEM": "code",
  }[label];
}

const appLinks = {
  tracka: "",
  demoBooking: "",
  support: "",
  excursions: "",
};

function NoticeBanner({ notice, onClose }) {
  if (!notice) return null;
  return (
    <div className="notice-banner" role="status">
      <p>{notice}</p>
      <button type="button" onClick={onClose}>Close</button>
    </div>
  );
}

function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function openConfiguredLink(url, setNotice, label) {
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  setNotice(`${label} is still a placeholder. Add the real URL in the app config when you have it.`);
}

function contentPrimaryLink(item) {
  return (
    item.materials?.resourceUrl
    || item.materials?.lessonPlanUrl
    || item.materials?.unitPlanUrl
    || item.materials?.teacherAdminUrl
    || item.materials?.teacherGuideUrl
    || item.materials?.studentWorksheetUrl
    || item.materials?.canvaEmbedUrl
    || item.materials?.videoUrl
    || item.materials?.resourceLinks?.[0]
    || ""
  );
}

function LandingPage() {
  const [notice, setNotice] = useState("");

  return (
    <>
      <header className="site-header">
        <a className="site-logo" href={routePath()} aria-label="Wildly by Taronga home"><img src={assets.wildlyLogo} alt="Wildly by Taronga" /></a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#about">About</a><a href="#subjects">Subjects</a><a href="#paths">Learning Paths</a><a href="#tracka">Tracka</a><a href="#schools">Schools</a>
        </nav>
        <div className="header-actions"><a className="login-link" href={routePath("teacher")}>Log in</a><a className="start-link" href={routePath("teacher")}>Get started</a></div>
      </header>
      <main>
        <section className="hero-section" id="about">
          <div className="hero-copy">
            <span className="audience-pill">For teachers and schools</span>
            <h1>Learning through nature</h1>
            <p className="hero-subtitle">Inspire curiosity. Create change.</p>
            <p>Curriculum-aligned lessons, real-world experiences and conservation connections - for every learner, everywhere.</p>
            <div className="hero-actions"><a className="primary-action" href={routePath("teacher")}>Get started free</a><a className="secondary-action" href="#subjects">Explore subjects</a></div>
            <div className="alignment-list" aria-label="Curriculum alignment">
              <p className="alignment-note"><Icon type="book" className="alignment-icon" />Aligned to NSW and Australian curriculums (Early Stage 1 - Stage 6)</p>
              <p className="alignment-note"><Icon type="blocks" className="alignment-icon" />Aligned to the Early Years Learning Framework (Pre-School)</p>
            </div>
          </div>
          <div className="device-stage" aria-label="Wildly teacher dashboard preview">
            <div className="laptop"><div className="laptop-screen"><iframe className="teacher-preview" src={routePath("teacher")} title="Wildly teacher dashboard preview" tabIndex="-1"></iframe></div><div className="laptop-base"></div></div>
            <div className="phone"><img src={assets.heroKoala} alt="" /><h3>Adaptations of Australian Animals</h3><p>Ready to assign</p><a href={routePath("teacher")}>View resource</a></div>
          </div>
        </section>
        <NoticeBanner notice={notice} onClose={() => setNotice("")} />
        <section className="feature-row">
          {[
            ["leaf", "Curriculum-aligned learning", "Engaging lessons mapped to the Australian Curriculum across multiple subject areas."],
            ["globe", "Connected real-world experiences", "Bring learning to life with excursion preparation, animal encounters and conservation action."],
            ["target", "Linked with Taronga Tracka", "Extend inquiry beyond the classroom and turn citizen science data into next steps."],
          ].map(([icon, title, copy]) => <article key={title}><Icon type={icon} className="" /><h2>{title}</h2><p>{copy}</p></article>)}
        </section>
        <section className="subjects-section" id="subjects">
          <div className="section-heading"><h2>Explore by subject</h2><a href={routePath("teacher")}>View all subjects</a></div>
          <div className="subject-strip">
            {subjects.map(([label, cls, copy]) => <a className={cls} href={routePath("teacher")} key={label}><Icon type={subjectIconType(label)} className="" /><strong>{label}</strong><span>{copy}</span></a>)}
          </div>
        </section>
        <section className="journey-section" id="paths">
          <div className="section-heading"><div><h2>A learning journey, connected to nature</h2><p>Wildly makes it easy to connect classroom learning with authentic experiences.</p></div></div>
          <div className="journey-line">{["Pre-visit learning", "At the zoo", "Tracka missions", "Post-visit reflection"].map((title, index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{["Build background knowledge and curiosity before your excursion.", "Engage in guided experiences and real-world investigation.", "Take action with live data, citizen science and reflective tasks.", "Consolidate learning and connect back to curriculum outcomes."][index]}</p></article>)}</div>
        </section>
        <section className="trust-row" id="tracka">
          <article><button type="button" className="trust-action" onClick={() => openConfiguredLink(appLinks.tracka, setNotice, "Taronga Tracka")}><img src={assets.trackaLogo} alt="Taronga Tracka" /><span>Proudly connected with Taronga Tracka</span></button></article>
          <article><Icon type="book" className="" /><span>Aligned to NSW and Australian curriculums (Early Stage 1 - Stage 6)</span></article>
          <article><Icon type="blocks" className="" /><span>Aligned to the Early Years Learning Framework (Pre-School)</span></article>
          <article><Icon type="bookmark" className="" /><span>Secure, reliable teacher resources</span></article>
        </section>
        <section className="cta-section" id="schools"><img src={assets.heroKoala} alt="Koala with joey" /><div><h2>Bring learning to life through nature</h2><p>Join thousands of educators using Wildly to inspire the next generation to care for nature - together.</p><div className="hero-actions"><a className="primary-action" href={routePath("teacher")}>Get started free</a><button type="button" className="secondary-action" onClick={() => openConfiguredLink(appLinks.demoBooking, setNotice, "Book a demo")}>Book a demo</button></div></div></section>
        <footer className="site-footer"><a className="staff-login" href={routePath("staff")}>Taronga staff login</a></footer>
      </main>
    </>
  );
}

function TeacherDashboard({ config, contentItems = defaultContentItems.map(resolveContentItem) }) {
  const [activeSubject, setActiveSubject] = useState(null);
  const [query, setQuery] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedContent, setSelectedContent] = useState(null);
  const [notice, setNotice] = useState("");
  const publishedItems = useMemo(() => contentItems.filter((item) => item.status === "Published"), [contentItems]);
  const learningPaths = useMemo(() => publishedItems.filter((item) => item.type === "Learning Path"), [publishedItems]);
  const lessons = useMemo(() => publishedItems.filter((item) => item.type === "Lesson"), [publishedItems]);
  const resources = useMemo(() => publishedItems.filter((item) => item.type === "Resource"), [publishedItems]);
  const filteredItems = useMemo(() => publishedItems.filter((item) => {
    const matchesSubject = !activeSubject || item.subject === activeSubject;
    const haystack = `${item.title} ${item.subject} ${item.stage} ${item.type} ${item.summary} ${item.description}`.toLowerCase();
    return matchesSubject && haystack.includes(query.toLowerCase());
  }), [activeSubject, publishedItems, query]);
  const visibleResources = useMemo(() => contentItems.filter((resource) => {
    const isPublished = resource.status === "Published";
    const matchesSubject = !activeSubject || resource.subject === activeSubject;
    const haystack = `${resource.title} ${resource.subject} ${resource.stage} ${resource.type}`.toLowerCase();
    return isPublished && matchesSubject && haystack.includes(query.toLowerCase());
  }).slice(0, 3), [activeSubject, contentItems, query]);
  const navItems = [
    ["dashboard", "Dashboard", "grid"],
    ["classes", "My Classes", "users"],
    ["students", "Students", "cap"],
    ["reports", "Reports", "report"],
    ["saved", "Saved", "bookmark"],
    ["calendar", "Calendar", "calendar"],
  ];
  const exploreItems = [
    ["paths", "Learning Paths", "path"],
    ["excursions", "Excursions & Zoo Links", "pin"],
    ["tracka", "Tracka Missions", "target"],
  ];
  const teacherClasses = [
    { title: "Year 3 Blue", detail: "26 students · Stage 2 focus", action: "Open class", view: "students" },
    { title: "Year 4 Green", detail: "24 students · upcoming zoo visit", action: "Review tasks", view: "calendar" },
    { title: "Stage 3 Extension", detail: "12 students · inquiry project", action: "View progress", view: "reports" },
  ];
  const studentSnapshots = [
    ["Ava Wilson", "Needs support with data interpretation", "Stage 2 science"],
    ["Noah Patel", "Ready for extension in persuasive writing", "Stage 3 English"],
    ["Mia Brown", "Completed Tracka mission reflection", "PDHPE / Science"],
  ];
  const reportSnapshots = [
    ["Curriculum coverage", "146 mapped outcomes across live content"],
    ["Highest engagement", "Science, HSIE and Technology & STEM this month"],
    ["Recommended action", "Publish more Stage 2 resources before the next zoo visit"],
  ];

  const showContinue = config.showContinueLearning;
  const showUpcoming = config.showUpcomingPanel;
  const showTracka = config.showTrackaCard;

  function resetFilters() {
    setActiveSubject(null);
    setQuery("");
  }

  function openSubject(label) {
    setActiveSubject(label);
    setActiveView("subjects");
  }

  function openContent(item) {
    setSelectedContent(item);
  }

  function openPrimaryContent(item) {
    const primaryLink = contentPrimaryLink(item);
    if (primaryLink) {
      window.open(primaryLink, "_blank", "noopener,noreferrer");
      return;
    }

    openContent(item);
    setNotice(`${item.title} is ready for content links, but the primary lesson/resource URL still needs to be added.`);
  }

  function openExplorePanel(panel) {
    if (panel === "paths") {
      setActiveView("paths");
      return;
    }

    if (panel === "tracka") {
      openConfiguredLink(appLinks.tracka, setNotice, "Taronga Tracka");
      return;
    }

    setActiveView("calendar");
    setNotice("Excursions & Zoo Links is active as a placeholder. Add the real booking or excursion URL when you have it.");
  }

  const contentDetail = selectedContent ? resolveContentItem(selectedContent) : null;

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Teacher navigation">
        <a className="brand" href={routePath()} aria-label="Wildly by Taronga dashboard"><img className="brand-logo" src={assets.wildlyLogo} alt="Wildly by Taronga - Learning through nature" /></a>
        <nav className="main-nav">
          {navItems.map(([id, label, icon]) => <button type="button" className={`nav-item ${activeView === id ? "active" : ""}`} key={label} onClick={() => setActiveView(id)}><Icon type={icon} />{label}</button>)}
        </nav>
        <section className="side-section" aria-labelledby="subjects-title"><h2 id="subjects-title">Subject Areas</h2>{subjects.map(([label, cls]) => <button className={`subject-link ${cls}`} data-filter={label} key={label} onClick={() => openSubject(label)}><Icon type={subjectIconType(label)} className="subject-svg" />{label}</button>)}</section>
        <section className="side-section" aria-labelledby="explore-title"><h2 id="explore-title">Explore</h2>{exploreItems.map(([id, label, icon]) => <button type="button" className="nav-item small" key={label} onClick={() => openExplorePanel(id)}><Icon type={icon} />{label}{id === "tracka" ? <span className="external"></span> : null}</button>)}</section>
        {showTracka && <article className="tracka-card"><img className="tracka-logo" src={assets.trackaLogo} alt="Taronga Tracka" /><div><strong>Connected to Taronga Tracka</strong><p>Extend learning beyond your visit with real data and citizen science.</p><button type="button" onClick={() => openConfiguredLink(appLinks.tracka, setNotice, "Taronga Tracka")}>Go to Tracka</button></div></article>}
      </aside>
      <main className="workspace">
        <header className="topbar"><button className="menu-button" type="button" aria-label="Open navigation" onClick={() => setNotice("Mobile menu placeholder. The sidebar is the main navigation for now.")}></button><nav className="top-links" aria-label="Primary"><button type="button" className={activeView === "dashboard" ? "selected" : ""} onClick={() => setActiveView("dashboard")}>Dashboard</button><button type="button" className={activeView === "subjects" ? "selected" : ""} onClick={() => setActiveView("subjects")}>Subjects</button><button type="button" className={activeView === "paths" ? "selected" : ""} onClick={() => setActiveView("paths")}>Learning Paths</button><button type="button" className={activeView === "resources" ? "selected" : ""} onClick={() => setActiveView("resources")}>Resources</button><button type="button" className={activeView === "classes" ? "selected" : ""} onClick={() => setActiveView("classes")}>My Classes</button></nav><div className="top-actions"><button type="button" className="top-icon-button" aria-label="Notifications" onClick={() => setNotice("Notifications placeholder: upcoming excursions, due tasks and Tracka mission alerts will appear here.")}><Icon type="bell" className="" /></button><button type="button" className="icon-button help" aria-label="Help" onClick={() => setNotice("Help placeholder: add your support email, docs URL or onboarding flow here.")}></button><button type="button" className="profile-button" onClick={() => setNotice("Profile placeholder: account settings and class preferences can sit here.")}><span>JT</span><strong>Mr. Thompson</strong><small>Teacher</small></button></div></header>
        <NoticeBanner notice={notice} onClose={() => setNotice("")} />
        <section className="hero"><div className="hero-copy"><h1>{config.heroTitle}</h1><p className="hero-subtitle">{config.heroSubtitle}</p><p>Curriculum-aligned lessons, real-world experiences and conservation connections - for every learner, everywhere.</p><div className="hero-actions"><button type="button" className="primary-action" onClick={() => { setActiveView("subjects"); resetFilters(); }}>Browse Subjects</button><button type="button" className="secondary-action" onClick={() => setActiveView("paths")}><Icon type="path" className="path-action-icon" />Start a Learning Path</button></div></div><img className="hero-animal" src={config.heroImageUrl} alt="Koala with joey at Taronga" /></section>
        <section className="library-head"><div><h2>Explore by Subject</h2><p>Filter the teacher library by curriculum area, stage and resource type.</p></div><label className="search-box"><span></span><input value={query} onChange={(event) => { setQuery(event.target.value); setActiveView("subjects"); }} type="search" placeholder="Search resources" /></label><button type="button" className="text-link" onClick={() => { resetFilters(); setActiveView("subjects"); }}>View All Subjects</button></section>
        <section className="subject-grid" aria-label="Subject cards">{subjects.map(([label, cls, copy]) => <article className={`subject-card ${cls} ${activeSubject === label ? "selected" : ""}`} key={label} onClick={() => openSubject(label)}><Icon type={subjectIconType(label)} className="subject-icon" /><h3>{label}</h3><p>{copy}</p><button type="button" onClick={(event) => { event.stopPropagation(); openSubject(label); }}>Explore</button></article>)}</section>
        {activeView === "dashboard" && <div className="dashboard-columns">
          <section className="content-column">
            {showContinue && <><div className="section-title-row"><h2>Continue Learning</h2><button type="button" className="text-link" onClick={() => setActiveView("resources")}>View all</button></div><section className="learning-grid" aria-live="polite">{visibleResources.map((resource, index) => <article className="learning-card" key={resource.title}><img src={resource.image} alt="" /><div className="learning-body"><span className="pill">{resource.subject}</span><h3>{index === 0 ? config.featuredResourceTitle : resource.title}</h3><p>{resource.type} - {resource.stage}</p><div className="progress-row"><div className="progress-track"><span style={{ width: `${resource.progress}%` }}></span></div><small>{resource.progress}% Complete</small></div><button type="button" onClick={() => openPrimaryContent(resource)}>Continue</button></div></article>)}</section></>}
            <div className="section-title-row news-title"><h2>What's New on Wildly</h2><button type="button" className="text-link" onClick={() => setActiveView("resources")}>View all</button></div>
            <section className="news-grid"><article className="news-card blue" onClick={() => openContent(resources[0] || publishedItems[0])}><img src={assets.rhino} alt="" /><div><span>New Resource</span><h3>Voices for Country</h3><p>First Nations perspectives for Stage 3 inquiry.</p></div></article><article className="news-card purple" onClick={() => setNotice("Teacher webinar placeholder. Add your webinar or PD registration link here.")}><img src={assets.gorilla} alt="" /><div><span>Teacher Webinar</span><h3>Learning with Impact</h3><p>Plan lessons around conservation action.</p></div></article><article className="news-card green" onClick={() => openContent(learningPaths[0] || publishedItems[0])}><img src={assets.binturong} alt="" /><div><span>New Learning Path</span><h3>Sustainable Futures</h3><p>Build a full sequence across Science and HSIE.</p></div></article></section>
          </section>
          {showUpcoming && <aside className="upcoming-panel" aria-labelledby="upcoming-title"><div className="section-title-row"><h2 id="upcoming-title">Upcoming</h2><button type="button" className="text-link" onClick={() => setActiveView("calendar")}>View Calendar</button></div><article className="event-card" onClick={() => setNotice("Excursion booking placeholder. Link this card to your booking or visit-planning workflow.")}><img src={assets.giraffe} alt="" /><div><span className="event-tag">Excursion</span><h3>Taronga Zoo Visit - Biodiversity in Action</h3><p>Tue 8 Jun - 9:30am</p></div></article><article className="event-card icon-event" onClick={() => openConfiguredLink(appLinks.tracka, setNotice, "Tracka mission")}><span className="target-icon"></span><div><span className="event-tag live">Live</span><h3>Tracka Mission - Citizen Science Challenge</h3><p>Fri 21 Jun - 11:00am</p></div></article><article className="event-card icon-event" onClick={() => openContent(lessons[0] || publishedItems[0])}><span className="leaf-badge"></span><div><span className="event-tag due">Due</span><h3>Creative Writing: Inspired by Nature</h3><p>Mon 24 Jun - 11:59pm</p></div></article><article className="difference-card"><span className="mini-mark" aria-hidden="true"></span><div><h3>Learning that makes a difference</h3><p>Inspiring the next generation to care for nature - together.</p></div></article></aside>}
        </div>}
        {activeView === "subjects" && <section className="teacher-panel"><div className="teacher-panel-header"><div><span className="content-type">Subjects</span><h2>{activeSubject || "All Subjects"}</h2><p>{filteredItems.length} published items ready for teachers to browse and assign.</p></div><button type="button" className="secondary-action" onClick={resetFilters}>Clear filters</button></div><div className="teacher-library-grid">{filteredItems.length ? filteredItems.map((item) => <article className="teacher-library-card" key={item.id || item.title}><img src={item.image} alt="" /><div><span className="pill">{item.type}</span><h3>{item.title}</h3><p>{item.summary || item.description}</p><small>{item.subject} - {item.stage}</small><div className="teacher-card-actions"><button type="button" className="primary-action" onClick={() => openPrimaryContent(item)}>Open</button><button type="button" className="secondary-action" onClick={() => openContent(item)}>Details</button></div></div></article>) : <article className="placeholder-card"><h3>No content matches this filter yet</h3><p>Try another subject, clear the search, or add more published content from the staff console.</p></article>}</div></section>}
        {activeView === "paths" && <section className="teacher-panel"><div className="teacher-panel-header"><div><span className="content-type">Learning Paths</span><h2>Assignable units and sequences</h2><p>Open a full learning path, review its outcomes and follow the lesson sequence.</p></div><button type="button" className="secondary-action" onClick={() => setActiveView("dashboard")}>Back to dashboard</button></div><div className="teacher-library-grid">{learningPaths.length ? learningPaths.map((item) => <article className="teacher-library-card" key={item.id || item.title}><img src={item.image} alt="" /><div><span className="pill">{item.subject}</span><h3>{item.title}</h3><p>{item.summary || item.description}</p><small>{item.durationWeeks || 0} weeks · {item.lessonIds?.length || 0} lessons</small><div className="teacher-card-actions"><button type="button" className="primary-action" onClick={() => openContent(item)}>Open path</button><button type="button" className="secondary-action" onClick={() => setNotice("Assign path placeholder. Connect this to your class assignment workflow next.")}>Assign</button></div></div></article>) : <article className="placeholder-card"><h3>No learning paths published yet</h3><p>Create and publish a learning path from the staff Content tab to surface it here.</p></article>}</div></section>}
        {activeView === "resources" && <section className="teacher-panel"><div className="teacher-panel-header"><div><span className="content-type">Resources</span><h2>Lessons and resources</h2><p>Everything published in the teacher library, ready to open.</p></div><button type="button" className="secondary-action" onClick={() => setActiveView("subjects")}>Filter by subject</button></div><div className="teacher-library-grid">{[...lessons, ...resources].length ? [...lessons, ...resources].map((item) => <article className="teacher-library-card" key={item.id || item.title}><img src={item.image} alt="" /><div><span className="pill">{item.type}</span><h3>{item.title}</h3><p>{item.summary || item.description}</p><small>{item.subject} - {item.stage}</small><div className="teacher-card-actions"><button type="button" className="primary-action" onClick={() => openPrimaryContent(item)}>Open</button><button type="button" className="secondary-action" onClick={() => setNotice("Assign resource placeholder. Hook this up to class assignment when you are ready.")}>Assign</button></div></div></article>) : <article className="placeholder-card"><h3>No published lessons or resources yet</h3><p>Publish some content in the staff console and it will appear here automatically.</p></article>}</div></section>}
        {activeView === "classes" && <section className="teacher-panel"><div className="teacher-panel-header"><div><span className="content-type">My Classes</span><h2>Teaching groups</h2><p>Use this view for class-level assignment, planning and monitoring.</p></div><button type="button" className="secondary-action" onClick={() => setNotice("Class creation placeholder. Add your real class management flow here.")}>Create class</button></div><div className="teacher-summary-grid">{teacherClasses.map((classroom) => <article key={classroom.title} className="summary-card"><h3>{classroom.title}</h3><p>{classroom.detail}</p><button type="button" className="primary-action" onClick={() => setActiveView(classroom.view)}>{classroom.action}</button></article>)}</div></section>}
        {activeView === "students" && <section className="teacher-panel"><div className="teacher-panel-header"><div><span className="content-type">Students</span><h2>Student snapshot</h2><p>Track support needs, extension opportunities and completion at a glance.</p></div><button type="button" className="secondary-action" onClick={() => setNotice("Student export placeholder. Add CSV export or SIS sync here.")}>Export students</button></div><div className="teacher-summary-grid">{studentSnapshots.map(([name, note, group]) => <article key={name} className="summary-card"><h3>{name}</h3><p>{note}</p><small>{group}</small></article>)}</div></section>}
        {activeView === "reports" && <section className="teacher-panel"><div className="teacher-panel-header"><div><span className="content-type">Reports</span><h2>Teacher reporting</h2><p>Use this area for curriculum coverage, engagement and next-step recommendations.</p></div><button type="button" className="secondary-action" onClick={() => downloadTextFile("wildly-teacher-report.csv", "metric,value\nCurriculum coverage,146\nBelow expected,18%\nAt expected,57%\nAbove expected,25%\n", "text/csv;charset=utf-8")}>Download sample CSV</button></div><div className="teacher-summary-grid">{reportSnapshots.map(([title, copy]) => <article key={title} className="summary-card"><h3>{title}</h3><p>{copy}</p></article>)}</div></section>}
        {activeView === "saved" && <section className="teacher-panel"><div className="teacher-panel-header"><div><span className="content-type">Saved</span><h2>Saved for later</h2><p>This is ready for bookmarking once you want persistent teacher saves.</p></div></div><article className="placeholder-card"><h3>No saved items yet</h3><p>Bookmarking is the next obvious feature here. For now, use the resource library and learning paths directly.</p></article></section>}
        {activeView === "calendar" && <section className="teacher-panel"><div className="teacher-panel-header"><div><span className="content-type">Calendar</span><h2>Upcoming dates</h2><p>Assignments, excursions and Tracka missions can all surface here.</p></div><button type="button" className="secondary-action" onClick={() => setNotice("Calendar sync placeholder. Add Google Calendar, Outlook or school calendar sync here.")}>Connect calendar</button></div><div className="teacher-summary-grid"><article className="summary-card"><h3>Tue 8 Jun</h3><p>Taronga Zoo Visit - Biodiversity in Action</p></article><article className="summary-card"><h3>Fri 21 Jun</h3><p>Tracka Mission - Citizen Science Challenge</p></article><article className="summary-card"><h3>Mon 24 Jun</h3><p>Creative Writing: Inspired by Nature due</p></article></div></section>}
        {contentDetail && <div className="detail-overlay" role="dialog" aria-modal="true"><div className="detail-modal"><button type="button" className="detail-close" onClick={() => setSelectedContent(null)}>Close</button><img src={contentDetail.image} alt="" /><div className="detail-copy"><span className="content-type">{contentDetail.type}</span><h2>{contentDetail.title}</h2><p>{contentDetail.description || contentDetail.summary}</p><div className="detail-meta"><small>{contentDetail.subject}</small><small>{contentDetail.stage}</small>{contentDetail.durationWeeks ? <small>{contentDetail.durationWeeks} weeks</small> : null}{contentDetail.durationMinutes ? <small>{contentDetail.durationMinutes} minutes</small> : null}</div><div className="teacher-card-actions"><button type="button" className="primary-action" onClick={() => openPrimaryContent(contentDetail)}>Open main link</button><button type="button" className="secondary-action" onClick={() => setNotice("Assignment placeholder. Connect this modal to your class assignment flow next.")}>Assign</button></div>{contentDetail.outcomeCodes?.length ? <div className="detail-list"><h3>Outcomes</h3><ul>{contentDetail.outcomeCodes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul></div> : null}{contentDetail.lessonIds?.length ? <div className="detail-list"><h3>Included lessons</h3><ul>{contentDetail.lessonIds.map((lessonId) => <li key={lessonId}>{lessons.find((lesson) => lesson.id === lessonId)?.title || lessonId}</li>)}</ul></div> : null}{contentDetail.resourceIds?.length ? <div className="detail-list"><h3>Attached resources</h3><ul>{contentDetail.resourceIds.map((resourceId) => <li key={resourceId}>{resources.find((resource) => resource.id === resourceId)?.title || resourceId}</li>)}</ul></div> : null}</div></div></div>}
      </main>
    </div>
  );
}

const defaultDashboardConfig = {
  heroTitle: "Learning through nature",
  heroSubtitle: "Inspire curiosity. Create change.",
  heroImageUrl: assets.heroKoala,
  featuredResourceTitle: "Sustainable Futures",
  showContinueLearning: true,
  showUpcomingPanel: true,
  showTrackaCard: true,
};

const dashboardConfigRef = doc(db, "dashboardConfig", "main");
const contentItemsCollection = collection(db, "contentItems");

function collectionForContentType(type) {
  return {
    "Learning Path": "learningPaths",
    Lesson: "lessons",
    Resource: "resources",
  }[type] || "";
}

function itemKindForContentType(type) {
  return type === "Learning Path" ? "learningPath" : type === "Lesson" ? "lesson" : "resource";
}

function resolveContentItem(item = {}) {
  const image = item.image || assets[item.imageKey] || assets.heroKoala;
  return {
    progress: 0,
    status: "Draft",
    type: "Resource",
    subject: "Science",
    stage: "Stage 2",
    materials: {},
    lessonIds: [],
    resourceIds: [],
    ...item,
    image,
  };
}

function sortContentItems(items) {
  return [...items].sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
}

function useContentItems() {
  const [items, setItems] = useState(defaultContentItems.map(resolveContentItem));
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    return onSnapshot(
      contentItemsCollection,
      (snapshot) => {
        if (snapshot.empty) {
          setItems(defaultContentItems.map(resolveContentItem));
          setStatus("missing");
          return;
        }

        setItems(sortContentItems(snapshot.docs.map((snapshotDoc) => resolveContentItem({ id: snapshotDoc.id, ...snapshotDoc.data() }))));
        setStatus("live");
      },
      (error) => {
        console.error("Unable to load contentItems", error);
        setItems(defaultContentItems.map(resolveContentItem));
        setStatus("error");
      },
    );
  }, []);

  return { items, status };
}

function withDefaultDashboardConfig(config = {}) {
  return { ...defaultDashboardConfig, ...config };
}

function useDashboardConfig() {
  const [config, setConfig] = useState(defaultDashboardConfig);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    return onSnapshot(
      dashboardConfigRef,
      (snapshot) => {
        setConfig(withDefaultDashboardConfig(snapshot.exists() ? snapshot.data() : {}));
        setStatus(snapshot.exists() ? "live" : "missing");
      },
      (error) => {
        console.error("Unable to load dashboardConfig/main", error);
        setStatus("error");
      },
    );
  }, []);

  return { config, status };
}

function TeacherPage() {
  const { config, status } = useDashboardConfig();
  const { items: contentItems, status: contentStatus } = useContentItems();
  return (
    <>
      <FirestoreStatus status={status} />
      <ContentFirestoreStatus status={contentStatus} />
      <TeacherDashboard config={config} contentItems={contentItems} />
    </>
  );
}

function StaffPage() {
  const [isUnlocked, setIsUnlocked] = useState(() => window.sessionStorage.getItem(staffSessionKey) === "unlocked");

  function unlock() {
    window.sessionStorage.setItem(staffSessionKey, "unlocked");
    setIsUnlocked(true);
  }

  function lock() {
    window.sessionStorage.removeItem(staffSessionKey);
    setIsUnlocked(false);
  }

  if (!isUnlocked) {
    return <StaffPasswordScreen onUnlock={unlock} />;
  }

  return <StaffConsole onLock={lock} />;
}

function StaffPasswordScreen({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (password === staffPassword) {
      onUnlock();
      return;
    }

    setError("Incorrect password.");
  }

  return (
    <main className="staff-auth-page">
      <section className="staff-auth-card" aria-label="Taronga staff login">
        <img src={assets.wildlyLogo} alt="Wildly by Taronga" />
        <span>Taronga Staff Console</span>
        <h1>Staff password</h1>
        <p>Enter the temporary staff password to edit Wildly dashboard content.</p>
        <form onSubmit={handleSubmit}>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={staffPassword} autoComplete="current-password" autoFocus /></label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit">Enter staff console</button>
        </form>
      </section>
    </main>
  );
}

function StaffConsole({ onLock }) {
  const [panel, setPanel] = useState("overview");
  const { config: savedConfig, status } = useDashboardConfig();
  const { items: contentItems, status: contentStatus } = useContentItems();
  const [config, setConfig] = useState(defaultDashboardConfig);
  const [previewKey, setPreviewKey] = useState(0);
  const [saveState, setSaveState] = useState("idle");
  const [contentSaveState, setContentSaveState] = useState("idle");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setConfig(savedConfig);
  }, [savedConfig]);

  function updateConfig(patch) {
    setConfig((current) => ({ ...current, ...patch }));
  }

  async function publishDashboardConfig() {
    setSaveState("saving");
    try {
      await setDoc(
        dashboardConfigRef,
        {
          ...config,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setSaveState("saved");
    } catch (error) {
      console.error("Unable to save dashboardConfig/main", error);
      setSaveState("error");
    }
  }

  async function seedContentItems() {
    setContentSaveState("saving");
    try {
      await Promise.all(defaultContentItems.flatMap((item) => {
        const mirrorCollection = collectionForContentType(item.type);
        const writes = [
          setDoc(
            doc(db, "contentItems", item.id),
            { ...item, itemKind: itemKindForContentType(item.type), updatedAt: serverTimestamp() },
            { merge: true },
          ),
        ];

        if (mirrorCollection) {
          writes.push(setDoc(doc(db, mirrorCollection, item.id), {
            ...item,
            itemKind: itemKindForContentType(item.type),
            lessonIds: item.lessonIds || [],
            resourceIds: item.resourceIds || [],
            updatedAt: serverTimestamp(),
          }, { merge: true }));
        }

        return writes;
      }));
      setContentSaveState("saved");
    } catch (error) {
      console.error("Unable to seed contentItems", error);
      setContentSaveState("error");
    }
  }

  async function addContentItem(item) {
    setContentSaveState("saving");
    try {
      const contentType = item.type;
      const mirrorCollection = collectionForContentType(contentType);
      const contentPayload = {
        ...item,
        image: item.uploadedImageDataUrl || item.customImageUrl?.trim() || item.image || assets[item.imageKey] || assets.heroKoala,
        durationMinutes: Number(item.durationMinutes) || 0,
        durationWeeks: Number(item.durationWeeks) || 0,
        outcomeCodes: Array.isArray(item.outcomeCodes) ? item.outcomeCodes : listFromText(item.outcomeCodes || ""),
        activityPrompts: Array.isArray(item.activityPrompts) ? item.activityPrompts : listFromText(item.activityPrompts || ""),
        materials: {
          canvaEmbedUrl: item.canvaEmbedUrl?.trim() || "",
          teacherGuideUrl: item.teacherGuideUrl?.trim() || "",
          studentWorksheetUrl: item.studentWorksheetUrl?.trim() || "",
          videoUrl: item.videoUrl?.trim() || "",
          teacherAdminUrl: item.teacherAdminUrl?.trim() || "",
          unitPlanUrl: item.unitPlanUrl?.trim() || "",
          lessonPlanUrl: item.lessonPlanUrl?.trim() || "",
          resourceUrl: item.resourceUrl?.trim() || "",
          resourceLinks: Array.isArray(item.resourceLinks) ? item.resourceLinks : listFromText(item.resourceLinks || ""),
        },
        lessonIds: Array.isArray(item.lessonIds) ? item.lessonIds : [],
        resourceIds: Array.isArray(item.resourceIds) ? item.resourceIds : [],
        learningPathId: item.learningPathId || "",
        lessonId: item.lessonId || "",
        progress: contentType === "Learning Path" ? 0 : Number(item.progress) || 0,
        itemKind: itemKindForContentType(contentType),
      };

      delete contentPayload.canvaEmbedUrl;
      delete contentPayload.teacherGuideUrl;
      delete contentPayload.studentWorksheetUrl;
      delete contentPayload.videoUrl;
      delete contentPayload.teacherAdminUrl;
      delete contentPayload.unitPlanUrl;
      delete contentPayload.lessonPlanUrl;
      delete contentPayload.resourceUrl;
      delete contentPayload.resourceLinks;
      delete contentPayload.customImageUrl;
      delete contentPayload.uploadedImageDataUrl;

      const contentRef = await addDoc(contentItemsCollection, {
        ...contentPayload,
        order: contentItems.length + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (mirrorCollection) {
        await setDoc(doc(db, mirrorCollection, contentRef.id), {
          ...contentPayload,
          contentItemId: contentRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setContentSaveState("saved");
    } catch (error) {
      console.error("Unable to add content item", error);
      setContentSaveState("error");
    }
  }

  async function deleteContentItem(item) {
    if (!item?.id) return;

    setContentSaveState("saving");
    try {
      await deleteDoc(doc(db, "contentItems", item.id));
      const mirrorCollection = collectionForContentType(item.type);
      if (mirrorCollection) {
        await deleteDoc(doc(db, mirrorCollection, item.id));
      }
      setContentSaveState("saved");
    } catch (error) {
      console.error("Unable to delete content item", error);
      setContentSaveState("error");
    }
  }

  async function publishUpdates() {
    await publishDashboardConfig();
    setNotice("Dashboard settings were published. Content items save to Firestore as soon as they are created or deleted.");
  }

  return (
    <div className="staff-shell">
      <aside className="staff-sidebar">
        <a className="staff-logo" href={routePath()} aria-label="Wildly home"><img src={assets.wildlyLogo} alt="Wildly by Taronga" /></a>
        <nav className="staff-nav" aria-label="Staff navigation">
          {[
            ["overview", "grid", "Overview"],
            ["users", "users", "Users"],
            ["analytics", "report", "Analytics"],
            ["content", "report", "Content"],
            ["dashboard", "monitor", "Edit Dashboard"],
          ].map(([id, icon, label]) => <button className={panel === id ? "active" : ""} type="button" data-panel={id} key={id} onClick={() => setPanel(id)}><Icon type={icon} className="" />{label}</button>)}
        </nav>
        <article className="tracka-mini"><img src={assets.trackaLogo} alt="Taronga Tracka" /><p>Staff editing is unlocked for this browser session. Tracka data connector ready for staff review.</p></article>
      </aside>
      <main className="staff-workspace">
        <header className="staff-topbar"><div><span>Taronga Staff Console</span><h1>Wildly learning operations</h1></div><div className="staff-actions"><a href={routePath("teacher")}>Teacher view</a><button type="button" onClick={publishUpdates}>Publish updates</button><button type="button" className="sign-out-button" onClick={onLock}>Lock staff view</button></div></header>
        <NoticeBanner notice={notice} onClose={() => setNotice("")} />
        {panel === "overview" && <section className="staff-panel active"><div className="overview-grid">{[["Active users", "4,286", "Teachers, students and Taronga staff this term"], ["Assigned resources", "18,940", "Lessons, learning paths and missions launched"], ["Tracka-linked sessions", "72%", "Activities connected to excursion or citizen science data"], ["Curriculum coverage", "146", "Mapped outcomes across NSW and Australian Curriculum"]].map(([label, value, copy]) => <article key={label}><span>{label}</span><strong>{value}</strong><p>{copy}</p></article>)}</div><div className="overview-snapshot"><article><h2>Current priorities</h2><p>Science and HSIE pathways are seeing the strongest uptake this month, with data interpretation flagged as the highest-value support area.</p></article><article><h2>Next recommended action</h2><p>Review Stage 3 animal adaptations lessons and prepare a Tracka mission bundle for upcoming school visits.</p></article></div></section>}
        {panel === "users" && <UsersPanel onPlaceholder={(message) => setNotice(message)} />}
        {panel === "analytics" && <AnalyticsPanel onPlaceholder={(message) => setNotice(message)} />}
        {panel === "content" && <ContentPanel contentItems={contentItems} status={contentStatus} saveState={contentSaveState} seedContentItems={seedContentItems} addContentItem={addContentItem} deleteContentItem={deleteContentItem} />}
        {panel === "dashboard" && <DashboardEditor config={config} contentItems={contentItems} updateConfig={updateConfig} reset={() => { setConfig(defaultDashboardConfig); setPreviewKey((key) => key + 1); }} previewKey={previewKey} publish={publishDashboardConfig} status={status} saveState={saveState} />}
      </main>
    </div>
  );
}

function UsersPanel({ onPlaceholder }) {
  const userRows = [
    ["James Thompson", "Teacher", "Riverbank Public School", "Active", "Today"],
    ["Ava Wilson", "Student", "Riverbank Public School", "Active", "Today"],
    ["Maya Chen", "Taronga staff", "Taronga Education", "Review", "Yesterday"],
    ["Samir Patel", "School admin", "Western Sydney Learning Hub", "Active", "2 days ago"],
  ];
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const visibleRows = userRows.filter(([name, role, org]) => {
    const matchesSearch = `${name} ${role} ${org}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All roles" || role === roleFilter.slice(0, -1) || role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return <section className="staff-section staff-panel active"><div className="section-heading"><div><h2>Users</h2><p>Analyse all teachers, students, schools and Taronga staff involved in Wildly.</p></div><button type="button" onClick={() => onPlaceholder("Add user placeholder. Connect this to your user invite or provisioning flow.")}>Add user</button></div><div className="user-layout"><article className="user-breakdown"><h3>User mix</h3><div className="donut" aria-label="User mix chart"></div><ul>{[["teacher", "Teachers", "682"], ["student", "Students", "3,421"], ["staff", "Taronga staff", "74"], ["school", "School admins", "109"]].map(([cls, label, value]) => <li key={label}><span className={cls}></span>{label}<strong>{value}</strong></li>)}</ul></article><article className="user-table-card"><div className="table-toolbar"><label><Icon type="target" className="" /><input type="search" placeholder="Search users, schools or roles" value={search} onChange={(event) => setSearch(event.target.value)} /></label><select aria-label="Filter users" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option>All roles</option><option>Teacher</option><option>Student</option><option>Taronga staff</option><option>School admin</option></select></div><table><thead><tr><th>User</th><th>Role</th><th>Organisation</th><th>Status</th><th>Last active</th></tr></thead><tbody>{visibleRows.map(([name, role, org, status, active]) => <tr key={name}><td>{name}</td><td>{role}</td><td>{org}</td><td><span className={`status ${status === "Active" ? "active" : "review"}`}>{status}</span></td><td>{active}</td></tr>)}</tbody></table>{visibleRows.length ? null : <p className="empty-table-copy">No users match this filter.</p>}</article></div></section>;
}

function AnalyticsPanel({ onPlaceholder }) {
  function exportReport() {
    downloadTextFile(
      "wildly-analytics-report.csv",
      "metric,value\nLearning engagement peak,88%\nBelow expected,18%\nAt expected,57%\nAbove expected,25%\nHighest gap,Adaptation vs behaviour\n",
      "text/csv;charset=utf-8",
    );
    onPlaceholder("Analytics report exported as a sample CSV. Replace this with your real reporting export when ready.");
  }

  return <section className="staff-section staff-panel active"><div className="section-heading"><div><h2>Analytics</h2><p>View engagement, learning progress, curriculum gaps and Tracka-connected outcomes.</p></div><button type="button" onClick={exportReport}>Export report</button></div><div className="analytics-grid"><article className="wide-card"><h3>Learning engagement by week</h3><div className="bar-chart">{[42, 58, 51, 76, 68, 88, 81].map((height) => <span style={{ height: `${height}%` }} key={height}></span>)}</div></article><article><h3>Knowledge gaps</h3>{[["Adaptation vs behaviour", 64], ["Data interpretation", 48], ["Persuasive writing", 37]].map(([label, width]) => <React.Fragment key={label}><p className="metric">{label}</p><div className="meter"><span style={{ width: `${width}%` }}></span></div></React.Fragment>)}</article><article><h3>Results snapshot</h3><ul className="result-list"><li>Below expected <strong>18%</strong></li><li>At expected <strong>57%</strong></li><li>Above expected <strong>25%</strong></li></ul></article></div></section>;
}

function ContentPanel({ contentItems, status, saveState, seedContentItems, addContentItem, deleteContentItem }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(createContentDraft("Learning Path"));
  const [imageError, setImageError] = useState("");
  const learningPaths = contentItems.filter((item) => item.type === "Learning Path");
  const lessonOptions = contentItems.filter((item) => item.type === "Lesson");
  const resourceOptions = contentItems.filter((item) => item.type === "Resource");
  const groupedContent = [
    ["Learning Path", learningPaths],
    ["Lesson", lessonOptions],
    ["Resource", resourceOptions],
  ];
  const selectedImage = draft.uploadedImageDataUrl || draft.customImageUrl || draft.image || assets[draft.imageKey] || assets.heroKoala;

  async function submitContent(event) {
    event.preventDefault();
    await addContentItem(draft);
    setDraft(createContentDraft(draft.type));
    setShowForm(false);
  }

  function updateDraft(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function changeType(type) {
    setDraft((current) => ({
      ...createContentDraft(type),
      subject: current.subject,
      stage: current.stage,
      imageKey: current.imageKey,
      image: current.image,
    }));
    setShowForm(true);
    setImageError("");
  }

  async function uploadCardImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await resizeImageFile(file);
      updateDraft({ uploadedImageDataUrl: dataUrl, customImageUrl: "", image: dataUrl, imageKey: "" });
      setImageError("");
    } catch (error) {
      setImageError(error.message);
    }
  }

  function toggleListItem(field, itemId) {
    setDraft((current) => {
      const currentList = current[field] || [];
      const nextList = currentList.includes(itemId)
        ? currentList.filter((id) => id !== itemId)
        : [...currentList, itemId];
      return { ...current, [field]: nextList };
    });
  }

  function chooseStockImage(src) {
    const stockImage = stockImages.find((image) => image.src === src);
    updateDraft({
      imageKey: stockImage?.key || "",
      image: stockImage?.key ? "" : src,
      customImageUrl: "",
      uploadedImageDataUrl: "",
    });
    setImageError("");
  }

  async function confirmDelete(item) {
    const label = `${item.type}: ${item.title}`;
    if (!window.confirm(`Delete ${label}? This removes the Firestore content item and its ${item.type.toLowerCase()} record.`)) return;
    await deleteContentItem(item);
  }

  function itemTitle(items, id) {
    return items.find((item) => item.id === id)?.title || "";
  }

  function materialCount(item) {
    return [
      item.materials?.canvaEmbedUrl,
      item.materials?.teacherGuideUrl,
      item.materials?.studentWorksheetUrl,
      item.materials?.videoUrl,
      item.materials?.teacherAdminUrl,
      item.materials?.unitPlanUrl,
      item.materials?.lessonPlanUrl,
      item.materials?.resourceUrl,
      ...(item.materials?.resourceLinks || []),
    ].filter(Boolean).length;
  }

  return (
    <section className="staff-section staff-panel active">
      <div className="section-heading">
        <div><h2>Content</h2><p>Build content in the real LMS order: learning path, lesson, resource. Each item can also stand alone.</p></div>
        <div className="heading-actions"><button type="button" onClick={seedContentItems}>Seed Firestore content</button></div>
      </div>
      <ContentFirestoreStatus status={status} saveState={saveState} />
      <div className="content-builder-options" aria-label="Create content">
        <button type="button" onClick={() => changeType("Learning Path")}><span>1</span><strong>Learning Path</strong><small>Unit, weeks, outcomes, admin docs</small></button>
        <button type="button" onClick={() => changeType("Lesson")}><span>2</span><strong>Lesson</strong><small>Lesson plan, outcomes, path link</small></button>
        <button type="button" onClick={() => changeType("Resource")}><span>3</span><strong>Resource</strong><small>File, link, description, lesson link</small></button>
      </div>
      {showForm && <form className="content-form" onSubmit={submitContent}>
        <div className="content-form-header">
          <span className="content-type">{draft.type} Builder</span>
          <h3>{draft.type === "Learning Path" ? "Create a learning path" : draft.type === "Lesson" ? "Create a lesson" : "Create a resource"}</h3>
          <p>{draft.type === "Learning Path" ? "A learning path is the full unit or sequence teachers assign over multiple weeks." : draft.type === "Lesson" ? "A lesson can sit inside a learning path or be used by itself." : "A resource can sit inside a lesson or be used by itself."}</p>
        </div>
        <label>Title<input type="text" required value={draft.title} onChange={(event) => updateDraft({ title: event.target.value })} /></label>
        <label>Type<select value={draft.type} onChange={(event) => changeType(event.target.value)}><option>Lesson</option><option>Learning Path</option><option>Resource</option></select></label>
        <label>Subject<select value={draft.subject} onChange={(event) => updateDraft({ subject: event.target.value })}>{subjects.map(([label]) => <option key={label}>{label}</option>)}</select></label>
        <label>Stage<input type="text" value={draft.stage} onChange={(event) => updateDraft({ stage: event.target.value })} /></label>
        <label>Status<select value={draft.status} onChange={(event) => updateDraft({ status: event.target.value })}><option>Draft</option><option>Review</option><option>Published</option></select></label>
        {draft.type === "Learning Path" && <label>Duration in weeks<input type="number" min="0" value={draft.durationWeeks} onChange={(event) => updateDraft({ durationWeeks: event.target.value })} /></label>}
        {draft.type === "Lesson" && <label>Duration in minutes<input type="number" min="0" value={draft.durationMinutes} onChange={(event) => updateDraft({ durationMinutes: event.target.value })} /></label>}
        <label className="wide-field">Summary<input type="text" required value={draft.summary} onChange={(event) => updateDraft({ summary: event.target.value })} /></label>
        <label className="wide-field">Description<textarea value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })}></textarea></label>
        <div className="simple-image-picker">
          <img src={selectedImage} alt="" />
          <div>
            <span className="content-type">Image</span>
            <label>Stock image<select value={selectedImage} onChange={(event) => chooseStockImage(event.target.value)}>{stockImages.map((stockImage) => <option value={stockImage.src} key={`${stockImage.label}-${stockImage.src}`}>{stockImage.label}</option>)}</select></label>
            <label>Image URL<input type="url" value={draft.customImageUrl} onChange={(event) => updateDraft({ customImageUrl: event.target.value, uploadedImageDataUrl: "", image: event.target.value, imageKey: "" })} placeholder="https://..." /></label>
            <label>Upload image<input type="file" accept="image/*" onChange={uploadCardImage} /></label>
            {imageError && <p className="auth-error">{imageError}</p>}
          </div>
        </div>
        <label className="wide-field">Curriculum outcomes<textarea placeholder="One outcome per line, e.g. ST2-4LW-S" value={draft.outcomeCodes} onChange={(event) => updateDraft({ outcomeCodes: event.target.value })}></textarea></label>
        {draft.type === "Learning Path" && <><label>Teacher admin documents URL<input type="url" value={draft.teacherAdminUrl} onChange={(event) => updateDraft({ teacherAdminUrl: event.target.value })} placeholder="Drive, PDF or Canva link" /></label><label>Unit plan URL<input type="url" value={draft.unitPlanUrl} onChange={(event) => updateDraft({ unitPlanUrl: event.target.value })} placeholder="Scope, sequence or program link" /></label><fieldset className="lesson-picker"><legend>Lessons in this learning path</legend>{lessonOptions.length ? lessonOptions.map((lesson) => <label key={lesson.id || lesson.title}><input type="checkbox" checked={draft.lessonIds.includes(lesson.id)} onChange={() => toggleListItem("lessonIds", lesson.id)} />{lesson.title}<small>{lesson.subject} - {lesson.stage}</small></label>) : <p>Create or seed lessons first, then add them to this path.</p>}</fieldset></>}
        {draft.type === "Lesson" && <><label>Learning path<select value={draft.learningPathId} onChange={(event) => updateDraft({ learningPathId: event.target.value })}><option value="">Standalone lesson</option>{learningPaths.map((path) => <option value={path.id} key={path.id || path.title}>{path.title}</option>)}</select></label><label>Lesson plan URL<input type="url" value={draft.lessonPlanUrl} onChange={(event) => updateDraft({ lessonPlanUrl: event.target.value })} placeholder="PDF, Google Drive or Canva link" /></label><fieldset className="lesson-picker"><legend>Resources in this lesson</legend>{resourceOptions.length ? resourceOptions.map((resource) => <label key={resource.id || resource.title}><input type="checkbox" checked={draft.resourceIds.includes(resource.id)} onChange={() => toggleListItem("resourceIds", resource.id)} />{resource.title}<small>{resource.subject} - {resource.stage}</small></label>) : <p>Create resources first, then add them to this lesson.</p>}</fieldset></>}
        {draft.type === "Resource" && <><label>Lesson<select value={draft.lessonId} onChange={(event) => updateDraft({ lessonId: event.target.value })}><option value="">Standalone resource</option>{lessonOptions.map((lesson) => <option value={lesson.id} key={lesson.id || lesson.title}>{lesson.title}</option>)}</select></label><label>Resource file or Canva URL<input type="url" value={draft.resourceUrl} onChange={(event) => updateDraft({ resourceUrl: event.target.value })} placeholder="PDF, image, video, Canva or Drive link" /></label><label className="wide-field">Extra resource links<textarea placeholder="One URL per line" value={draft.resourceLinks} onChange={(event) => updateDraft({ resourceLinks: event.target.value })}></textarea></label></>}
        {draft.type === "Learning Path" && <fieldset className="lesson-picker">
          <legend>Optional activity prompts</legend>
          <label className="wide-field">Teacher notes<textarea placeholder="One activity or prompt per line" value={draft.activityPrompts} onChange={(event) => updateDraft({ activityPrompts: event.target.value })}></textarea></label>
        </fieldset>}
        <div className="content-form-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" disabled={saveState === "saving"}>{saveState === "saving" ? "Saving..." : "Save to Firestore"}</button></div>
      </form>}
      <div className="content-sections">{groupedContent.map(([type, items]) => <section className="content-section-card" key={type}><div className="content-section-heading"><div><span className="content-type">{type}</span><h3>{type === "Learning Path" ? "Units and sequences" : type === "Lesson" ? "Assignable lessons" : "Individual resources"}</h3></div><button type="button" onClick={() => changeType(type)}>Add {type.toLowerCase()}</button></div><div className="content-list">{items.length ? items.map((item) => <article className="content-item-card" key={item.id || item.title}><img className="content-thumb" src={item.image} alt="" /><div><span className="content-type">{item.status}</span><h4>{item.title}</h4><p>{item.summary || item.description}</p><small>{item.subject} - {item.stage}</small>{item.durationWeeks ? <small>{item.durationWeeks} weeks</small> : null}{item.durationMinutes ? <small>{item.durationMinutes} minutes</small> : null}{item.learningPathId ? <small>Path: {itemTitle(learningPaths, item.learningPathId)}</small> : null}{item.lessonId ? <small>Lesson: {itemTitle(lessonOptions, item.lessonId)}</small> : null}{item.lessonIds?.length ? <small>{item.lessonIds.length} lessons sequenced</small> : null}{item.resourceIds?.length ? <small>{item.resourceIds.length} resources attached</small> : null}{materialCount(item) ? <div className="material-tags"><span>{materialCount(item)} links/files</span></div> : null}<div className="content-card-actions"><span className="sync-chip">Firestore synced</span><button type="button" className="delete-button" onClick={() => confirmDelete(item)}>Delete</button></div></div></article>) : <article className="empty-content-card"><Icon type="plus" className="" /><h4>No {type.toLowerCase()}s yet</h4><p>Add one here, or create it as a standalone item first.</p></article>}</div></section>)}</div>
    </section>
  );
}

function DashboardEditor({ config, contentItems, updateConfig, reset, previewKey, publish, status, saveState }) {
  const saveText = saveState === "saving" ? "Publishing..." : "Publish changes";
  return <section className="staff-section staff-panel active"><div className="section-heading"><div><h2>Edit teacher dashboard</h2><p>Live-edit teacher-facing dashboard text, imagery and visibility flags before publishing.</p></div><div className="heading-actions"><button type="button" onClick={reset}>Reset preview</button><button type="button" onClick={publish} disabled={saveState === "saving"}>{saveText}</button></div></div><article className="dashboard-editor live-dashboard-editor"><div className="editor-copy"><span className="content-type">Teacher Dashboard Editor</span><h3>Update teacher-facing dashboard content</h3><p>Changes below update the preview immediately. Publishing writes the values to Firestore at dashboardConfig/main.</p><FirestoreStatus status={status} saveState={saveState} /></div><form className="editor-form"><label>Hero headline<input type="text" value={config.heroTitle} onChange={(event) => updateConfig({ heroTitle: event.target.value })} /></label><label>Hero subheading<input type="text" value={config.heroSubtitle} onChange={(event) => updateConfig({ heroSubtitle: event.target.value })} /></label><label>Hero image<select value={config.heroImageUrl} onChange={(event) => updateConfig({ heroImageUrl: event.target.value })}><option value={assets.heroKoala}>Koala with joey</option><option value={assets.giraffe}>Giraffe at Taronga</option><option value={assets.binturong}>Binturong encounter</option><option value={assets.gorilla}>Gorilla habitat</option></select></label><label>Featured resource title<select value={config.featuredResourceTitle} onChange={(event) => updateConfig({ featuredResourceTitle: event.target.value })}>{contentItems.map((item) => <option key={item.id || item.title}>{item.title}</option>)}</select></label></form><div className="flag-grid" aria-label="Teacher dashboard content flags"><label><input type="checkbox" checked={config.showContinueLearning} onChange={(event) => updateConfig({ showContinueLearning: event.target.checked })} /> Show Continue Learning</label><label><input type="checkbox" checked={config.showUpcomingPanel} onChange={(event) => updateConfig({ showUpcomingPanel: event.target.checked })} /> Show Upcoming panel</label><label><input type="checkbox" checked={config.showTrackaCard} onChange={(event) => updateConfig({ showTrackaCard: event.target.checked })} /> Feature Taronga Tracka card</label><label><input type="checkbox" /> Show beta student insights</label><label><input type="checkbox" defaultChecked /> Display new resource badges</label><label><input type="checkbox" /> Lock subject cards during review</label></div><div className="teacher-live-preview"><div className="preview-toolbar"><span>Live teacher dashboard preview</span><a href={routePath("teacher")} target="_blank" rel="noreferrer">Open full view</a></div><div className="preview-frame" key={previewKey}><TeacherDashboard config={config} contentItems={contentItems} /></div></div></article></section>;
}

function FirestoreStatus({ status, saveState }) {
  if (status === "live" && !saveState) return null;

  const messages = {
    loading: "Loading Firestore dashboard config...",
    missing: "Firestore connected. dashboardConfig/main has not been published yet.",
    error: "Firestore config could not load. Check Firestore is enabled and rules allow access.",
    saving: "Publishing dashboard config to Firestore...",
    saved: "Dashboard config published to Firestore.",
  };

  const statusKey = saveState && saveState !== "idle" ? saveState : status;
  return <p className={`firestore-status ${statusKey}`}>{messages[statusKey]}</p>;
}

function ContentFirestoreStatus({ status, saveState }) {
  if (status === "live" && !saveState) return null;

  const messages = {
    loading: "Loading Firestore content library...",
    missing: "Firestore contentItems is empty. Showing fallback content until you seed or add content.",
    error: "Firestore content could not load. Check rules allow access to contentItems.",
    saving: "Writing content to Firestore...",
    saved: "Content saved to Firestore.",
  };

  const statusKey = saveState && saveState !== "idle" ? saveState : status;
  return <p className={`firestore-status ${statusKey}`}>{messages[statusKey]}</p>;
}

function getRoutePath() {
  const hashPath = window.location.hash.replace(/^#\/?/, "");
  return hashPath || window.location.pathname.replace(basePath, "").replace(/^\//, "").replace(/\/$/, "");
}

function App() {
  const [path, setPath] = useState(getRoutePath);

  useEffect(() => {
    const syncRoute = () => setPath(getRoutePath());
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);
    return () => {
      window.removeEventListener("hashchange", syncRoute);
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);

  if (path === "/teacher" || path === "/teacher.html") return <TeacherPage />;
  if (path === "/staff" || path === "/staff.html") return <StaffPage />;
  if (path === "teacher" || path === "teacher.html") return <TeacherPage />;
  if (path === "staff" || path === "staff.html") return <StaffPage />;
  return <LandingPage />;
}

createRoot(document.getElementById("root")).render(<App />);
