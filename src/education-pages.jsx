import React from "react";
import "./education-pages.css";

const questions = [
  ["Is Wildly free to use?", "You can create a free teacher account and access the published Wildly resource collection. Excursions and professional learning sessions may have their own booking requirements."],
  ["Which curriculum does it cover?", "Browse the collection by NSW subject and stage. Check the teaching notes and outcomes on individual resources to choose material for your class."],
  ["Do my students need an account?", "Students don’t need an account for you to browse, plan or use teaching resources. Student activities and Taronga Tracka have their own joining instructions."],
  ["Do we need to visit Taronga?", "No. You can use Wildly in the classroom without a zoo visit. If you are planning an excursion, use the collection to prepare your class and follow up afterwards."],
  ["Can I look around before signing up?", "Yes. The teacher workspace preview lets you explore the layout with labelled sample resources and classes. The published collection is available through the library."],
];

export function SchoolsPage({ SiteHeader, SiteFooter, assets, routePath, Icon }) {
  const resources = [
    ["Lessons & resources", "Find teaching notes, activities and materials by subject and stage.", "subjects", assets.tarongaBushland],
    ["Learning paths", "Explore a sequence of lessons and the resources that support it.", "learning-paths", assets.tarongaClassroom],
    ["Taronga TV", "Bring wildlife stories and keeper insights into a class discussion.", "teacher/taronga-tv", assets.gorilla],
    ["Professional learning", "Find sessions and resources for your own teaching practice.", "teacher/professional-learning", assets.tarongaPlLectureTheatre],
  ];
  return <>
    <SiteHeader active="schools" />
    <main className="ed-page ed-schools" id="main-content" tabIndex={-1}>
      <section className="ed-school-cover" aria-labelledby="school-title">
        <img className="ed-school-cover-photo" src={assets.tarongaClassroom} alt="Students gathered around a Taronga educator in a habitat classroom" width="2048" height="1024" fetchPriority="high" />
        <div className="ed-school-cover-copy">
          <span className="ed-label">For schools</span>
          <h1 id="school-title">Taronga, in<br />your classroom.</h1>
          <p>Wildlife stories, lessons and activities for the subjects you teach. Explore the collection and choose what works for your students.</p>
          <a className="ed-button" href={routePath("subjects")}>Find teaching resources <Icon type="arrowRight" /></a>
          <a className="ed-link" href={routePath("teacher/preview")}>Preview the teacher workspace <Icon type="arrowRight" /></a>
        </div>
        <span className="ed-cover-caption">Learning with a Taronga educator</span>
      </section>

      <section className="ed-section ed-resource-directory" aria-labelledby="school-resources">
        <header><span className="ed-label">The collection</span><h2 id="school-resources">What are you<br />planning?</h2><p>Start with a lesson, a whole unit or a question your class wants to explore.</p></header>
        <div className="ed-resource-links">
          {resources.map(([title, copy, path, image]) => <a href={routePath(path)} key={path}><img src={image} alt="" width="180" height="140" loading="lazy" /><div><h3>{title}</h3><p>{copy}</p></div><Icon type="arrowRight" /></a>)}
        </div>
      </section>

      <section className="ed-school-visit" aria-labelledby="school-visit">
        <figure><img src={assets.tarongaOutdoor} alt="A school group observing wildlife outdoors at Taronga" width="2000" height="1335" loading="lazy" /></figure>
        <div><span className="ed-label">Learning at the zoo</span><h2 id="school-visit">Taking your<br />class to Taronga?</h2><p>Use Wildly to introduce a topic before you go. At the zoo, Taronga Tracka gives students animal missions and a way to record their observations.</p><p>Back at school, return to their questions and choose resources for the next lesson.</p><a className="ed-link" href={routePath("tracka")}>Explore Taronga Tracka <Icon type="arrowRight" /></a></div>
      </section>

      <section className="ed-section ed-school-faq" aria-labelledby="school-faq-title">
        <header><h2 id="school-faq-title">Questions<br />about Wildly</h2><a className="ed-button" href={routePath("get-started")}>Create a free account <Icon type="arrowRight" /></a></header>
        <div className="ed-answers">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
      </section>
    </main>
    <SiteFooter />
  </>;
}

