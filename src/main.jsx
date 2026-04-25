import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import "../landing.css";
import "../styles.css";
import "../staff.css";

const basePath = import.meta.env.BASE_URL;
const routePath = (path = "") => `${basePath}#${path}`;
const assetPath = (path) => `${basePath}${path}`;
const teacherRoute = (path = "") => routePath(path ? `teacher/${path}` : "teacher");
const teacherContentRoute = (id) => teacherRoute(`content/${id}`);
const teacherTvRoute = (id = "") => teacherRoute(id ? `taronga-tv/${id}` : "taronga-tv");
const teacherPreviewRoute = () => teacherRoute("preview");
const loginRoute = () => routePath("login");
const signupRoute = () => routePath("get-started");
const aboutYouRoute = () => routePath("about-you");
const demoSessionKey = "wildly-demo-session";

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

const stockImages = [
  { label: "Koala with joey", subject: "Animals", key: "heroKoala", src: assets.heroKoala },
  { label: "Koala portrait", subject: "Animals", key: "koala", src: assets.koala },
  { label: "River habitat", subject: "Habitats", key: "river", src: assets.river },
  { label: "Rhino habitat", subject: "Animals", key: "rhino", src: assets.rhino },
  { label: "Giraffe", subject: "Animals", key: "giraffe", src: assets.giraffe },
  { label: "Binturong", subject: "Animals", key: "binturong", src: assets.binturong },
  { label: "Gorilla", subject: "Animals", key: "gorilla", src: assets.gorilla },
  { label: "Rainforest canopy", subject: "Habitats", src: "https://loremflickr.com/900/520/rainforest,nature?lock=21" },
  { label: "Ocean conservation", subject: "Science", src: "https://loremflickr.com/900/520/ocean,conservation?lock=22" },
  { label: "Australian bushland", subject: "Habitats", src: "https://loremflickr.com/900/520/australian,bushland?lock=23" },
  { label: "Wildlife camera", subject: "Technology & STEM", src: "https://loremflickr.com/900/520/wildlife,camera?lock=24" },
  { label: "Students outdoors", subject: "Learning", src: "https://loremflickr.com/900/520/students,nature?lock=25" },
  { label: "Animal tracks", subject: "Science", src: "https://loremflickr.com/900/520/animal,tracks?lock=26" },
  { label: "Forest data collection", subject: "Mathematics", src: "https://loremflickr.com/900/520/fieldwork,data?lock=27" },
  { label: "Wetlands", subject: "Geography", src: "https://loremflickr.com/900/520/wetland,wildlife?lock=28" },
  { label: "Native plants", subject: "Science", src: "https://loremflickr.com/900/520/native,plants?lock=29" },
  { label: "Conservation action", subject: "HSIE", src: "https://loremflickr.com/900/520/conservation,volunteer?lock=30" },
  { label: "STEM design", subject: "Technology & STEM", src: "https://loremflickr.com/900/520/stem,design?lock=31" },
  { label: "Creative nature art", subject: "CAPA", src: "https://loremflickr.com/900/520/nature,art?lock=32" },
  { label: "Wellbeing in nature", subject: "PDHPE", src: "https://loremflickr.com/900/520/nature,wellbeing?lock=33" },
  { label: "Elephant herd", subject: "Animals", src: "https://loremflickr.com/900/520/elephant,herd?lock=34" },
  { label: "Lion habitat", subject: "Animals", src: "https://loremflickr.com/900/520/lion,habitat?lock=35" },
  { label: "Tiger close-up", subject: "Animals", src: "https://loremflickr.com/900/520/tiger,wildlife?lock=36" },
  { label: "Meerkat group", subject: "Animals", src: "https://loremflickr.com/900/520/meerkat,group?lock=37" },
  { label: "Seal colony", subject: "Animals", src: "https://loremflickr.com/900/520/seal,coast?lock=38" },
  { label: "Penguins on rocks", subject: "Animals", src: "https://loremflickr.com/900/520/penguin,colony?lock=39" },
  { label: "Turtle underwater", subject: "Animals", src: "https://loremflickr.com/900/520/turtle,ocean?lock=40" },
  { label: "Platypus habitat", subject: "Animals", src: "https://loremflickr.com/900/520/platypus,river?lock=41" },
  { label: "Wallaby in bushland", subject: "Animals", src: "https://loremflickr.com/900/520/wallaby,bushland?lock=42" },
  { label: "Bird of prey", subject: "Animals", src: "https://loremflickr.com/900/520/eagle,bird?lock=43" },
  { label: "Butterfly garden", subject: "Animals", src: "https://loremflickr.com/900/520/butterfly,garden?lock=44" },
  { label: "Insect macro", subject: "Animals", src: "https://loremflickr.com/900/520/insect,macro?lock=45" },
  { label: "Desert ecosystem", subject: "Habitats", src: "https://loremflickr.com/900/520/desert,ecosystem?lock=46" },
  { label: "Mangrove habitat", subject: "Habitats", src: "https://loremflickr.com/900/520/mangrove,habitat?lock=47" },
  { label: "Rockpool life", subject: "Habitats", src: "https://loremflickr.com/900/520/rockpool,marine?lock=48" },
  { label: "Coral reef", subject: "Habitats", src: "https://loremflickr.com/900/520/coral,reef?lock=49" },
  { label: "Mountain forest", subject: "Habitats", src: "https://loremflickr.com/900/520/mountain,forest?lock=50" },
  { label: "Savannah grassland", subject: "Habitats", src: "https://loremflickr.com/900/520/savannah,grassland?lock=51" },
  { label: "Arctic landscape", subject: "Habitats", src: "https://loremflickr.com/900/520/arctic,landscape?lock=52" },
  { label: "Creek ecosystem", subject: "Habitats", src: "https://loremflickr.com/900/520/creek,ecosystem?lock=53" },
  { label: "Bushfire regeneration", subject: "Science", src: "https://loremflickr.com/900/520/bushfire,regeneration?lock=54" },
  { label: "Food web diagram scene", subject: "Science", src: "https://loremflickr.com/900/520/ecosystem,science?lock=55" },
  { label: "Weather observation", subject: "Science", src: "https://loremflickr.com/900/520/weather,observation?lock=56" },
  { label: "Plant life cycle", subject: "Science", src: "https://loremflickr.com/900/520/plant,growth?lock=57" },
  { label: "Microscope investigation", subject: "Science", src: "https://loremflickr.com/900/520/microscope,science?lock=58" },
  { label: "Water testing", subject: "Science", src: "https://loremflickr.com/900/520/water,testing?lock=59" },
  { label: "Data graphing outdoors", subject: "Mathematics", src: "https://loremflickr.com/900/520/data,graph?lock=60" },
  { label: "Measurement investigation", subject: "Mathematics", src: "https://loremflickr.com/900/520/measurement,math?lock=61" },
  { label: "Patterns in nature", subject: "Mathematics", src: "https://loremflickr.com/900/520/patterns,nature?lock=62" },
  { label: "Statistics fieldwork", subject: "Mathematics", src: "https://loremflickr.com/900/520/statistics,fieldwork?lock=63" },
  { label: "Mapping activity", subject: "HSIE", src: "https://loremflickr.com/900/520/map,students?lock=64" },
  { label: "Community conservation", subject: "HSIE", src: "https://loremflickr.com/900/520/community,conservation?lock=65" },
  { label: "Cultural landscape", subject: "HSIE", src: "https://loremflickr.com/900/520/cultural,landscape?lock=66" },
  { label: "Place and environment", subject: "HSIE", src: "https://loremflickr.com/900/520/place,environment?lock=67" },
  { label: "Nature journalling", subject: "English", src: "https://loremflickr.com/900/520/journal,students?lock=68" },
  { label: "Reading outdoors", subject: "English", src: "https://loremflickr.com/900/520/reading,outdoors?lock=69" },
  { label: "Storytelling circle", subject: "English", src: "https://loremflickr.com/900/520/storytelling,classroom?lock=70" },
  { label: "Persuasive speaking", subject: "English", src: "https://loremflickr.com/900/520/speaking,presentation?lock=71" },
  { label: "Outdoor mindfulness", subject: "PDHPE", src: "https://loremflickr.com/900/520/mindfulness,outdoors?lock=72" },
  { label: "Team challenge", subject: "PDHPE", src: "https://loremflickr.com/900/520/teamwork,students?lock=73" },
  { label: "Healthy habitats walk", subject: "PDHPE", src: "https://loremflickr.com/900/520/walking,nature?lock=74" },
  { label: "Movement in nature", subject: "PDHPE", src: "https://loremflickr.com/900/520/movement,nature?lock=75" },
  { label: "Wildlife sketching", subject: "CAPA", src: "https://loremflickr.com/900/520/sketching,wildlife?lock=76" },
  { label: "Nature sculpture", subject: "CAPA", src: "https://loremflickr.com/900/520/sculpture,nature?lock=77" },
  { label: "Creative media production", subject: "CAPA", src: "https://loremflickr.com/900/520/media,creative?lock=78" },
  { label: "Performance in the round", subject: "CAPA", src: "https://loremflickr.com/900/520/performance,students?lock=79" },
  { label: "Robotics lab", subject: "Technology & STEM", src: "https://loremflickr.com/900/520/robotics,lab?lock=80" },
  { label: "Coding and circuits", subject: "Technology & STEM", src: "https://loremflickr.com/900/520/coding,circuits?lock=81" },
  { label: "Design prototype", subject: "Technology & STEM", src: "https://loremflickr.com/900/520/prototype,design?lock=82" },
  { label: "Drone fieldwork", subject: "Technology & STEM", src: "https://loremflickr.com/900/520/drone,fieldwork?lock=83" },
  { label: "Students at the zoo", subject: "Excursions", src: "https://loremflickr.com/900/520/zoo,students?lock=84" },
  { label: "Excursion field notes", subject: "Excursions", src: "https://loremflickr.com/900/520/fieldnotes,excursion?lock=85" },
  { label: "Keeper talk", subject: "Excursions", src: "https://loremflickr.com/900/520/zookeeper,talk?lock=86" },
  { label: "Habitat observation deck", subject: "Excursions", src: "https://loremflickr.com/900/520/observation,deck?lock=87" },
  { label: "Early years discovery", subject: "Early Years", src: "https://loremflickr.com/900/520/children,discovery?lock=88" },
  { label: "Play-based learning", subject: "Early Years", src: "https://loremflickr.com/900/520/play,learning?lock=89" },
  { label: "Sensory nature table", subject: "Early Years", src: "https://loremflickr.com/900/520/sensory,nature?lock=90" },
  { label: "Story mat with animals", subject: "Early Years", src: "https://loremflickr.com/900/520/animals,children?lock=91" },
  { label: "Teacher workshop", subject: "Professional Learning", src: "https://loremflickr.com/900/520/teacher,workshop?lock=92" },
  { label: "Webinar session", subject: "Professional Learning", src: "https://loremflickr.com/900/520/webinar,teacher?lock=93" },
  { label: "Curriculum planning", subject: "Professional Learning", src: "https://loremflickr.com/900/520/curriculum,planning?lock=94" },
  { label: "Teachers collaborating", subject: "Professional Learning", src: "https://loremflickr.com/900/520/teachers,collaboration?lock=95" },
  { label: "Conservation poster", subject: "Resources", src: "https://loremflickr.com/900/520/poster,education?lock=96" },
  { label: "Worksheet flatlay", subject: "Resources", src: "https://loremflickr.com/900/520/worksheet,desk?lock=97" },
  { label: "Digital lesson screen", subject: "Resources", src: "https://loremflickr.com/900/520/digital,lesson?lock=98" },
  { label: "Teacher pack materials", subject: "Resources", src: "https://loremflickr.com/900/520/teacher,materials?lock=99" },
  { label: "Citizen science in action", subject: "Tracka", src: "https://loremflickr.com/900/520/citizen,science?lock=100" },
  { label: "Wildlife tracking", subject: "Tracka", src: "https://loremflickr.com/900/520/wildlife,tracking?lock=101" },
  { label: "Outdoor data logging", subject: "Tracka", src: "https://loremflickr.com/900/520/data,logging?lock=102" },
  { label: "Field observation board", subject: "Tracka", src: "https://loremflickr.com/900/520/field,observation?lock=103" },
];

const subjects = [
  ["Science", "science", "Discover the living world and our place in it."],
  ["English", "english", "Communicate, create and explore ideas that matter."],
  ["Literacy & Numeracy", "litnum", "Build core literacy and numeracy capability through real-world, nature-based learning."],
  ["Mathematics", "maths", "Make sense of patterns, numbers and the world around you."],
  ["HSIE", "hsie", "Understand people, places, histories and how we shape society."],
  ["PDHPE", "pdhpe", "Build wellbeing, strong relationships and healthy communities."],
  ["CAPA", "capa", "Imagine, express and connect through creativity."],
  ["Technology & STEM", "stem", "Design, innovate and solve real-world challenges."],
  ["Early Years", "earlyyears", "Play-based, story-led and sensory learning for pre-school and Early Stage 1."],
];

const tarongaTvCategories = [
  "Early Years",
  "Science",
  "Excursions",
  "Teacher PD",
];

const defaultContentItems = [
  { id: "adaptations-australian-animals", title: "Adaptations of Australian Animals", type: "Lesson", subject: "Science", stage: "Stage 2", progress: 65, imageKey: "river", summary: "Stage 2 science lesson with teacher guide and student prompts.", description: "Explore animal adaptations through observation, vocabulary and evidence-based explanation.", status: "Published", order: 1 },
  { id: "first-nations-cultures-country", title: "First Nations Cultures and Country", type: "Resource", subject: "HSIE", stage: "Stage 3", progress: 40, imageKey: "rhino", summary: "First Nations perspectives for Stage 3 inquiry.", description: "Support respectful inquiry into Country, culture and conservation connections.", status: "Published", order: 2 },
  { id: "sustainable-futures", title: "Sustainable Futures", type: "Learning Path", subject: "Technology & STEM", stage: "Stage 4", progress: 25, imageKey: "binturong", summary: "8 lessons across Science, HSIE and Technology & STEM.", description: "Build a sequence around conservation design, systems thinking and action planning.", status: "Published", order: 3 },
  { id: "persuasive-texts-wildlife-action", title: "Persuasive Texts for Wildlife Action", type: "Lesson", subject: "English", stage: "Stage 3", progress: 15, imageKey: "koala", summary: "Writing task with model texts and scaffolds.", description: "Use wildlife conservation contexts to plan, draft and refine persuasive writing.", status: "Draft", order: 4 },
  { id: "animal-movement-data-patterns", title: "Animal Movement and Data Patterns", type: "Resource", subject: "Mathematics", stage: "Stage 3", progress: 55, imageKey: "giraffe", summary: "Data activity using animal movement and habitat observations.", description: "Interpret data patterns and represent findings using classroom-friendly datasets.", status: "Published", order: 5 },
  { id: "wellbeing-through-nature", title: "Wellbeing Through Nature Connection", type: "Lesson", subject: "PDHPE", stage: "Stage 2", progress: 80, imageKey: "gorilla", summary: "Reflection lesson connecting wellbeing, nature and community.", description: "Guide students through reflective prompts about nature connection and wellbeing.", status: "Review", order: 6 },
];

const schoolOptions = [
  "Taronga Education Centre",
  "Sydney Secondary College",
  "Dubbo Public School",
  "Melbourne High School",
  "Brisbane State High School",
  "Auckland Grammar School",
  "Singapore International School",
];

const defaultProfessionalLearningItems = [
  {
    id: "teacher-webinar-learning-with-impact",
    title: "Teacher Webinar: Learning with Impact",
    date: "2026-05-14",
    time: "4:00 PM AEST",
    summary: "A live online session on building conservation action into classroom planning.",
    description: "Join Taronga education staff for a practical walkthrough of how to use Wildly content, Tracka data and curriculum alignment to build stronger classroom sequences.",
    registrationUrl: "",
    pdfUrl: "",
    infoUrl: "",
    status: "Published",
  },
];

const defaultTarongaTvVideos = [
  {
    id: "koala-adaptations-stage-2",
    title: "Koala Adaptations",
    summary: "A short classroom-ready video exploring how koalas survive in Australian habitats.",
    description: "Use this video to introduce structural and behavioural adaptations, habitat needs and evidence-based classroom discussion.",
    subject: "Science",
    stage: "Stage 2",
    imageKey: "heroKoala",
    thumbnailUrl: "",
    embedUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    duration: "6 min",
    status: "Published",
    categories: ["Science"],
    outcomeCodes: ["ST2-4LW-S", "ST2-1WS-S"],
    lessonIds: ["adaptations-australian-animals"],
    learningPathIds: ["sustainable-futures"],
    discussionPoints: [
      { time: "00:45", prompt: "What body features help the koala survive in trees?" },
      { time: "02:10", prompt: "Pause and collect evidence of behavioural adaptations." },
      { time: "04:20", prompt: "How does habitat change affect this species?" },
    ],
  },
  {
    id: "voices-for-country-taronga-tv",
    title: "Voices for Country",
    summary: "A reflective video connecting Country, culture and conservation.",
    description: "Use this video to support respectful inquiry, discussion and linked writing or observation tasks.",
    subject: "HSIE",
    stage: "Stage 3",
    imageKey: "rhino",
    thumbnailUrl: "",
    embedUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    duration: "8 min",
    status: "Published",
    categories: ["Excursions"],
    outcomeCodes: ["HT3-1", "GE3-2"],
    lessonIds: [],
    learningPathIds: [],
    discussionPoints: [
      { time: "01:20", prompt: "What viewpoints are being shared here?" },
      { time: "05:00", prompt: "How can students connect this to local place and responsibility?" },
    ],
  },
];

const staffPassword = "admin";
const staffSessionKey = "wildly-staff-session";

