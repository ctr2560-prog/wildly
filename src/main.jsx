import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
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

const subjects = [
  ["Science", "science", "Discover the living world and our place in it."],
  ["English", "english", "Communicate, create and explore ideas that matter."],
  ["Mathematics", "maths", "Make sense of patterns, numbers and the world around you."],
  ["HSIE", "hsie", "Understand people, places, histories and how we shape society."],
  ["PDHPE", "pdhpe", "Build wellbeing, strong relationships and healthy communities."],
  ["CAPA", "capa", "Imagine, express and connect through creativity."],
  ["Technology & STEM", "stem", "Design, innovate and solve real-world challenges."],
];

const resources = [
  { title: "Adaptations of Australian Animals", subject: "Science", stage: "Stage 2", progress: 65, image: assets.river, type: "Lesson sequence" },
  { title: "First Nations Cultures and Country", subject: "HSIE", stage: "Stage 3", progress: 40, image: assets.rhino, type: "Inquiry resource" },
  { title: "Design for a Sustainable Future", subject: "Technology & STEM", stage: "Stage 4", progress: 25, image: assets.binturong, type: "Design challenge" },
  { title: "Persuasive Texts for Wildlife Action", subject: "English", stage: "Stage 3", progress: 15, image: assets.koala, type: "Writing task" },
  { title: "Animal Movement and Data Patterns", subject: "Mathematics", stage: "Stage 3", progress: 55, image: assets.giraffe, type: "Data activity" },
  { title: "Wellbeing Through Nature Connection", subject: "PDHPE", stage: "Stage 2", progress: 80, image: assets.gorilla, type: "Reflection lesson" },
];