export function AboutPage({ SiteHeader, SiteFooter, assets, routePath, Icon, appLinks }) {
  return <>
    <SiteHeader active="about" />
    <main className="ed-page ed-about" id="main-content" tabIndex={-1}>
      <section className="ed-about-opening" aria-labelledby="about-title">
        <div className="ed-about-title"><span className="ed-label">About Wildly</span><h1 id="about-title">Learning<br />through nature.</h1></div>
        <div className="ed-about-intro"><p>Wildly brings Taronga’s wildlife and conservation knowledge into the classroom.</p><p>A place for teachers to find resources, follow a line of inquiry and give students more ways to understand the natural world.</p></div>
        <figure><img src={assets.tarongaRainforestClassroom} alt="A Taronga educator and students learning together in a rainforest habitat classroom" width="2000" height="1000" fetchPriority="high" /><figcaption>Taronga education <span>Learning in a habitat classroom</span></figcaption></figure>
      </section>

      <section className="ed-section ed-about-story" aria-labelledby="about-story-title">
        <div><h2 id="about-story-title">Teaching<br />with wildlife.</h2></div>
        <div className="ed-story-text"><p>An animal’s behaviour can begin a science investigation. A conservation story can become a writing task. Observations can give a mathematics lesson something real to work with.</p><p>Wildly brings those starting points together with teaching resources, organised by subject and stage. Teachers choose the material, adapt it to their students and decide where the learning goes next.</p><a className="ed-link" href={routePath("subjects")}>Explore the resource collection <Icon type="arrowRight" /></a></div>
      </section>

      <section className="ed-about-field" aria-labelledby="about-taronga-title">
        <figure><img src={assets.tarongaKeeperTortoise} alt="A Taronga educator introducing students to a tortoise" width="1452" height="1437" loading="lazy" /><figcaption>An animal encounter in a Taronga habitat classroom</figcaption></figure>
        <div><span className="ed-label">The Taronga connection</span><h2 id="about-taronga-title">Learning with<br />Taronga’s educators.</h2><p>Taronga’s education experiences bring students into contact with wildlife and the people who care for it.</p><p>Wildly gives teachers a place to explore related topics at school, whether they are preparing for a visit, following one up or teaching entirely in the classroom.</p><a className="ed-link" href={appLinks.excursions} target="_blank" rel="noopener noreferrer">Explore learning at Taronga <span aria-hidden="true">↗</span><span className="ed-sr-only"> (opens in a new tab)</span></a></div>
      </section>

      <section className="ed-section ed-connections" aria-labelledby="about-tools-title">
        <header><span className="ed-label">Two places to explore</span><h2 id="about-tools-title">Wildly & Taronga Tracka</h2><p>Classroom resources and zoo observations, with one teacher account.</p></header>
        <div className="ed-product-links">
          <a href={routePath("subjects")}><span className="ed-product-title">Wildly <Icon type="arrowRight" /></span><p>Browse lessons, learning paths and wildlife stories for your teaching.</p><span className="ed-link-label">Explore resources</span></a>
          <a href={routePath("tracka")}><span className="ed-product-title">Taronga Tracka <Icon type="arrowRight" /></span><p>Explore animal missions and review what your class observes at the zoo.</p><span className="ed-link-label">See how Tracka works</span></a>
        </div>
        <p className="ed-account-note">Use the same email address and password, signing in separately on each website.</p>
      </section>
    </main>
    <SiteFooter />
  </>;
}

// ⚠️ DRAFT FOR TARONGA REVIEW. Written from what the code actually collects
// (October 2026), not legal advice. Taronga's privacy officer / legal team must
// approve it — and fill in a direct privacy contact — before launch. Keep it in
// step with the app: if a feature starts collecting something new, update this.
const LEGAL_UPDATED = "15 October 2026";

