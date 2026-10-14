import React, { useEffect, useId, useRef, useState } from "react";

// Each field keeps its own label association, including repeated quiz rows.
export function StaffField({ children, ...props }) {
  const generatedId = useId();
  const elements = React.Children.toArray(children);
  const control = elements.find(child => React.isValidElement(child) && ["input", "select", "textarea"].includes(child.type));
  const id = control?.props.id || generatedId;
  return <div {...props}>{elements.map(child => {
    if (!React.isValidElement(child)) return child;
    if (child.type === "label") return React.cloneElement(child, { htmlFor: id });
    if (child === control) return React.cloneElement(child, { id });
    return child;
  })}</div>;
}

const groups = [
  ["Workspace", [["overview", "grid", "Overview"], ["analytics", "report", "Analytics"]]],
  ["Publishing", [["content", "book", "Content studio"], ["taronga-tv", "play", "Taronga TV"], ["professional-learning", "path", "Professional learning"], ["upcoming-events", "calendar", "Upcoming events"], ["banner", "speech", "Banners"]]],
  ["Administration", [["users", "users", "Users"], ["control-room", "target", "Control room"]]],
];

// Native dialogs provide focus containment and make the background inert.
export function StaffDialog({ children, onClose, label = "Content editor", className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    const heading = dialog.querySelector(".sc-detail-header h3");
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);
  function containFocus(event) {
    if (event.key !== "Tab") return;
    const dialog = ref.current;
    const controls = [...dialog.querySelectorAll("button, a[href], input, select, textarea, [tabindex]")].filter((element) => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length && getComputedStyle(element).visibility !== "hidden");
    const first = controls[0], last = controls.at(-1);
    if (!first) { event.preventDefault(); dialog.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement))) { event.preventDefault(); first.focus(); }
  }
  return <dialog ref={ref} tabIndex={-1} onKeyDown={containFocus} className={`cc-modal-backdrop staff-native-dialog ${className}`} aria-label={label}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>{children}</dialog>;
}