function Icon({ type, className = "nav-svg" }) {
  const icons = {
    grid: <><rect x="3" y="4" width="7" height="7" rx="1.5" /><rect x="14" y="4" width="7" height="7" rx="1.5" /><rect x="3" y="15" width="7" height="5" rx="1.5" /><rect x="14" y="15" width="7" height="5" rx="1.5" /></>,
    users: <><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3.5 19c.7-3.4 2.3-5 4.5-5s3.8 1.6 4.5 5" /><path d="M13.5 18.8c.5-2.5 1.8-3.8 3.7-3.8 1.6 0 2.8 1 3.3 3.8" /></>,
    cap: <><path d="M3 8.5 12 4l9 4.5-9 4.5L3 8.5Z" /><path d="M7 11v4.5c1.2 1.3 2.9 2 5 2s3.8-.7 5-2V11" /><path d="M20 9v5" /></>,
    report: <><path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h9L19 7.5V20H5Z" /><path d="M15 4v4h4" /><path d="M8 16v-3" /><path d="M12 16v-6" /><path d="M16 16v-4" /></>,
    bookmark: <path d="M7 4h10v16l-5-3-5 3V4Z" />,
    book: <><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5v-16Z" /><path d="M5 5.5A2.5 2.5 0 0 1 7.5 8H20" /><path d="M8 12h8" /><path d="M8 15h6" /></>,
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

function LandingPage() {
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
            <p className="alignment-note"><Icon type="book" className="alignment-icon" />Aligned to NSW and Australian curriculums (Stage 1-6), aligned to early learning framework</p>
          </div>
          <div className="device-stage" aria-label="Wildly teacher dashboard preview">
            <div className="laptop"><div className="laptop-screen"><iframe className="teacher-preview" src={routePath("teacher")} title="Wildly teacher dashboard preview" tabIndex="-1"></iframe></div><div className="laptop-base"></div></div>
            <div className="phone"><img src={assets.heroKoala} alt="" /><h3>Adaptations of Australian Animals</h3><p>Ready to assign</p><a href={routePath("teacher")}>View resource</a></div>
          </div>
        </section>
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
          <article><img src={assets.trackaLogo} alt="Taronga Tracka" /><span>Proudly connected with Taronga Tracka</span></article>
          <article><Icon type="book" className="" /><span>Aligned to NSW and Australian curriculums (Stage 1-6), aligned to early learning framework</span></article>
          <article><Icon type="bookmark" className="" /><span>Secure, reliable teacher resources</span></article>
        </section>
        <section className="cta-section"><img src={assets.heroKoala} alt="Koala with joey" /><div><h2>Bring learning to life through nature</h2><p>Join thousands of educators using Wildly to inspire the next generation to care for nature - together.</p><div className="hero-actions"><a className="primary-action" href={routePath("teacher")}>Get started free</a><a className="secondary-action" href={routePath("teacher")}>Book a demo</a></div></div></section>
        <footer className="site-footer"><a className="staff-login" href={routePath("staff")}>Taronga staff login</a></footer>
      </main>
    </>
  );
}

function TeacherDashboard({ config }) {
  const [activeSubject, setActiveSubject] = useState(null);
  const [query, setQuery] = useState("");
  const visibleResources = useMemo(() => resources.filter((resource) => {
    const matchesSubject = !activeSubject || resource.subject === activeSubject;
    const haystack = `${resource.title} ${resource.subject} ${resource.stage} ${resource.type}`.toLowerCase();
    return matchesSubject && haystack.includes(query.toLowerCase());
  }).slice(0, 3), [activeSubject, query]);

  const showContinue = config.showContinueLearning;
  const showUpcoming = config.showUpcomingPanel;
  const showTracka = config.showTrackaCard;

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Teacher navigation">
        <a className="brand" href={routePath()} aria-label="Wildly by Taronga dashboard"><img className="brand-logo" src={assets.wildlyLogo} alt="Wildly by Taronga - Learning through nature" /></a>
        <nav className="main-nav">
          {["Dashboard", "My Classes", "Students", "Reports", "Saved", "Calendar"].map((item, i) => <a className={`nav-item ${i === 0 ? "active" : ""}`} href="#" key={item}><Icon type={["grid", "users", "cap", "report", "bookmark", "calendar"][i]} />{item}</a>)}
        </nav>
        <section className="side-section" aria-labelledby="subjects-title"><h2 id="subjects-title">Subject Areas</h2>{subjects.map(([label, cls]) => <button className={`subject-link ${cls}`} data-filter={label} key={label} onClick={() => setActiveSubject(label)}><Icon type={subjectIconType(label)} className="subject-svg" />{label}</button>)}</section>
        <section className="side-section" aria-labelledby="explore-title"><h2 id="explore-title">Explore</h2><a className="nav-item small" href="#"><Icon type="path" />Learning Paths</a><a className="nav-item small" href="#"><Icon type="pin" />Excursions & Zoo Links</a><a className="nav-item small" href="#"><Icon type="target" />Tracka Missions<span className="external"></span></a></section>
        {showTracka && <article className="tracka-card"><img className="tracka-logo" src={assets.trackaLogo} alt="Taronga Tracka" /><div><strong>Connected to Taronga Tracka</strong><p>Extend learning beyond your visit with real data and citizen science.</p><button>Go to Tracka</button></div></article>}
      </aside>
      <main className="workspace">
        <header className="topbar"><button className="menu-button" aria-label="Open navigation"></button><nav className="top-links" aria-label="Primary"><a className="selected" href="#">Dashboard</a><a href="#">Subjects</a><a href="#">Learning Paths</a><a href="#">Resources</a><a href="#">My Classes</a></nav><div className="top-actions"><button className="top-icon-button" aria-label="Notifications"><Icon type="bell" className="" /></button><button className="icon-button help" aria-label="Help"></button><button className="profile-button"><span>JT</span><strong>Mr. Thompson</strong><small>Teacher</small></button></div></header>
        <section className="hero"><div className="hero-copy"><h1>{config.heroTitle}</h1><p className="hero-subtitle">{config.heroSubtitle}</p><p>Curriculum-aligned lessons, real-world experiences and conservation connections - for every learner, everywhere.</p><div className="hero-actions"><button className="primary-action">Browse Subjects</button><button className="secondary-action"><Icon type="path" className="path-action-icon" />Start a Learning Path</button></div></div><img className="hero-animal" src={config.heroImageUrl} alt="Koala with joey at Taronga" /></section>
        <section className="library-head"><div><h2>Explore by Subject</h2><p>Filter the teacher library by curriculum area, stage and resource type.</p></div><label className="search-box"><span></span><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search resources" /></label><button className="text-link" onClick={() => { setActiveSubject(null); setQuery(""); }}>View All Subjects</button></section>
        <section className="subject-grid" aria-label="Subject cards">{subjects.map(([label, cls, copy]) => <article className={`subject-card ${cls} ${activeSubject === label ? "selected" : ""}`} key={label} onClick={() => setActiveSubject(label)}><Icon type={subjectIconType(label)} className="subject-icon" /><h3>{label}</h3><p>{copy}</p><button>Explore</button></article>)}</section>
        <div className="dashboard-columns">
          <section className="content-column">
            {showContinue && <><div className="section-title-row"><h2>Continue Learning</h2><button className="text-link">View all</button></div><section className="learning-grid" aria-live="polite">{visibleResources.map((resource, index) => <article className="learning-card" key={resource.title}><img src={resource.image} alt="" /><div className="learning-body"><span className="pill">{resource.subject}</span><h3>{index === 0 ? config.featuredResourceTitle : resource.title}</h3><p>{resource.type} - {resource.stage}</p><div className="progress-row"><div className="progress-track"><span style={{ width: `${resource.progress}%` }}></span></div><small>{resource.progress}% Complete</small></div><button>Continue</button></div></article>)}</section></>}
            <div className="section-title-row news-title"><h2>What's New on Wildly</h2><button className="text-link">View all</button></div>
            <section className="news-grid"><article className="news-card blue"><img src={assets.rhino} alt="" /><div><span>New Resource</span><h3>Voices for Country</h3><p>First Nations perspectives for Stage 3 inquiry.</p></div></article><article className="news-card purple"><img src={assets.gorilla} alt="" /><div><span>Teacher Webinar</span><h3>Learning with Impact</h3><p>Plan lessons around conservation action.</p></div></article><article className="news-card green"><img src={assets.binturong} alt="" /><div><span>New Learning Path</span><h3>Sustainable Futures</h3><p>Build a full sequence across Science and HSIE.</p></div></article></section>
          </section>
          {showUpcoming && <aside className="upcoming-panel" aria-labelledby="upcoming-title"><div className="section-title-row"><h2 id="upcoming-title">Upcoming</h2><button className="text-link">View Calendar</button></div><article className="event-card"><img src={assets.giraffe} alt="" /><div><span className="event-tag">Excursion</span><h3>Taronga Zoo Visit - Biodiversity in Action</h3><p>Tue 8 Jun - 9:30am</p></div></article><article className="event-card icon-event"><span className="target-icon"></span><div><span className="event-tag live">Live</span><h3>Tracka Mission - Citizen Science Challenge</h3><p>Fri 21 Jun - 11:00am</p></div></article><article className="event-card icon-event"><span className="leaf-badge"></span><div><span className="event-tag due">Due</span><h3>Creative Writing: Inspired by Nature</h3><p>Mon 24 Jun - 11:59pm</p></div></article><article className="difference-card"><span className="mini-mark" aria-hidden="true"></span><div><h3>Learning that makes a difference</h3><p>Inspiring the next generation to care for nature - together.</p></div></article></aside>}
        </div>
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
  return (
    <>
      <FirestoreStatus status={status} />
      <TeacherDashboard config={config} />
    </>
  );
}

function StaffConsole() {
  const [panel, setPanel] = useState("overview");
  const { config: savedConfig, status } = useDashboardConfig();
  const [config, setConfig] = useState(defaultDashboardConfig);
  const [previewKey, setPreviewKey] = useState(0);
  const [saveState, setSaveState] = useState("idle");

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
        <article className="tracka-mini"><img src={assets.trackaLogo} alt="Taronga Tracka" /><p>Tracka data connector ready for staff review.</p></article>
      </aside>
      <main className="staff-workspace">
        <header className="staff-topbar"><div><span>Taronga Staff Console</span><h1>Wildly learning operations</h1></div><div className="staff-actions"><a href={routePath("teacher")}>Teacher view</a><button>Publish updates</button></div></header>
        {panel === "overview" && <section className="staff-panel active"><div className="overview-grid">{[["Active users", "4,286", "Teachers, students and Taronga staff this term"], ["Assigned resources", "18,940", "Lessons, learning paths and missions launched"], ["Tracka-linked sessions", "72%", "Activities connected to excursion or citizen science data"], ["Curriculum coverage", "146", "Mapped outcomes across NSW and Australian Curriculum"]].map(([label, value, copy]) => <article key={label}><span>{label}</span><strong>{value}</strong><p>{copy}</p></article>)}</div><div className="overview-snapshot"><article><h2>Current priorities</h2><p>Science and HSIE pathways are seeing the strongest uptake this month, with data interpretation flagged as the highest-value support area.</p></article><article><h2>Next recommended action</h2><p>Review Stage 3 animal adaptations lessons and prepare a Tracka mission bundle for upcoming school visits.</p></article></div></section>}
        {panel === "users" && <UsersPanel />}
        {panel === "analytics" && <AnalyticsPanel />}
        {panel === "content" && <ContentPanel />}
        {panel === "dashboard" && <DashboardEditor config={config} updateConfig={updateConfig} reset={() => { setConfig(defaultDashboardConfig); setPreviewKey((key) => key + 1); }} previewKey={previewKey} publish={publishDashboardConfig} status={status} saveState={saveState} />}
      </main>
    </div>
  );
}

