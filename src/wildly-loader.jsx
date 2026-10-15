import React from "react";
import "./wildly-loader.css";

const logo = `${import.meta.env.BASE_URL}assets/wildly-logo-transparent.png`;

// Full-screen brand loader: the Wildly logo bobbing with a gloss sweep and
// three dots. Lives in its own tiny module so main.jsx can show it while the
// public/teacher/staff chunks download, not just once they've loaded.
export default function LoadingScreen({ label = "Loading…" }) {
  const logoMask = { WebkitMaskImage: `url("${logo}")`, maskImage: `url("${logo}")` };
  return (
    <div className="wl-load" role="status" aria-live="polite">
      <div className="wl-load-inner">
        <div className="wl-logo-wrap">
          <img className="wl-load-logo" src={logo} alt="Wildly by Taronga" />
          <span className="wl-logo-shine" style={logoMask} aria-hidden="true" />
        </div>
        <div className="wl-dots" aria-hidden="true"><span /><span /><span /></div>
        <p className="wl-load-label">{label}</p>
      </div>
    </div>
  );
}