export function LegalPage({ SiteHeader, routePath, section = "privacy" }) {
  // The site routes on the URL hash, so in-page "#anchor" links would navigate
  // away. #privacy and #terms are both routes to this page; scroll to match.
  React.useEffect(() => {
    // Next frame: main.jsx scrolls to the top on every route change after this runs.
    const frame = requestAnimationFrame(() => {
      if (section === "terms") document.getElementById("terms")?.scrollIntoView();
      else window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [section]);
  return <>
    <SiteHeader />
    <main className="ed-page ed-legal" id="main-content" tabIndex={-1}>
      <header className="ed-legal-head">
        <span className="ed-label">Wildly by Taronga</span>
        <h1>Privacy &amp; terms</h1>
        <p>Last updated {LEGAL_UPDATED}. <a href={routePath("privacy")}>Privacy policy</a> · <a href={routePath("terms")}>Terms of use</a></p>
      </header>

      <article className="ed-legal-body">
        <h2 id="privacy-policy">Privacy policy</h2>
        <p>Wildly is run by Taronga Conservation Society Australia (“Taronga”, “we”), a NSW Government statutory authority. We handle personal information in line with the <em>Privacy and Personal Information Protection Act 1998</em> (NSW). This policy explains what Wildly collects and why.</p>

        <h3>Who Wildly is for</h3>
        <p>Wildly is for teachers and Taronga education staff. Students do not create Wildly accounts.</p>

        <h3>What we collect</h3>
        <ul>
          <li><strong>Your account:</strong> your email address and your school. Your password is handled by our sign-in provider (Google Firebase Authentication). We never see or store it.</li>
          <li><strong>Your profile, if you complete it:</strong> your name, role and country.</li>
          <li><strong>How Wildly is used:</strong> we count how often each resource is opened. These counts are totals and are not linked to you. We also use Google Analytics for Firebase to understand overall use, such as pages viewed, device type and approximate location.</li>
          <li><strong>Security checks:</strong> Google reCAPTCHA and Firebase App Check confirm requests come from the real Wildly site, to protect accounts and student data from automated attacks.</li>
        </ul>

        <h3>What stays on your device</h3>
        <p>Resources you save and classes you set up in Wildly are stored in your own browser. They are not sent to Taronga, and clearing your browser data removes them.</p>

        <h3>One account with Taronga Tracka</h3>
        <p>Your Wildly account is the same account you use for Taronga Tracka. If you use Tracka, Wildly can show your Tracka classes and their observations to you. Nobody else can see them. Information about students in Tracka is covered by Tracka's own privacy information.</p>

        <h3>How we use it</h3>
        <p>We use your information to run your account, show you relevant resources, keep Wildly secure and improve our education programs. We do not sell your information. We do not send you marketing without your consent.</p>

        <h3>Where it is stored</h3>
        <p>Wildly runs on Google Firebase. Our database is hosted in Sydney. Some services, including sign-in and analytics, may process information outside Australia.</p>

        <h3>Access, correction and deletion</h3>
        <p>You can update your profile at any time from your account. To see the information we hold about you, correct it, delete your account or make a privacy complaint, contact Taronga through <a href="https://taronga.org.au" target="_blank" rel="noopener noreferrer">taronga.org.au</a>.</p>

        <h2 id="terms">Terms of use</h2>
        <p>By creating an account or using Wildly, you agree to these terms.</p>
        <h3>Using the resources</h3>
        <p>Wildly resources are provided free for educational use. You may use, print and adapt them for your own teaching and students. Do not sell them, republish them as your own or remove Taronga's attribution. Unless a resource says otherwise, copyright stays with Taronga or the credited creators.</p>
        <h3>Your account</h3>
        <p>Keep your password to yourself and tell us if you think someone else has used your account. We may suspend accounts that are misused or used in ways that could harm students, other users or Wildly.</p>
        <h3>Accuracy and availability</h3>
        <p>We take care to keep resources accurate and suitable for schools, but you are responsible for checking a resource suits your students and setting. Wildly may change, or be unavailable at times.</p>
        <h3>Changes</h3>
        <p>We may update this page. The date at the top shows when it last changed.</p>

        <p><a className="ed-link" href={routePath()}>← Back to Wildly</a></p>
      </article>
    </main>
  </>;
}