function listFromText(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function createContentDraft(type = "Lesson") {
  return {
    title: "",
    type,
    subject: "Science",
    stage: "Stage 2",
    summary: "",
    description: "",
    imageKey: "heroKoala",
    image: "",
    customImageUrl: "",
    uploadedImageDataUrl: "",
    progress: 0,
    status: "Draft",
    durationMinutes: type === "Lesson" ? 45 : 0,
    durationWeeks: type === "Learning Path" ? 6 : 0,
    outcomeCodes: "",
    activityPrompts: "",
    canvaEmbedUrl: "",
    teacherGuideUrl: "",
    studentWorksheetUrl: "",
    videoUrl: "",
    teacherAdminUrl: "",
    unitPlanUrl: "",
    lessonPlanUrl: "",
    resourceUrl: "",
    resourceLinks: "",
    downloadLinks: "",
    learningPathId: "",
    lessonId: "",
    lessonIds: [],
    resourceIds: [],
  };
}

function createTarongaTvDraft() {
  return {
    title: "",
    summary: "",
    description: "",
    subject: "Science",
    stage: "Stage 2",
    status: "Draft",
    duration: "",
    imageKey: "heroKoala",
    image: "",
    customImageUrl: "",
    uploadedImageDataUrl: "",
    embedUrl: "",
    categories: [],
    outcomeCodes: "",
    lessonIds: [],
    learningPathIds: [],
    discussionPoints: [
      { time: "", prompt: "" },
    ],
  };
}

function normalizeYouTubeEmbedUrl(value = "") {
  const raw = value.trim();
  if (!raw) return "";
  if (raw.includes("/embed/")) return raw;

  try {
    const url = new URL(raw);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : raw;
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return raw;
  }

  return raw;
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Unable to load image file."));
      image.onload = () => {
        const maxWidth = 1000;
        const maxHeight = 620;
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.76));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function Icon({ type, className = "nav-svg" }) {
  const icons = {
    grid: <><rect x="3" y="4" width="7" height="7" rx="1.5" /><rect x="14" y="4" width="7" height="7" rx="1.5" /><rect x="3" y="15" width="7" height="5" rx="1.5" /><rect x="14" y="15" width="7" height="5" rx="1.5" /></>,
    users: <><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3.5 19c.7-3.4 2.3-5 4.5-5s3.8 1.6 4.5 5" /><path d="M13.5 18.8c.5-2.5 1.8-3.8 3.7-3.8 1.6 0 2.8 1 3.3 3.8" /></>,
    cap: <><path d="M3 8.5 12 4l9 4.5-9 4.5L3 8.5Z" /><path d="M7 11v4.5c1.2 1.3 2.9 2 5 2s3.8-.7 5-2V11" /><path d="M20 9v5" /></>,
    report: <><path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h9L19 7.5V20H5Z" /><path d="M15 4v4h4" /><path d="M8 16v-3" /><path d="M12 16v-6" /><path d="M16 16v-4" /></>,
    bookmark: <path d="M7 4h10v16l-5-3-5 3V4Z" />,
    book: <><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5v-16Z" /><path d="M5 5.5A2.5 2.5 0 0 1 7.5 8H20" /><path d="M8 12h8" /><path d="M8 15h6" /></>,
    blocks: <><rect x="4" y="11" width="7" height="7" rx="1.4" /><rect x="13" y="11" width="7" height="7" rx="1.4" /><path d="M8.5 11V6.5A2.5 2.5 0 0 1 11 4h2a2.5 2.5 0 0 1 2.5 2.5V11" /><path d="M6.5 15h2" /><path d="M15.5 15h2" /><path d="M10 7h4" /></>,
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
    play: <><rect x="4" y="5" width="16" height="14" rx="2" /><path d="m10 9 5 3.5-5 3.5Z" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  };
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true">{icons[type]}</svg>;
}

function subjectIconType(label) {
  return {
    Science: "leaf",
    English: "speech",
    "Literacy & Numeracy": "book",
    Mathematics: "calc",
    HSIE: "globe",
    PDHPE: "heart",
    CAPA: "palette",
    "Technology & STEM": "code",
    "Early Years": "blocks",
  }[label];
}

const appLinks = {
  tracka: "https://tarongatracka.com.au",
  demoBooking: routePath("demo-booking"),
  support: routePath("support"),
  excursions: "https://taronga.org.au/education/sydney-excursions",
  professionalLearning: teacherRoute("professional-learning"),
};

function subjectSlug(label) {
  return {
    Science: "science",
    English: "english",
    "Literacy & Numeracy": "literacy-numeracy",
    Mathematics: "mathematics",
    HSIE: "hsie",
    PDHPE: "pdhpe",
    CAPA: "capa",
    "Technology & STEM": "technology-stem",
    "Early Years": "early-years",
  }[label] || "";
}

function subjectFromSlug(slug) {
  return {
    science: "Science",
    english: "English",
    "literacy-numeracy": "Literacy & Numeracy",
    mathematics: "Mathematics",
    hsie: "HSIE",
    pdhpe: "PDHPE",
    capa: "CAPA",
    "technology-stem": "Technology & STEM",
    "early-years": "Early Years",
  }[slug] || null;
}

function NoticeBanner({ notice, onClose }) {
  if (!notice) return null;
  return (
    <div className="notice-banner" role="status">
      <p>{notice}</p>
      <button type="button" onClick={onClose}>Close</button>
    </div>
  );
}

function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function openConfiguredLink(url, setNotice, label) {
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  setNotice(`${label} is still a placeholder. Add the real URL in the app config when you have it.`);
}

function parseNamedLinks(value = "") {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [labelPart, ...urlParts] = line.split("|");
      if (urlParts.length) {
        return {
          label: labelPart.trim() || `Download ${index + 1}`,
          url: urlParts.join("|").trim(),
        };
      }
      return {
        label: `Download ${index + 1}`,
        url: line,
      };
    })
    .filter((item) => item.url);
}

function buildContentDownloads(item) {
  const downloads = [
    ["Teacher admin pack", item.materials?.teacherAdminUrl],
    ["Unit plan", item.materials?.unitPlanUrl],
    ["Lesson plan", item.materials?.lessonPlanUrl],
    ["Teacher guide", item.materials?.teacherGuideUrl],
    ["Student worksheet", item.materials?.studentWorksheetUrl],
    ["Resource file", item.materials?.resourceUrl],
  ]
    .filter(([, url]) => Boolean(url))
    .map(([label, url]) => ({ label, url }));

  return [
    ...downloads,
    ...(item.materials?.downloadLinks || []),
    ...(item.materials?.resourceLinks || []).map((entry, index) => ({ label: `Resource link ${index + 1}`, url: entry })),
  ];
}

function buildProfessionalLearningLinks(item) {
  return [
    item.pdfUrl ? { label: "Session PDF", url: item.pdfUrl } : null,
    item.infoUrl ? { label: "Session information", url: item.infoUrl } : null,
    ...(item.downloadLinks || []),
  ].filter(Boolean);
}

function LinkSection({ title = "Files and links", links = [] }) {
  if (!links.length) return null;

  return (
    <div className="detail-list">
      <h3>{title}</h3>
      <div className="teacher-card-actions">
        {links.map((link) => (
          <a key={`${link.label}-${link.url}`} className="secondary-action" href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
        ))}
      </div>
    </div>
  );
}

function contentPrimaryLink(item) {
  return (
    item.materials?.resourceUrl
    || item.materials?.lessonPlanUrl
    || item.materials?.unitPlanUrl
    || item.materials?.teacherAdminUrl
    || item.materials?.teacherGuideUrl
    || item.materials?.studentWorksheetUrl
    || item.materials?.canvaEmbedUrl
    || item.materials?.videoUrl
    || item.materials?.resourceLinks?.[0]
    || ""
  );
}

function buildDemoProfile() {
  return {
    uid: "demo-zoo",
    email: "demo@zoo",
    name: "Demo Teacher",
    country: "Australia",
    role: "Teacher",
    school: "Taronga Education Centre",
    isDemo: true,
  };
}

function createInitials(name = "") {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return initials || "WT";
}

function useSessionUser() {
  const [state, setState] = useState({ status: "loading", user: null, profile: null });

  useEffect(() => {
    const demoSession = window.localStorage.getItem(demoSessionKey);
    if (demoSession === "active") {
      const demoProfile = buildDemoProfile();
      setState({ status: "ready", user: demoProfile, profile: demoProfile });
      return () => {};
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setState({ status: "ready", user: null, profile: null });
        return;
      }

      try {
        const profileSnapshot = await getDoc(doc(db, "users", firebaseUser.uid));
        setState({
          status: "ready",
          user: firebaseUser,
          profile: profileSnapshot.exists() ? profileSnapshot.data() : null,
        });
      } catch (error) {
        console.error("Unable to load user profile", error);
        setState({ status: "ready", user: firebaseUser, profile: null });
      }
    });
  }, []);

  return state;
}

function AuthScreen({ mode = "login" }) {
  const isSignup = mode === "signup";
  const { status, user, profile } = useSessionUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status !== "ready" || !user) return;
    window.location.hash = profile || user.isDemo ? "#teacher" : "#about-you";
  }, [status, user, profile]);

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");
    setBusy(true);

    try {
      if (!isSignup && email.trim().toLowerCase() === "demo@zoo") {
        window.localStorage.setItem(demoSessionKey, "active");
        window.location.hash = "#teacher";
        return;
      }

      window.localStorage.removeItem(demoSessionKey);

      if (!password.trim()) {
        setNotice("Please enter your password.");
        return;
      }

      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        window.location.hash = "#about-you";
        return;
      }

      await signInWithEmailAndPassword(auth, email.trim(), password);
      window.location.hash = "#teacher";
    } catch (error) {
      console.error("Auth flow failed", error);
      setNotice(error.message || "Unable to complete authentication.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="site-logo auth-logo" href={routePath()} aria-label="Wildly home">
          <img src={assets.wildlyLogo} alt="Wildly by Taronga" />
        </a>
        <span className="audience-pill">{isSignup ? "Create account" : "Welcome back"}</span>
        <h1>{isSignup ? "Get started with Wildly" : "Log in to Wildly"}</h1>
        <p>{isSignup ? "Create your account first, then complete your educator profile on the next page." : "Use your email and password to access your teacher workspace."}</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={isSignup ? "you@school.edu" : "Enter your email"} autoComplete="email" required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete={isSignup ? "new-password" : "current-password"} />
          </label>
          {!isSignup ? <p className="auth-helper">Use `demo@zoo` to enter the demo teacher account instantly.</p> : null}
          {notice ? <p className="auth-error">{notice}</p> : null}
          <button type="submit" disabled={busy}>{busy ? "Working..." : isSignup ? "Continue" : "Log in"}</button>
        </form>
        <div className="auth-links">
          {isSignup ? <a href={loginRoute()}>Already have an account? Log in</a> : <a href={signupRoute()}>Need an account? Get started</a>}
          <a href={routePath("staff")}>Taronga staff login</a>
        </div>
      </section>
    </main>
  );
}

