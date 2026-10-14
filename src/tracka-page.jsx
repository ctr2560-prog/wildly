import React, { useState } from "react";
import "./tracka-page.css";

const asset = (name) => `${import.meta.env.BASE_URL}assets/tracka/${name}`;
const studentViews = [
  { id: "gorilla", label: "Gorilla", title: "What can you describe without guessing?", description: "Describe the position of the gorilla’s head and eyes. Which details can you point to in the photograph? What would you need to watch longer to find out?", detail: "An observation prompt to try", image: "gorilla.jpg", width: 2880, height: 1400, alt: "A close view of a gorilla’s face, looking to one side" },
  { id: "giraffe", label: "Giraffe", title: "Where would you look for evidence?", description: "Look at the giraffe’s body and surroundings. What do you notice about its shape? Choose one feature and explain how you could investigate what it helps the animal do.", detail: "An observation prompt to try", image: "giraffe.jpg", width: 1200, height: 630, alt: "Giraffe at Taronga" },
  { id: "tiger", label: "Sumatran tiger", title: "What did you see, and what did you infer?", description: "Describe the tiger’s position, ears and eyes. Separate what you can see in the photograph from what you think the animal might be doing.", detail: "An observation prompt to try", image: "tiger.jpg", width: 1200, height: 630, alt: "Sumatran tiger looking through foliage" },
];
const teacherViews = [
  { id: "writing", label: "Student writing", image: "portal-slide-1.jpg", width: 1600, height: 801, description: "Review writing, observation detail and areas to discuss with your class." },
  { id: "observations", label: "Observations", image: "portal-slide-2.jpg", width: 1600, height: 787, description: "Read individual observations and revisit the evidence students recorded." },
  { id: "documentaries", label: "Documentaries", image: "portal-slide-4.jpg", width: 1600, height: 866, description: "View the wildlife documentaries created by your ZooSnooz group." },
];
const studentScreenshots = [
  { title: "Recording an observation", image: "mission-2.jpg", width: 520, height: 291, alt: "Tracka’s observation form, with a koala prompt, writing area and suggestions for what to notice", description: "Prompts help students describe what they see and record the details." },
  { title: "Collecting animal badges", image: "app-collection.jpg", width: 1400, height: 761, alt: "Tracka’s badge collection showing animal badges and points", description: "Students can revisit their animal badges and the points they’ve earned." },
];
const visitSteps = [
  ["Before your visit", "Set up your class", "Create a class in Tracka’s teacher portal and share the join code with your students."],
  ["At Taronga", "Observe and record", "Use the zoo map to find animal zones. Students complete missions, record observations and collect badges."],
  ["Back at school", "Discuss what you found", "Review student work in Tracka, then browse Wildly for resources that relate to your class’s questions."],
];

