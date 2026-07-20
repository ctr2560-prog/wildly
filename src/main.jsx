import React, { Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./bootstrap.css";

const PublicApp = lazy(() => import("./public-app.jsx"));
const AuthenticatedApp = lazy(() => import("./authenticated-app.jsx"));
const basePath = import.meta.env.BASE_URL;

function getRoutePath() {
  const hashPath = window.location.hash.replace(/^#\/?/, "");
  return hashPath || window.location.pathname.replace(basePath, "").replace(/^\//, "").replace(/\/$/, "");
}

function isAuthenticatedRoute(path) {
  return ["login", "get-started", "about-you", "staff", "staff.html", "teacher", "teacher.html", "student", "demo-booking", "support", "excursions", "professional-learning"]
    .some((route) => path === route || path.startsWith(`${route}/`));
}

function AppLoader() {
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  const RouteApp = isAuthenticatedRoute(path) ? AuthenticatedApp : PublicApp;
  return (
    <Suspense fallback={<div className="app-route-loader" role="status"><span>Loading Wildly</span></div>}>
      <RouteApp />
    </Suspense>
  );
}

createRoot(document.getElementById("root")).render(<AppLoader />);