function AboutYouPage() {
  const { status, user, profile } = useSessionUser();
  const [form, setForm] = useState({
    name: "",
    country: "Australia",
    role: "Teacher",
    schoolSearch: "",
    schoolManual: "",
    cantFindSchool: false,
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (profile) {
      setForm((current) => ({
        ...current,
        name: profile.name || "",
        country: profile.country || "Australia",
        role: profile.role || "Teacher",
        schoolSearch: schoolOptions.includes(profile.school) ? profile.school : "",
        schoolManual: schoolOptions.includes(profile.school) ? "" : (profile.school || ""),
        cantFindSchool: profile.school ? !schoolOptions.includes(profile.school) : false,
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (status === "ready" && !user) {
      window.location.hash = "#get-started";
    }
  }, [status, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user || user.isDemo) {
      window.location.hash = "#teacher";
      return;
    }

    const school = form.cantFindSchool ? form.schoolManual.trim() : form.schoolSearch.trim();
    if (!school) {
      setNotice("Please select your school or type it in.");
      return;
    }

    setBusy(true);
    setNotice("");

    try {
      await setDoc(doc(db, "users", user.uid), {
        name: form.name.trim(),
        country: form.country.trim(),
        role: form.role,
        school,
        email: user.email,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      window.location.hash = "#teacher";
    } catch (error) {
      console.error("Unable to save profile", error);
      setNotice(error.message || "Unable to save your profile.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return <main className="auth-page"><section className="auth-card"><p>Loading your profile...</p></section></main>;
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">
        <a className="site-logo auth-logo" href={routePath()} aria-label="Wildly home">
          <img src={assets.wildlyLogo} alt="Wildly by Taronga" />
        </a>
        <span className="audience-pill">About you</span>
        <h1>Tell us about you</h1>
        <p>This profile shapes the teacher experience and helps us personalise school content.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-grid">
            <label>
              Name
              <input type="text" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Your full name" required />
            </label>
            <label>
              Country
              <input type="text" value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} placeholder="Country" required />
            </label>
            <label>
              I am
              <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
                {["Teacher", "School Leader", "Parent", "Student", "Curriculum Leader", "Education Staff"].map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
            <label>
              Search for school
              <input list="school-options" value={form.schoolSearch} onChange={(event) => setForm((current) => ({ ...current, schoolSearch: event.target.value }))} placeholder="Start typing your school" disabled={form.cantFindSchool} />
              <datalist id="school-options">
                {schoolOptions.map((school) => <option key={school} value={school} />)}
              </datalist>
            </label>
          </div>

          <label className="checkbox-row">
            <input type="checkbox" checked={form.cantFindSchool} onChange={(event) => setForm((current) => ({ ...current, cantFindSchool: event.target.checked }))} />
            Can't find school
          </label>

          {form.cantFindSchool ? (
            <label>
              School name
              <input type="text" value={form.schoolManual} onChange={(event) => setForm((current) => ({ ...current, schoolManual: event.target.value }))} placeholder="Type your school name" required />
            </label>
          ) : null}

          {notice ? <p className="auth-error">{notice}</p> : null}
          <button type="submit" disabled={busy}>{busy ? "Saving..." : "Finish setup"}</button>
        </form>
      </section>
    </main>
  );
}

function LandingPage() {
  return (
    <>
      <header className="site-header">
        <a className="site-logo" href={routePath()} aria-label="Wildly by Taronga home"><img src={assets.wildlyLogo} alt="Wildly by Taronga" /></a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#about">About</a><a href="#subjects">Subjects</a><a href="#paths">Learning Paths</a><a href="#tracka">Tracka</a><a href="#schools">Schools</a>
        </nav>
        <div className="header-actions"><a className="login-link" href={loginRoute()}>Log in</a><a className="start-link" href={signupRoute()}>Get started</a></div>
      </header>
      <main>
        <section className="hero-section" id="about">
          <div className="hero-copy">
            <span className="audience-pill">For teachers and schools</span>
            <h1>Learning through nature</h1>
            <p className="hero-subtitle">Inspire curiosity. Create change.</p>
            <p>Curriculum-aligned lessons, real-world experiences and conservation connections - for every learner, everywhere.</p>
            <div className="hero-actions"><a className="primary-action" href={signupRoute()}>Get started free</a><a className="secondary-action" href={teacherPreviewRoute()}>Explore subjects</a></div>
            <div className="alignment-list" aria-label="Curriculum alignment">
              <p className="alignment-note"><Icon type="book" className="alignment-icon" />Aligned to NSW and Australian curriculums (Early Stage 1 - Stage 6)</p>
              <p className="alignment-note"><Icon type="blocks" className="alignment-icon" />Aligned to the Early Years Learning Framework (Pre-School)</p>
            </div>
          </div>
          <div className="device-stage" aria-label="Wildly teacher dashboard preview">
            <div className="laptop"><div className="laptop-screen"><iframe className="teacher-preview" src={teacherPreviewRoute()} title="Wildly teacher dashboard preview" tabIndex="-1"></iframe></div><div className="laptop-base"></div></div>
            <div className="phone"><img src={assets.heroKoala} alt="" /><h3>Adaptations of Australian Animals</h3><p>Ready to assign</p><a href={teacherPreviewRoute()}>View resource</a></div>
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
          <div className="section-heading"><h2>Explore by subject</h2><a href={teacherPreviewRoute()}>View all subjects</a></div>
          <div className="subject-strip">
            {subjects.map(([label, cls, copy]) => <a className={cls} href={teacherPreviewRoute()} key={label}><Icon type={subjectIconType(label)} className="" /><strong>{label}</strong><span>{copy}</span></a>)}
          </div>
        </section>
        <section className="journey-section" id="paths">
          <div className="section-heading"><div><h2>A learning journey, connected to nature</h2><p>Wildly makes it easy to connect classroom learning with authentic experiences.</p></div></div>
          <div className="journey-line">{["Pre-visit learning", "At the zoo", "Tracka missions", "Post-visit reflection"].map((title, index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{["Build background knowledge and curiosity before your excursion.", "Engage in guided experiences and real-world investigation.", "Take action with live data, citizen science and reflective tasks.", "Consolidate learning and connect back to curriculum outcomes."][index]}</p></article>)}</div>
        </section>
        <section className="trust-row" id="tracka">
          <article><a className="trust-action" href={appLinks.tracka || appLinks.excursions}><img src={assets.trackaLogo} alt="Taronga Tracka" /><span>Proudly connected with Taronga Tracka</span></a></article>
          <article><Icon type="book" className="" /><span>Aligned to NSW and Australian curriculums (Early Stage 1 - Stage 6)</span></article>
          <article><Icon type="blocks" className="" /><span>Aligned to the Early Years Learning Framework (Pre-School)</span></article>
          <article><Icon type="bookmark" className="" /><span>Secure, reliable teacher resources</span></article>
        </section>
        <section className="cta-section" id="schools"><img src={assets.heroKoala} alt="Koala with joey" /><div><h2>Bring learning to life through nature</h2><p>Join thousands of educators using Wildly to inspire the next generation to care for nature - together.</p><div className="hero-actions"><a className="primary-action" href={signupRoute()}>Get started free</a><a className="secondary-action" href={appLinks.demoBooking}>Book a demo</a></div></div></section>
        <footer className="site-footer"><div className="footer-links"><a className="staff-login" href={routePath("staff")}>TARONGA STAFF LOGIN</a></div></footer>
      </main>
    </>
  );
}

function TeacherDashboard({ config, contentItems = defaultContentItems.map(resolveContentItem), professionalLearningItems = defaultProfessionalLearningItems, tarongaTvVideos = defaultTarongaTvVideos.map(resolveTarongaTvVideo), page = "dashboard", subject = "", contentId = "", tvVideoId = "", profile = null, onSignOut = null, preview = false }) {
  const [activeSubject, setActiveSubject] = useState(subjectFromSlug(subject));
  const [activeTvCategory, setActiveTvCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const routeSubject = subjectFromSlug(subject);

  useEffect(() => {
    setActiveSubject(routeSubject);
  }, [routeSubject]);

  const publishedItems = useMemo(() => contentItems.filter((item) => item.status === "Published"), [contentItems]);
  const learningPaths = useMemo(() => publishedItems.filter((item) => item.type === "Learning Path"), [publishedItems]);
  const lessons = useMemo(() => publishedItems.filter((item) => item.type === "Lesson"), [publishedItems]);
  const resources = useMemo(() => publishedItems.filter((item) => item.type === "Resource"), [publishedItems]);
  const filteredItems = useMemo(() => publishedItems.filter((item) => {
    const matchesSubject = !activeSubject || item.subject === activeSubject;
    const haystack = `${item.title} ${item.subject} ${item.stage} ${item.type} ${item.summary} ${item.description}`.toLowerCase();
    return matchesSubject && haystack.includes(query.toLowerCase());
  }), [activeSubject, publishedItems, query]);
  const visibleResources = useMemo(() => publishedItems.filter((item) => {
    const matchesSubject = !activeSubject || item.subject === activeSubject;
    const haystack = `${item.title} ${item.subject} ${item.stage} ${item.type}`.toLowerCase();
    return matchesSubject && haystack.includes(query.toLowerCase());
  }).slice(0, 3), [activeSubject, publishedItems, query]);
  const contentDetail = publishedItems.find((item) => item.id === contentId) || null;
  const publishedTarongaTvVideos = useMemo(() => tarongaTvVideos.filter((item) => item.status === "Published"), [tarongaTvVideos]);
  const filteredTarongaTvVideos = useMemo(() => publishedTarongaTvVideos.filter((item) => {
    const matchesSubject = !activeSubject || item.subject === activeSubject;
    const matchesCategory = activeTvCategory === "All" || (item.categories || []).includes(activeTvCategory);
    const haystack = `${item.title} ${item.subject} ${item.stage} ${item.summary} ${item.description} ${(item.outcomeCodes || []).join(" ")}`.toLowerCase();
    return matchesSubject && matchesCategory && haystack.includes(query.toLowerCase());
  }), [activeSubject, activeTvCategory, publishedTarongaTvVideos, query]);
  const featuredTarongaTvVideo = filteredTarongaTvVideos[0] || publishedTarongaTvVideos[0] || null;
  const tarongaTvDetail = publishedTarongaTvVideos.find((item) => item.id === tvVideoId) || null;
  const contentDownloads = contentDetail ? buildContentDownloads(contentDetail) : [];
  const tarongaTvDownloads = tarongaTvDetail?.downloadLinks || [];
  const allResourceItems = [...lessons, ...resources];
  const navItems = [
    ["", "Dashboard", "grid"],
    ["classes", "My Classes", "users"],
    ["students", "Students", "cap"],
    ["reports", "Reports", "report"],
    ["saved", "Saved", "bookmark"],
    ["calendar", "Calendar", "calendar"],
  ];
  const teacherClasses = [
    { title: "Year 3 Blue", detail: "26 students · Stage 2 focus", action: "Open students", href: teacherRoute("students") },
    { title: "Year 4 Green", detail: "24 students · upcoming zoo visit", action: "Open calendar", href: teacherRoute("calendar") },
    { title: "Stage 3 Extension", detail: "12 students · inquiry project", action: "View reports", href: teacherRoute("reports") },
  ];
  const studentSnapshots = [
    ["Ava Wilson", "Needs support with data interpretation", "Stage 2 science"],
    ["Noah Patel", "Ready for extension in persuasive writing", "Stage 3 English"],
    ["Mia Brown", "Completed Tracka mission reflection", "PDHPE / Science"],
  ];
  const reportSnapshots = [
    ["Curriculum coverage", "146 mapped outcomes across live content"],
    ["Highest engagement", "Science, HSIE and Technology & STEM this month"],
    ["Recommended action", "Publish more Stage 2 resources before the next zoo visit"],
  ];
  const publishedProfessionalLearningItems = professionalLearningItems.filter((item) => item.status !== "Draft");
  const professionalLearningLinksById = Object.fromEntries(
    publishedProfessionalLearningItems.map((item) => [item.id, buildProfessionalLearningLinks(item)]),
  );
  const nextProfessionalLearning = publishedProfessionalLearningItems[0] || null;
  const notificationItems = publishedProfessionalLearningItems.slice(0, 3);
  const showContinue = config.showContinueLearning;
  const showUpcoming = config.showUpcomingPanel;
  const showTracka = config.showTrackaCard;

  function openPrimaryContent(item) {
    const primaryLink = contentPrimaryLink(item);
    if (primaryLink) {
      window.open(primaryLink, "_blank", "noopener,noreferrer");
      return;
    }

    setNotice(`${item.title} is ready for content links, but the primary lesson/resource URL still needs to be added.`);
  }

  function resetFilters() {
    setActiveSubject(null);
    setActiveTvCategory("All");
    setQuery("");
  }

  const pageMeta = {
    subjects: {
      eyebrow: "Subjects",
      title: activeSubject || "All Subjects",
      description: `${filteredItems.length} published items ready for teachers to browse and assign.`,
      action: <button type="button" className="secondary-action" onClick={resetFilters}>Clear filters</button>,
    },
    paths: {
      eyebrow: "Learning Paths",
      title: "Units and teaching sequences",
      description: "Open a full learning path, review outcomes and move straight into attached lessons.",
      action: <a className="secondary-action" href={teacherRoute("subjects")}>Browse subjects</a>,
    },
    "professional-learning": {
      eyebrow: "Professional Learning",
      title: "Teacher webinars and learning sessions",
      description: "Upcoming professional learning sessions, registrations, supporting information and downloadable PDFs all live here.",
      action: <a className="secondary-action" href={teacherRoute("calendar")}>Open calendar</a>,
    },
    "taronga-tv": {
      eyebrow: "Taronga TV",
      title: tarongaTvDetail ? tarongaTvDetail.title : "Video learning and classroom viewing",
      description: tarongaTvDetail ? (tarongaTvDetail.summary || tarongaTvDetail.description) : "Curriculum-aligned videos with linked outcomes, lessons, learning paths and timed discussion prompts for teachers.",
      action: tarongaTvDetail ? <a className="secondary-action" href={teacherTvRoute()}>Back to Taronga TV</a> : <button type="button" className="secondary-action" onClick={resetFilters}>Clear filters</button>,
    },
    resources: {
      eyebrow: "Resources",
      title: "Lessons and downloadable resources",
      description: "Everything published in the teacher library, ready to preview, assign or open.",
      action: <a className="secondary-action" href={teacherRoute("subjects")}>Filter by subject</a>,
    },
    classes: {
      eyebrow: "My Classes",
      title: "Teaching groups",
      description: "Class planning, assignment and review should live here as a full workflow rather than a dashboard widget.",
      action: <button type="button" className="secondary-action" onClick={() => setNotice("Class creation placeholder. Add your real class management flow here.")}>Create class</button>,
    },
    students: {
      eyebrow: "Students",
      title: "Learner overview",
      description: "Track support needs, extension opportunities and completion at a glance.",
      action: <button type="button" className="secondary-action" onClick={() => setNotice("Student export placeholder. Add CSV export or SIS sync here.")}>Export students</button>,
    },
    reports: {
      eyebrow: "Reports",
      title: "Teacher reporting",
      description: "Curriculum coverage, engagement and next-step recommendations should read as a proper reporting page.",
      action: <button type="button" className="secondary-action" onClick={() => downloadTextFile("wildly-teacher-report.csv", "metric,value\nCurriculum coverage,146\nBelow expected,18%\nAt expected,57%\nAbove expected,25%\n", "text/csv;charset=utf-8")}>Download sample CSV</button>,
    },
    saved: {
      eyebrow: "Saved",
      title: "Saved for later",
      description: "This page is ready for bookmarks, pinned lessons and draft assignment collections.",
      action: null,
    },
    calendar: {
      eyebrow: "Calendar",
      title: "Upcoming dates",
      description: "Assignments, excursions and Tracka missions can all surface here as a full planning page.",
      action: <button type="button" className="secondary-action" onClick={() => setNotice("Calendar sync placeholder. Add Google Calendar, Outlook or school calendar sync here.")}>Connect calendar</button>,
    },
  }[page];
  const displayName = profile?.name || "Mr. Thompson";
  const displayRole = profile?.role || "Teacher";
  const profileInitials = createInitials(displayName);

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Teacher navigation">
        <a className="brand" href={routePath()} aria-label="Wildly by Taronga dashboard">
          <img className="brand-logo" src={assets.wildlyLogo} alt="Wildly by Taronga - Learning through nature" />
        </a>
        <nav className="main-nav">
          {navItems.map(([path, label, icon]) => (
            <a className={`nav-item ${page === (path || "dashboard") ? "active" : ""}`} key={label} href={teacherRoute(path)}>
              <Icon type={icon} />
              {label}
            </a>
          ))}
        </nav>
        <section className="side-section" aria-labelledby="subjects-title">
          <h2 id="subjects-title">Subject Areas</h2>
          {subjects.map(([label, cls]) => (
            <a className={`subject-link ${cls}`} data-filter={label} key={label} href={teacherRoute(`subjects/${subjectSlug(label)}`)}>
              <Icon type={subjectIconType(label)} className="subject-svg" />
              {label}
            </a>
          ))}
        </section>
        <section className="side-section" aria-labelledby="explore-title">
          <h2 id="explore-title">Explore</h2>
          <a className="nav-item small" href={teacherRoute("professional-learning")}><Icon type="book" />Professional Learning</a>
          <a className="nav-item small" href={appLinks.excursions}><Icon type="pin" />Excursions & Zoo Links</a>
          <a className="nav-item small" href={appLinks.tracka || appLinks.excursions}><Icon type="target" />Tracka Missions<span className="external"></span></a>
        </section>
        {showTracka && (
          <article className="tracka-card">
            <img className="tracka-logo" src={assets.trackaLogo} alt="Taronga Tracka" />
            <div>
              <strong>Connected to Taronga Tracka</strong>
              <p>Extend learning beyond your visit with real data and citizen science.</p>
              <a className="inline-action" href={appLinks.tracka || appLinks.excursions}>Go to Tracka</a>
            </div>
          </article>
        )}
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button className="menu-button" type="button" aria-label="Open navigation" onClick={() => setNotice("Mobile menu placeholder. The sidebar is the main navigation for now.")}></button>
          <nav className="top-links" aria-label="Primary">
            <a className={page === "dashboard" ? "selected" : ""} href={teacherRoute()}>Dashboard</a>
            <a className={page === "resources" ? "selected" : ""} href={teacherRoute("resources")}>Resources</a>
            <a className={page === "taronga-tv" ? "selected" : ""} href={teacherRoute("taronga-tv")}>Taronga TV</a>
            <a className={page === "professional-learning" ? "selected" : ""} href={teacherRoute("professional-learning")}>Professional Learning</a>
          </nav>
          <div className="top-actions">
            {!preview && onSignOut ? <button type="button" className="top-text-action" onClick={onSignOut}>Sign out</button> : null}
            <button type="button" className="top-icon-button" aria-label="Notifications" onClick={() => setNotice(notificationItems.length ? notificationItems.map((item) => `${item.title} - ${item.date}${item.time ? `, ${item.time}` : ""}`).join("\n") : "No new professional learning notifications yet.")}>
              <Icon type="bell" className="" />
            </button>
            <a className="icon-button help" aria-label="Help" href={appLinks.support}></a>
            <button type="button" className="profile-button" onClick={() => setNotice("Profile placeholder: account settings and class preferences can sit here.")}>
              <span>{profileInitials}</span>
              <strong>{displayName}</strong>
              <small>{displayRole}</small>
            </button>
          </div>
        </header>

        <NoticeBanner notice={notice} onClose={() => setNotice("")} />

        {page === "dashboard" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <h1>{config.heroTitle}</h1>
                <p className="hero-subtitle">{config.heroSubtitle}</p>
                <p>Curriculum-aligned lessons, real-world experiences and conservation connections - for every learner, everywhere.</p>
                <div className="hero-actions">
                  <a className="primary-action" href={teacherRoute("subjects")}>Browse Subjects</a>
                  <a className="secondary-action" href={teacherRoute("paths")}><Icon type="path" className="path-action-icon" />Start a Learning Path</a>
                </div>
              </div>
              <img className="hero-animal" src={config.heroImageUrl} alt="Koala with joey at Taronga" />
            </section>

            <section className="library-head">
              <div>
                <h2>Explore by Subject</h2>
                <p>Filter the teacher library by curriculum area, stage and resource type.</p>
              </div>
              <label className="search-box">
                <span></span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search resources" />
              </label>
              <button type="button" className="text-link" onClick={resetFilters}>View All Subjects</button>
            </section>

            <section className="subject-grid" aria-label="Subject cards">
              {subjects.map(([label, cls, copy]) => (
                <a className={`subject-card ${cls} ${activeSubject === label ? "selected" : ""}`} key={label} href={teacherRoute(`subjects/${subjectSlug(label)}`)}>
                  <Icon type={subjectIconType(label)} className="subject-icon" />
                  <h3>{label}</h3>
                  <p>{copy}</p>
                  <span className="subject-card-cta">Explore</span>
                </a>
              ))}
            </section>

            <div className="dashboard-columns">
              <section className="content-column">
                {showContinue && (
                  <>
                    <div className="section-title-row">
                      <h2>Continue Learning</h2>
                      <a className="text-link" href={teacherRoute("resources")}>View all</a>
                    </div>
                    <section className="learning-grid" aria-live="polite">
                      {visibleResources.map((resource, index) => (
                        <article className="learning-card" key={resource.title}>
                          <img src={resource.image} alt="" />
                          <div className="learning-body">
                            <span className="pill">{resource.subject}</span>
                            <h3>{index === 0 ? config.featuredResourceTitle : resource.title}</h3>
                            <p>{resource.type} - {resource.stage}</p>
                            <div className="progress-row">
                              <div className="progress-track"><span style={{ width: `${resource.progress}%` }}></span></div>
                              <small>{resource.progress}% Complete</small>
                            </div>
                            <a className="inline-action" href={teacherContentRoute(resource.id)}>Continue</a>
                          </div>
                        </article>
                      ))}
                    </section>
                  </>
                )}

                <div className="section-title-row news-title">
                  <h2>What's New on Wildly</h2>
                  <a className="text-link" href={teacherRoute("resources")}>View all</a>
                </div>
                <section className="news-grid">
                  <a className="news-card blue" href={teacherContentRoute((resources[0] || publishedItems[0])?.id || "")}>
                    <img src={assets.rhino} alt="" />
                    <div>
                      <span>New Resource</span>
                      <h3>Voices for Country</h3>
                      <p>First Nations perspectives for Stage 3 inquiry.</p>
                    </div>
                  </a>
                  <a className="news-card purple" href={teacherRoute("professional-learning")}>
                    <img src={assets.gorilla} alt="" />
                    <div>
                      <span>Professional Learning</span>
                      <h3>Learning with Impact</h3>
                      <p>Plan lessons around conservation action.</p>
                    </div>
                  </a>
                  <a className="news-card green" href={teacherContentRoute((learningPaths[0] || publishedItems[0])?.id || "")}>
                    <img src={assets.binturong} alt="" />
                    <div>
                      <span>New Learning Path</span>
                      <h3>Sustainable Futures</h3>
                      <p>Build a full sequence across Science and HSIE.</p>
                    </div>
                  </a>
                </section>
              </section>

              {showUpcoming && (
                <aside className="upcoming-panel" aria-labelledby="upcoming-title">
                  <div className="section-title-row">
                    <h2 id="upcoming-title">Upcoming</h2>
                    <a className="text-link" href={teacherRoute("calendar")}>View Calendar</a>
                  </div>
                  <a className="event-card" href={appLinks.excursions}>
                    <img src={assets.giraffe} alt="" />
                    <div>
                      <span className="event-tag">Excursion</span>
                      <h3>Taronga Zoo Visit - Biodiversity in Action</h3>
                      <p>Tue 8 Jun - 9:30am</p>
                    </div>
                  </a>
                  <a className="event-card icon-event" href={appLinks.tracka || appLinks.excursions}>
                    <span className="target-icon"></span>
                    <div>
                      <span className="event-tag live">Live</span>
                      <h3>Tracka Mission - Citizen Science Challenge</h3>
                      <p>Fri 21 Jun - 11:00am</p>
                    </div>
                  </a>
                  <a className="event-card icon-event" href={teacherContentRoute((lessons[0] || publishedItems[0])?.id || "")}>
                    <span className="leaf-badge"></span>
                    <div>
                      <span className="event-tag due">Due</span>
                      <h3>Creative Writing: Inspired by Nature</h3>
                      <p>Mon 24 Jun - 11:59pm</p>
                    </div>
                  </a>
                  {nextProfessionalLearning ? (
                    <a className="event-card icon-event" href={teacherRoute("professional-learning")}>
                      <span className="target-icon"></span>
                      <div>
                        <span className="event-tag live">PL</span>
                        <h3>{nextProfessionalLearning.title}</h3>
                        <p>{nextProfessionalLearning.date}{nextProfessionalLearning.time ? ` - ${nextProfessionalLearning.time}` : ""}</p>
                      </div>
                    </a>
                  ) : null}
                  <article className="difference-card">
                    <span className="mini-mark" aria-hidden="true"></span>
                    <div>
                      <h3>Learning that makes a difference</h3>
                      <p>Inspiring the next generation to care for nature - together.</p>
                    </div>
                  </article>
                </aside>
              )}
            </div>
          </>
        )}

        {pageMeta && page !== "dashboard" && page !== "content" && (
          <section className="workspace-page">
            <div className="workspace-page-header">
              <div>
                <span className="content-type">{pageMeta.eyebrow}</span>
                <h1>{pageMeta.title}</h1>
                <p>{pageMeta.description}</p>
              </div>
              <div className="workspace-page-actions">{pageMeta.action}</div>
            </div>

            {(page === "subjects" || page === "resources" || page === "taronga-tv") && !tarongaTvDetail && (
              <div className="workspace-page-toolbar">
                <label className="search-box">
                  <span></span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder={page === "taronga-tv" ? "Search videos" : "Search resources"} />
                </label>
                <div className="page-chip-row">
                  {page === "taronga-tv" ? (
                    <>
                      <button type="button" className={`page-chip ${!activeSubject ? "selected" : ""}`} onClick={() => setActiveSubject(null)}>All</button>
                      {subjects.map(([label]) => (
                        <button type="button" className={`page-chip ${activeSubject === label ? "selected" : ""}`} key={label} onClick={() => setActiveSubject(label)}>
                          {label}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      <a className={`page-chip ${!activeSubject ? "selected" : ""}`} href={teacherRoute("subjects")}>All</a>
                      {subjects.map(([label]) => (
                        <a className={`page-chip ${activeSubject === label ? "selected" : ""}`} key={label} href={teacherRoute(`subjects/${subjectSlug(label)}`)}>
                          {label}
                        </a>
                      ))}
                    </>
                  )}
                </div>
                {page === "taronga-tv" ? (
                  <div className="page-chip-row">
                    <button type="button" className={`page-chip ${activeTvCategory === "All" ? "selected" : ""}`} onClick={() => setActiveTvCategory("All")}>All playlists</button>
                    {tarongaTvCategories.map((category) => (
                      <button type="button" className={`page-chip ${activeTvCategory === category ? "selected" : ""}`} key={category} onClick={() => setActiveTvCategory(category)}>
                        {category}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </section>
        )}

        {page === "subjects" && (
          <section className="teacher-panel">
            <div className="teacher-library-grid">
              {filteredItems.length ? filteredItems.map((item) => (
                <article className="teacher-library-card" key={item.id || item.title}>
                  <img src={item.image} alt="" />
                  <div>
                    <span className="pill">{item.type}</span>
                    <h3>{item.title}</h3>
                    <p>{item.summary || item.description}</p>
                    <small>{item.subject} - {item.stage}</small>
                    <div className="teacher-card-actions">
                      <a className="primary-action" href={teacherContentRoute(item.id)}>Open</a>
                      <button type="button" className="secondary-action" onClick={() => setNotice("Assignment placeholder. Connect this to your class assignment flow next.")}>Assign</button>
                    </div>
                  </div>
                </article>
              )) : (
                <article className="placeholder-card">
                  <h3>No content matches this filter yet</h3>
                  <p>Try another subject, clear the search, or add more published content from the staff console.</p>
                </article>
              )}
            </div>
          </section>
        )}

        {page === "paths" && (
          <section className="teacher-panel">
            <div className="teacher-library-grid">
              {learningPaths.length ? learningPaths.map((item) => (
                <article className="teacher-library-card" key={item.id || item.title}>
                  <img src={item.image} alt="" />
                  <div>
                    <span className="pill">{item.subject}</span>
                    <h3>{item.title}</h3>
                    <p>{item.summary || item.description}</p>
                    <small>{item.durationWeeks || 0} weeks · {item.lessonIds?.length || 0} lessons</small>
                    <div className="teacher-card-actions">
                      <a className="primary-action" href={teacherContentRoute(item.id)}>Open path</a>
                      <button type="button" className="secondary-action" onClick={() => setNotice("Assign path placeholder. Connect this to your class assignment workflow next.")}>Assign</button>
                    </div>
                  </div>
                </article>
              )) : (
                <article className="placeholder-card">
                  <h3>No learning paths published yet</h3>
                  <p>Create and publish a learning path from the staff Content tab to surface it here.</p>
                </article>
              )}
            </div>
          </section>
        )}

        {page === "taronga-tv" && !tarongaTvDetail && (
          <>
            {featuredTarongaTvVideo ? (
              <section className="teacher-panel tv-feature-panel">
                <article className="tv-feature-card">
                  <img src={featuredTarongaTvVideo.thumbnail} alt="" />
                  <div className="tv-feature-copy">
                    <span className="pill">Featured video</span>
                    <h2>{featuredTarongaTvVideo.title}</h2>
                    <p>{featuredTarongaTvVideo.description || featuredTarongaTvVideo.summary}</p>
                    <div className="tv-meta-row">
                      <small>{featuredTarongaTvVideo.subject}</small>
                      <small>{featuredTarongaTvVideo.stage}</small>
                      {featuredTarongaTvVideo.duration ? <small>{featuredTarongaTvVideo.duration}</small> : null}
                      {featuredTarongaTvVideo.categories?.map((category) => <small key={category}>{category}</small>)}
                    </div>
                    <div className="teacher-card-actions">
                      <a className="primary-action" href={teacherTvRoute(featuredTarongaTvVideo.id)}>Watch and teach</a>
                      {featuredTarongaTvVideo.lessonIds?.[0] ? <a className="secondary-action" href={teacherContentRoute(featuredTarongaTvVideo.lessonIds[0])}>Open linked lesson</a> : null}
                    </div>
                  </div>
                </article>
              </section>
            ) : null}

            <section className="teacher-panel">
              <div className="teacher-library-grid tv-library-grid">
                {filteredTarongaTvVideos.length ? filteredTarongaTvVideos.map((video) => (
                  <article className="teacher-library-card tv-library-card" key={video.id || video.title}>
                    <div className="tv-thumb-wrap">
                      <img src={video.thumbnail} alt="" />
                      <span className="tv-play-chip"><Icon type="play" className="" /></span>
                    </div>
                    <div>
                      <span className="pill">{video.subject}</span>
                      <h3>{video.title}</h3>
                      <p>{video.summary}</p>
                      <small>{video.stage}</small>
                      {video.duration ? <small>{video.duration}</small> : null}
                      {video.outcomeCodes?.length ? <small>{video.outcomeCodes.length} outcomes</small> : null}
                      {video.categories?.length ? <small>{video.categories.join(" · ")}</small> : null}
                      <div className="teacher-card-actions">
                        <a className="primary-action" href={teacherTvRoute(video.id)}>Open video</a>
                        {video.lessonIds?.[0] ? <a className="secondary-action" href={teacherContentRoute(video.lessonIds[0])}>Linked lesson</a> : null}
                      </div>
                    </div>
                  </article>
                )) : (
                  <article className="placeholder-card">
                    <h3>No Taronga TV videos match this filter yet</h3>
                    <p>Try another subject, clear the search, or publish videos from the staff console.</p>
                  </article>
                )}
              </div>
            </section>
          </>
        )}

        {page === "taronga-tv" && tarongaTvDetail && (
          <section className="teacher-panel teacher-detail-page tv-detail-page">
            <div className="teacher-panel-header">
              <div>
                <span className="content-type">Taronga TV</span>
                <h2>{tarongaTvDetail.title}</h2>
                <p>{tarongaTvDetail.description || tarongaTvDetail.summary}</p>
              </div>
              <a className="secondary-action" href={teacherTvRoute()}>Back to Taronga TV</a>
            </div>

            <div className="tv-detail-layout">
              <article className="tv-player-card">
                <div className="tv-embed-shell">
                  {tarongaTvDetail.embedUrl ? (
                    <iframe
                      src={tarongaTvDetail.embedUrl}
                      title={tarongaTvDetail.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="tv-embed-placeholder">
                      <Icon type="play" className="" />
                      <p>Add an embed URL in the staff console to display the video here.</p>
                    </div>
                  )}
                </div>
                <div className="tv-detail-actions">
                  {tarongaTvDetail.lessonIds?.[0] ? <a className="secondary-action" href={teacherContentRoute(tarongaTvDetail.lessonIds[0])}>Open linked lesson</a> : null}
                  {tarongaTvDetail.learningPathIds?.[0] ? <a className="secondary-action" href={teacherContentRoute(tarongaTvDetail.learningPathIds[0])}>Open learning path</a> : null}
                </div>
              </article>

              <aside className="tv-side-panel">
                <div className="tv-info-card">
                  <h3>Video details</h3>
                  <div className="detail-meta">
                    <small>{tarongaTvDetail.subject}</small>
                    <small>{tarongaTvDetail.stage}</small>
                    {tarongaTvDetail.duration ? <small>{tarongaTvDetail.duration}</small> : null}
                    {tarongaTvDetail.categories?.map((category) => <small key={category}>{category}</small>)}
                  </div>
                  {tarongaTvDetail.summary ? <p>{tarongaTvDetail.summary}</p> : null}
                </div>

                {tarongaTvDetail.outcomeCodes?.length ? (
                  <div className="tv-info-card">
                    <h3>Linked outcomes</h3>
                    <ul className="tv-list">
                      {tarongaTvDetail.outcomeCodes.map((outcome) => <li key={outcome}>{outcome}</li>)}
                    </ul>
                  </div>
                ) : null}

                {tarongaTvDownloads.length ? (
                  <div className="tv-info-card">
                    <LinkSection links={tarongaTvDownloads} />
                  </div>
                ) : null}

                {tarongaTvDetail.discussionPoints?.length ? (
                  <div className="tv-info-card">
                    <h3>Discussion points</h3>
                    <ul className="tv-discussion-list">
                      {tarongaTvDetail.discussionPoints.map((point, index) => (
                        <li key={`${point.time}-${index}`}>
                          <strong>{point.time || "Pause point"}</strong>
                          <p>{point.prompt}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </aside>
            </div>
          </section>
        )}

        {page === "professional-learning" && (
          <>
            <section className="teacher-summary-grid page-summary-grid">
              {publishedProfessionalLearningItems.length ? publishedProfessionalLearningItems.map((item) => (
                <article key={item.id} className="summary-card">
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <small>{item.date}{item.time ? ` · ${item.time}` : ""}</small>
                </article>
              )) : (
                <article className="summary-card">
                  <h3>No sessions scheduled</h3>
                  <p>Professional learning events created by staff will appear here.</p>
                </article>
              )}
            </section>
            <section className="teacher-panel">
              <div className="teacher-library-grid">
                {publishedProfessionalLearningItems.length ? publishedProfessionalLearningItems.map((item) => (
                  <article key={item.id} className="teacher-library-card">
                    <img src={assets.gorilla} alt="" />
                    <div>
                      <span className="pill">Professional Learning</span>
                      <h3>{item.title}</h3>
                      <p>{item.description || item.summary}</p>
                      <small>{item.date}{item.time ? ` - ${item.time}` : ""}</small>
                      <div className="teacher-card-actions">
                        {item.registrationUrl ? <a className="primary-action" href={item.registrationUrl} target="_blank" rel="noreferrer">Open registration</a> : <button type="button" className="primary-action" onClick={() => setNotice("Add a registration link in the staff portal to activate this button.")}>Registration needed</button>}
                      </div>
                      <LinkSection links={professionalLearningLinksById[item.id] || []} />
                    </div>
                  </article>
                )) : (
                  <article className="placeholder-card">
                    <h3>No professional learning sessions published yet</h3>
                    <p>Create upcoming sessions in the staff portal and they will appear here automatically.</p>
                  </article>
                )}
              </div>
            </section>
          </>
        )}

        {page === "resources" && (
          <section className="teacher-panel">
            <div className="teacher-library-grid">
              {allResourceItems.length ? allResourceItems.map((item) => (
                <article className="teacher-library-card" key={item.id || item.title}>
                  <img src={item.image} alt="" />
                  <div>
                    <span className="pill">{item.type}</span>
                    <h3>{item.title}</h3>
                    <p>{item.summary || item.description}</p>
                    <small>{item.subject} - {item.stage}</small>
                    <div className="teacher-card-actions">
                      <a className="primary-action" href={teacherContentRoute(item.id)}>Open</a>
                      <button type="button" className="secondary-action" onClick={() => setNotice("Assign resource placeholder. Hook this up to class assignment when you are ready.")}>Assign</button>
                    </div>
                  </div>
                </article>
              )) : (
                <article className="placeholder-card">
                  <h3>No published lessons or resources yet</h3>
                  <p>Publish some content in the staff console and it will appear here automatically.</p>
                </article>
              )}
            </div>
          </section>
        )}

        {page === "classes" && (
          <>
            <section className="teacher-summary-grid page-summary-grid">
              {teacherClasses.map((classroom) => (
                <article key={classroom.title} className="summary-card">
                  <h3>{classroom.title}</h3>
                  <p>{classroom.detail}</p>
                  <a className="primary-action" href={classroom.href}>{classroom.action}</a>
                </article>
              ))}
            </section>
            <section className="teacher-panel">
              <div className="teacher-panel-header">
                <div>
                  <h2>Class actions</h2>
                  <p>Assignments, grouping, and class-level resource planning can all grow from this page.</p>
                </div>
              </div>
              <div className="teacher-summary-grid">
                <article className="summary-card">
                  <h3>Upcoming assignment</h3>
                  <p>Sustainable Futures sequence scheduled for Year 4 Green next week.</p>
                </article>
                <article className="summary-card">
                  <h3>Needs review</h3>
                  <p>Stage 3 Extension has 3 students with incomplete reflection tasks.</p>
                </article>
                <article className="summary-card">
                  <h3>Ready to assign</h3>
                  <p>Animal Movement and Data Patterns is ready for Year 3 Blue.</p>
                </article>
              </div>
            </section>
          </>
        )}

        {page === "students" && (
          <>
            <section className="teacher-summary-grid page-summary-grid">
              {studentSnapshots.map(([name, note, group]) => (
                <article key={name} className="summary-card">
                  <h3>{name}</h3>
                  <p>{note}</p>
                  <small>{group}</small>
                </article>
              ))}
            </section>
            <section className="teacher-panel">
              <div className="teacher-panel-header">
                <div>
                  <h2>Support and extension</h2>
                  <p>This page should become the operational student list, not just a dashboard fragment.</p>
                </div>
              </div>
              <div className="teacher-summary-grid">
                <article className="summary-card">
                  <h3>Below expected</h3>
                  <p>5 students need extra support with evidence-based responses.</p>
                </article>
                <article className="summary-card">
                  <h3>At expected</h3>
                  <p>18 students are on track across their current assigned lessons.</p>
                </article>
                <article className="summary-card">
                  <h3>Above expected</h3>
                  <p>4 students are ready for extension via Tracka-linked investigation tasks.</p>
                </article>
              </div>
            </section>
          </>
        )}

        {page === "reports" && (
          <>
            <section className="teacher-summary-grid report-stat-grid">
              <article className="summary-card">
                <h3>Curriculum coverage</h3>
                <p>146 mapped outcomes across Science, HSIE, English and STEM.</p>
              </article>
              <article className="summary-card">
                <h3>Engagement trend</h3>
                <p>Science and HSIE are driving the strongest completion this month.</p>
              </article>
              <article className="summary-card">
                <h3>Recommended next step</h3>
                <p>Publish more Stage 2 resources before the next zoo visit window.</p>
              </article>
            </section>
            <section className="teacher-panel">
              <div className="teacher-panel-header">
                <div>
                  <h2>Reporting overview</h2>
                  <p>This now behaves like a proper reporting destination instead of reusing the dashboard hero.</p>
                </div>
              </div>
              <div className="teacher-summary-grid">
                {reportSnapshots.map(([title, copy]) => (
                  <article key={title} className="summary-card">
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {page === "saved" && (
          <section className="teacher-panel">
            <article className="placeholder-card">
              <h3>No saved items yet</h3>
              <p>Bookmarking is the next obvious feature here. For now, use the resource library and learning paths directly.</p>
            </article>
          </section>
        )}

        {page === "calendar" && (
          <>
            <section className="teacher-summary-grid page-summary-grid">
              <article className="summary-card"><h3>Tue 8 Jun</h3><p>Taronga Zoo Visit - Biodiversity in Action</p></article>
              <article className="summary-card"><h3>Fri 21 Jun</h3><p>Tracka Mission - Citizen Science Challenge</p></article>
              <article className="summary-card"><h3>Mon 24 Jun</h3><p>Creative Writing: Inspired by Nature due</p></article>
              {publishedProfessionalLearningItems.slice(0, 2).map((item) => <article key={item.id} className="summary-card"><h3>{item.date}</h3><p>{item.title}</p></article>)}
            </section>
            <section className="teacher-panel">
              <div className="teacher-panel-header">
                <div>
                  <h2>Planning calendar</h2>
                  <p>Excursions, due dates and mission windows should all live here as a proper planner page.</p>
                </div>
              </div>
              <div className="teacher-summary-grid">
                <article className="summary-card">
                  <h3>Excursion prep</h3>
                  <p>Send pre-visit lesson pack to Year 4 Green by Friday.</p>
                </article>
                <article className="summary-card">
                  <h3>Tracka sync</h3>
                  <p>Citizen science mission opens immediately after the zoo visit.</p>
                </article>
                <article className="summary-card">
                  <h3>Assessment checkpoint</h3>
                  <p>Stage 2 persuasive writing reflections due next Monday.</p>
                </article>
              </div>
            </section>
          </>
        )}

        {page === "content" && contentDetail && (
          <section className="teacher-panel teacher-detail-page">
            <div className="teacher-panel-header">
              <div>
                <span className="content-type">{contentDetail.type}</span>
                <h2>{contentDetail.title}</h2>
                <p>{contentDetail.summary || contentDetail.description}</p>
              </div>
              <a className="secondary-action" href={teacherRoute(contentDetail.type === "Learning Path" ? "paths" : "resources")}>Back</a>
            </div>
            <div className="detail-modal page-modal">
              <img src={contentDetail.image} alt="" />
              <div className="detail-copy">
                <div className="detail-meta">
                  <small>{contentDetail.subject}</small>
                  <small>{contentDetail.stage}</small>
                  {contentDetail.durationWeeks ? <small>{contentDetail.durationWeeks} weeks</small> : null}
                  {contentDetail.durationMinutes ? <small>{contentDetail.durationMinutes} minutes</small> : null}
                </div>
                <div className="teacher-card-actions">
                  {contentPrimaryLink(contentDetail) ? (
                    <button type="button" className="primary-action" onClick={() => openPrimaryContent(contentDetail)}>Open main link</button>
                  ) : (
                    <button type="button" className="primary-action" onClick={() => setNotice("Add the main lesson/resource URL in staff content to activate this button.")}>Main link needed</button>
                  )}
                  <button type="button" className="secondary-action" onClick={() => setNotice("Assignment placeholder. Connect this detail page to your class assignment flow next.")}>Assign</button>
                </div>
                {contentDetail.description ? <div className="detail-list"><h3>Description</h3><p>{contentDetail.description}</p></div> : null}
                {contentDetail.outcomeCodes?.length ? <div className="detail-list"><h3>Outcomes</h3><ul>{contentDetail.outcomeCodes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul></div> : null}
                <LinkSection links={contentDownloads} />
                {contentDetail.lessonIds?.length ? <div className="detail-list"><h3>Included lessons</h3><ul>{contentDetail.lessonIds.map((lessonId) => <li key={lessonId}>{lessons.find((lesson) => lesson.id === lessonId)?.title || lessonId}</li>)}</ul></div> : null}
                {contentDetail.resourceIds?.length ? <div className="detail-list"><h3>Attached resources</h3><ul>{contentDetail.resourceIds.map((resourceId) => <li key={resourceId}>{resources.find((resource) => resource.id === resourceId)?.title || resourceId}</li>)}</ul></div> : null}
              </div>
            </div>
          </section>
        )}
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
const contentItemsCollection = collection(db, "contentItems");
const professionalLearningCollection = collection(db, "professionalLearning");
const tarongaTvCollection = collection(db, "tarongaTvVideos");

function collectionForContentType(type) {
  return {
    "Learning Path": "learningPaths",
    Lesson: "lessons",
    Resource: "resources",
  }[type] || "";
}

function itemKindForContentType(type) {
  return type === "Learning Path" ? "learningPath" : type === "Lesson" ? "lesson" : "resource";
}

function resolveContentItem(item = {}) {
  const image = item.image || assets[item.imageKey] || assets.heroKoala;
  return {
    progress: 0,
    status: "Draft",
    type: "Resource",
    subject: "Science",
    stage: "Stage 2",
    materials: {},
    lessonIds: [],
    resourceIds: [],
    ...item,
    image,
  };
}

function sortContentItems(items) {
  return [...items].sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
}

function sortProfessionalLearningItems(items) {
  return [...items].sort((a, b) => `${a.date || ""}${a.time || ""}`.localeCompare(`${b.date || ""}${b.time || ""}`));
}

function resolveTarongaTvVideo(video = {}) {
  return {
    subject: "Science",
    stage: "Stage 2",
    status: "Draft",
    duration: "",
    categories: [],
    outcomeCodes: [],
    lessonIds: [],
    learningPathIds: [],
    discussionPoints: [],
    downloadLinks: [],
    ...video,
    embedUrl: normalizeYouTubeEmbedUrl(video.embedUrl || ""),
    thumbnail: video.thumbnail || video.thumbnailUrl || video.image || assets[video.imageKey] || assets.heroKoala,
  };
}

function sortTarongaTvVideos(items) {
  return [...items].sort((a, b) => a.title.localeCompare(b.title));
}

function useContentItems() {
  const [items, setItems] = useState(defaultContentItems.map(resolveContentItem));
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    return onSnapshot(
      contentItemsCollection,
      (snapshot) => {
        if (snapshot.empty) {
          setItems(defaultContentItems.map(resolveContentItem));
          setStatus("missing");
          return;
        }

        setItems(sortContentItems(snapshot.docs.map((snapshotDoc) => resolveContentItem({ id: snapshotDoc.id, ...snapshotDoc.data() }))));
        setStatus("live");
      },
      (error) => {
        console.error("Unable to load contentItems", error);
        setItems(defaultContentItems.map(resolveContentItem));
        setStatus("error");
      },
    );
  }, []);

  return { items, status };
}

function useProfessionalLearningItems() {
  const [items, setItems] = useState(defaultProfessionalLearningItems);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    return onSnapshot(
      professionalLearningCollection,
      (snapshot) => {
        if (snapshot.empty) {
          setItems(defaultProfessionalLearningItems);
          setStatus("missing");
          return;
        }

        setItems(sortProfessionalLearningItems(snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() }))));
        setStatus("live");
      },
      (error) => {
        console.error("Unable to load professionalLearning", error);
        setItems(defaultProfessionalLearningItems);
        setStatus("error");
      },
    );
  }, []);

  return { items, status };
}

function useTarongaTvVideos() {
  const [items, setItems] = useState(defaultTarongaTvVideos.map(resolveTarongaTvVideo));
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    return onSnapshot(
      tarongaTvCollection,
      (snapshot) => {
        if (snapshot.empty) {
          setItems(defaultTarongaTvVideos.map(resolveTarongaTvVideo));
          setStatus("missing");
          return;
        }

        setItems(sortTarongaTvVideos(snapshot.docs.map((snapshotDoc) => resolveTarongaTvVideo({ id: snapshotDoc.id, ...snapshotDoc.data() }))));
        setStatus("live");
      },
      (error) => {
        console.error("Unable to load tarongaTvVideos", error);
        setItems(defaultTarongaTvVideos.map(resolveTarongaTvVideo));
        setStatus("error");
      },
    );
  }, []);

  return { items, status };
}

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

function TeacherPage({ page = "dashboard", subject = "", contentId = "", tvVideoId = "", preview = false }) {
  const { config, status } = useDashboardConfig();
  const { items: contentItems, status: contentStatus } = useContentItems();
  const { items: professionalLearningItems } = useProfessionalLearningItems();
  const { items: tarongaTvVideos } = useTarongaTvVideos();
  const { status: sessionStatus, user, profile } = useSessionUser();

  async function handleSignOut() {
    window.localStorage.removeItem(demoSessionKey);
    if (auth.currentUser) {
      await signOut(auth);
    }
    window.location.hash = "#login";
  }

  useEffect(() => {
    if (!preview && sessionStatus === "ready" && !user) {
      window.location.hash = "#login";
    }
    if (!preview && sessionStatus === "ready" && user && !profile && !user.isDemo) {
      window.location.hash = "#about-you";
    }
  }, [preview, sessionStatus, user, profile]);

  if (!preview && sessionStatus === "loading") {
    return <main className="auth-page"><section className="auth-card"><p>Loading your account...</p></section></main>;
  }

  if (!preview && sessionStatus === "ready" && !user) {
    return null;
  }

  if (!preview && sessionStatus === "ready" && user && !profile && !user.isDemo) {
    return null;
  }

  return (
    <>
      <FirestoreStatus status={status} />
      <ContentFirestoreStatus status={contentStatus} />
      <TeacherDashboard config={config} contentItems={contentItems} professionalLearningItems={professionalLearningItems} tarongaTvVideos={tarongaTvVideos} page={page} subject={subject} contentId={contentId} tvVideoId={tvVideoId} profile={profile} onSignOut={handleSignOut} preview={preview} />
    </>
  );
}

function StaffPage() {
  const [isUnlocked, setIsUnlocked] = useState(() => window.sessionStorage.getItem(staffSessionKey) === "unlocked");

  function unlock() {
    window.sessionStorage.setItem(staffSessionKey, "unlocked");
    setIsUnlocked(true);
  }

  function lock() {
    window.sessionStorage.removeItem(staffSessionKey);
    setIsUnlocked(false);
  }

  if (!isUnlocked) {
    return <StaffPasswordScreen onUnlock={unlock} />;
  }

  return <StaffConsole onLock={lock} />;
}

function StaffPasswordScreen({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (password === staffPassword) {
      onUnlock();
      return;
    }

    setError("Incorrect password.");
  }

  return (
    <main className="staff-auth-page">
      <section className="staff-auth-card" aria-label="Taronga staff login">
        <img src={assets.wildlyLogo} alt="Wildly by Taronga" />
        <span>Taronga Staff Console</span>
        <h1>Staff password</h1>
        <p>Enter the temporary staff password to edit Wildly dashboard content.</p>
        <form onSubmit={handleSubmit}>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={staffPassword} autoComplete="current-password" autoFocus /></label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit">Enter staff console</button>
        </form>
      </section>
    </main>
  );
}

function StaffConsole({ onLock }) {
  const [panel, setPanel] = useState("overview");
  const { config: savedConfig, status } = useDashboardConfig();
  const { items: contentItems, status: contentStatus } = useContentItems();
  const { items: professionalLearningItems, status: professionalLearningStatus } = useProfessionalLearningItems();
  const { items: tarongaTvVideos, status: tarongaTvStatus } = useTarongaTvVideos();
  const [config, setConfig] = useState(defaultDashboardConfig);
  const [previewKey, setPreviewKey] = useState(0);
  const [saveState, setSaveState] = useState("idle");
  const [contentSaveState, setContentSaveState] = useState("idle");
  const [professionalLearningSaveState, setProfessionalLearningSaveState] = useState("idle");
  const [tarongaTvSaveState, setTarongaTvSaveState] = useState("idle");
  const [notice, setNotice] = useState("");

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

  async function seedContentItems() {
    setContentSaveState("saving");
    try {
      await Promise.all(defaultContentItems.flatMap((item) => {
        const mirrorCollection = collectionForContentType(item.type);
        const writes = [
          setDoc(
            doc(db, "contentItems", item.id),
            { ...item, itemKind: itemKindForContentType(item.type), updatedAt: serverTimestamp() },
            { merge: true },
          ),
        ];

        if (mirrorCollection) {
          writes.push(setDoc(doc(db, mirrorCollection, item.id), {
            ...item,
            itemKind: itemKindForContentType(item.type),
            lessonIds: item.lessonIds || [],
            resourceIds: item.resourceIds || [],
            updatedAt: serverTimestamp(),
          }, { merge: true }));
        }

        return writes;
      }));
      setContentSaveState("saved");
    } catch (error) {
      console.error("Unable to seed contentItems", error);
      setContentSaveState("error");
    }
  }

  async function addContentItem(item) {
    setContentSaveState("saving");
    try {
      const contentType = item.type;
      const mirrorCollection = collectionForContentType(contentType);
      const isExisting = Boolean(item.id);
      const contentPayload = {
        ...item,
        image: item.uploadedImageDataUrl || item.customImageUrl?.trim() || item.image || assets[item.imageKey] || assets.heroKoala,
        durationMinutes: Number(item.durationMinutes) || 0,
        durationWeeks: Number(item.durationWeeks) || 0,
        outcomeCodes: Array.isArray(item.outcomeCodes) ? item.outcomeCodes : listFromText(item.outcomeCodes || ""),
        activityPrompts: Array.isArray(item.activityPrompts) ? item.activityPrompts : listFromText(item.activityPrompts || ""),
        materials: {
          canvaEmbedUrl: item.canvaEmbedUrl?.trim() || "",
          teacherGuideUrl: item.teacherGuideUrl?.trim() || "",
          studentWorksheetUrl: item.studentWorksheetUrl?.trim() || "",
          videoUrl: item.videoUrl?.trim() || "",
          teacherAdminUrl: item.teacherAdminUrl?.trim() || "",
          unitPlanUrl: item.unitPlanUrl?.trim() || "",
          lessonPlanUrl: item.lessonPlanUrl?.trim() || "",
          resourceUrl: item.resourceUrl?.trim() || "",
          resourceLinks: Array.isArray(item.resourceLinks) ? item.resourceLinks : listFromText(item.resourceLinks || ""),
          downloadLinks: Array.isArray(item.downloadLinks) ? item.downloadLinks : parseNamedLinks(item.downloadLinks || ""),
        },
        lessonIds: Array.isArray(item.lessonIds) ? item.lessonIds : [],
        resourceIds: Array.isArray(item.resourceIds) ? item.resourceIds : [],
        learningPathId: item.learningPathId || "",
        lessonId: item.lessonId || "",
        progress: contentType === "Learning Path" ? 0 : Number(item.progress) || 0,
        itemKind: itemKindForContentType(contentType),
      };

      delete contentPayload.canvaEmbedUrl;
      delete contentPayload.teacherGuideUrl;
      delete contentPayload.studentWorksheetUrl;
      delete contentPayload.videoUrl;
      delete contentPayload.teacherAdminUrl;
      delete contentPayload.unitPlanUrl;
      delete contentPayload.lessonPlanUrl;
      delete contentPayload.resourceUrl;
      delete contentPayload.resourceLinks;
      delete contentPayload.downloadLinks;
      delete contentPayload.customImageUrl;
      delete contentPayload.uploadedImageDataUrl;

      let contentId = item.id;

      if (isExisting) {
        await setDoc(doc(db, "contentItems", item.id), {
          ...contentPayload,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        const contentRef = await addDoc(contentItemsCollection, {
          ...contentPayload,
          order: contentItems.length + 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        contentId = contentRef.id;
      }

      if (mirrorCollection && contentId) {
        await setDoc(doc(db, mirrorCollection, contentId), {
          ...contentPayload,
          contentItemId: contentId,
          ...(isExisting ? {} : { createdAt: serverTimestamp() }),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      setContentSaveState("saved");
    } catch (error) {
      console.error("Unable to add content item", error);
      setContentSaveState("error");
    }
  }

  async function deleteContentItem(item) {
    if (!item?.id) return;

    setContentSaveState("saving");
    try {
      await deleteDoc(doc(db, "contentItems", item.id));
      const mirrorCollection = collectionForContentType(item.type);
      if (mirrorCollection) {
        await deleteDoc(doc(db, mirrorCollection, item.id));
      }
      setContentSaveState("saved");
    } catch (error) {
      console.error("Unable to delete content item", error);
      setContentSaveState("error");
    }
  }

  async function publishUpdates() {
    await publishDashboardConfig();
    setNotice("Dashboard settings were published. Content items save to Firestore as soon as they are created or deleted.");
  }

  async function saveProfessionalLearningItem(item) {
    setProfessionalLearningSaveState("saving");
    try {
      const payload = {
        title: item.title || "",
        date: item.date || "",
        time: item.time || "",
        summary: item.summary || "",
        description: item.description || "",
        registrationUrl: item.registrationUrl || "",
        pdfUrl: item.pdfUrl || "",
        infoUrl: item.infoUrl || "",
        downloadLinks: Array.isArray(item.downloadLinks) ? item.downloadLinks : parseNamedLinks(item.downloadLinks || ""),
        status: item.status || "Draft",
        updatedAt: serverTimestamp(),
      };

      if (item.id) {
        await setDoc(doc(db, "professionalLearning", item.id), payload, { merge: true });
      } else {
        await addDoc(professionalLearningCollection, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      setProfessionalLearningSaveState("saved");
    } catch (error) {
      console.error("Unable to save professional learning item", error);
      setProfessionalLearningSaveState("error");
    }
  }

  async function deleteProfessionalLearningItem(item) {
    if (!item?.id) return;

    setProfessionalLearningSaveState("saving");
    try {
      await deleteDoc(doc(db, "professionalLearning", item.id));
      setProfessionalLearningSaveState("saved");
    } catch (error) {
      console.error("Unable to delete professional learning item", error);
      setProfessionalLearningSaveState("error");
    }
  }

  async function saveTarongaTvVideo(item) {
    setTarongaTvSaveState("saving");
    try {
      const payload = {
        title: item.title || "",
        summary: item.summary || "",
        description: item.description || "",
        subject: item.subject || "Science",
        stage: item.stage || "Stage 2",
        status: item.status || "Draft",
        duration: item.duration || "",
        embedUrl: normalizeYouTubeEmbedUrl(item.embedUrl || ""),
        imageKey: item.imageKey || "",
        thumbnailUrl: item.uploadedImageDataUrl || item.customImageUrl?.trim() || item.thumbnailUrl || item.image || assets[item.imageKey] || assets.heroKoala,
        categories: Array.isArray(item.categories) ? item.categories : [],
        outcomeCodes: Array.isArray(item.outcomeCodes) ? item.outcomeCodes : listFromText(item.outcomeCodes || ""),
        lessonIds: Array.isArray(item.lessonIds) ? item.lessonIds : [],
        learningPathIds: Array.isArray(item.learningPathIds) ? item.learningPathIds : [],
        downloadLinks: Array.isArray(item.downloadLinks) ? item.downloadLinks : parseNamedLinks(item.downloadLinks || ""),
        discussionPoints: (item.discussionPoints || []).filter((point) => point.time || point.prompt).map((point) => ({
          time: point.time || "",
          prompt: point.prompt || "",
        })),
        updatedAt: serverTimestamp(),
      };

      if (item.id) {
        await setDoc(doc(db, "tarongaTvVideos", item.id), payload, { merge: true });
      } else {
        await addDoc(tarongaTvCollection, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      setTarongaTvSaveState("saved");
    } catch (error) {
      console.error("Unable to save Taronga TV video", error);
      setTarongaTvSaveState("error");
    }
  }

  async function deleteTarongaTvVideo(item) {
    if (!item?.id) return;

    setTarongaTvSaveState("saving");
    try {
      await deleteDoc(doc(db, "tarongaTvVideos", item.id));
      setTarongaTvSaveState("saved");
    } catch (error) {
      console.error("Unable to delete Taronga TV video", error);
      setTarongaTvSaveState("error");
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
            ["taronga-tv", "play", "Taronga TV"],
            ["professional-learning", "book", "Professional Learning"],
            ["dashboard", "monitor", "Edit Dashboard"],
          ].map(([id, icon, label]) => <button className={panel === id ? "active" : ""} type="button" data-panel={id} key={id} onClick={() => setPanel(id)}><Icon type={icon} className="" />{label}</button>)}
        </nav>
        <article className="tracka-mini"><img src={assets.trackaLogo} alt="Taronga Tracka" /><p>Staff editing is unlocked for this browser session. Tracka data connector ready for staff review.</p></article>
      </aside>
      <main className="staff-workspace">
        <header className="staff-topbar"><div><span>Taronga Staff Console</span><h1>Wildly learning operations</h1></div><div className="staff-actions"><a href={routePath("teacher")}>Teacher view</a><button type="button" onClick={publishUpdates}>Publish updates</button><button type="button" className="sign-out-button" onClick={onLock}>Lock staff view</button></div></header>
        <NoticeBanner notice={notice} onClose={() => setNotice("")} />
        {panel === "overview" && <section className="staff-panel active"><div className="overview-grid">{[["Active users", "4,286", "Teachers, students and Taronga staff this term"], ["Assigned resources", "18,940", "Lessons, learning paths and missions launched"], ["Tracka-linked sessions", "72%", "Activities connected to excursion or citizen science data"], ["Curriculum coverage", "146", "Mapped outcomes across NSW and Australian Curriculum"]].map(([label, value, copy]) => <article key={label}><span>{label}</span><strong>{value}</strong><p>{copy}</p></article>)}</div><div className="overview-snapshot"><article><h2>Current priorities</h2><p>Science and HSIE pathways are seeing the strongest uptake this month, with data interpretation flagged as the highest-value support area.</p></article><article><h2>Next recommended action</h2><p>Review Stage 3 animal adaptations lessons and prepare a Tracka mission bundle for upcoming school visits.</p></article></div></section>}
        {panel === "users" && <UsersPanel onPlaceholder={(message) => setNotice(message)} />}
        {panel === "analytics" && <AnalyticsPanel onPlaceholder={(message) => setNotice(message)} />}
        {panel === "content" && <ContentPanel contentItems={contentItems} status={contentStatus} saveState={contentSaveState} seedContentItems={seedContentItems} addContentItem={addContentItem} deleteContentItem={deleteContentItem} />}
        {panel === "taronga-tv" && <TarongaTvPanel items={tarongaTvVideos} contentItems={contentItems} status={tarongaTvStatus} saveState={tarongaTvSaveState} saveVideo={saveTarongaTvVideo} deleteVideo={deleteTarongaTvVideo} />}
        {panel === "professional-learning" && <ProfessionalLearningPanel items={professionalLearningItems} status={professionalLearningStatus} saveState={professionalLearningSaveState} saveItem={saveProfessionalLearningItem} deleteItem={deleteProfessionalLearningItem} />}
        {panel === "dashboard" && <DashboardEditor config={config} contentItems={contentItems} updateConfig={updateConfig} reset={() => { setConfig(defaultDashboardConfig); setPreviewKey((key) => key + 1); }} previewKey={previewKey} publish={publishDashboardConfig} status={status} saveState={saveState} />}
      </main>
    </div>
  );
}

function UsersPanel({ onPlaceholder }) {
  const userRows = [
    ["James Thompson", "Teacher", "Riverbank Public School", "Active", "Today"],
    ["Ava Wilson", "Student", "Riverbank Public School", "Active", "Today"],
    ["Maya Chen", "Taronga staff", "Taronga Education", "Review", "Yesterday"],
    ["Samir Patel", "School admin", "Western Sydney Learning Hub", "Active", "2 days ago"],
  ];
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const visibleRows = userRows.filter(([name, role, org]) => {
    const matchesSearch = `${name} ${role} ${org}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All roles" || role === roleFilter.slice(0, -1) || role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return <section className="staff-section staff-panel active"><div className="section-heading"><div><h2>Users</h2><p>Analyse all teachers, students, schools and Taronga staff involved in Wildly.</p></div><button type="button" onClick={() => onPlaceholder("Add user placeholder. Connect this to your user invite or provisioning flow.")}>Add user</button></div><div className="user-layout"><article className="user-breakdown"><h3>User mix</h3><div className="donut" aria-label="User mix chart"></div><ul>{[["teacher", "Teachers", "682"], ["student", "Students", "3,421"], ["staff", "Taronga staff", "74"], ["school", "School admins", "109"]].map(([cls, label, value]) => <li key={label}><span className={cls}></span>{label}<strong>{value}</strong></li>)}</ul></article><article className="user-table-card"><div className="table-toolbar"><label><Icon type="target" className="" /><input type="search" placeholder="Search users, schools or roles" value={search} onChange={(event) => setSearch(event.target.value)} /></label><select aria-label="Filter users" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option>All roles</option><option>Teacher</option><option>Student</option><option>Taronga staff</option><option>School admin</option></select></div><table><thead><tr><th>User</th><th>Role</th><th>Organisation</th><th>Status</th><th>Last active</th></tr></thead><tbody>{visibleRows.map(([name, role, org, status, active]) => <tr key={name}><td>{name}</td><td>{role}</td><td>{org}</td><td><span className={`status ${status === "Active" ? "active" : "review"}`}>{status}</span></td><td>{active}</td></tr>)}</tbody></table>{visibleRows.length ? null : <p className="empty-table-copy">No users match this filter.</p>}</article></div></section>;
}

function AnalyticsPanel({ onPlaceholder }) {
  function exportReport() {
    downloadTextFile(
      "wildly-analytics-report.csv",
      "metric,value\nLearning engagement peak,88%\nBelow expected,18%\nAt expected,57%\nAbove expected,25%\nHighest gap,Adaptation vs behaviour\n",
      "text/csv;charset=utf-8",
    );
    onPlaceholder("Analytics report exported as a sample CSV. Replace this with your real reporting export when ready.");
  }

  return <section className="staff-section staff-panel active"><div className="section-heading"><div><h2>Analytics</h2><p>View engagement, learning progress, curriculum gaps and Tracka-connected outcomes.</p></div><button type="button" onClick={exportReport}>Export report</button></div><div className="analytics-grid"><article className="wide-card"><h3>Learning engagement by week</h3><div className="bar-chart">{[42, 58, 51, 76, 68, 88, 81].map((height) => <span style={{ height: `${height}%` }} key={height}></span>)}</div></article><article><h3>Knowledge gaps</h3>{[["Adaptation vs behaviour", 64], ["Data interpretation", 48], ["Persuasive writing", 37]].map(([label, width]) => <React.Fragment key={label}><p className="metric">{label}</p><div className="meter"><span style={{ width: `${width}%` }}></span></div></React.Fragment>)}</article><article><h3>Results snapshot</h3><ul className="result-list"><li>Below expected <strong>18%</strong></li><li>At expected <strong>57%</strong></li><li>Above expected <strong>25%</strong></li></ul></article></div></section>;
}

function ContentPanel({ contentItems, status, saveState, seedContentItems, addContentItem, deleteContentItem }) {
  const [activeType, setActiveType] = useState("Learning Path");
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(createContentDraft("Learning Path"));
  const [imageError, setImageError] = useState("");
  const learningPaths = contentItems.filter((item) => item.type === "Learning Path");
  const lessonOptions = contentItems.filter((item) => item.type === "Lesson");
  const resourceOptions = contentItems.filter((item) => item.type === "Resource");
  const currentItems = activeType === "Learning Path" ? learningPaths : activeType === "Lesson" ? lessonOptions : resourceOptions;
  const selectedItem = currentItems.find((item) => item.id === selectedId) || null;
  const selectedImage = draft.uploadedImageDataUrl || draft.customImageUrl || draft.image || assets[draft.imageKey] || assets.heroKoala;
  const selectedStockImage = stockImages.find((image) => (image.key && image.key === draft.imageKey) || (!draft.imageKey && !draft.uploadedImageDataUrl && !draft.customImageUrl && image.src === draft.image));
  const typeCopy = {
    "Learning Path": {
      title: "Learning paths",
      description: "Full units or sequences with duration, outcomes, admin documents and linked lessons.",
      button: "New learning path",
      icon: "path",
      intro: "Build the unit first, then attach the lessons that sit inside it.",
      review: ["Teacher content library", "Learning path pages", "Lesson grouping"],
    },
    Lesson: {
      title: "Lessons",
      description: "Individual lessons that can sit inside a learning path or be used on their own.",
      button: "New lesson",
      icon: "book",
      intro: "Create a single lesson, then connect it to a path or keep it standalone.",
      review: ["Teacher lesson cards", "Linked learning paths", "Attached resources"],
    },
    Resource: {
      title: "Resources",
      description: "Files, links and supporting resources that can sit inside lessons or stand alone.",
      button: "New resource",
      icon: "blocks",
      intro: "Add the individual file or link teachers will open or assign.",
      review: ["Teacher resource library", "Lesson resource lists", "Direct resource access"],
    },
  };

  function itemTitle(items, id) {
    return items.find((item) => item.id === id)?.title || "";
  }

  function materialCount(item) {
    return [
      item.materials?.canvaEmbedUrl,
      item.materials?.teacherGuideUrl,
      item.materials?.studentWorksheetUrl,
      item.materials?.videoUrl,
      item.materials?.teacherAdminUrl,
      item.materials?.unitPlanUrl,
      item.materials?.lessonPlanUrl,
      item.materials?.resourceUrl,
      ...(item.materials?.downloadLinks || []).map((entry) => entry.url),
      ...(item.materials?.resourceLinks || []),
    ].filter(Boolean).length;
  }

  function makeEditableDraft(item) {
    return {
      ...createContentDraft(item.type),
      ...item,
      imageKey: item.imageKey || "",
      image: item.image || "",
      customImageUrl: item.imageKey ? "" : (item.image || ""),
      uploadedImageDataUrl: "",
      outcomeCodes: Array.isArray(item.outcomeCodes) ? item.outcomeCodes.join("\n") : (item.outcomeCodes || ""),
      activityPrompts: Array.isArray(item.activityPrompts) ? item.activityPrompts.join("\n") : (item.activityPrompts || ""),
      canvaEmbedUrl: item.materials?.canvaEmbedUrl || "",
      teacherGuideUrl: item.materials?.teacherGuideUrl || "",
      studentWorksheetUrl: item.materials?.studentWorksheetUrl || "",
      videoUrl: item.materials?.videoUrl || "",
      teacherAdminUrl: item.materials?.teacherAdminUrl || "",
      unitPlanUrl: item.materials?.unitPlanUrl || "",
      lessonPlanUrl: item.materials?.lessonPlanUrl || "",
      resourceUrl: item.materials?.resourceUrl || "",
      downloadLinks: Array.isArray(item.materials?.downloadLinks) ? item.materials.downloadLinks.map((entry) => `${entry.label} | ${entry.url}`).join("\n") : "",
      resourceLinks: Array.isArray(item.materials?.resourceLinks) ? item.materials.resourceLinks.join("\n") : "",
      lessonIds: item.lessonIds || [],
      resourceIds: item.resourceIds || [],
      learningPathId: item.learningPathId || "",
      lessonId: item.lessonId || "",
    };
  }

  useEffect(() => {
    if (selectedItem) {
      setDraft(makeEditableDraft(selectedItem));
      setImageError("");
      return;
    }

    setDraft((current) => ({
      ...createContentDraft(activeType),
      subject: current.subject || "Science",
      stage: current.stage || "Stage 2",
    }));
    setImageError("");
  }, [activeType, selectedItem]);

  function startNew(type = activeType) {
    setActiveType(type);
    setSelectedId("");
    setDraft(createContentDraft(type));
    setImageError("");
  }

  function selectItem(item) {
    setActiveType(item.type);
    setSelectedId(item.id);
  }

  function updateDraft(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function submitContent(event) {
    event.preventDefault();
    await addContentItem(draft);
    setSelectedId("");
    setDraft(createContentDraft(activeType));
  }

  async function uploadCardImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await resizeImageFile(file);
      updateDraft({ uploadedImageDataUrl: dataUrl, customImageUrl: "", image: dataUrl, imageKey: "" });
      setImageError("");
    } catch (error) {
      setImageError(error.message);
    }
  }

  function toggleListItem(field, itemId) {
    setDraft((current) => {
      const currentList = current[field] || [];
      const nextList = currentList.includes(itemId)
        ? currentList.filter((id) => id !== itemId)
        : [...currentList, itemId];
      return { ...current, [field]: nextList };
    });
  }

  function chooseStockImage(value) {
    const stockImage = stockImages.find((image) => image.src === value || image.key === value);
    updateDraft({
      imageKey: stockImage?.key || "",
      image: stockImage?.key ? "" : (stockImage?.src || value),
      customImageUrl: "",
      uploadedImageDataUrl: "",
    });
    setImageError("");
  }

  async function confirmDelete(item) {
    const label = `${item.type}: ${item.title}`;
    if (!window.confirm(`Delete ${label}? This removes the Firestore content item and its ${item.type.toLowerCase()} record.`)) return;
    await deleteContentItem(item);
    setSelectedId("");
    setDraft(createContentDraft(activeType));
  }

  function handleExistingSelection(value) {
    if (!value) {
      startNew(activeType);
      return;
    }

    const item = currentItems.find((entry) => entry.id === value);
    if (item) selectItem(item);
  }

  return (
    <section className="staff-section staff-panel active">
      <div className="section-heading">
        <div>
          <h2>Content Studio</h2>
          <p>Create content in a simple flow: choose what you are making, add the essentials, connect related items and publish.</p>
        </div>
        <div className="heading-actions">
          <button type="button" onClick={seedContentItems}>Seed Firestore content</button>
        </div>
      </div>
      <ContentFirestoreStatus status={status} saveState={saveState} collectionLabel="Taronga TV library" collectionName="tarongaTvVideos" loadingLabel="Loading Taronga TV library..." emptyLabel="Firestore tarongaTvVideos is empty. Showing fallback videos until you add your own." savingLabel="Writing Taronga TV video to Firestore..." savedLabel="Taronga TV video saved to Firestore." errorLabel="Taronga TV videos could not load. Check rules allow access to tarongaTvVideos." />

      <div className="content-flow-shell">
        <div className="content-type-selector" aria-label="Content types">
          {["Learning Path", "Lesson", "Resource"].map((type) => (
            <button key={type} type="button" className={`content-type-card ${activeType === type ? "active" : ""}`} onClick={() => startNew(type)}>
              <div className="content-type-icon">
                <Icon type={typeCopy[type].icon} className="nav-svg" />
              </div>
              <div>
                <strong>{type}</strong>
                <p>{typeCopy[type].description}</p>
                <small>{typeCopy[type].intro}</small>
              </div>
            </button>
          ))}
        </div>

        <form className="content-form content-flow-form" onSubmit={submitContent}>
          <div className="content-flow-toolbar">
            <div>
              <span className="content-type">{selectedId ? "Editing existing content" : "New content"}</span>
              <h3>{selectedId ? draft.title || `Edit ${draft.type.toLowerCase()}` : `Create ${draft.type.toLowerCase()}`}</h3>
              <p>{typeCopy[draft.type].intro}</p>
            </div>

            <div className="content-flow-toolbar-actions">
              <label className="content-quick-select">
                Continue editing
                <select value={selectedId} onChange={(event) => handleExistingSelection(event.target.value)}>
                  <option value="">Start a new {draft.type.toLowerCase()}</option>
                  {currentItems.map((item) => <option value={item.id} key={item.id || item.title}>{item.title}</option>)}
                </select>
              </label>
              <button type="button" className="secondary-button" onClick={() => startNew(activeType)}>{typeCopy[activeType].button}</button>
            </div>
          </div>

          <div className="content-flow-main">
            <section className="content-step-card">
              <div className="content-step-header">
                <span className="content-step-badge">1</span>
                <div>
                  <h4>Core details</h4>
                  <p>Start with the essentials staff need to recognise and organise this content.</p>
                </div>
              </div>
              <div className="content-editor-fields">
                <label>Title<input type="text" required value={draft.title} onChange={(event) => updateDraft({ title: event.target.value })} /></label>
                <label>Subject<select value={draft.subject} onChange={(event) => updateDraft({ subject: event.target.value })}>{subjects.map(([label]) => <option key={label}>{label}</option>)}</select></label>
                <label>Stage<input type="text" value={draft.stage} onChange={(event) => updateDraft({ stage: event.target.value })} /></label>
                <label>Status<select value={draft.status} onChange={(event) => updateDraft({ status: event.target.value })}><option>Draft</option><option>Review</option><option>Published</option></select></label>
                {draft.type === "Learning Path" ? <label>Duration in weeks<input type="number" min="0" value={draft.durationWeeks} onChange={(event) => updateDraft({ durationWeeks: event.target.value })} /></label> : null}
                {draft.type === "Lesson" ? <label>Duration in minutes<input type="number" min="0" value={draft.durationMinutes} onChange={(event) => updateDraft({ durationMinutes: event.target.value })} /></label> : null}
                <label className="wide-field">Summary<input type="text" required value={draft.summary} onChange={(event) => updateDraft({ summary: event.target.value })} /></label>
                <label className="wide-field">Description<textarea value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })}></textarea></label>
                <label className="wide-field">Outcomes<textarea placeholder="One outcome per line" value={draft.outcomeCodes} onChange={(event) => updateDraft({ outcomeCodes: event.target.value })}></textarea></label>
              </div>
            </section>

            <section className="content-step-card">
              <div className="content-step-header">
                <span className="content-step-badge">2</span>
                <div>
                  <h4>Files, links and image</h4>
                  <p>Keep uploads and links in one place so staff do not need to hunt for the right field.</p>
                </div>
              </div>

              <div className="simple-image-picker">
                <img src={selectedImage} alt="" />
                <div>
                  <label>
                    Stock image
                    <select value={selectedStockImage ? (selectedStockImage.key || selectedStockImage.src) : ""} onChange={(event) => chooseStockImage(event.target.value)}>
                      <option value="">Choose a stock image</option>
                      {stockImages.map((stockImage) => <option value={stockImage.key || stockImage.src} key={`${stockImage.label}-${stockImage.src}`}>{stockImage.label}</option>)}
                    </select>
                  </label>
                  <label>Image URL<input type="url" value={draft.customImageUrl} onChange={(event) => updateDraft({ customImageUrl: event.target.value, uploadedImageDataUrl: "", image: event.target.value, imageKey: "" })} placeholder="https://..." /></label>
                  <label>Upload image<input type="file" accept="image/*" onChange={uploadCardImage} /></label>
                  {imageError ? <p className="auth-error">{imageError}</p> : null}
                </div>
              </div>

              <div className="content-editor-fields">
                {draft.type === "Learning Path" ? (
                  <>
                    <label>Teacher admin documents URL<input type="url" value={draft.teacherAdminUrl} onChange={(event) => updateDraft({ teacherAdminUrl: event.target.value })} placeholder="Drive, PDF or Canva link" /></label>
                    <label>Unit plan URL<input type="url" value={draft.unitPlanUrl} onChange={(event) => updateDraft({ unitPlanUrl: event.target.value })} placeholder="Scope, sequence or program link" /></label>
                    <label className="wide-field">Teacher notes<textarea placeholder="One note or prompt per line" value={draft.activityPrompts} onChange={(event) => updateDraft({ activityPrompts: event.target.value })}></textarea></label>
                  </>
                ) : null}

                {draft.type === "Lesson" ? (
                  <>
                    <label>Lesson plan URL<input type="url" value={draft.lessonPlanUrl} onChange={(event) => updateDraft({ lessonPlanUrl: event.target.value })} placeholder="PDF, Drive or Canva link" /></label>
                    <label>Teacher guide URL<input type="url" value={draft.teacherGuideUrl} onChange={(event) => updateDraft({ teacherGuideUrl: event.target.value })} placeholder="Optional support material" /></label>
                  </>
                ) : null}

                {draft.type === "Resource" ? (
                  <>
                    <label>Resource file or Canva URL<input type="url" value={draft.resourceUrl} onChange={(event) => updateDraft({ resourceUrl: event.target.value })} placeholder="PDF, image, video, Canva or Drive link" /></label>
                    <label>Student worksheet URL<input type="url" value={draft.studentWorksheetUrl} onChange={(event) => updateDraft({ studentWorksheetUrl: event.target.value })} placeholder="Optional worksheet or download" /></label>
                    <label className="wide-field">Extra resource links<textarea placeholder="One URL per line" value={draft.resourceLinks} onChange={(event) => updateDraft({ resourceLinks: event.target.value })}></textarea></label>
                  </>
                ) : null}
                <label className="wide-field">Download links<textarea placeholder="One per line: Label | URL" value={draft.downloadLinks} onChange={(event) => updateDraft({ downloadLinks: event.target.value })}></textarea></label>
              </div>
            </section>

            <section className="content-step-card">
              <div className="content-step-header">
                <span className="content-step-badge">3</span>
                <div>
                  <h4>Structure and relationships</h4>
                  <p>Link this item into the wider content model only where it needs to sit.</p>
                </div>
              </div>

              <div className="content-editor-fields">
                {draft.type === "Learning Path" ? (
                  <fieldset className="lesson-picker wide-field">
                    <legend>Lessons in this learning path</legend>
                    {lessonOptions.length ? lessonOptions.map((lesson) => <label key={lesson.id || lesson.title}><input type="checkbox" checked={draft.lessonIds.includes(lesson.id)} onChange={() => toggleListItem("lessonIds", lesson.id)} />{lesson.title}<small>{lesson.subject} - {lesson.stage}</small></label>) : <p>Create lessons first, then attach them here.</p>}
                  </fieldset>
                ) : null}

                {draft.type === "Lesson" ? (
                  <>
                    <label>Learning path<select value={draft.learningPathId} onChange={(event) => updateDraft({ learningPathId: event.target.value })}><option value="">Standalone lesson</option>{learningPaths.map((path) => <option value={path.id} key={path.id || path.title}>{path.title}</option>)}</select></label>
                    <fieldset className="lesson-picker wide-field">
                      <legend>Resources in this lesson</legend>
                      {resourceOptions.length ? resourceOptions.map((resource) => <label key={resource.id || resource.title}><input type="checkbox" checked={draft.resourceIds.includes(resource.id)} onChange={() => toggleListItem("resourceIds", resource.id)} />{resource.title}<small>{resource.subject} - {resource.stage}</small></label>) : <p>Create resources first, then attach them here.</p>}
                    </fieldset>
                  </>
                ) : null}

                {draft.type === "Resource" ? (
                  <label className="wide-field">Lesson<select value={draft.lessonId} onChange={(event) => updateDraft({ lessonId: event.target.value })}><option value="">Standalone resource</option>{lessonOptions.map((lesson) => <option value={lesson.id} key={lesson.id || lesson.title}>{lesson.title}</option>)}</select></label>
                ) : null}
              </div>
            </section>

            <section className="content-step-card review-card">
              <div className="content-step-header">
                <span className="content-step-badge">4</span>
                <div>
                  <h4>Review and save</h4>
                  <p>Check where this will appear for teachers, then save it to Firestore.</p>
                </div>
              </div>

              <div className="content-review-grid">
                <div className="content-review-preview">
                  <img className="content-thumb" src={selectedImage} alt="" />
                  <div>
                    <span className="content-type">{draft.status}</span>
                    <h5>{draft.title || `Untitled ${draft.type.toLowerCase()}`}</h5>
                    <p>{draft.summary || "Add a short summary so teachers can scan this quickly."}</p>
                    <div className="material-tags">
                      <span>{draft.subject}</span>
                      <span>{draft.stage || "Stage not set"}</span>
                      <span>{selectedId ? "Existing item" : "New item"}</span>
                    </div>
                  </div>
                </div>

                <div className="content-review-meta">
                  <h5>Teachers will see this in</h5>
                  <div className="editor-meta-list">
                    {typeCopy[draft.type].review.map((label) => <span key={label}>{label}</span>)}
                  </div>
                  <div className="content-form-actions">
                    {selectedId ? <button type="button" className="delete-button editor-delete-button" onClick={() => confirmDelete(draft)}>Delete</button> : null}
                    <button type="button" className="secondary-button" onClick={() => startNew(activeType)}>Clear form</button>
                    <button type="submit" disabled={saveState === "saving"}>{saveState === "saving" ? "Saving..." : selectedId ? "Update content" : "Save to Firestore"}</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </form>

        <section className="content-library-section">
          <div className="content-library-section-header">
            <div>
              <span className="content-type">{activeType}</span>
              <h3>Existing {typeCopy[activeType].title}</h3>
              <p>Select something to edit, or stay in the flow above to create a new item.</p>
            </div>
            <button type="button" className="secondary-button" onClick={() => startNew(activeType)}>{typeCopy[activeType].button}</button>
          </div>

          <div className="content-library-grid">
            {currentItems.length ? currentItems.map((item) => (
              <article className={`content-mini-card ${selectedId === item.id ? "selected" : ""}`} key={item.id || item.title} onClick={() => selectItem(item)}>
                <img className="content-thumb" src={item.image} alt="" />
                <div>
                  <span className="content-type">{item.status}</span>
                  <h4>{item.title}</h4>
                  <p>{item.summary || item.description}</p>
                  <small>{item.subject} - {item.stage}</small>
                  {item.durationWeeks ? <small>{item.durationWeeks} weeks</small> : null}
                  {item.durationMinutes ? <small>{item.durationMinutes} minutes</small> : null}
                  {item.learningPathId ? <small>Path: {itemTitle(learningPaths, item.learningPathId)}</small> : null}
                  {item.lessonId ? <small>Lesson: {itemTitle(lessonOptions, item.lessonId)}</small> : null}
                  {item.lessonIds?.length ? <small>{item.lessonIds.length} lessons linked</small> : null}
                  {item.resourceIds?.length ? <small>{item.resourceIds.length} resources linked</small> : null}
                  {materialCount(item) ? <div className="material-tags"><span>{materialCount(item)} links/files</span></div> : null}
                </div>
              </article>
            )) : (
              <article className="empty-content-card">
                <Icon type="plus" className="" />
                <h4>No {activeType.toLowerCase()}s yet</h4>
                <p>Create the first one using the steps above.</p>
              </article>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function TarongaTvPanel({ items, contentItems, status, saveState, saveVideo, deleteVideo }) {
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(createTarongaTvDraft());
  const [imageError, setImageError] = useState("");
  const selectedItem = items.find((item) => item.id === selectedId) || null;
  const lessonOptions = contentItems.filter((item) => item.type === "Lesson");
  const learningPathOptions = contentItems.filter((item) => item.type === "Learning Path");
  const selectedImage = draft.uploadedImageDataUrl || draft.customImageUrl || draft.thumbnailUrl || draft.image || assets[draft.imageKey] || assets.heroKoala;
  const selectedStockImage = stockImages.find((image) => (image.key && image.key === draft.imageKey) || (!draft.imageKey && !draft.uploadedImageDataUrl && !draft.customImageUrl && image.src === draft.thumbnailUrl));

  useEffect(() => {
    if (selectedItem) {
      setDraft({
        ...createTarongaTvDraft(),
        ...selectedItem,
        imageKey: selectedItem.imageKey || "",
        thumbnailUrl: selectedItem.thumbnailUrl || "",
        customImageUrl: selectedItem.imageKey ? "" : (selectedItem.thumbnailUrl || ""),
        uploadedImageDataUrl: "",
        outcomeCodes: Array.isArray(selectedItem.outcomeCodes) ? selectedItem.outcomeCodes.join("\n") : (selectedItem.outcomeCodes || ""),
        categories: selectedItem.categories || [],
        lessonIds: selectedItem.lessonIds || [],
        learningPathIds: selectedItem.learningPathIds || [],
        downloadLinks: Array.isArray(selectedItem.downloadLinks) ? selectedItem.downloadLinks.map((item) => `${item.label} | ${item.url}`).join("\n") : "",
        discussionPoints: selectedItem.discussionPoints?.length ? selectedItem.discussionPoints : [{ time: "", prompt: "" }],
      });
      setImageError("");
      return;
    }

    setDraft(createTarongaTvDraft());
    setImageError("");
  }, [selectedItem]);

  function updateDraft(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function startNew() {
    setSelectedId("");
    setDraft(createTarongaTvDraft());
    setImageError("");
  }

  async function uploadCardImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await resizeImageFile(file);
      updateDraft({ uploadedImageDataUrl: dataUrl, customImageUrl: "", thumbnailUrl: dataUrl, imageKey: "" });
      setImageError("");
    } catch (error) {
      setImageError(error.message);
    }
  }

  function chooseStockImage(value) {
    const stockImage = stockImages.find((image) => image.src === value || image.key === value);
    updateDraft({
      imageKey: stockImage?.key || "",
      thumbnailUrl: stockImage?.key ? "" : (stockImage?.src || value),
      customImageUrl: "",
      uploadedImageDataUrl: "",
    });
  }

  function toggleRelation(field, itemId) {
    setDraft((current) => {
      const currentList = current[field] || [];
      return {
        ...current,
        [field]: currentList.includes(itemId) ? currentList.filter((id) => id !== itemId) : [...currentList, itemId],
      };
    });
  }

  function updateDiscussionPoint(index, patch) {
    setDraft((current) => ({
      ...current,
      discussionPoints: current.discussionPoints.map((point, pointIndex) => pointIndex === index ? { ...point, ...patch } : point),
    }));
  }

  function addDiscussionPoint() {
    setDraft((current) => ({
      ...current,
      discussionPoints: [...current.discussionPoints, { time: "", prompt: "" }],
    }));
  }

  function removeDiscussionPoint(index) {
    setDraft((current) => ({
      ...current,
      discussionPoints: current.discussionPoints.length === 1 ? [{ time: "", prompt: "" }] : current.discussionPoints.filter((_, pointIndex) => pointIndex !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await saveVideo(draft);
    setSelectedId("");
  }

  async function handleDelete() {
    if (!selectedItem) return;
    if (!window.confirm(`Delete Taronga TV video "${selectedItem.title}"?`)) return;
    await deleteVideo(selectedItem);
    setSelectedId("");
  }

  return (
    <section className="staff-section staff-panel active">
      <div className="section-heading">
        <div>
          <h2>Taronga TV</h2>
          <p>Create curriculum-aligned videos with linked lessons, learning paths, outcomes and timed discussion points.</p>
        </div>
      </div>
      <ContentFirestoreStatus status={status} saveState={saveState} />

      <div className="content-flow-shell">
        <form className="content-form content-flow-form" onSubmit={handleSubmit}>
          <div className="content-flow-toolbar">
            <div>
              <span className="content-type">{selectedId ? "Editing video" : "New video"}</span>
              <h3>{selectedId ? draft.title || "Edit Taronga TV video" : "Create Taronga TV video"}</h3>
              <p>Keep the workflow simple: add the classroom-facing summary, paste the embed link, connect curriculum and then drop in pause-point prompts.</p>
            </div>
            <div className="content-flow-toolbar-actions">
              <label className="content-quick-select">
                Continue editing
                <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                  <option value="">Start a new video</option>
                  {items.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
              </label>
              <button type="button" className="secondary-button" onClick={startNew}>New video</button>
            </div>
          </div>

          <div className="content-flow-main">
            <section className="content-step-card">
              <div className="content-step-header">
                <span className="content-step-badge">1</span>
                <div>
                  <h4>Video details</h4>
                  <p>Add the essential teacher-facing information first.</p>
                </div>
              </div>
              <div className="content-editor-fields">
                <label>Title<input type="text" required value={draft.title} onChange={(event) => updateDraft({ title: event.target.value })} /></label>
                <label>Status<select value={draft.status} onChange={(event) => updateDraft({ status: event.target.value })}><option>Draft</option><option>Published</option></select></label>
                <label>Subject<select value={draft.subject} onChange={(event) => updateDraft({ subject: event.target.value })}>{subjects.map(([label]) => <option key={label}>{label}</option>)}</select></label>
                <label>Stage<input type="text" value={draft.stage} onChange={(event) => updateDraft({ stage: event.target.value })} /></label>
                <label>Duration<input type="text" value={draft.duration} onChange={(event) => updateDraft({ duration: event.target.value })} placeholder="6 min" /></label>
                <label>Embed or YouTube URL<input type="url" value={draft.embedUrl} onChange={(event) => updateDraft({ embedUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=... or embed URL" /></label>
                <label className="wide-field">Summary<input type="text" required value={draft.summary} onChange={(event) => updateDraft({ summary: event.target.value })} /></label>
                <label className="wide-field">Description<textarea value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })}></textarea></label>
                <fieldset className="lesson-picker wide-field">
                  <legend>Categories / playlists</legend>
                  {tarongaTvCategories.map((category) => <label key={category}><input type="checkbox" checked={draft.categories.includes(category)} onChange={() => toggleRelation("categories", category)} />{category}</label>)}
                </fieldset>
                <label className="wide-field">Download links<textarea placeholder="One per line: Label | URL" value={draft.downloadLinks} onChange={(event) => updateDraft({ downloadLinks: event.target.value })}></textarea></label>
              </div>
            </section>

            <section className="content-step-card">
              <div className="content-step-header">
                <span className="content-step-badge">2</span>
                <div>
                  <h4>Thumbnail and preview</h4>
                  <p>Use a stock image, your own upload, or a direct thumbnail URL.</p>
                </div>
              </div>
              <div className="simple-image-picker">
                <img src={selectedImage} alt="" />
                <div>
                  <label>
                    Stock image
                    <select value={selectedStockImage ? (selectedStockImage.key || selectedStockImage.src) : ""} onChange={(event) => chooseStockImage(event.target.value)}>
                      <option value="">Choose a stock image</option>
                      {stockImages.map((stockImage) => <option value={stockImage.key || stockImage.src} key={`${stockImage.label}-${stockImage.src}`}>{stockImage.label}</option>)}
                    </select>
                  </label>
                  <label>Thumbnail URL<input type="url" value={draft.customImageUrl} onChange={(event) => updateDraft({ customImageUrl: event.target.value, uploadedImageDataUrl: "", thumbnailUrl: event.target.value, imageKey: "" })} placeholder="https://..." /></label>
                  <label>Upload thumbnail<input type="file" accept="image/*" onChange={uploadCardImage} /></label>
                  {imageError ? <p className="auth-error">{imageError}</p> : null}
                </div>
              </div>
            </section>

            <section className="content-step-card">
              <div className="content-step-header">
                <span className="content-step-badge">3</span>
                <div>
                  <h4>Curriculum and linked content</h4>
                  <p>Connect the video to outcomes, lessons and learning paths teachers can open next.</p>
                </div>
              </div>
              <div className="content-editor-fields">
                <label className="wide-field">Outcomes<textarea placeholder="One outcome per line" value={draft.outcomeCodes} onChange={(event) => updateDraft({ outcomeCodes: event.target.value })}></textarea></label>
                <fieldset className="lesson-picker wide-field">
                  <legend>Linked lessons</legend>
                  {lessonOptions.length ? lessonOptions.map((lesson) => <label key={lesson.id || lesson.title}><input type="checkbox" checked={draft.lessonIds.includes(lesson.id)} onChange={() => toggleRelation("lessonIds", lesson.id)} />{lesson.title}<small>{lesson.subject} - {lesson.stage}</small></label>) : <p>Create lessons first, then attach them here.</p>}
                </fieldset>
                <fieldset className="lesson-picker wide-field">
                  <legend>Linked learning paths</legend>
                  {learningPathOptions.length ? learningPathOptions.map((path) => <label key={path.id || path.title}><input type="checkbox" checked={draft.learningPathIds.includes(path.id)} onChange={() => toggleRelation("learningPathIds", path.id)} />{path.title}<small>{path.subject} - {path.stage}</small></label>) : <p>Create learning paths first, then attach them here.</p>}
                </fieldset>
              </div>
            </section>

            <section className="content-step-card">
              <div className="content-step-header">
                <span className="content-step-badge">4</span>
                <div>
                  <h4>Timed discussion points</h4>
                  <p>Add the pause moments and teacher prompts that make the video immediately usable in class.</p>
                </div>
              </div>
              <div className="discussion-points-editor">
                {draft.discussionPoints.map((point, index) => (
                  <div className="discussion-point-row" key={`discussion-${index}`}>
                    <label>Time<input type="text" value={point.time} onChange={(event) => updateDiscussionPoint(index, { time: event.target.value })} placeholder="02:15" /></label>
                    <label>Talking point<textarea value={point.prompt} onChange={(event) => updateDiscussionPoint(index, { prompt: event.target.value })} placeholder="Pause and ask..." /></label>
                    <button type="button" className="secondary-button slim-button" onClick={() => removeDiscussionPoint(index)}>Remove</button>
                  </div>
                ))}
                <button type="button" className="secondary-button" onClick={addDiscussionPoint}>Add discussion point</button>
              </div>
            </section>

            <section className="content-step-card review-card">
              <div className="content-step-header">
                <span className="content-step-badge">5</span>
                <div>
                  <h4>Review and publish</h4>
                  <p>Teachers will see this in Taronga TV and can open the linked learning from the video page.</p>
                </div>
              </div>
              <div className="content-review-grid">
                <div className="content-review-preview">
                  <img className="content-thumb" src={selectedImage} alt="" />
                  <div>
                    <span className="content-type">{draft.status}</span>
                    <h5>{draft.title || "Untitled Taronga TV video"}</h5>
                    <p>{draft.summary || "Add a short summary so teachers can scan the purpose of the video."}</p>
                    <div className="material-tags">
                      <span>{draft.subject}</span>
                      <span>{draft.stage}</span>
                      {draft.duration ? <span>{draft.duration}</span> : null}
                    </div>
                  </div>
                </div>
                <div className="content-review-meta">
                  <h5>Teacher experience</h5>
                  <div className="editor-meta-list">
                    <span>Taronga TV library</span>
                    <span>Video detail page</span>
                    <span>Linked lessons and paths</span>
                  </div>
                  <div className="content-form-actions">
                    {selectedItem ? <a className="secondary-button slim-button" href={teacherTvRoute(selectedItem.id)} target="_blank" rel="noreferrer">Preview teacher page</a> : null}
                    {selectedItem ? <button type="button" className="delete-button editor-delete-button" onClick={handleDelete}>Delete</button> : null}
                    <button type="button" className="secondary-button" onClick={startNew}>Clear form</button>
                    <button type="submit" disabled={saveState === "saving"}>{saveState === "saving" ? "Saving..." : selectedItem ? "Update video" : "Save video"}</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </form>

        <section className="content-library-section">
          <div className="content-library-section-header">
            <div>
              <span className="content-type">Taronga TV</span>
              <h3>Existing videos</h3>
              <p>Choose a video to edit, or stay in the flow above to create a new one.</p>
            </div>
            <button type="button" className="secondary-button" onClick={startNew}>New video</button>
          </div>
          <div className="content-library-grid">
            {items.length ? items.map((item) => (
              <article className={`content-mini-card ${selectedId === item.id ? "selected" : ""}`} key={item.id} onClick={() => setSelectedId(item.id)}>
                <img className="content-thumb" src={item.thumbnail} alt="" />
                <div>
                  <span className="content-type">{item.status}</span>
                  <h4>{item.title}</h4>
                  <p>{item.summary}</p>
                  <small>{item.subject} - {item.stage}</small>
                  {item.duration ? <small>{item.duration}</small> : null}
                  {item.categories?.length ? <small>{item.categories.join(" · ")}</small> : null}
                  {item.discussionPoints?.length ? <small>{item.discussionPoints.length} discussion points</small> : null}
                </div>
              </article>
            )) : (
              <article className="empty-content-card">
                <Icon type="play" className="" />
                <h4>No videos yet</h4>
                <p>Create the first Taronga TV video using the steps above.</p>
              </article>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function ProfessionalLearningPanel({ items, status, saveState, saveItem, deleteItem }) {
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState({
    title: "",
    date: "",
    time: "",
    summary: "",
    description: "",
    registrationUrl: "",
    pdfUrl: "",
    infoUrl: "",
    status: "Draft",
  });

  const selectedItem = items.find((item) => item.id === selectedId) || null;

  useEffect(() => {
    if (selectedItem) {
      setDraft({
        id: selectedItem.id,
        title: selectedItem.title || "",
        date: selectedItem.date || "",
        time: selectedItem.time || "",
        summary: selectedItem.summary || "",
        description: selectedItem.description || "",
        registrationUrl: selectedItem.registrationUrl || "",
        pdfUrl: selectedItem.pdfUrl || "",
        infoUrl: selectedItem.infoUrl || "",
        downloadLinks: Array.isArray(selectedItem.downloadLinks) ? selectedItem.downloadLinks.map((item) => `${item.label} | ${item.url}`).join("\n") : "",
        status: selectedItem.status || "Draft",
      });
      return;
    }

    setDraft({
      title: "",
      date: "",
      time: "",
      summary: "",
      description: "",
      registrationUrl: "",
      pdfUrl: "",
      infoUrl: "",
      downloadLinks: "",
      status: "Draft",
    });
  }, [selectedItem]);

  async function handleSubmit(event) {
    event.preventDefault();
    await saveItem(draft);
    setSelectedId("");
  }

  async function handleDelete() {
    if (!selectedItem) return;
    if (!window.confirm(`Delete professional learning event "${selectedItem.title}"?`)) return;
    await deleteItem(selectedItem);
    setSelectedId("");
  }

  return (
    <section className="staff-section staff-panel active">
      <div className="section-heading">
        <div>
          <h2>Professional Learning</h2>
          <p>Create upcoming professional learning sessions for teachers. These surface in the teacher professional learning page, calendar and notification bell.</p>
        </div>
      </div>
      <ContentFirestoreStatus status={status} saveState={saveState} />
      <div className="content-flow-shell">
        <form className="content-form content-flow-form" onSubmit={handleSubmit}>
          <div className="content-flow-toolbar">
            <div>
              <span className="content-type">{selectedItem ? "Editing session" : "New session"}</span>
              <h3>{selectedItem ? draft.title || "Edit professional learning session" : "Create professional learning session"}</h3>
              <p>Keep the setup simple: add the session basics, paste the registration and information links, then publish it to teachers.</p>
            </div>
            <div className="content-flow-toolbar-actions">
              <label className="content-quick-select">
                Continue editing
                <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                  <option value="">Start a new session</option>
                  {items.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
              </label>
              <button type="button" className="secondary-button" onClick={() => setSelectedId("")}>New session</button>
            </div>
          </div>

          <div className="content-flow-main">
            <section className="content-step-card">
              <div className="content-step-header">
                <span className="content-step-badge">1</span>
                <div>
                  <h4>Session details</h4>
                  <p>Add the details teachers need to understand the event at a glance.</p>
                </div>
              </div>
              <div className="content-editor-fields">
                <label>Title<input type="text" required value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
                <label>Status<select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}><option>Draft</option><option>Published</option></select></label>
                <label>Date<input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} /></label>
                <label>Time<input type="text" value={draft.time} onChange={(event) => setDraft((current) => ({ ...current, time: event.target.value }))} placeholder="4:00 PM AEST" /></label>
                <label className="wide-field">Summary<input type="text" value={draft.summary} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} /></label>
                <label className="wide-field">Description<textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}></textarea></label>
              </div>
            </section>

            <section className="content-step-card">
              <div className="content-step-header">
                <span className="content-step-badge">2</span>
                <div>
                  <h4>Links and files</h4>
                  <p>Put everything teachers may need to register or prepare in one place.</p>
                </div>
              </div>
              <div className="content-editor-fields">
                <label>Registration link<input type="url" value={draft.registrationUrl} onChange={(event) => setDraft((current) => ({ ...current, registrationUrl: event.target.value }))} placeholder="https://..." /></label>
                <label>Information link<input type="url" value={draft.infoUrl} onChange={(event) => setDraft((current) => ({ ...current, infoUrl: event.target.value }))} placeholder="https://..." /></label>
                <label className="wide-field">PDF link<input type="url" value={draft.pdfUrl} onChange={(event) => setDraft((current) => ({ ...current, pdfUrl: event.target.value }))} placeholder="https://..." /></label>
                <label className="wide-field">Download links<textarea placeholder="One per line: Label | URL" value={draft.downloadLinks} onChange={(event) => setDraft((current) => ({ ...current, downloadLinks: event.target.value }))}></textarea></label>
              </div>
            </section>

            <section className="content-step-card">
              <div className="content-step-header">
                <span className="content-step-badge">3</span>
                <div>
                  <h4>Teacher experience</h4>
                  <p>Published sessions will automatically surface in the right teacher-facing places.</p>
                </div>
              </div>
              <div className="editor-meta-list">
                <span>Professional Learning page</span>
                <span>Teacher calendar</span>
                <span>Notification bell</span>
              </div>
            </section>

            <section className="content-step-card review-card">
              <div className="content-step-header">
                <span className="content-step-badge">4</span>
                <div>
                  <h4>Review and publish</h4>
                  <p>Check the session summary, then save it to Firestore.</p>
                </div>
              </div>
              <div className="content-review-grid">
                <div className="content-review-preview">
                  <img className="content-thumb" src={assets.gorilla} alt="" />
                  <div>
                    <span className="content-type">{draft.status}</span>
                    <h5>{draft.title || "Untitled professional learning session"}</h5>
                    <p>{draft.summary || "Add a short summary so teachers can scan the focus of the session."}</p>
                    <div className="material-tags">
                      {draft.date ? <span>{draft.date}</span> : null}
                      {draft.time ? <span>{draft.time}</span> : null}
                      <span>{selectedItem ? "Existing session" : "New session"}</span>
                    </div>
                  </div>
                </div>
                <div className="content-review-meta">
                  <h5>Teacher visibility</h5>
                  <div className="editor-meta-list">
                    <span>Registration CTA</span>
                    <span>Calendar event</span>
                    <span>Notification item</span>
                  </div>
                  <div className="content-form-actions">
                    {selectedItem ? <button type="button" className="delete-button editor-delete-button" onClick={handleDelete}>Delete</button> : null}
                    <button type="button" className="secondary-button" onClick={() => setSelectedId("")}>Clear form</button>
                    <button type="submit" disabled={saveState === "saving"}>{saveState === "saving" ? "Saving..." : selectedItem ? "Update session" : "Save session"}</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </form>

        <section className="content-library-section">
          <div className="content-library-section-header">
            <div>
              <span className="content-type">Professional Learning</span>
              <h3>Existing sessions</h3>
              <p>Choose a session to edit, or stay in the flow above to create a new one.</p>
            </div>
            <button type="button" className="secondary-button" onClick={() => setSelectedId("")}>New session</button>
          </div>
          <div className="content-library-grid">
            {items.length ? items.map((item) => (
              <article className={`content-mini-card ${selectedId === item.id ? "selected" : ""}`} key={item.id} onClick={() => setSelectedId(item.id)}>
                <img className="content-thumb" src={assets.gorilla} alt="" />
                <div>
                  <span className="content-type">{item.status}</span>
                  <h4>{item.title}</h4>
                  <p>{item.summary}</p>
                  <small>{item.date}{item.time ? ` - ${item.time}` : ""}</small>
                </div>
              </article>
            )) : (
              <article className="empty-content-card">
                <Icon type="plus" className="" />
                <h4>No sessions yet</h4>
                <p>Create the first professional learning session using the steps above.</p>
              </article>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function DashboardEditor({ config, contentItems, updateConfig, reset, previewKey, publish, status, saveState }) {
  const saveText = saveState === "saving" ? "Publishing..." : "Publish changes";
  return <section className="staff-section staff-panel active"><div className="section-heading"><div><h2>Edit teacher dashboard</h2><p>Live-edit teacher-facing dashboard text, imagery and visibility flags before publishing.</p></div><div className="heading-actions"><button type="button" onClick={reset}>Reset preview</button><button type="button" onClick={publish} disabled={saveState === "saving"}>{saveText}</button></div></div><article className="dashboard-editor live-dashboard-editor"><div className="editor-copy"><span className="content-type">Teacher Dashboard Editor</span><h3>Update teacher-facing dashboard content</h3><p>Changes below update the preview immediately. Publishing writes the values to Firestore at dashboardConfig/main.</p><FirestoreStatus status={status} saveState={saveState} /></div><form className="editor-form"><label>Hero headline<input type="text" value={config.heroTitle} onChange={(event) => updateConfig({ heroTitle: event.target.value })} /></label><label>Hero subheading<input type="text" value={config.heroSubtitle} onChange={(event) => updateConfig({ heroSubtitle: event.target.value })} /></label><label>Hero image<select value={config.heroImageUrl} onChange={(event) => updateConfig({ heroImageUrl: event.target.value })}><option value={assets.heroKoala}>Koala with joey</option><option value={assets.giraffe}>Giraffe at Taronga</option><option value={assets.binturong}>Binturong encounter</option><option value={assets.gorilla}>Gorilla habitat</option></select></label><label>Featured resource title<select value={config.featuredResourceTitle} onChange={(event) => updateConfig({ featuredResourceTitle: event.target.value })}>{contentItems.map((item) => <option key={item.id || item.title}>{item.title}</option>)}</select></label></form><div className="flag-grid" aria-label="Teacher dashboard content flags"><label><input type="checkbox" checked={config.showContinueLearning} onChange={(event) => updateConfig({ showContinueLearning: event.target.checked })} /> Show Continue Learning</label><label><input type="checkbox" checked={config.showUpcomingPanel} onChange={(event) => updateConfig({ showUpcomingPanel: event.target.checked })} /> Show Upcoming panel</label><label><input type="checkbox" checked={config.showTrackaCard} onChange={(event) => updateConfig({ showTrackaCard: event.target.checked })} /> Feature Taronga Tracka card</label><label><input type="checkbox" /> Show beta student insights</label><label><input type="checkbox" defaultChecked /> Display new resource badges</label><label><input type="checkbox" /> Lock subject cards during review</label></div><div className="teacher-live-preview"><div className="preview-toolbar"><span>Live teacher dashboard preview</span><a href={routePath("teacher")} target="_blank" rel="noreferrer">Open full view</a></div><div className="preview-frame" key={previewKey}><TeacherDashboard config={config} contentItems={contentItems} /></div></div></article></section>;
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

function ContentFirestoreStatus({
  status,
  saveState,
  collectionLabel = "content library",
  collectionName = "contentItems",
  loadingLabel,
  emptyLabel,
  errorLabel,
  savingLabel,
  savedLabel,
}) {
  if (status === "live" && !saveState) return null;

  const messages = {
    loading: loadingLabel || `Loading Firestore ${collectionLabel}...`,
    missing: emptyLabel || `Firestore ${collectionName} is empty. Showing fallback content until you seed or add content.`,
    error: errorLabel || `Firestore ${collectionLabel} could not load. Check rules allow access to ${collectionName}.`,
    saving: savingLabel || "Writing content to Firestore...",
    saved: savedLabel || "Content saved to Firestore.",
  };

  const statusKey = saveState && saveState !== "idle" ? saveState : status;
  return <p className={`firestore-status ${statusKey}`}>{messages[statusKey]}</p>;
}

function PlaceholderExperiencePage({ eyebrow, title, description, points = [], primaryLabel, primaryHref, secondaryLabel, secondaryHref }) {
  return (
    <>
      <header className="site-header">
        <a className="site-logo" href={routePath()} aria-label="Wildly by Taronga home"><img src={assets.wildlyLogo} alt="Wildly by Taronga" /></a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href={routePath()}>Home</a><a href={teacherRoute()}>Teacher</a><a href={routePath("staff")}>Staff</a><a href={appLinks.support}>Support</a><a href={appLinks.professionalLearning}>Professional Learning</a>
        </nav>
        <div className="header-actions"><a className="login-link" href={loginRoute()}>Teacher login</a><a className="start-link" href={routePath("staff")}>Staff login</a></div>
      </header>
      <main>
        <section className="hero-section standalone-page">
          <div className="hero-copy">
            <span className="audience-pill">{eyebrow}</span>
            <h1>{title}</h1>
            <p className="hero-subtitle">Wildly by Taronga</p>
            <p>{description}</p>
            <div className="hero-actions">
              <a className="primary-action" href={primaryHref}>{primaryLabel}</a>
              <a className="secondary-action" href={secondaryHref}>{secondaryLabel}</a>
            </div>
          </div>
          <div className="tool-panel">
            <div>
              <h2>What this space is for</h2>
              <ul>{points.map((point) => <li key={point}>{point}</li>)}</ul>
            </div>
            <div className="mini-dashboard"><img src={assets.heroKoala} alt="" /><span></span><span></span><span></span></div>
          </div>
        </section>
      </main>
    </>
  );
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

  if (path === "login") return <AuthScreen mode="login" />;
  if (path === "get-started") return <AuthScreen mode="signup" />;
  if (path === "about-you") return <AboutYouPage />;
  if (path === "/teacher" || path === "/teacher.html" || path === "teacher" || path === "teacher.html") return <TeacherPage />;
  if (path.startsWith("teacher/")) {
    const [, section = "dashboard", third = ""] = path.split("/");
    if (section === "preview") return <TeacherPage preview />;
    if (section === "subjects") return <TeacherPage page="subjects" subject={third} />;
    if (section === "content") return <TeacherPage page="content" contentId={third} />;
    if (section === "taronga-tv") return <TeacherPage page="taronga-tv" tvVideoId={third} />;
    if (section === "professional-learning") return <TeacherPage page="professional-learning" />;
    return <TeacherPage page={section || "dashboard"} />;
  }
  if (path === "/staff" || path === "/staff.html") return <StaffPage />;
  if (path === "staff" || path === "staff.html") return <StaffPage />;
  if (path === "demo-booking") return <PlaceholderExperiencePage eyebrow="Demo Booking" title="Book a Wildly demo" description="This page is ready for your real demo booking workflow. Use it for school enquiries, implementation calls and onboarding sessions." points={["Demo request form or embedded scheduler", "School details and contact intake", "Implementation readiness checklist"]} primaryLabel="Teacher Dashboard" primaryHref={teacherRoute()} secondaryLabel="Support" secondaryHref={appLinks.support} />;
  if (path === "support") return <PlaceholderExperiencePage eyebrow="Support" title="Wildly support" description="This is the right place for help content, onboarding docs, support contact details and troubleshooting guidance." points={["Teacher help centre or FAQs", "Support email, form or live chat", "Technical setup and Firestore guidance"]} primaryLabel="Teacher Dashboard" primaryHref={teacherRoute()} secondaryLabel="Professional Learning" secondaryHref={appLinks.professionalLearning} />;
  if (path === "excursions") return <PlaceholderExperiencePage eyebrow="Excursions" title="Excursions and zoo links" description="Use this space for visit planning, excursion bookings, pre-visit resources and Tracka-connected field learning." points={["Excursion booking links", "Pre-visit teacher packs", "On-site learning workflows and Tracka links"]} primaryLabel="Teacher Dashboard" primaryHref={teacherRoute("calendar")} secondaryLabel="Home" secondaryHref={routePath()} />;
  if (path === "professional-learning") return <TeacherPage page="professional-learning" />;
  return <LandingPage />;
}

createRoot(document.getElementById("root")).render(<App />);