function UsersPanel() {
  return <section className="staff-section staff-panel active"><div className="section-heading"><div><h2>Users</h2><p>Analyse all teachers, students, schools and Taronga staff involved in Wildly.</p></div><button>Add user</button></div><div className="user-layout"><article className="user-breakdown"><h3>User mix</h3><div className="donut" aria-label="User mix chart"></div><ul>{[["teacher", "Teachers", "682"], ["student", "Students", "3,421"], ["staff", "Taronga staff", "74"], ["school", "School admins", "109"]].map(([cls, label, value]) => <li key={label}><span className={cls}></span>{label}<strong>{value}</strong></li>)}</ul></article><article className="user-table-card"><div className="table-toolbar"><label><Icon type="target" className="" /><input type="search" placeholder="Search users, schools or roles" /></label><select aria-label="Filter users"><option>All roles</option><option>Teachers</option><option>Students</option><option>Taronga staff</option></select></div><table><thead><tr><th>User</th><th>Role</th><th>Organisation</th><th>Status</th><th>Last active</th></tr></thead><tbody>{[["James Thompson", "Teacher", "Riverbank Public School", "Active", "Today"], ["Ava Wilson", "Student", "Riverbank Public School", "Active", "Today"], ["Maya Chen", "Taronga staff", "Taronga Education", "Review", "Yesterday"], ["Samir Patel", "School admin", "Western Sydney Learning Hub", "Active", "2 days ago"]].map(([name, role, org, status, active]) => <tr key={name}><td>{name}</td><td>{role}</td><td>{org}</td><td><span className={`status ${status === "Active" ? "active" : "review"}`}>{status}</span></td><td>{active}</td></tr>)}</tbody></table></article></div></section>;
}

