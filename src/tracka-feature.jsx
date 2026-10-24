import React from "react";

// Taronga Tracka promotion, in Tracka's own look. Shown under every lesson and unit, and on
// the teacher dashboard. When a lesson has its own Tracka activity (set in Wildly Studio),
// that text replaces the general pitch.
const base = import.meta.env.BASE_URL;
export const TRACKA_URL = "https://tarongatracka.com.au";

export function hasTrackaActivity(item) {
  return Boolean(item?.materials?.trackaLink?.activity);
}

export function TrackaBadge({ item, className = "" }) {
  if (!hasTrackaActivity(item)) return null;
  return (
    <span className={`tk-badge ${className}`}>
      <img src={`${base}assets/tracka/tracka-logo.png`} alt="" />
      Taronga Tracka {item.type === "Learning Path" ? "program" : "lesson"}
    </span>
  );
}

export default function TrackaFeature({ Icon, eyebrow, title, text, url = TRACKA_URL, id = "tk-title" }) {
  return (
    <section className="tk-card" aria-labelledby={id}>
      <div className="tk-copy">
        <img className="tk-logo" src={`${base}assets/tracka/tracka-logo.png`} alt="Taronga Tracka" />
        {eyebrow ? <span className="tk-eyebrow">{eyebrow}</span> : null}
        <h2 id={id}>{title}</h2>
        <p className="tk-activity">{text}</p>
        <ul className="tk-points">
          <li><Icon type="pin" className="" />Track animals at Taronga</li>
          <li><Icon type="book" className="" />Record real observations</li>
          <li><Icon type="target" className="" />Earn badges together</li>
        </ul>
        <a className="tk-btn" href={url} target="_blank" rel="noreferrer">Let's track! <Icon type="arrowRight" className="" /></a>
      </div>
      <div className="tk-art" aria-hidden="true">
        <img className="tk-photo" src={`${base}assets/tracka/mode-zoo.jpg`} alt="" />
        <div className="tk-phone"><img src={`${base}assets/tracka/app-home.jpg`} alt="" /></div>
      </div>
    </section>
  );
}