export default function TrackaPage({ SiteHeader, SiteFooter, AccessibleTabs, tabDomId, Icon, appLinks, routePath }) {
  const [studentView, setStudentView] = useState("gorilla");
  const [teacherView, setTeacherView] = useState("writing");
  const activity = studentViews.find(view => view.id === studentView);
  const portal = teacherViews.find(view => view.id === teacherView);

  function jumpTo(id) {
    const section = document.getElementById(id);
    section?.focus({ preventScroll: true });
    section?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }

  return (
    <>
      <SiteHeader active="tracka" />
      <main className="tracka-field-page" id="main-content" tabIndex={-1}>
        <section className="tf-hero" aria-labelledby="tf-title">
          <figure className="tf-hero-photo">
            <img src={asset("student-tiger-encounter.jpeg")} alt="A student using Taronga Tracka on a tablet beside a tiger viewing window" width="3024" height="4032" fetchPriority="high" />
            <figcaption>Learning with Tracka at Taronga</figcaption>
          </figure>
          <div className="tf-hero-copy">
            <div className="tf-product-name">Taronga Tracka</div>
            <h1 id="tf-title">A closer look<br />at the wild.</h1>
            <p>Animal missions for your next school visit.</p>
            <a className="tf-button" href={appLinks.tracka} target="_blank" rel="noopener noreferrer">Open Taronga Tracka <span aria-hidden="true">↗</span><span className="tf-sr-only"> (opens in a new tab)</span></a>
          </div>
        </section>

        <div className="tf-introduction">
          <div className="tf-introduction-copy">
            <p>Give your class a reason to stop, look and ask questions. Tracka helps students record what they notice at the zoo, ready to explore together back at school.</p>
            <p className="tf-account-note">Already use Wildly? Sign in to Tracka with the same account.</p>
          </div>
          <nav className="tf-section-nav" aria-label="On this page">
            <button type="button" onClick={() => jumpTo("tf-students")}>For students <span aria-hidden="true">↓</span></button>
            <button type="button" onClick={() => jumpTo("tf-teachers")}>For teachers <span aria-hidden="true">↓</span></button>
            <button type="button" onClick={() => jumpTo("tf-visit")}>Plan your visit <span aria-hidden="true">↓</span></button>
          </nav>
        </div>

        <section className="tf-section tf-students" id="tf-students" tabIndex={-1} aria-labelledby="tf-students-title">
          <header className="tf-section-heading">
            <div><span className="tf-eyebrow">For students</span><h2 id="tf-students-title">Start with<br />an observation.</h2></div>
            <p>Tracka combines animal missions, activities and badges. These example prompts show how a close look at wildlife can become a question to investigate.</p>
          </header>
          <AccessibleTabs id="tf-student" items={studentViews} activeId={studentView} onChange={setStudentView} ariaLabel="Choose an animal observation prompt" className="tf-tabs" renderItem={view => view.label} />
          <div className="tf-student-panel" id="tf-student-panel" role="tabpanel" aria-labelledby={tabDomId("tf-student", studentView)} tabIndex={0}>
            <figure className={`tf-activity-image tf-activity-${activity.id}`}>
              <img key={activity.image} src={asset(activity.image)} alt={activity.alt} width={activity.width} height={activity.height} loading="lazy" />
            </figure>
            <div className="tf-activity-copy">
              <span className="tf-eyebrow">{activity.detail}</span>
              <h3>{activity.title}</h3>
              <p>{activity.description}</p>
              <a className="tf-text-link" href={asset(activity.image)} target="_blank" rel="noopener noreferrer">Open the photograph <span aria-hidden="true">↗</span><span className="tf-sr-only"> (opens in a new tab)</span></a>
              <small>Illustrative teaching prompt. This is not a live Tracka mission and no responses are saved.</small>
            </div>
          </div>
          <div className="tf-app-gallery" aria-labelledby="tf-app-gallery-title">
            <h3 id="tf-app-gallery-title">Inside the student app</h3>
            <div className="tf-app-screenshots">
              {studentScreenshots.map(screen => <figure key={screen.image}>
                <a className="tf-screenshot-link" href={asset(screen.image)} target="_blank" rel="noopener noreferrer" aria-label={`View full screenshot: ${screen.title} (opens in a new tab)`}>
                  <img src={asset(screen.image)} alt={screen.alt} width={screen.width} height={screen.height} loading="lazy" />
                </a>
                <figcaption>
                  <h4>{screen.title}</h4>
                  <p>{screen.description}</p>
                  <a className="tf-text-link" href={asset(screen.image)} target="_blank" rel="noopener noreferrer">View full screenshot <span aria-hidden="true">↗</span><span className="tf-sr-only">: {screen.title} (opens in a new tab)</span></a>
                </figcaption>
              </figure>)}
            </div>
          </div>
        </section>

        <section className="tf-teachers" id="tf-teachers" tabIndex={-1} aria-labelledby="tf-teachers-title">
          <div className="tf-section">
            <header className="tf-section-heading">
              <div><span className="tf-eyebrow">For teachers</span><h2 id="tf-teachers-title">Review their<br />discoveries.</h2></div>
              <p>Bring student observations, writing and mission progress together. Use their work to start the next classroom discussion.</p>
            </header>
            <AccessibleTabs id="tf-portal" items={teacherViews} activeId={teacherView} onChange={setTeacherView} ariaLabel="Teacher portal previews" className="tf-tabs" renderItem={view => view.label} />
            <div id="tf-portal-panel" role="tabpanel" aria-labelledby={tabDomId("tf-portal", teacherView)} tabIndex={0}>
              <figure className="tf-portal-preview">
                <div className="tf-portal-image"><img key={portal.image} src={asset(portal.image)} alt={`${portal.label} screen in the Taronga Tracka teacher portal`} width={portal.width} height={portal.height} loading="lazy" /></div>
                <figcaption><p>{portal.description}</p><a className="tf-text-link" href={asset(portal.image)} target="_blank" rel="noopener noreferrer">View full screenshot <span aria-hidden="true">↗</span><span className="tf-sr-only"> (opens in a new tab)</span></a></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="tf-section tf-visit" id="tf-visit" tabIndex={-1} aria-labelledby="tf-visit-title">
          <div className="tf-visit-intro">
            <span className="tf-eyebrow">Planning with Tracka</span>
            <h2 id="tf-visit-title">Plan your<br />class visit.</h2>
            <p>Prepare your class, make time for observation and bring their questions back to school.</p>
          </div>
          <div className="tf-visit-details">
            <ol className="tf-visit-steps">
              {visitSteps.map(([when, title, copy]) => <li key={when}><span>{when}</span><h3>{title}</h3><p>{copy}</p></li>)}
            </ol>
            <a className="tf-text-link" href={routePath("subjects")}>Find classroom resources in Wildly <Icon type="arrowRight" /></a>
          </div>
          <div className="tf-questions">
            <details><summary>Which experiences can I use Tracka for?</summary><p>Tracka has experiences for day visits to Taronga Zoo and overnight ZooSnooz groups. School mode is in development.</p></details>
            <details><summary>Do I need a separate account?</summary><p>Wildly and Taronga Tracka use the same teacher account. You’ll sign in separately on each website using the same email address and password.</p></details>
          </div>
        </section>

        <section className="tf-start" aria-labelledby="tf-start-title">
          <div><h2 id="tf-start-title">Start with your class.</h2><p>Open Tracka to set up your group, or explore Taronga’s excursion options.</p></div>
          <div className="tf-start-actions"><a className="tf-button" href={appLinks.tracka} target="_blank" rel="noopener noreferrer">Open Taronga Tracka <span aria-hidden="true">↗</span><span className="tf-sr-only"> (opens in a new tab)</span></a><a className="tf-text-link" href={appLinks.excursions} target="_blank" rel="noopener noreferrer">Plan an excursion <span aria-hidden="true">↗</span><span className="tf-sr-only"> (opens in a new tab)</span></a></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
