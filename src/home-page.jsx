import React, { useEffect, useRef, useState } from "react";
import { subjectImage } from "./subject-identity.js";
import "./home-page.css";

const curriculum = [
  ["Science", "Animals, habitats & conservation"],
  ["English", "Writing, speaking & storytelling"],
  ["HSIE", "People, places & environments"],
  ["Technology & STEM", "Design, systems & problem-solving"],
];
const encounterSteps = [
  { label: "Observe", title: "Look closely. What do you notice?", text: "Choose an animal in the photograph. Describe its shape, colour and surroundings. Separate what you can see from what you think might be true.", prompt: "“I notice… I wonder…”", detail: "Observation · descriptive language" },
  { label: "Question", title: "Turn an observation into a question.", text: "What might this animal need from its habitat? Ask students to choose one question they could investigate, then explain what evidence would help.", prompt: "“How could we find out?”", detail: "Inquiry · evidence & explanation" },
  { label: "Connect", title: "Take the question back to school.", text: "Compare this habitat with a place in your school grounds. What is similar? What is different? Sketch one change that could make that place better for wildlife.", prompt: "“What could we change?”", detail: "Comparison · design & conservation" },
];
function Encounter({ assets, Icon }) {
  const [step, setStep] = useState(0);
  const tabs = useRef([]);
  const current = encounterSteps[step];
  function navigate(event, index) {
    const direction = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : direction ? (index + direction + 3) % 3 : null;
    if (next === null) return;
    event.preventDefault(); setStep(next); tabs.current[next]?.focus();
  }
  return (
    <section className="wild-encounter" aria-labelledby="encounter-title">
      <div className="wild-encounter-photo">
        <img src={assets.tarongaKeeperTortoise} alt="A Taronga educator and students observing a tortoise in a habitat classroom" width="1200" height="900" loading="lazy" />
        <div className="wild-field-caption"><Icon type="pin" /><span>Learning with a Taronga educator<strong>Habitat classroom, Sydney</strong></span></div>
      </div>
      <div className="wild-encounter-copy">
        <span className="wild-eyebrow">A teaching idea to try</span>
        <h2 id="encounter-title">One encounter.<br />Three ways to teach.</h2>
        <p className="wild-encounter-intro">Start with the photograph. Follow your students’ questions.</p>
        <div className="wild-field-tabs" role="tablist" aria-label="Explore the teaching idea">
          {encounterSteps.map((item, index) => <button key={item.label} ref={node => { tabs.current[index] = node; }} id={`encounter-tab-${index}`} type="button" role="tab" aria-selected={step === index} aria-controls="encounter-panel" tabIndex={step === index ? 0 : -1} onClick={() => setStep(index)} onKeyDown={event => navigate(event, index)}><span aria-hidden="true">{index + 1}</span>{item.label}</button>)}
        </div>
        <div className="wild-field-panel" id="encounter-panel" role="tabpanel" aria-labelledby={`encounter-tab-${step}`} tabIndex="0">
          <h3>{current.title}</h3><p>{current.text}</p><blockquote>{current.prompt}</blockquote><span className="wild-field-detail">{current.detail}</span>
        </div>
        <p className="wild-field-disclaimer">An example classroom prompt, not a published curriculum resource.</p>
      </div>
    </section>
  );
}
export default function WildlyHome({ SiteHeader, SiteFooter, Icon, assets, routePath }) {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const respectMotion = () => { if (preference.matches) { videoRef.current?.pause(); setPaused(true); } };
    preference.addEventListener("change", respectMotion);
    return () => preference.removeEventListener("change", respectMotion);
  }, []);
  async function toggleVideo() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) { video.pause(); setPaused(true); return; }
    try { await video.play(); setPaused(false); } catch { setPaused(true); }
  }
  return (
    <div className="wildly-public">
      <SiteHeader />
      <main className="wildly-home" id="main-content" tabIndex="-1">
        <section className="wild-hero" aria-labelledby="wild-hero-title">
          <div className="wild-hero-copy">
            <span className="wild-eyebrow">Wildly by Taronga · For educators</span>
            <h1 id="wild-hero-title">The world is<br />your <span>classroom.</span></h1>
            <p>Explore lessons, wildlife stories and classroom activities from Taronga, organised by subject and stage.</p>
            <div className="wild-actions"><a className="wild-button" href={routePath("subjects")}>Explore teaching resources<Icon type="arrowRight" /></a><a className="wild-text-link" href={routePath("teacher/preview")}>Preview the teacher workspace<Icon type="arrowRight" /></a></div>

          </div>
          <div className="wild-hero-media">
            <video ref={videoRef} autoPlay={!paused} loop muted playsInline preload="metadata" poster={assets.homeVideoPoster} aria-hidden="true" onPause={() => setPaused(true)} onPlay={() => setPaused(false)}><source src={assets.homeVideo} type="video/mp4" /></video>
            <div className="wild-photo-note"><Icon type="pin" /><span>Giraffes at Taronga<strong>Sydney, Australia</strong></span></div>
            <button className="wild-video-control" type="button" onClick={toggleVideo} aria-label={paused ? "Play wildlife film" : "Pause wildlife film"}><Icon type={paused ? "mediaPlay" : "pause"} /></button>
          </div>
        </section>

        <section className="wild-section wild-curriculum" aria-labelledby="wild-curriculum-title">
          <div className="wild-section-heading"><div><span className="wild-eyebrow">Teaching resources</span><h2 id="wild-curriculum-title">What are you teaching?</h2></div><a className="wild-text-link" href={routePath("subjects")}>All 9 curriculum areas<Icon type="arrowRight" /></a></div>
          <div className="wild-curriculum-grid">{curriculum.map(([title, copy]) => <a className="wild-subject" href={routePath(`subjects/${encodeURIComponent(title)}`)} key={title}><div className="wild-subject-image"><img src={subjectImage(title)} alt="" loading="lazy" width="710" height="520" /><span className="wild-round-arrow"><Icon type="arrowRight" /></span></div><h3>{title}</h3><p>{copy}</p></a>)}</div>
        </section>
        <Encounter assets={assets} Icon={Icon} />
        <section className="wild-section wild-experiences" aria-labelledby="wild-experiences-title">
          <div className="wild-section-heading"><div><h2 id="wild-experiences-title">More from Taronga</h2></div></div>
          <div className="wild-experience-grid">
            <a className="wild-experience-card" href={routePath("tracka")}><div className="wild-experience-image"><img src={assets.tarongaOutdoor} alt="Students exploring Taronga on an excursion" width="1200" height="800" loading="lazy" /></div><div className="wild-experience-copy"><h3>Taronga Tracka<Icon type="arrowRight" /></h3><p>Connect your excursion with animal observation missions and classroom follow-up.</p></div></a>
            <a className="wild-experience-card" href={routePath("teacher/taronga-tv")}><div className="wild-experience-image"><img src={assets.gorilla} alt="Gorilla at Taronga" width="710" height="400" loading="lazy" /></div><div className="wild-experience-copy"><h3>Taronga TV<Icon type="arrowRight" /></h3><p>Wildlife stories and keeper insights to watch with your class.</p></div></a>
            <a className="wild-experience-card" href={routePath("teacher/professional-learning")}><div className="wild-experience-image"><img src={assets.tarongaPlLectureTheatre} alt="Professional learning at Taronga" width="1200" height="800" loading="lazy" /></div><div className="wild-experience-copy"><h3>Professional learning<Icon type="arrowRight" /></h3><p>Explore sessions, courses and resources for your own teaching practice.</p></div></a>
          </div>
        </section>
        <section className="wild-invitation"><div><h2>Plan your next lesson with Taronga.</h2><p>Create a free teacher account to save resources and organise your classes.</p></div><div><a className="wild-button wild-button-light" href={routePath("get-started")}>Create your free account<Icon type="arrowRight" /></a><a className="wild-text-link" href={routePath("teacher/preview")}>Preview the teacher workspace<Icon type="arrowRight" /></a></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
