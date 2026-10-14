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