function AnalyticsPanel() {
  return <section className="staff-section staff-panel active"><div className="section-heading"><div><h2>Analytics</h2><p>View engagement, learning progress, curriculum gaps and Tracka-connected outcomes.</p></div><button>Export report</button></div><div className="analytics-grid"><article className="wide-card"><h3>Learning engagement by week</h3><div className="bar-chart">{[42, 58, 51, 76, 68, 88, 81].map((height) => <span style={{ height: `${height}%` }} key={height}></span>)}</div></article><article><h3>Knowledge gaps</h3>{[["Adaptation vs behaviour", 64], ["Data interpretation", 48], ["Persuasive writing", 37]].map(([label, width]) => <React.Fragment key={label}><p className="metric">{label}</p><div className="meter"><span style={{ width: `${width}%` }}></span></div></React.Fragment>)}</article><article><h3>Results snapshot</h3><ul className="result-list"><li>Below expected <strong>18%</strong></li><li>At expected <strong>57%</strong></li><li>Above expected <strong>25%</strong></li></ul></article></div></section>;
}

function ContentPanel() {
  return <section className="staff-section staff-panel active"><div className="section-heading"><div><h2>Content</h2><p>Add, review and publish learning paths, lessons and resource-library items.</p></div><button type="button">Add content</button></div><div className="content-grid">{[["Learning Path", "Sustainable Futures", "8 lessons across Science, HSIE and Technology & STEM.", "Edit path"], ["Lesson", "Adaptations of Australian Animals", "Stage 2 science lesson with teacher guide and student prompts.", "Edit lesson"], ["Resource", "Koala Encounter Media Pack", "Images, video prompts and vocabulary support for early years.", "Edit resource"]].map(([type, title, copy, action]) => <article key={title}><span className="content-type">{type}</span><h3>{title}</h3><p>{copy}</p><button>{action}</button></article>)}<article className="create-card"><Icon type="plus" className="" /><h3>Create new content</h3><p>Start a learning path, lesson, media activity or Tracka mission.</p></article></div></section>;
}