export default function StaffWorkspace({ panel, onNavigate, email, onTeacherView, onSignOut, Icon, children, preview = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headingRef = useRef(null);
  const title = groups.flatMap(([, items]) => items).find(([id]) => id === panel)?.[2] || "Overview";
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (media.matches) setMenuOpen(false); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);
  function navigate(id) {
    onNavigate(id);
    setMenuOpen(false);
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  const navigation = <>
    <a className="staff-logo" href={`${import.meta.env.BASE_URL}#`} aria-label="Wildly home"><img src={`${import.meta.env.BASE_URL}assets/wildly-logo-transparent.png`} alt="Wildly by Taronga" /></a>
    <span className="staff-workspace-label">Education workspace</span>
    <nav className="staff-nav" aria-label="Staff navigation">
      {groups.map(([label, items]) => <div className="staff-nav-group" key={label}>
        <p>{label}</p>
        {items.map(([id, icon, name]) => <button type="button" key={id} data-panel={id} aria-current={id === panel ? "page" : undefined} className={id === panel ? "active" : ""} onClick={() => navigate(id)}><Icon type={icon} className="" />{name}</button>)}
      </div>)}
    </nav>
    <div className="staff-account"><span className="staff-user-avatar" aria-hidden="true">{(email || "S").charAt(0).toUpperCase()}</span><div><strong>{preview ? "Design preview" : "Staff account"}</strong><span title={email}>{email}</span></div></div>
    <button type="button" className="staff-signout" onClick={onSignOut}>{preview ? "Go to staff sign-in" : "Sign out"}<span aria-hidden="true">↗</span></button>
  </>;
  return <div className="staff-shell staff-studio">
    <a className="staff-skip" href="#staff-main" onClick={(event) => { event.preventDefault(); document.getElementById("staff-main")?.focus(); }}>Skip to workspace</a>
    <aside className="staff-sidebar">{navigation}</aside>
    {menuOpen && <StaffDialog label="Staff navigation" className="staff-mobile-dialog" onClose={() => setMenuOpen(false)}><aside className="staff-mobile-rail"><button type="button" className="staff-menu-close" onClick={() => setMenuOpen(false)}>Close menu ×</button>{navigation}</aside></StaffDialog>}
    <main className="staff-workspace" id="staff-main" tabIndex={-1}>
      <header className="staff-topbar">
        <div className="staff-topbar-titles"><span>Wildly / Staff workspace</span><h1 ref={headingRef} tabIndex={-1}>{title}</h1></div>
        <div className="staff-actions"><button className="staff-menu-button" type="button" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>Menu</button><button type="button" className="staff-btn staff-btn-ghost" onClick={onTeacherView}>Teacher view <span aria-hidden="true">↗</span></button></div>
      </header>
      {preview && <p className="staff-preview-notice" role="status">Design preview · Sample content only. Changes are not saved.</p>}
      <div className="staff-page-content" key={panel}>{children}</div>
      <footer className="staff-workspace-footer"><span>Wildly by Taronga</span><span>Staff workspace</span></footer>
    </main>
  </div>;
}

export function StaffOverview({ contentItems, tvVideos, plItems, upcomingEvents = [], users = [], tracka = {}, onNavigate, Icon, libraryState = "ready", accountsAvailable = true }) {
  const allItems = [...contentItems.map((item) => ({ ...item, panel: "content" })), ...tvVideos.map((item) => ({ ...item, type: "Taronga TV", panel: "taronga-tv" })), ...plItems.map((item) => ({ ...item, type: "Professional learning", panel: "professional-learning" }))];
  const count = (status) => libraryState === "ready" ? allItems.filter((item) => (item.status || "Draft") === status).length : "—";
  const queue = allItems.filter((item) => item.status !== "Published").sort((a, b) => Number(b.status === "Review") - Number(a.status === "Review")).slice(0, 5);
  const categories = [["Learning paths", contentItems.filter((item) => item.type === "Learning Path").length, "content"], ["Lessons & resources", contentItems.filter((item) => item.type !== "Learning Path").length, "content"], ["Taronga TV", tvVideos.length, "taronga-tv"], ["Professional learning", plItems.length, "professional-learning"]];
  const maximum = Math.max(...categories.map(([, value]) => value), 1);
  const fmt = (value) => tracka.loading ? "…" : value == null ? "—" : value.toLocaleString();
  return <section className="staff-overview" aria-label="Publishing overview">
    {libraryState !== "ready" && <p className="staff-data-notice" role="status">{libraryState === "loading" ? "Loading your publishing libraries…" : "Some library data is unavailable. Totals are withheld; only loaded content is shown. Open a library to check its connection or access status."}</p>}
    <div className="staff-overview-intro"><div><h2>Publishing overview</h2><p>Review drafts, manage resources and check your library.</p></div><button type="button" className="cc-new" onClick={() => onNavigate("content")}>Open content studio <Icon type="arrowRight" className="" /></button></div>
    <div className="staff-publication-strip" aria-label="Library status">
      {[["Published", count("Published"), "Available to teachers"], ["In review", count("Review"), "Awaiting review"], ["Drafts", count("Draft"), "Work in progress"], ["Accounts", accountsAvailable ? users.length : "—", accountsAvailable ? "Registered users" : "Account totals unavailable"]].map(([label, value, hint]) => <div key={label}><span>{label}</span><strong>{value.toLocaleString()}</strong><small>{hint}</small></div>)}
    </div>
    <div className="staff-overview-columns">
      <div className="staff-overview-primary">
        <section className="staff-desk-section"><header><div><h3>Drafts and reviews</h3></div><span className="staff-count">{libraryState === "ready" ? `${allItems.filter((item) => item.status !== "Published").length} unpublished` : "Partial library"}</span></header>
          {queue.length ? <ul className="staff-editorial-list">{queue.map((item) => <li key={`${item.panel}-${item.id}`}><span className={`staff-editorial-mark ${item.status === "Review" ? "is-review" : ""}`} aria-hidden="true"><Icon type={item.panel === "taronga-tv" ? "play" : "book"} className="" /></span><div><button type="button" onClick={() => onNavigate(item.panel)} aria-label={`${item.title || "Untitled"} — open ${item.panel === "content" ? "content studio" : item.type}`}>{item.title || "Untitled"}</button><p>{item.type}{item.subject ? ` · ${item.subject}` : ""}</p></div><span className={`staff-status ${item.status === "Review" ? "is-review" : ""}`}>{item.status || "Draft"}</span><span className="staff-row-arrow" aria-hidden="true">↗</span></li>)}</ul> : <div className="staff-desk-empty"><h4>{libraryState === "ready" ? "No unpublished resources" : libraryState === "loading" ? "Loading your work…" : "Your work could not be loaded."}</h4><p>{libraryState === "ready" ? "No drafts or items in review. Open the content studio to start your next resource." : "Open the content studio to check the library connection and your account access."}</p></div>}
          {queue.length > 0 && <p className="staff-section-note">Showing up to five unpublished items. Open a library to continue editing.</p>}
        </section>
        <section className="staff-desk-section"><header><div><h3>Content by type</h3></div><span className="staff-count">{libraryState === "ready" ? `${allItems.length} items` : "Loaded items only"}</span></header><div className="staff-library-mix">{categories.map(([label, value, panel]) => <button type="button" key={label} onClick={() => onNavigate(panel)}><span>{label}</span><span className="staff-mix-bar"><i style={{ width: `${libraryState === "ready" ? value / maximum * 100 : 0}%` }} /></span><strong>{libraryState === "ready" ? value : "—"}</strong><span aria-hidden="true">↗</span></button>)}</div></section>
      </div>
      <aside className="staff-overview-secondary"><section className="staff-tools"><h3>Manage publishing</h3>{[["taronga-tv", "play", "Taronga TV", "Videos, stories and discussion prompts"], ["professional-learning", "book", "Professional learning", "Sessions, registrations and materials"], ["upcoming-events", "calendar", "Upcoming events", `${upcomingEvents.length} event${upcomingEvents.length === 1 ? "" : "s"} in the calendar`], ["banner", "speech", "Teacher announcements", "What's new on the dashboard"]].map(([panel, icon, title, copy]) => <button type="button" key={panel} onClick={() => onNavigate(panel)}><Icon type={icon} className="" /><span><strong>{title}</strong><small>{copy}</small></span><span aria-hidden="true">↗</span></button>)}</section>
        <section className="staff-field-note"><h3>Taronga Tracka</h3><p>School and class totals from the shared education platform.</p><dl><div><dt>Schools</dt><dd>{fmt(tracka.schools)}</dd></div><div><dt>Classes</dt><dd>{fmt(tracka.classes)}</dd></div><div><dt>Student records</dt><dd>{fmt(tracka.students)}</dd></div></dl><small>{tracka.loading ? "Loading Tracka totals…" : tracka.schools == null ? "Tracka totals unavailable." : "Current totals from Taronga Tracka."}</small></section>
      </aside>
    </div>
  </section>;
}
