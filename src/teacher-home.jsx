import React from "react";
import "./teacher-home.css";

function ResourceRow({ item, href, Icon }) {
  return (
    <a className="desk-resource" href={href}>
      <img src={item.image} alt="" width="160" height="120" loading="lazy" />
      <div>
        <span className="desk-meta">{item.subject}{item.stage ? ` · ${item.stage}` : ""}</span>
        <h3>{item.title}</h3>
        <span className="desk-resource-type">{item.type}{item.durationMinutes ? ` · ${item.durationMinutes} min` : ""}</span>
      </div>
      <Icon type="arrowRight" />
    </a>
  );
}

export default function TeacherHome({ profile, preview, query, onQueryChange, results, renderCard, recentItems, newestItems, subjects, subjectSlug, route, contentRoute, savedCount, classCount, upcomingEvents, formatDate, Icon, assets, banner }) {
  const resources = recentItems.length ? recentItems : newestItems;
  const firstName = profile?.name?.trim().split(/\s+/)[0];

  return (
    <div className="teacher-desk">
      <div className="desk-heading">
        <div>
          <h1>{firstName && !preview ? `Welcome back, ${firstName}.` : "Your teaching space"}</h1>
          <p>Find teaching resources and organise your next lesson.</p>
        </div>
        <div className="desk-personal-links" aria-label="Your saved work">
          <a href={route("classes")}><strong>{classCount}</strong> {classCount === 1 ? "class" : "classes"}<Icon type="arrowRight" /></a>
          <a href={route("saved")}><strong>{savedCount}</strong> saved<Icon type="arrowRight" /></a>
        </div>
      </div>
      {preview && (
        <div className="desk-preview-note">
          <span>Preview</span> Sample resources and classes.
          <a href={`${import.meta.env.BASE_URL}#get-started`}>Create an account<Icon type="arrowRight" /></a>
        </div>
      )}
      <div className="desk-discovery">
        {banner && <div className="desk-banner" aria-label="From Taronga">{banner}</div>}
        <section className="desk-search-panel" aria-labelledby="desk-search-title">
        <div>
          <h2 id="desk-search-title">What are you teaching today?</h2>
          <p>Search by topic, subject or stage.</p>
        </div>
        <div className="desk-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
          <input type="search" name="resource-search" value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Try habitats or Stage 2…" aria-label="Search teaching resources" autoComplete="off" />
          {query && <button type="button" onClick={() => onQueryChange("")} aria-label="Clear search">×</button>}
        </div>
        <div className="desk-search-footer">
          <span>Lessons, resources & learning paths</span>
          <a href={route("resources")}>Browse the library<Icon type="arrowRight" /></a>
        </div>
        </section>
      </div>
      {query.trim() ? (
        <section className="desk-results" aria-label="Search results">
          <div className="desk-section-heading"><h2>Search results</h2><p role="status">{results.length} {results.length === 1 ? "resource" : "resources"} found</p></div>
          {results.length ? <div className="lib-grid">{results.map(renderCard)}</div> : (
            <div className="desk-empty"><Icon type="book" /><h3>No matching resources</h3><p>Try a different topic, subject or stage.</p><button type="button" onClick={() => onQueryChange("")}>Clear search</button></div>
          )}
        </section>
      ) : (
        <>
          <div className="desk-layout">
            <div className="desk-main">
              <section className="desk-resources" aria-labelledby="desk-resources-title">
                <div className="desk-section-heading">
                  <h2 id="desk-resources-title">{recentItems.length ? "Recently opened" : "From the library"}</h2>
                  <a href={route("resources")}>View all<Icon type="arrowRight" /></a>
                </div>
                {resources.length ? (
                  <div className="desk-resource-list">{resources.map(item => <ResourceRow key={item.id} item={item} href={contentRoute(item.id)} Icon={Icon} />)}</div>
                ) : (
                  <div className="desk-start"><Icon type="book" /><div><h3>Find a resource for your class</h3><p>Browse the subjects below or search by topic and stage.</p></div></div>
                )}
              </section>
              <section className="desk-subjects" aria-labelledby="desk-subjects-title">
                <div className="desk-section-heading"><h2 id="desk-subjects-title">Browse by subject</h2></div>
                <div className="desk-subject-grid">
                  {subjects.map(([label]) => (
                    <a className="desk-subject" key={label} href={route(`subjects/${subjectSlug(label)}`)}><span>{label}</span><Icon type="arrowRight" /></a>
                  ))}
                </div>
              </section>
            </div>
            <aside className="desk-aside" aria-label="Events and excursions">
              <section className="desk-calendar">
                <div className="desk-section-heading"><h2>Upcoming events</h2><a href={route("calendar")} aria-label="Open your calendar"><Icon type="calendar" /></a></div>
                {upcomingEvents.length ? upcomingEvents.slice(0, 2).map(event => (
                  <a className="desk-event" key={event.id || `${event.title}-${event.date}`} href={route("calendar")}><span>{formatDate(event.date)}</span><strong>{event.title}</strong></a>
                )) : <><p>No events scheduled.</p><a href={route("professional-learning")}>View professional learning<Icon type="arrowRight" /></a></>}
              </section>
              <a className="desk-tracka" href={`${import.meta.env.BASE_URL}#tracka`}>
                <img src={`${import.meta.env.BASE_URL}assets/taronga-outdoor-learning.jpg`} alt="Students at Taronga Zoo" width="600" height="400" loading="lazy" />
                <div><h2>Taking your class to Taronga?</h2><p>Explore animal observation activities in Taronga Tracka.</p><span>View Taronga Tracka<Icon type="arrowRight" /></span></div>
              </a>
            </aside>
          </div>
          <section className="desk-more" aria-label="More from Taronga">
            <a href={route("taronga-tv")}><img src={assets.gorilla} alt="" width="320" height="240" loading="lazy" /><div><h2>Taronga TV</h2><p>Wildlife videos and discussion prompts for your class.</p><span>Browse videos<Icon type="arrowRight" /></span></div></a>
            <a href={route("professional-learning")}><img src={assets.teacherPl} alt="" width="320" height="240" loading="lazy" /><div><h2>Professional learning</h2><p>Sessions and resources for your teaching practice.</p><span>View sessions<Icon type="arrowRight" /></span></div></a>
          </section>
        </>
      )}
    </div>
  );
}