function DashboardEditor({ config, updateConfig, reset, previewKey, publish, status, saveState }) {
  const saveText = saveState === "saving" ? "Publishing..." : "Publish changes";
  return <section className="staff-section staff-panel active"><div className="section-heading"><div><h2>Edit teacher dashboard</h2><p>Live-edit teacher-facing dashboard text, imagery and visibility flags before publishing.</p></div><div className="heading-actions"><button type="button" onClick={reset}>Reset preview</button><button type="button" onClick={publish} disabled={saveState === "saving"}>{saveText}</button></div></div><article className="dashboard-editor live-dashboard-editor"><div className="editor-copy"><span className="content-type">Teacher Dashboard Editor</span><h3>Update teacher-facing dashboard content</h3><p>Changes below update the preview immediately. Publishing writes the values to Firestore at dashboardConfig/main.</p><FirestoreStatus status={status} saveState={saveState} /></div><form className="editor-form"><label>Hero headline<input type="text" value={config.heroTitle} onChange={(event) => updateConfig({ heroTitle: event.target.value })} /></label><label>Hero subheading<input type="text" value={config.heroSubtitle} onChange={(event) => updateConfig({ heroSubtitle: event.target.value })} /></label><label>Hero image<select value={config.heroImageUrl} onChange={(event) => updateConfig({ heroImageUrl: event.target.value })}><option value={assets.heroKoala}>Koala with joey</option><option value={assets.giraffe}>Giraffe at Taronga</option><option value={assets.binturong}>Binturong encounter</option><option value={assets.gorilla}>Gorilla habitat</option></select></label><label>Featured resource title<select value={config.featuredResourceTitle} onChange={(event) => updateConfig({ featuredResourceTitle: event.target.value })}><option>Sustainable Futures</option><option>Adaptations of Australian Animals</option><option>Voices for Country</option></select></label></form><div className="flag-grid" aria-label="Teacher dashboard content flags"><label><input type="checkbox" checked={config.showContinueLearning} onChange={(event) => updateConfig({ showContinueLearning: event.target.checked })} /> Show Continue Learning</label><label><input type="checkbox" checked={config.showUpcomingPanel} onChange={(event) => updateConfig({ showUpcomingPanel: event.target.checked })} /> Show Upcoming panel</label><label><input type="checkbox" checked={config.showTrackaCard} onChange={(event) => updateConfig({ showTrackaCard: event.target.checked })} /> Feature Taronga Tracka card</label><label><input type="checkbox" /> Show beta student insights</label><label><input type="checkbox" defaultChecked /> Display new resource badges</label><label><input type="checkbox" /> Lock subject cards during review</label></div><div className="teacher-live-preview"><div className="preview-toolbar"><span>Live teacher dashboard preview</span><a href={routePath("teacher")} target="_blank" rel="noreferrer">Open full view</a></div><div className="preview-frame" key={previewKey}><TeacherDashboard config={config} /></div></div></article></section>;
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
  if (path === "/staff" || path === "/staff.html") return <StaffConsole />;
  if (path === "teacher" || path === "teacher.html") return <TeacherPage />;
  if (path === "staff" || path === "staff.html") return <StaffConsole />;
  return <LandingPage />;
}

createRoot(document.getElementById("root")).render(<App />);
