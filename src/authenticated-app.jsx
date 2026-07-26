import React, { useEffect, useMemo, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
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
const studentRoute = (path = "") => routePath(path ? `student/${path}` : "student");
const loginRoute = () => routePath("login");
const signupRoute = () => routePath("get-started");
const aboutYouRoute = () => routePath("about-you");
const demoSessionKey = "wildly-demo-session";

const assets = {
  wildlyLogo: assetPath("assets/wildly-logo-transparent.png"),
  trackaLogo: assetPath("assets/taronga-tracka-logo-colour.png"),
  trackaLogoFull: assetPath("assets/tracka-logo-full.png"),
  heroKoala: assetPath("assets/hero-koala.jpg"),
  koala: assetPath("assets/koala.jpg"),
  river: assetPath("assets/river.png"),
  rhino: assetPath("assets/rhino.jpg"),
  giraffe: assetPath("assets/giraffe.jpg"),
  binturong: assetPath("assets/binturong.jpg"),
  gorilla: assetPath("assets/gorilla.jpg"),
  teacherPl: assetPath("assets/teacher-pl.png"),
  aboutTop: assetPath("assets/about-top.png"),
  aboutBottom: assetPath("assets/about-bottom.png"),
  tvScreenshot: assetPath("assets/TV-Screenshot.png"),
  dashboardScreenshot: assetPath("assets/wildly-dashboard-homepage.png"),
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

const defaultTeacherStudents = [
  { id: "stu-ava", name: "Ava Wilson", classId: "year-3-blue", status: "Needs support", focus: "Data interpretation", streak: 4 },
  { id: "stu-noah", name: "Noah Patel", classId: "year-3-blue", status: "On track", focus: "Scientific explanations", streak: 6 },
  { id: "stu-mia", name: "Mia Brown", classId: "year-3-blue", status: "Extension ready", focus: "Reflection writing", streak: 8 },
  { id: "stu-luca", name: "Luca Smith", classId: "year-4-green", status: "On track", focus: "Systems thinking", streak: 5 },
  { id: "stu-charlotte", name: "Charlotte Lee", classId: "year-4-green", status: "Needs support", focus: "Vocabulary and evidence", streak: 3 },
  { id: "stu-harper", name: "Harper Jones", classId: "year-4-green", status: "On track", focus: "Inquiry planning", streak: 7 },
  { id: "stu-ethan", name: "Ethan Nguyen", classId: "stage-3-extension", status: "Extension ready", focus: "Independent investigation", streak: 10 },
  { id: "stu-grace", name: "Grace Kim", classId: "stage-3-extension", status: "On track", focus: "Argument structure", streak: 6 },
  { id: "stu-oliver", name: "Oliver White", classId: "stage-3-extension", status: "Needs support", focus: "Completion and organisation", streak: 2 },
];

const defaultTeacherClasses = [
  { id: "year-3-blue", title: "Year 3 Blue", stage: "Stage 2", note: "Foundations and observation", studentIds: ["stu-ava", "stu-noah", "stu-mia"] },
  { id: "year-4-green", title: "Year 4 Green", stage: "Stage 2", note: "Excursion preparation", studentIds: ["stu-luca", "stu-charlotte", "stu-harper"] },
  { id: "stage-3-extension", title: "Stage 3 Extension", stage: "Stage 3", note: "Inquiry and extension", studentIds: ["stu-ethan", "stu-grace", "stu-oliver"] },
];

function createDefaultTeacherAssignments() {
  return [
    {
      id: "asg-adaptations-year3",
      classId: "year-3-blue",
      contentId: "adaptations-australian-animals",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      assignedAt: new Date().toISOString().slice(0, 10),
    },
    {
      id: "asg-futures-year4",
      classId: "year-4-green",
      contentId: "sustainable-futures",
      dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      assignedAt: new Date().toISOString().slice(0, 10),
    },
  ];
}

function createDefaultTeacherWorkspace() {
  return {
    savedItemIds: ["animal-movement-data-patterns"],
    classes: defaultTeacherClasses,
    assignments: createDefaultTeacherAssignments(),
  };
}

const defaultLiveActivityBlocks = [
  {
    id: "intro-slide",
    type: "slide",
    title: "Welcome",
    prompt: "Introduce the lesson, frame the learning intention, and get students ready to respond.",
    notes: "Teacher framing and discussion prompt.",
    options: [],
  },
  {
    id: "check-for-understanding",
    type: "quiz",
    title: "Quick check",
    prompt: "Which idea best matches the main concept from this part of the lesson?",
    notes: "",
    options: ["Option A", "Option B", "Option C", "Option D"],
    answer: "Option A",
  },
  {
    id: "extended-response",
    type: "extended-response",
    title: "Reflect and explain",
    prompt: "Explain your thinking using evidence from the lesson.",
    notes: "Use this for written reasoning or exit-ticket style reflection.",
    options: [],
  },
];

function createActivityBlock(type = "slide") {
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title: type === "slide" ? "Content slide" : type === "quiz" ? "Quiz question" : type === "poll" ? "Poll" : "Extended response",
    prompt: "",
    notes: "",
    options: type === "slide" || type === "extended-response" ? [] : ["Option 1", "Option 2"],
    answer: "",
  };
}

function normalizeActivityBlocks(blocks = []) {
  return blocks
    .map((block, index) => ({
      id: block.id || `step-${index + 1}`,
      type: block.type || "slide",
      title: block.title?.trim() || `Step ${index + 1}`,
      prompt: block.prompt?.trim() || "",
      notes: block.notes?.trim() || "",
      options: Array.isArray(block.options) ? block.options.map((option) => option.trim()).filter(Boolean) : [],
      answer: block.answer?.trim() || "",
    }))
    .filter((block) => block.prompt || block.notes || block.options.length || block.type === "slide");
}

function buildLessonActivityBlocks(item) {
  const savedBlocks = normalizeActivityBlocks(item.materials?.activityBlocks || []);
  if (savedBlocks.length) return savedBlocks;
  return defaultLiveActivityBlocks.map((block, index) => ({
    ...block,
    id: `${item.id || "content"}-${index + 1}`,
    title: index === 0 ? item.title : block.title,
    prompt: index === 0 ? (item.summary || item.description || block.prompt) : block.prompt,
  }));
}

function generateSessionCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const staffPassword = "admin";
const staffSessionKey = "wildly-staff-session";
const staffRoles = ["Education Staff", "Curriculum Leader", "School Leader"];

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
    activityBlocks: type === "Lesson" ? defaultLiveActivityBlocks.map((block) => ({ ...block })) : [],
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

  const iframeSrcMatch = raw.match(/src=["']([^"']+)["']/i);
  const candidate = iframeSrcMatch?.[1] || raw;
  if (candidate.includes("/embed/")) {
    return candidate.replace("https://www.youtube.com/embed/", "https://www.youtube-nocookie.com/embed/")
      .replace("https://youtube.com/embed/", "https://www.youtube-nocookie.com/embed/")
      .replace("https://m.youtube.com/embed/", "https://www.youtube-nocookie.com/embed/");
  }

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
    let id = "";

    if (hostname === "youtu.be") {
      id = url.pathname.replace("/", "");
    } else if (hostname === "youtube.com") {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v") || "";
      } else if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/live/") || url.pathname.startsWith("/embed/")) {
        id = url.pathname.split("/")[2] || "";
      }
    }

    if (id) {
      const start = url.searchParams.get("t") || url.searchParams.get("start") || "";
      const normalizedStart = start ? String(parseInt(start, 10) || 0) : "";
      const startQuery = normalizedStart ? `?start=${normalizedStart}` : "";
      return `https://www.youtube-nocookie.com/embed/${id}${startQuery}`;
    }

    if (hostname === "youtu.be") {
      const id = url.pathname.replace("/", "");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : candidate;
    }
  } catch {
    return candidate;
  }

  return candidate;
}

function firstParagraph(text = "") {
  return String(text || "").split(/\n\s*\n|\r\n\s*\r\n/).map((part) => part.trim()).find(Boolean) || "";
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
    link: <><path d="M10.5 13.5 13.5 10.5" /><path d="M8.2 16.8 6.7 18.3a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0" /><path d="m15.8 7.2 1.5-1.5a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0" /></>,
    chevron: <path d="m7 9.5 5 5 5-5" />,
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

function formatDisplayDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function downloadCalendarInvite(title, date, description = "") {
  if (!date) return;
  const start = date.replace(/-/g, "");
  const endDate = new Date(`${date}T12:00:00`);
  endDate.setDate(endDate.getDate() + 1);
  const end = endDate.toISOString().slice(0, 10).replace(/-/g, "");
  const safeTitle = title.replace(/,/g, "");
  const safeDescription = description.replace(/\n/g, " ").replace(/,/g, "");
  const contents = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wildly by Taronga//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@wildly`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${safeTitle}`,
    `DESCRIPTION:${safeDescription}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
  downloadTextFile(`${safeTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "wildly-event"}.ics`, contents, "text/calendar;charset=utf-8");
}

function teacherWorkspaceStorageKey(user, profile) {
  const base = profile?.email || user?.email || user?.uid || "guest";
  return `wildly-teacher-workspace:${base}`;
}

function useTeacherWorkspace(user, profile) {
  const storageKey = teacherWorkspaceStorageKey(user, profile);
  const [workspace, setWorkspace] = useState(createDefaultTeacherWorkspace);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) {
        setWorkspace(createDefaultTeacherWorkspace());
        return;
      }

      const parsed = JSON.parse(saved);
      setWorkspace({
        ...createDefaultTeacherWorkspace(),
        ...parsed,
        savedItemIds: Array.isArray(parsed.savedItemIds) ? parsed.savedItemIds : [],
        classes: Array.isArray(parsed.classes) && parsed.classes.length ? parsed.classes : defaultTeacherClasses,
        assignments: Array.isArray(parsed.assignments) ? parsed.assignments : createDefaultTeacherAssignments(),
      });
    } catch {
      setWorkspace(createDefaultTeacherWorkspace());
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(workspace));
  }, [storageKey, workspace]);

  function toggleSavedItem(itemId) {
    setWorkspace((current) => ({
      ...current,
      savedItemIds: current.savedItemIds.includes(itemId)
        ? current.savedItemIds.filter((id) => id !== itemId)
        : [...current.savedItemIds, itemId],
    }));
  }

  function assignContentToClass(contentId, classId, dueDate) {
    setWorkspace((current) => {
      const existingIndex = current.assignments.findIndex((item) => item.contentId === contentId && item.classId === classId);
      const nextAssignment = {
        id: existingIndex >= 0 ? current.assignments[existingIndex].id : `asg-${Date.now()}`,
        contentId,
        classId,
        dueDate,
        assignedAt: new Date().toISOString().slice(0, 10),
      };

      const assignments = existingIndex >= 0
        ? current.assignments.map((item, index) => (index === existingIndex ? nextAssignment : item))
        : [...current.assignments, nextAssignment];

      return { ...current, assignments };
    });
  }

  function createClass(title, stage) {
    const classId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    setWorkspace((current) => ({
      ...current,
      classes: [
        ...current.classes,
        { id: classId, title, stage, note: "Custom class", studentIds: [] },
      ],
    }));
  }

  return {
    workspace,
    toggleSavedItem,
    assignContentToClass,
    createClass,
  };
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
        // Shared "Taronga Education" identity — teachers/{email}, not users/{uid}.
        // Same doc Taronga Tracka reads/writes, keyed by the Auth account's email.
        const profileSnapshot = await getDoc(doc(db, "teachers", firebaseUser.email.toLowerCase()));
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
  const { status, user } = useSessionUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolManual, setSchoolManual] = useState("");
  const [cantFindSchool, setCantFindSchool] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status !== "ready" || !user) return;
    // A Tracka account signing into Wildly for the first time already has
    // everything Wildly needs (email, password, school) — no extra profile
    // step, straight to the dashboard, same as any other login.
    window.location.hash = "#teacher";
  }, [status, user]);

  const school = cantFindSchool ? schoolManual.trim() : schoolSearch.trim();
  const isLoginValid = email.trim().includes("@") && password.length > 0;
  const isSignupValid = email.trim().includes("@") && password.length >= 6 && password === confirm && school.length > 1;

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

      if (isSignup) {
        if (!isSignupValid) {
          setNotice(password !== confirm ? "Passwords do not match." : "Please fill in every field.");
          return;
        }
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await setDoc(doc(db, "teachers", credential.user.email.toLowerCase()), {
          email: credential.user.email.toLowerCase(),
          schoolName: school,
          createdAt: serverTimestamp(),
          products: arrayUnion("wildly"),
        }, { merge: true });
        window.location.hash = "#teacher";
        return;
      }

      if (!password.trim()) {
        setNotice("Please enter your password.");
        return;
      }

      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      setDoc(doc(db, "teachers", credential.user.email.toLowerCase()), { products: arrayUnion("wildly") }, { merge: true }).catch(() => {});
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <img src={assets.trackaLogoFull} alt="Taronga Tracka" style={{ height: "72px", width: "auto" }} />
          <span style={{ color: "#D4D4D8", fontSize: "1.6rem", fontWeight: 200 }}>+</span>
          <img src={assets.wildlyLogo} alt="Wildly by Taronga" style={{ height: "64px", width: "auto" }} />
        </div>
        <h1 style={{ fontFamily: '"Taronga Headline", "Avenir Next", Avenir, sans-serif', fontWeight: 400 }}>Taronga Education</h1>
        <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#71717A" }}>Multiple applications, one log-in</p>
        <span className="audience-pill">{isSignup ? "Create account" : "Welcome back"}</span>
        <p>{isSignup ? "Create one account for Taronga Tracka, Wildly by Taronga, and more." : "Sign in to access Taronga Tracka, Wildly by Taronga, and more."}</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={isSignup ? "you@school.edu" : "Enter your email"} autoComplete="email" required />
          </label>
          <label>
            Password{isSignup ? " (min. 6 characters)" : ""}
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete={isSignup ? "new-password" : "current-password"} />
          </label>
          {isSignup ? (
            <>
              <label>
                Confirm password
                <input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Re-enter your password" autoComplete="new-password" />
              </label>
              <label>
                Your school
                <input list="wildly-school-options" value={schoolSearch} onChange={(event) => setSchoolSearch(event.target.value)} placeholder="Start typing your school name" disabled={cantFindSchool} />
                <datalist id="wildly-school-options">
                  {schoolOptions.map((s) => <option key={s} value={s} />)}
                </datalist>
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={cantFindSchool} onChange={(event) => setCantFindSchool(event.target.checked)} />
                Can't find school
              </label>
              {cantFindSchool ? (
                <label>
                  School name
                  <input type="text" value={schoolManual} onChange={(event) => setSchoolManual(event.target.value)} placeholder="Type your school name" />
                </label>
              ) : null}
            </>
          ) : null}
          {!isSignup ? <p className="auth-helper">Use `demo@zoo` to enter the demo teacher account instantly.</p> : null}
          {notice ? <p className="auth-error">{notice}</p> : null}
          <button type="submit" disabled={busy}>{busy ? "Working..." : isSignup ? "Create account" : "Log in"}</button>
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
      // schoolName (not school) — the shared field name Taronga Tracka's teacher
      // docs already use, so a teacher who signed up on Tracka first sees their
      // school pre-filled here too.
      const school = profile.schoolName || "";
      setForm((current) => ({
        ...current,
        name: profile.name || "",
        country: profile.country || "Australia",
        role: profile.role || "Teacher",
        schoolSearch: schoolOptions.includes(school) ? school : "",
        schoolManual: schoolOptions.includes(school) ? "" : school,
        cantFindSchool: school ? !schoolOptions.includes(school) : false,
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
      await setDoc(doc(db, "teachers", user.email.toLowerCase()), {
        name: form.name.trim(),
        country: form.country.trim(),
        role: form.role,
        schoolName: school,
        email: user.email.toLowerCase(),
        products: arrayUnion("wildly"),
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <img src={assets.trackaLogoFull} alt="Taronga Tracka" style={{ height: "72px", width: "auto" }} />
          <span style={{ color: "#D4D4D8", fontSize: "1.6rem", fontWeight: 200 }}>+</span>
          <img src={assets.wildlyLogo} alt="Wildly by Taronga" style={{ height: "64px", width: "auto" }} />
        </div>
        <h1 style={{ fontFamily: '"Taronga Headline", "Avenir Next", Avenir, sans-serif', fontWeight: 400 }}>Taronga Education</h1>
        <span className="audience-pill">About you</span>
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

function TeacherDashboard({ config, contentItems = defaultContentItems.map(resolveContentItem), professionalLearningItems = defaultProfessionalLearningItems, tarongaTvVideos = defaultTarongaTvVideos.map(resolveTarongaTvVideo), page = "dashboard", subject = "", contentId = "", tvVideoId = "", profile = null, onSignOut = null, preview = false, workspace = createDefaultTeacherWorkspace(), onToggleSaved = () => {}, onAssignContent = () => {}, onCreateClass = () => {}, upcomingEvents = [] }) {
  const [activeSubject, setActiveSubject] = useState(subjectFromSlug(subject));
  const [activeTvCategory, setActiveTvCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [assignmentDraft, setAssignmentDraft] = useState({ itemId: "", classId: "", dueDate: "" });
  const [classDraft, setClassDraft] = useState({ title: "", stage: "Stage 2" });
  const [launchDraft, setLaunchDraft] = useState({ itemId: "", classId: "", mode: "live" });
  const routeSubject = subjectFromSlug(subject);

  useEffect(() => {
    setActiveSubject(routeSubject);
  }, [routeSubject]);

  useEffect(() => {
    if (page !== "taronga-tv") return;
    if (!routeSubject) {
      setActiveSubject(null);
    }
    setActiveTvCategory("All");
    setQuery("");
  }, [page, routeSubject]);

  const publishedItems = useMemo(() => contentItems.filter((item) => normalizeEditorialStatus(item.status, "Draft") === "Published"), [contentItems]);

  const [recentIds, setRecentIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wildly_recent_items") || "[]"); }
    catch { return []; }
  });
  useEffect(() => {
    if (page !== "content" || !contentId) return;
    setRecentIds((prev) => {
      const updated = [contentId, ...prev.filter((id) => id !== contentId)].slice(0, 3);
      localStorage.setItem("wildly_recent_items", JSON.stringify(updated));
      return updated;
    });
  }, [page, contentId]);
  const recentItems = recentIds.map((id) => publishedItems.find((item) => item.id === id)).filter(Boolean);
  const newestItems = useMemo(() =>
    [...publishedItems].sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)).slice(0, 3),
    [publishedItems],
  );

  const learningPaths = useMemo(() => publishedItems.filter((item) => item.type === "Learning Path"), [publishedItems]);
  const lessons = useMemo(() => publishedItems.filter((item) => item.type === "Lesson"), [publishedItems]);
  const resources = useMemo(() => publishedItems.filter((item) => item.type === "Resource"), [publishedItems]);
  const filteredItems = useMemo(() => publishedItems.filter((item) => {
    const matchesSubject = !activeSubject || item.subject === activeSubject;
    const haystack = `${item.title} ${item.subject} ${item.stage} ${item.type} ${item.summary} ${item.description}`.toLowerCase();
    return matchesSubject && haystack.includes(query.toLowerCase());
  }), [activeSubject, publishedItems, query]);
  const contentDetail = publishedItems.find((item) => item.id === contentId) || null;
  const contentActivityBlocks = contentDetail ? buildLessonActivityBlocks(contentDetail) : [];
  const teacherVisibleTarongaTvVideos = useMemo(() => sortTarongaTvVideos(tarongaTvVideos), [tarongaTvVideos]);
  const filteredTarongaTvVideos = useMemo(() => teacherVisibleTarongaTvVideos.filter((item) => {
    const matchesSubject = !activeSubject || item.subject === activeSubject;
    const matchesCategory = activeTvCategory === "All" || (item.categories || []).includes(activeTvCategory);
    const haystack = `${item.title} ${item.subject} ${item.stage} ${item.summary} ${item.description} ${(item.outcomeCodes || []).join(" ")}`.toLowerCase();
    return matchesSubject && matchesCategory && haystack.includes(query.toLowerCase());
  }), [activeSubject, activeTvCategory, teacherVisibleTarongaTvVideos, query]);
  const featuredTarongaTvVideo = filteredTarongaTvVideos[0] || teacherVisibleTarongaTvVideos[0] || null;
  const tarongaTvDetail = teacherVisibleTarongaTvVideos.find((item) => item.id === tvVideoId) || null;
  const contentDownloads = contentDetail ? buildContentDownloads(contentDetail) : [];
  const tarongaTvDownloads = tarongaTvDetail?.downloadLinks || [];
  const allResourceItems = [...lessons, ...resources];
  const classes = workspace.classes || defaultTeacherClasses;
  const assignments = workspace.assignments || [];
  const savedItemIds = workspace.savedItemIds || [];
  const classStudents = defaultTeacherStudents.filter((student) => classes.some((classroom) => classroom.id === student.classId));
  const assignmentsByClass = Object.fromEntries(classes.map((classroom) => [classroom.id, assignments.filter((assignment) => assignment.classId === classroom.id)]));
  const savedItems = publishedItems.filter((item) => savedItemIds.includes(item.id));
  const assignedContentIds = new Set(assignments.map((assignment) => assignment.contentId));
  const assignedItems = publishedItems.filter((item) => assignedContentIds.has(item.id));
  const contentById = Object.fromEntries(publishedItems.map((item) => [item.id, item]));
  const navItems = [
    ["", "Dashboard", "grid"],
    ["classes", "My Classes", "users"],
    ["students", "Students", "cap"],
    ["reports", "Reports", "report"],
    ["saved", "Saved", "bookmark"],
    ["calendar", "Calendar", "calendar"],
  ];
  const publishedProfessionalLearningItems = professionalLearningItems.filter((item) => normalizeEditorialStatus(item.status, "Draft") !== "Draft");
  const professionalLearningLinksById = Object.fromEntries(
    publishedProfessionalLearningItems.map((item) => [item.id, buildProfessionalLearningLinks(item)]),
  );
  const nextProfessionalLearning = publishedProfessionalLearningItems[0] || null;
  const assignmentNotifications = assignments
    .filter((item) => item.dueDate)
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
    .slice(0, 3)
    .map((item) => ({
      title: `${contentById[item.contentId]?.title || "Assigned content"} due for ${classes.find((classroom) => classroom.id === item.classId)?.title || "class"}`,
      date: item.dueDate,
    }));
  const notificationItems = [...publishedProfessionalLearningItems.slice(0, 2), ...assignmentNotifications].slice(0, 4);
  const showTracka = config.showTrackaCard;
  const teacherClasses = classes.map((classroom) => {
    const studentCount = classStudents.filter((student) => student.classId === classroom.id).length;
    const assignmentCount = assignmentsByClass[classroom.id]?.length || 0;
    return {
      ...classroom,
      detail: `${studentCount} students · ${classroom.stage}`,
      assignmentCount,
    };
  });
  const studentSnapshots = classStudents.map((student) => [student.name, student.focus, classes.find((classroom) => classroom.id === student.classId)?.title || "Unassigned", student.status]);
  const subjectCounts = publishedItems.reduce((accumulator, item) => ({ ...accumulator, [item.subject]: (accumulator[item.subject] || 0) + 1 }), {});
  const topSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Science";
  const reportSnapshots = [
    ["Curriculum coverage", `${publishedItems.length} published items across ${Object.keys(subjectCounts).length} subjects`],
    ["Assigned this term", `${assignments.length} active assignments across ${classes.length} classes`],
    ["Most represented subject", topSubject],
  ];
  const calendarEvents = [
    ...assignments.map((assignment) => ({
      id: assignment.id,
      date: assignment.dueDate,
      title: contentById[assignment.contentId]?.title || "Assigned content",
      detail: `${classes.find((classroom) => classroom.id === assignment.classId)?.title || "Class"} · Due date`,
      type: "Assignment",
      href: teacherContentRoute(assignment.contentId),
    })),
    ...publishedProfessionalLearningItems.map((item) => ({
      id: item.id,
      date: item.date,
      title: item.title,
      detail: item.time || "Professional learning",
      type: "Professional Learning",
      href: teacherRoute("professional-learning"),
    })),
    { id: "excursion", date: "2026-06-08", title: "Taronga Zoo Visit - Biodiversity in Action", detail: "Sydney excursion", type: "Excursion", href: appLinks.excursions },
  ].filter((item) => item.date).sort((a, b) => a.date.localeCompare(b.date));

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

  function openAssignmentFlow(item) {
    setAssignmentDraft({
      itemId: item.id,
      classId: classes[0]?.id || "",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
  }

  function closeAssignmentFlow() {
    setAssignmentDraft({ itemId: "", classId: "", dueDate: "" });
  }

  function submitAssignment(event) {
    event.preventDefault();
    if (!assignmentDraft.itemId || !assignmentDraft.classId || !assignmentDraft.dueDate) return;
    onAssignContent(assignmentDraft.itemId, assignmentDraft.classId, assignmentDraft.dueDate);
    const itemTitle = contentById[assignmentDraft.itemId]?.title || "Content";
    const classTitle = classes.find((classroom) => classroom.id === assignmentDraft.classId)?.title || "class";
    setNotice(`${itemTitle} assigned to ${classTitle} for ${formatDisplayDate(assignmentDraft.dueDate)}.`);
    closeAssignmentFlow();
  }

  function submitNewClass(event) {
    event.preventDefault();
    if (!classDraft.title.trim()) return;
    onCreateClass(classDraft.title.trim(), classDraft.stage);
    setNotice(`${classDraft.title.trim()} created and ready for assignments.`);
    setClassDraft({ title: "", stage: "Stage 2" });
  }

  function openLaunchFlow(item, mode = "live") {
    setLaunchDraft({ itemId: item.id, classId: classes[0]?.id || "", mode });
  }

  function closeLaunchFlow() {
    setLaunchDraft({ itemId: "", classId: "", mode: "live" });
  }

  async function launchSession(event) {
    event.preventDefault();
    const item = contentById[launchDraft.itemId];
    const classroom = classes.find((entry) => entry.id === launchDraft.classId);
    if (!item || !classroom) return;
    if (user?.isDemo) {
      setNotice("Live sessions are not available in demo mode. Sign up for a free account to launch lessons.");
      closeLaunchFlow();
      return;
    }
    const code = generateSessionCode();
    try {
      const sessionRef = await addDoc(liveSessionsCollection, {
        code,
        state: "active",
        mode: launchDraft.mode,
        contentId: item.id,
        contentTitle: item.title,
        classId: classroom.id,
        classTitle: classroom.title,
        teacherName: displayName,
        currentStep: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      closeLaunchFlow();
      window.location.hash = `#teacher/live/${sessionRef.id}`;
    } catch (error) {
      console.error("Unable to create live session", error);
      setNotice("Unable to start the session. Please check your connection and try again.");
      closeLaunchFlow();
    }
  }

  function exportStudentsCsv() {
    const rows = [
      ["name", "class", "status", "focus", "streak"],
      ...classStudents.map((student) => [
        student.name,
        classes.find((classroom) => classroom.id === student.classId)?.title || "",
        student.status,
        student.focus,
        String(student.streak),
      ]),
    ].map((row) => row.join(",")).join("\n");
    downloadTextFile("wildly-students.csv", rows, "text/csv;charset=utf-8");
  }

  function exportReportsCsv() {
    const rows = [
      ["metric", "value"],
      ["published_items", String(publishedItems.length)],
      ["assignments", String(assignments.length)],
      ["saved_items", String(savedItems.length)],
      ["classes", String(classes.length)],
      ["students", String(classStudents.length)],
      ["top_subject", topSubject],
    ].map((row) => row.join(",")).join("\n");
    downloadTextFile("wildly-teacher-report.csv", rows, "text/csv;charset=utf-8");
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
      description: "Manage classes, review current assignments and keep upcoming work visible in one place.",
      action: <a className="secondary-action" href="#create-class">Create class</a>,
    },
    students: {
      eyebrow: "Students",
      title: "Learner overview",
      description: "Track support needs, extension opportunities and completion at a glance.",
      action: <button type="button" className="secondary-action" onClick={exportStudentsCsv}>Export students</button>,
    },
    reports: {
      eyebrow: "Reports",
      title: "Teacher reporting",
      description: "Curriculum coverage, engagement and next-step recommendations should read as a proper reporting page.",
      action: <button type="button" className="secondary-action" onClick={exportReportsCsv}>Download report CSV</button>,
    },
    saved: {
      eyebrow: "Saved",
      title: "Saved for later",
      description: "Keep shortlisted lessons, resources and paths in one place while you plan.",
      action: null,
    },
    calendar: {
      eyebrow: "Calendar",
      title: "Upcoming dates",
      description: "Assignments, professional learning and excursion events now sit on one planning page.",
      action: <a className="secondary-action" href={appLinks.excursions}>Excursion details</a>,
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
          <button className="menu-button" type="button" aria-label="Open navigation"></button>
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
            <button type="button" className="profile-button" onClick={() => { window.location.hash = "#about-you"; }}>
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
              <section className="dashboard-col">
                <h2 className="col-heading">Continue Learning</h2>
                {recentItems.length === 0 ? (
                  <p className="col-empty">Resources you open will appear here so you can pick up where you left off.</p>
                ) : (
                  <div className="col-items">
                    {recentItems.map((item) => (
                      <a key={item.id} href={teacherContentRoute(item.id)} className="dash-item-card">
                        <span className="content-type">{item.type}</span>
                        <strong>{item.title}</strong>
                        <span className="dash-item-meta">{item.subject}{item.stage ? ` · ${item.stage}` : ""}</span>
                      </a>
                    ))}
                  </div>
                )}
              </section>

              <section className="dashboard-col">
                <h2 className="col-heading">What's New</h2>
                {newestItems.length === 0 ? (
                  <p className="col-empty">Newly published resources from Taronga will appear here.</p>
                ) : (
                  <div className="col-items">
                    {newestItems.map((item) => (
                      <a key={item.id} href={teacherContentRoute(item.id)} className="dash-item-card">
                        <span className="content-type">{item.type}</span>
                        <strong>{item.title}</strong>
                        <span className="dash-item-meta">{item.subject}{item.stage ? ` · ${item.stage}` : ""}</span>
                      </a>
                    ))}
                  </div>
                )}
              </section>

              <section className="dashboard-col">
                <h2 className="col-heading">Upcoming</h2>
                {upcomingEvents.length === 0 ? (
                  <p className="col-empty">Events and sessions added by Taronga staff will appear here.</p>
                ) : (
                  <div className="col-items">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="dash-upcoming-item">
                        <time className="upcoming-date">{formatDisplayDate(event.date)}</time>
                        <strong>{event.title}</strong>
                        {event.description && <p className="upcoming-description">{event.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>
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
                      <button type="button" className="secondary-action" onClick={() => openAssignmentFlow(item)}>Assign</button>
                      <button type="button" className="secondary-action" onClick={() => onToggleSaved(item.id)}>{savedItemIds.includes(item.id) ? "Saved" : "Save"}</button>
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
                      <button type="button" className="secondary-action" onClick={() => openAssignmentFlow(item)}>Assign</button>
                      <button type="button" className="secondary-action" onClick={() => onToggleSaved(item.id)}>{savedItemIds.includes(item.id) ? "Saved" : "Save"}</button>
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
                        {item.registrationUrl ? <a className="primary-action" href={item.registrationUrl} target="_blank" rel="noreferrer">Open registration</a> : <button type="button" className="primary-action" onClick={() => downloadCalendarInvite(item.title, item.date, item.summary || item.description || "")}>Add to calendar</button>}
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
                      <button type="button" className="secondary-action" onClick={() => openAssignmentFlow(item)}>Assign</button>
                      <button type="button" className="secondary-action" onClick={() => onToggleSaved(item.id)}>{savedItemIds.includes(item.id) ? "Saved" : "Save"}</button>
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
                  <small>{classroom.assignmentCount} active assignments</small>
                </article>
              ))}
            </section>
            <section className="teacher-panel">
              <div className="teacher-panel-header">
                <div>
                  <h2 id="create-class">Class setup and planning</h2>
                  <p>Create classes, review assigned content and keep due work visible by teaching group.</p>
                </div>
              </div>
              <form className="class-create-form" onSubmit={submitNewClass}>
                <label>Class name<input type="text" value={classDraft.title} onChange={(event) => setClassDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Year 5 Red" /></label>
                <label>Stage<select value={classDraft.stage} onChange={(event) => setClassDraft((current) => ({ ...current, stage: event.target.value }))}>{["Early Years", "Early Stage 1", "Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5", "Stage 6"].map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></label>
                <button type="submit" className="primary-action">Create class</button>
              </form>
              <div className="class-section-grid">
                {teacherClasses.map((classroom) => (
                  <article className="class-room-card" key={classroom.id}>
                    <div className="class-room-header">
                      <div>
                        <h3>{classroom.title}</h3>
                        <p>{classroom.stage} · {classroom.note}</p>
                      </div>
                      <span className="pill">{classroom.assignmentCount} assignments</span>
                    </div>
                    <div className="class-room-body">
                      <div>
                        <h4>Students</h4>
                        <ul className="compact-list">
                          {classStudents.filter((student) => student.classId === classroom.id).map((student) => <li key={student.id}>{student.name} · {student.status}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4>Assigned content</h4>
                        {assignmentsByClass[classroom.id]?.length ? (
                          <ul className="compact-list">
                            {assignmentsByClass[classroom.id].map((assignment) => (
                              <li key={assignment.id}>
                                <a href={teacherContentRoute(assignment.contentId)}>{contentById[assignment.contentId]?.title || "Content item"}</a> · due {formatDisplayDate(assignment.dueDate)}
                              </li>
                            ))}
                          </ul>
                        ) : <p className="mini-empty">No assignments yet.</p>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {page === "students" && (
          <>
            <section className="teacher-summary-grid page-summary-grid">
              {studentSnapshots.slice(0, 3).map(([name, note, group, status]) => (
                <article key={name} className="summary-card">
                  <h3>{name}</h3>
                  <p>{note}</p>
                  <small>{group}</small>
                  <small>{status}</small>
                </article>
              ))}
            </section>
            <section className="teacher-panel">
              <div className="teacher-panel-header">
                <div>
                  <h2>Support and extension</h2>
                  <p>Track learner needs, class grouping and readiness using the assignments already in the platform.</p>
                </div>
              </div>
              <div className="student-card-grid">
                {classStudents.map((student) => {
                  const classroom = classes.find((item) => item.id === student.classId);
                  const assignedCount = assignmentsByClass[student.classId]?.length || 0;
                  return (
                    <article className="student-card" key={student.id}>
                      <div className="student-card-head">
                        <div>
                          <h3>{student.name}</h3>
                          <p>{classroom?.title || "Class"} · {classroom?.stage || ""}</p>
                        </div>
                        <span className="pill">{student.status}</span>
                      </div>
                      <p>{student.focus}</p>
                      <div className="detail-meta">
                        <small>{assignedCount} assigned items</small>
                        <small>{student.streak} day streak</small>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {page === "reports" && (
          <>
            <section className="teacher-summary-grid report-stat-grid">
              <article className="summary-card">
                <h3>Curriculum coverage</h3>
                <p>{publishedItems.length} published items across {Object.keys(subjectCounts).length} subject areas.</p>
              </article>
              <article className="summary-card">
                <h3>Engagement trend</h3>
                <p>{savedItems.length} saved items and {assignments.length} live assignments are shaping current teacher activity.</p>
              </article>
              <article className="summary-card">
                <h3>Recommended next step</h3>
                <p>{nextProfessionalLearning ? `Promote ${nextProfessionalLearning.title} before ${formatDisplayDate(nextProfessionalLearning.date)}.` : "Build the next learning path and assign it into a class."}</p>
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
              <div className="teacher-summary-grid report-detail-grid">
                <article className="summary-card">
                  <h3>Saved for later</h3>
                  <p>{savedItems.length} items bookmarked for planning and future assignment.</p>
                </article>
                <article className="summary-card">
                  <h3>Classes active</h3>
                  <p>{classes.length} teaching groups currently set up in the workspace.</p>
                </article>
                <article className="summary-card">
                  <h3>Upcoming due dates</h3>
                  <p>{calendarEvents.filter((event) => event.type === "Assignment").length} assignment milestones currently visible in the planner.</p>
                </article>
              </div>
            </section>
          </>
        )}

        {page === "saved" && (
          <section className="teacher-panel">
            <div className="teacher-library-grid">
              {savedItems.length ? savedItems.map((item) => (
                <article className="teacher-library-card" key={item.id}>
                  <img src={item.image} alt="" />
                  <div>
                    <span className="pill">{item.type}</span>
                    <h3>{item.title}</h3>
                    <p>{item.summary || item.description}</p>
                    <small>{item.subject} · {item.stage}</small>
                    <div className="teacher-card-actions">
                      <a className="primary-action" href={teacherContentRoute(item.id)}>Open</a>
                      <button type="button" className="secondary-action" onClick={() => openAssignmentFlow(item)}>Assign</button>
                      <button type="button" className="secondary-action" onClick={() => onToggleSaved(item.id)}>Remove</button>
                    </div>
                  </div>
                </article>
              )) : (
                <article className="placeholder-card">
                  <h3>No saved items yet</h3>
                  <p>Use the Save button on lessons, resources and learning paths to build a short list for planning.</p>
                </article>
              )}
            </div>
          </section>
        )}

        {page === "calendar" && (
          <>
            <section className="teacher-summary-grid page-summary-grid">
              {calendarEvents.slice(0, 4).map((event) => <article key={event.id} className="summary-card"><h3>{formatDisplayDate(event.date)}</h3><p>{event.title}</p><small>{event.type}</small></article>)}
            </section>
            <section className="teacher-panel">
              <div className="teacher-panel-header">
                <div>
                  <h2>Planning calendar</h2>
                  <p>Assignments, professional learning and excursions are now visible together so teachers can plan from one page.</p>
                </div>
              </div>
              <div className="calendar-event-list">
                {calendarEvents.map((event) => (
                  <a className="calendar-event-card" href={event.href} key={event.id}>
                    <div>
                      <span className="pill">{event.type}</span>
                      <h3>{event.title}</h3>
                      <p>{event.detail}</p>
                    </div>
                    <strong>{formatDisplayDate(event.date)}</strong>
                  </a>
                ))}
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
                  {contentActivityBlocks.length ? <a className="secondary-action" href={teacherRoute(`present/${contentDetail.id}`)}>Present</a> : null}
                  {contentActivityBlocks.length ? <button type="button" className="secondary-action" onClick={() => openLaunchFlow(contentDetail, "live")}>Run live</button> : null}
                  {contentActivityBlocks.length ? <button type="button" className="secondary-action" onClick={() => openLaunchFlow(contentDetail, "student-paced")}>Student-paced</button> : null}
                  <button type="button" className="secondary-action" onClick={() => openAssignmentFlow(contentDetail)}>Assign</button>
                  <button type="button" className="secondary-action" onClick={() => onToggleSaved(contentDetail.id)}>{savedItemIds.includes(contentDetail.id) ? "Saved" : "Save"}</button>
                </div>
                {contentDetail.description ? <div className="detail-list"><h3>Description</h3><p>{contentDetail.description}</p></div> : null}
                {contentActivityBlocks.length ? <div className="detail-list"><h3>Interactive lesson flow</h3><ul>{contentActivityBlocks.map((block) => <li key={block.id}>{block.title} · {block.type}</li>)}</ul></div> : null}
                {contentDetail.outcomeCodes?.length ? <div className="detail-list"><h3>Outcomes</h3><ul>{contentDetail.outcomeCodes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul></div> : null}
                <LinkSection links={contentDownloads} />
                {contentDetail.lessonIds?.length ? <div className="detail-list"><h3>Included lessons</h3><ul>{contentDetail.lessonIds.map((lessonId) => <li key={lessonId}>{lessons.find((lesson) => lesson.id === lessonId)?.title || lessonId}</li>)}</ul></div> : null}
                {contentDetail.resourceIds?.length ? <div className="detail-list"><h3>Attached resources</h3><ul>{contentDetail.resourceIds.map((resourceId) => <li key={resourceId}>{resources.find((resource) => resource.id === resourceId)?.title || resourceId}</li>)}</ul></div> : null}
              </div>
            </div>
          </section>
        )}

        {assignmentDraft.itemId ? (
          <div className="detail-overlay" role="dialog" aria-modal="true">
            <form className="assignment-modal" onSubmit={submitAssignment}>
              <div className="teacher-panel-header">
                <div>
                  <span className="content-type">Assign content</span>
                  <h2>{contentById[assignmentDraft.itemId]?.title || "Assign content"}</h2>
                  <p>Choose a class and due date to add this item to your teaching workflow.</p>
                </div>
                <button type="button" className="secondary-action" onClick={closeAssignmentFlow}>Close</button>
              </div>
              <div className="assignment-modal-grid">
                <label>
                  Class
                  <select value={assignmentDraft.classId} onChange={(event) => setAssignmentDraft((current) => ({ ...current, classId: event.target.value }))}>
                    {classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.title}</option>)}
                  </select>
                </label>
                <label>
                  Due date
                  <input type="date" value={assignmentDraft.dueDate} onChange={(event) => setAssignmentDraft((current) => ({ ...current, dueDate: event.target.value }))} />
                </label>
              </div>
              <div className="teacher-card-actions">
                <button type="submit" className="primary-action">Save assignment</button>
                <button type="button" className="secondary-action" onClick={() => onToggleSaved(assignmentDraft.itemId)}>
                  {savedItemIds.includes(assignmentDraft.itemId) ? "Saved" : "Save while assigning"}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {launchDraft.itemId ? (
          <div className="detail-overlay" role="dialog" aria-modal="true">
            <form className="assignment-modal" onSubmit={launchSession}>
              <div className="teacher-panel-header">
                <div>
                  <span className="content-type">Launch lesson</span>
                  <h2>{contentById[launchDraft.itemId]?.title || "Launch lesson"}</h2>
                  <p>Create a code-based student session. A class must be selected before students can join.</p>
                </div>
                <button type="button" className="secondary-action" onClick={closeLaunchFlow}>Close</button>
              </div>
              <div className="assignment-modal-grid">
                <label>
                  Delivery mode
                  <select value={launchDraft.mode} onChange={(event) => setLaunchDraft((current) => ({ ...current, mode: event.target.value }))}>
                    <option value="live">Live Participation</option>
                    <option value="student-paced">Student-Paced</option>
                  </select>
                </label>
                <label>
                  Class
                  <select value={launchDraft.classId} onChange={(event) => setLaunchDraft((current) => ({ ...current, classId: event.target.value }))}>
                    {classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.title}</option>)}
                  </select>
                </label>
              </div>
              <div className="teacher-card-actions">
                <button type="submit" className="primary-action">Launch with code</button>
                <a className="secondary-action" href={teacherRoute(`present/${launchDraft.itemId}`)}>Present only</a>
              </div>
            </form>
          </div>
        ) : null}
      </main>
    </div>
  );
}

const defaultDashboardConfig = {
  heroTitle: "Learning through nature",
  heroSubtitle: "Inspire curiosity. Create change.",
  heroImageUrl: assets.heroKoala,
  featuredResourceTitle: "Sustainable Futures",
  showTrackaCard: true,
};

const dashboardConfigRef = doc(db, "dashboardConfig", "main");
const contentItemsCollection = collection(db, "contentItems");
const professionalLearningCollection = collection(db, "professionalLearning");
const tarongaTvCollection = collection(db, "tarongaTvVideos");
const liveSessionsCollection = collection(db, "liveSessions");
const liveResponsesCollection = collection(db, "liveResponses");
const teachersCollection = collection(db, "teachers");
const upcomingEventsCollection = collection(db, "upcomingEvents");

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

function normalizeEditorialStatus(status = "", fallback = "Draft") {
  const value = String(status || "").trim().toLowerCase();
  if (value === "published") return "Published";
  if (value === "review") return "Review";
  if (value === "draft") return "Draft";
  return fallback;
}

function resolveTarongaTvVideo(video = {}) {
  return {
    subject: "Science",
    stage: "Stage 2",
    duration: "",
    categories: [],
    outcomeCodes: [],
    lessonIds: [],
    learningPathIds: [],
    discussionPoints: [],
    downloadLinks: [],
    ...video,
    status: normalizeEditorialStatus(video.status, "Draft"),
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
        setStatus(error.code === "permission-denied" ? "fallback" : "error");
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
        setStatus(error.code === "permission-denied" ? "fallback" : "error");
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
        setStatus(error.code === "permission-denied" ? "fallback" : "error");
      },
    );
  }, []);

  return { items, status };
}

function useLiveSessions() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    return onSnapshot(
      query(liveSessionsCollection, orderBy("createdAt", "desc")),
      (snapshot) => {
        setItems(snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() })));
        setStatus(snapshot.empty ? "missing" : "live");
      },
      (error) => {
        console.error("Unable to load liveSessions", error);
        setItems([]);
        setStatus("error");
      },
    );
  }, []);

  return { items, status };
}

function useLiveResponses() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    return onSnapshot(
      query(liveResponsesCollection, orderBy("submittedAt", "desc")),
      (snapshot) => {
        setItems(snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() })));
        setStatus(snapshot.empty ? "missing" : "live");
      },
      (error) => {
        console.error("Unable to load liveResponses", error);
        setItems([]);
        setStatus("error");
      },
    );
  }, []);

  return { items, status };
}

function useUsers() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    // Shared teachers/{email} collection — sorted client-side rather than via
    // Firestore orderBy("name"), since Tracka-only teacher docs have no "name"
    // field yet and orderBy would silently exclude them from the query entirely.
    return onSnapshot(
      teachersCollection,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (a.name || a.email || "").localeCompare(b.name || b.email || ""));
        setUsers(docs);
        setStatus(snapshot.empty ? "empty" : "live");
      },
      (error) => {
        console.error("Unable to load users", error);
        setUsers([]);
        setStatus(error.code === "permission-denied" ? "permission-denied" : "error");
      },
    );
  }, []);

  return { users, status };
}

function useLiveSessionById(sessionId) {
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!sessionId) {
      setItem(null);
      setStatus("missing");
      return () => {};
    }

    return onSnapshot(
      doc(db, "liveSessions", sessionId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setItem(null);
          setStatus("missing");
          return;
        }
        setItem({ id: snapshot.id, ...snapshot.data() });
        setStatus("live");
      },
      (error) => {
        console.error("Unable to load live session", error);
        setItem(null);
        setStatus("error");
      },
    );
  }, [sessionId]);

  return { item, status };
}

function useLiveSessionByCode(code) {
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!code) {
      setItem(null);
      setStatus("missing");
      return () => {};
    }

    return onSnapshot(
      query(liveSessionsCollection, where("code", "==", code.toUpperCase())),
      (snapshot) => {
        if (snapshot.empty) {
          setItem(null);
          setStatus("missing");
          return;
        }
        const sessionDoc = snapshot.docs[0];
        setItem({ id: sessionDoc.id, ...sessionDoc.data() });
        setStatus("live");
      },
      (error) => {
        console.error("Unable to load live session by code", error);
        setItem(null);
        setStatus("error");
      },
    );
  }, [code]);

  return { item, status };
}

function useLiveResponsesForSession(sessionId) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!sessionId) {
      setItems([]);
      return () => {};
    }

    return onSnapshot(
      query(liveResponsesCollection, where("sessionId", "==", sessionId)),
      (snapshot) => {
        setItems(snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() })));
      },
      (error) => {
        console.error("Unable to load session responses", error);
        setItems([]);
      },
    );
  }, [sessionId]);

  return items;
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
        setConfig(defaultDashboardConfig);
        setStatus(error.code === "permission-denied" ? "fallback" : "error");
      },
    );
  }, []);

  return { config, status };
}

function useUpcomingEvents() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    return onSnapshot(upcomingEventsCollection, (snap) => {
      const today = new Date().toISOString().split("T")[0];
      setEvents(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((e) => e.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 8),
      );
    }, () => {});
  }, []);
  return { events };
}

function TeacherPage({ page = "dashboard", subject = "", contentId = "", tvVideoId = "", preview = false }) {
  const { config, status } = useDashboardConfig();
  const { items: contentItems, status: contentStatus } = useContentItems();
  const { items: professionalLearningItems } = useProfessionalLearningItems();
  const { items: tarongaTvVideos } = useTarongaTvVideos();
  const { events: upcomingEvents } = useUpcomingEvents();
  const { status: sessionStatus, user, profile } = useSessionUser();
  const { workspace, toggleSavedItem, assignContentToClass, createClass } = useTeacherWorkspace(user, profile);

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
      <TeacherDashboard config={config} contentItems={contentItems} professionalLearningItems={professionalLearningItems} tarongaTvVideos={tarongaTvVideos} page={page} subject={subject} contentId={contentId} tvVideoId={tvVideoId} profile={profile} onSignOut={handleSignOut} preview={preview} workspace={workspace} onToggleSaved={toggleSavedItem} onAssignContent={assignContentToClass} onCreateClass={createClass} upcomingEvents={upcomingEvents} />
    </>
  );
}

function StaffPage() {
  const [isUnlocked, setIsUnlocked] = useState(() => window.sessionStorage.getItem(staffSessionKey) === "unlocked");
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthChecked(true);
    });
  }, []);

  function unlock() {
    window.sessionStorage.setItem(staffSessionKey, "unlocked");
    setIsUnlocked(true);
  }

  async function lock() {
    window.sessionStorage.removeItem(staffSessionKey);
    setIsUnlocked(false);
    if (auth.currentUser) {
      await signOut(auth);
    }
  }

  if (!isUnlocked) {
    return <StaffPasswordScreen onUnlock={unlock} />;
  }

  if (!authChecked) {
    return (
      <main className="staff-auth-page">
        <section className="staff-auth-card">
          <img src={assets.wildlyLogo} alt="Wildly by Taronga" />
          <p style={{ marginTop: 16 }}>Checking authentication…</p>
        </section>
      </main>
    );
  }

  if (!firebaseUser) {
    return <StaffFirebaseLoginScreen onLock={lock} />;
  }

  return <StaffConsole onLock={lock} firebaseUser={firebaseUser} />;
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
        <p>Enter the staff password to access the console.</p>
        <form onSubmit={handleSubmit}>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus /></label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit">Enter staff console</button>
        </form>
      </section>
    </main>
  );
}

function StaffFirebaseLoginScreen({ onLock }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(
        err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found"
          ? "Incorrect email or password."
          : "Sign-in failed. Check your connection and try again.",
      );
      setLoading(false);
    }
  }

  return (
    <main className="staff-auth-page">
      <section className="staff-auth-card" aria-label="Taronga staff sign in">
        <img src={assets.wildlyLogo} alt="Wildly by Taronga" />
        <span>Taronga Staff Console</span>
        <h1>Sign in to enable saves</h1>
        <p>Content writes require your Taronga Firebase account. Use the email and password set up for your staff account.</p>
        <form onSubmit={handleSubmit}>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <button type="button" className="auth-back-link" onClick={onLock}>← Back to staff password</button>
      </section>
    </main>
  );
}

function StaffConsole({ onLock, firebaseUser }) {
  const [panel, setPanel] = useState("overview");
  const { config: savedConfig, status } = useDashboardConfig();
  const { items: contentItems, status: contentStatus } = useContentItems();
  const { items: professionalLearningItems, status: professionalLearningStatus } = useProfessionalLearningItems();
  const { items: tarongaTvVideos, status: tarongaTvStatus } = useTarongaTvVideos();
  const { events: upcomingEvents } = useUpcomingEvents();
  const { items: liveSessions, status: liveSessionsStatus } = useLiveSessions();
  const { items: liveResponses, status: liveResponsesStatus } = useLiveResponses();
  const { users, status: usersStatus } = useUsers();
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
          activityBlocks: normalizeActivityBlocks(item.activityBlocks || []),
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
      delete contentPayload.activityBlocks;
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
        status: normalizeEditorialStatus(item.status, "Draft"),
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
        status: normalizeEditorialStatus(item.status, "Draft"),
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

      let savedId = item.id || "";

      if (item.id) {
        await setDoc(doc(db, "tarongaTvVideos", item.id), payload, { merge: true });
      } else {
        const videoRef = await addDoc(tarongaTvCollection, {
          ...payload,
          createdAt: serverTimestamp(),
        });
        savedId = videoRef.id;
      }

      setTarongaTvSaveState("saved");
      return savedId;
    } catch (error) {
      console.error("Unable to save Taronga TV video", error);
      setTarongaTvSaveState("error");
      return "";
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

  async function saveUpcomingEvent(event) {
    try {
      const payload = {
        title: event.title || "",
        date: event.date || "",
        description: event.description || "",
        updatedAt: serverTimestamp(),
      };
      if (event.id) {
        await setDoc(doc(db, "upcomingEvents", event.id), payload, { merge: true });
      } else {
        await addDoc(upcomingEventsCollection, { ...payload, createdAt: serverTimestamp() });
      }
    } catch (error) {
      console.error("Unable to save upcoming event", error);
    }
  }

  async function deleteUpcomingEvent(event) {
    if (!event?.id) return;
    try {
      await deleteDoc(doc(db, "upcomingEvents", event.id));
    } catch (error) {
      console.error("Unable to delete upcoming event", error);
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
            ["upcoming-events", "calendar", "Upcoming Events"],
            ["dashboard", "monitor", "Edit Dashboard"],
          ].map(([id, icon, label]) => <button className={panel === id ? "active" : ""} type="button" data-panel={id} key={id} onClick={() => setPanel(id)}><Icon type={icon} className="" />{label}</button>)}
        </nav>
        <article className="tracka-mini"><img src={assets.trackaLogo} alt="Taronga Tracka" /><p>Staff editing is unlocked for this browser session. Tracka data connector ready for staff review.</p></article>
      </aside>
      <main className="staff-workspace">
        <header className="staff-topbar"><div><span>Taronga Staff Console</span><h1>Wildly learning operations</h1></div><div className="staff-actions">{firebaseUser && <span className="staff-signed-in">Signed in as {firebaseUser.email}</span>}<a href={routePath("teacher")}>Teacher view</a><button type="button" onClick={publishUpdates}>Publish updates</button><button type="button" className="sign-out-button" onClick={onLock}>Sign out</button></div></header>
        <NoticeBanner notice={notice} onClose={() => setNotice("")} />
        {panel === "overview" && <OverviewPanel contentItems={contentItems} tvVideos={tarongaTvVideos} plItems={professionalLearningItems} liveSessions={liveSessions} liveResponses={liveResponses} />}
        {panel === "users" && <UsersPanel users={users} usersStatus={usersStatus} onPlaceholder={(message) => setNotice(message)} />}
        {panel === "analytics" && <AnalyticsPanel liveSessions={liveSessions} liveResponses={liveResponses} liveSessionsStatus={liveSessionsStatus} liveResponsesStatus={liveResponsesStatus} onPlaceholder={(message) => setNotice(message)} />}
        {panel === "content" && <ContentPanel contentItems={contentItems} status={contentStatus} saveState={contentSaveState} seedContentItems={seedContentItems} addContentItem={addContentItem} deleteContentItem={deleteContentItem} />}
        {panel === "taronga-tv" && <TarongaTvPanel items={tarongaTvVideos} contentItems={contentItems} status={tarongaTvStatus} saveState={tarongaTvSaveState} saveVideo={saveTarongaTvVideo} deleteVideo={deleteTarongaTvVideo} />}
        {panel === "professional-learning" && <ProfessionalLearningPanel items={professionalLearningItems} status={professionalLearningStatus} saveState={professionalLearningSaveState} saveItem={saveProfessionalLearningItem} deleteItem={deleteProfessionalLearningItem} />}
        {panel === "upcoming-events" && <UpcomingEventsPanel events={upcomingEvents} saveEvent={saveUpcomingEvent} deleteEvent={deleteUpcomingEvent} />}
        {panel === "dashboard" && <DashboardEditor config={config} contentItems={contentItems} updateConfig={updateConfig} reset={() => { setConfig(defaultDashboardConfig); setPreviewKey((key) => key + 1); }} previewKey={previewKey} publish={publishDashboardConfig} status={status} saveState={saveState} />}
      </main>
    </div>
  );
}

function OverviewPanel({ contentItems, tvVideos, plItems, liveSessions, liveResponses }) {
  const publishedContent = contentItems.filter((i) => i.status === "Published").length;
  const publishedTv = tvVideos.filter((v) => v.status === "Published").length;
  const publishedPl = plItems.filter((s) => s.status === "Published").length;
  const activeSessions = liveSessions.filter((s) => s.state !== "ended").length;
  const totalResponses = liveResponses.length;
  const uniqueStudents = new Set(liveResponses.map((r) => r.studentName?.trim()).filter(Boolean)).size;

  const contentBreakdown = [
    { label: "Learning Paths", count: contentItems.filter((i) => i.type === "Learning Path").length },
    { label: "Lessons", count: contentItems.filter((i) => i.type === "Lesson").length },
    { label: "Resources", count: contentItems.filter((i) => i.type === "Resource").length },
    { label: "TV Videos", count: tvVideos.length },
    { label: "PL Sessions", count: plItems.length },
  ];
  const maxCount = Math.max(...contentBreakdown.map((b) => b.count), 1);

  return (
    <section className="staff-section staff-panel active">
      <div className="sc-overview-grid">
        <div className="sc-stat-card accent">
          <span>Published content</span>
          <strong>{publishedContent}</strong>
          <p>{contentItems.length} total items in Firestore</p>
        </div>
        <div className="sc-stat-card">
          <span>Taronga TV</span>
          <strong>{publishedTv}</strong>
          <p>{tvVideos.length} total videos</p>
        </div>
        <div className="sc-stat-card">
          <span>Student responses</span>
          <strong>{totalResponses}</strong>
          <p>{uniqueStudents} unique students</p>
        </div>
        <div className="sc-stat-card">
          <span>Live sessions</span>
          <strong>{liveSessions.length}</strong>
          <p>{activeSessions} still active</p>
        </div>
      </div>

      <div className="sc-overview-body">
        <div className="sc-overview-card">
          <h3>Content breakdown</h3>
          <div className="sc-content-breakdown">
            {contentBreakdown.map((b) => (
              <div key={b.label} className="sc-breakdown-row">
                <span className="sc-breakdown-label">{b.label}</span>
                <div className="sc-breakdown-bar"><span style={{width: `${(b.count / maxCount) * 100}%`}} /></div>
                <span className="sc-breakdown-count">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="sc-overview-card">
          <h3>Quick actions</h3>
          <p>Content, Taronga TV and Professional Learning panels let you create and publish directly to Firestore. Use the Analytics panel to monitor live session engagement. Edit Dashboard to update what teachers see on login.</p>
          {publishedPl > 0 && <p style={{marginTop:12}}><strong>{publishedPl}</strong> published professional learning session{publishedPl !== 1 ? "s" : ""} visible to teachers.</p>}
          {activeSessions > 0 && <p style={{marginTop:8,color:"var(--green-800)",fontWeight:700}}>{activeSessions} live session{activeSessions !== 1 ? "s" : ""} currently active.</p>}
        </div>
      </div>
    </section>
  );
}

function UsersPanel({ users = [], usersStatus = "loading", onPlaceholder }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");

  const allRoles = [...new Set(users.map((u) => u.role).filter(Boolean))].sort();

  const visibleUsers = users.filter((u) => {
    const haystack = `${u.name || ""} ${u.role || ""} ${u.schoolName || ""} ${u.email || ""}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    const matchesRole = roleFilter === "All roles" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = users.reduce((acc, u) => {
    const r = u.role || "Unknown";
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  const countTeachers = users.filter((u) => u.role === "Teacher").length;
  const countStaff = users.filter((u) => staffRoles.includes(u.role)).length;
  const countOther = users.filter((u) => u.role !== "Teacher" && !staffRoles.includes(u.role)).length;

  function formatDate(ts) {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  }

  const isPermissionDenied = usersStatus === "permission-denied";
  const isLoading = usersStatus === "loading";

  return (
    <section className="staff-section staff-panel active">
      <div className="section-heading">
        <div>
          <h2>Users</h2>
          <p>All registered teachers, staff and administrators in Wildly.</p>
        </div>
        <button type="button" onClick={() => onPlaceholder("User invites coming soon — connect this to your provisioning flow.")}>Invite user</button>
      </div>

      {isPermissionDenied && (
        <article className="placeholder-card" style={{ marginBottom: 24 }}>
          <h3>Staff sign-in required</h3>
          <p>Reading all user accounts requires Firebase authentication with a staff role. Log in at <code>/#login</code> with a staff account (Education Staff, Curriculum Leader, or School Leader) to see live user data here.</p>
        </article>
      )}

      <div className="sc-overview-grid" style={{ marginBottom: 24 }}>
        {[
          ["Total users", isLoading ? "…" : users.length, "Registered accounts"],
          ["Teachers", isLoading ? "…" : countTeachers, "Signed up via get-started"],
          ["Taronga staff", isLoading ? "…" : countStaff, "Education, Curriculum, School Leader"],
          ["Other roles", isLoading ? "…" : countOther, "Accounts with other or no role"],
        ].map(([label, value, desc]) => (
          <article key={label} className="sc-stat-card">
            <span className="sc-stat-label">{label}</span>
            <strong className="sc-stat-value">{value}</strong>
            <p className="sc-stat-desc">{desc}</p>
          </article>
        ))}
      </div>

      <article className="user-table-card">
        <div className="table-toolbar">
          <label>
            <Icon type="target" className="" />
            <input
              type="search"
              placeholder="Search name, school or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select aria-label="Filter by role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option>All roles</option>
            {allRoles.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        {isLoading ? (
          <p className="empty-table-copy">Loading users…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>School / Organisation</th>
                <th>Email</th>
                <th>Last updated</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name || "—"}</td>
                  <td>
                    <span className={`sc-status-badge ${staffRoles.includes(u.role) ? "published" : "draft"}`}>
                      {u.role || "No role"}
                    </span>
                  </td>
                  <td>{u.schoolName || "—"}</td>
                  <td style={{ fontSize: 13, color: "#666" }}>{u.email || "—"}</td>
                  <td style={{ fontSize: 13, color: "#888" }}>{formatDate(u.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && visibleUsers.length === 0 && (
          <p className="empty-table-copy">
            {users.length === 0
              ? isPermissionDenied
                ? "Sign in with a staff account to view users."
                : "No users have registered yet."
              : "No users match this filter."}
          </p>
        )}

        {!isLoading && users.length > 0 && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", padding: "12px 0 0", borderTop: "1px solid #eee", marginTop: 8 }}>
            {Object.entries(roleCounts).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
              <span key={role} style={{ fontSize: 12, color: "#555" }}>
                <strong style={{ color: "#1a4d2e" }}>{count}</strong> {role}
              </span>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

function AnalyticsPanel({ liveSessions = [], liveResponses = [], liveSessionsStatus = "loading", liveResponsesStatus = "loading", onPlaceholder }) {
  const sessionsWithResponses = liveSessions.map((session) => {
    const responses = liveResponses.filter((response) => response.sessionId === session.id);
    const uniqueStudents = new Set(responses.map((response) => response.studentName?.trim()).filter(Boolean));
    return {
      ...session,
      responseCount: responses.length,
      studentCount: uniqueStudents.size,
      responses,
    };
  });

  const activeSessions = sessionsWithResponses.filter((session) => session.state !== "ended");
  const totalSessions = sessionsWithResponses.length;
  const totalResponses = liveResponses.length;
  const totalStudents = new Set(liveResponses.map((response) => response.studentName?.trim()).filter(Boolean)).size;
  const avgResponses = totalSessions ? Math.round((totalResponses / totalSessions) * 10) / 10 : 0;
  const modeCounts = {
    live: sessionsWithResponses.filter((session) => session.mode === "live").length,
    "student-paced": sessionsWithResponses.filter((session) => session.mode === "student-paced").length,
  };
  const blockTypeCounts = liveResponses.reduce((accumulator, response) => ({
    ...accumulator,
    [response.blockType || "slide"]: (accumulator[response.blockType || "slide"] || 0) + 1,
  }), {});
  const responseMix = Object.entries(blockTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const weeklyCounts = Array.from({ length: 7 }, (_, index) => {
    const target = new Date();
    target.setDate(target.getDate() - (6 - index));
    const key = target.toISOString().slice(0, 10);
    return liveResponses.filter((response) => {
      const submittedAt = response.submittedAt?.toDate?.();
      return submittedAt && submittedAt.toISOString().slice(0, 10) === key;
    }).length;
  });
  const weeklyMax = Math.max(...weeklyCounts, 1);
  const recentSessions = [...sessionsWithResponses]
    .sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime?.() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime?.() || 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  function exportReport() {
    const rows = [
      ["session_title", "class", "mode", "code", "state", "responses", "students"],
      ...sessionsWithResponses.map((session) => [
        session.contentTitle || "",
        session.classTitle || "",
        session.mode || "",
        session.code || "",
        session.state || "",
        String(session.responseCount || 0),
        String(session.studentCount || 0),
      ]),
    ];
    downloadTextFile(
      "wildly-live-analytics.csv",
      rows.map((row) => row.map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(",")).join("\n"),
      "text/csv;charset=utf-8",
    );
    onPlaceholder("Live lesson analytics exported as CSV.");
  }

  const isEmpty = !sessionsWithResponses.length && !liveResponses.length;
  const loading = liveSessionsStatus === "loading" || liveResponsesStatus === "loading";

  return (
    <section className="staff-section staff-panel active">
      <div className="section-heading">
        <div>
          <h2>Analytics</h2>
          <p>View live lesson usage, student participation and response patterns across Wildly.</p>
        </div>
        <button type="button" onClick={exportReport}>Export report</button>
      </div>
      <div className="overview-grid analytics-summary-grid">
        {[
          ["Live sessions", totalSessions, "Teacher-launched lessons with join codes"],
          ["Active now", activeSessions.length, "Sessions students can still join"],
          ["Student responses", totalResponses, "Saved quiz, poll and written responses"],
          ["Avg. responses / session", avgResponses, "Useful for spotting engagement drop-off"],
        ].map(([label, value, copy]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{copy}</p>
          </article>
        ))}
      </div>
      {loading ? <article className="placeholder-card"><h3>Loading analytics</h3><p>Pulling live lesson session data from Firestore.</p></article> : null}
      {!loading ? (
        <div className="analytics-grid">
          <article className="wide-card">
            <h3>Student participation this week</h3>
            <div className="bar-chart">
              {weeklyCounts.map((count, index) => (
                <span key={`${index}-${count}`} style={{ height: `${Math.max((count / weeklyMax) * 100, count ? 18 : 8)}%` }}></span>
              ))}
            </div>
            <ul className="result-list compact-results">
              <li>Unique students <strong>{totalStudents}</strong></li>
              <li>Live Participation <strong>{modeCounts.live}</strong></li>
              <li>Student-Paced <strong>{modeCounts["student-paced"]}</strong></li>
            </ul>
          </article>
          <article>
            <h3>Response mix</h3>
            {responseMix.length ? responseMix.map(([label, value]) => {
              const width = Math.max((value / Math.max(...responseMix.map(([, count]) => count), 1)) * 100, 14);
              return (
                <React.Fragment key={label}>
                  <p className="metric">{label}</p>
                  <div className="meter"><span style={{ width: `${width}%` }}></span></div>
                </React.Fragment>
              );
            }) : <p className="mini-empty">Responses will be grouped here once students start answering live activities.</p>}
          </article>
          <article>
            <h3>Recent sessions</h3>
            <ul className="result-list analytics-session-list">
              {recentSessions.length ? recentSessions.map((session) => (
                <li key={session.id}>
                  <span>
                    {session.contentTitle || "Untitled lesson"}
                    <small>{session.classTitle || "Class"} · {session.code || "Code pending"} · {session.mode === "student-paced" ? "Student-Paced" : "Live"}</small>
                  </span>
                  <strong>{session.responseCount}</strong>
                </li>
              )) : <li>No live sessions yet</li>}
            </ul>
          </article>
        </div>
      ) : null}
      {!loading && isEmpty ? <article className="placeholder-card"><h3>No live lesson data yet</h3><p>Once teachers launch code-based lessons, session and response analytics will appear here automatically.</p></article> : null}
    </section>
  );
}

function ContentPanel({ contentItems, status, saveState, seedContentItems, addContentItem, deleteContentItem }) {
  const [activeType, setActiveType] = useState("Learning Path");
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(createContentDraft("Learning Path"));
  const [imageError, setImageError] = useState("");
  const [formTab, setFormTab] = useState("details");
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
      activityBlocks: buildLessonActivityBlocks(item),
      lessonIds: item.lessonIds || [],
      resourceIds: item.resourceIds || [],
      learningPathId: item.learningPathId || "",
      lessonId: item.lessonId || "",
    };
  }

  useEffect(() => {
    setFormTab("details");
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

  function updateActivityBlock(blockId, patch) {
    setDraft((current) => ({
      ...current,
      activityBlocks: (current.activityBlocks || []).map((block) => (
        block.id === blockId ? { ...block, ...patch } : block
      )),
    }));
  }

  function addActivityBlock(type) {
    setDraft((current) => ({
      ...current,
      activityBlocks: [...(current.activityBlocks || []), createActivityBlock(type)],
    }));
  }

  function removeActivityBlock(blockId) {
    setDraft((current) => ({
      ...current,
      activityBlocks: (current.activityBlocks || []).filter((block) => block.id !== blockId),
    }));
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

  const contentFormTabs = [
    { id: "details", label: "Details" },
    { id: "files", label: "Files & Image" },
    ...(draft.type !== "Learning Path" ? [{ id: "engagement", label: "Engagement" }] : []),
    { id: "structure", label: "Structure" },
  ];

  return (
    <section className="staff-section staff-panel active">
      <div className="sc-panel-header">
        <div>
          <h2>Content Studio</h2>
          <p>Create and manage learning paths, lessons and resources for teachers.</p>
        </div>
        <button type="button" className="secondary-button slim-button" onClick={seedContentItems}>Seed defaults</button>
      </div>
      <ContentFirestoreStatus status={status} saveState={saveState} />

      <div className="sc-type-tabs">
        {["Learning Path", "Lesson", "Resource"].map((type) => (
          <button key={type} type="button" className={`sc-type-tab${activeType === type ? " active" : ""}`} onClick={() => startNew(type)}>
            <Icon type={typeCopy[type].icon} className="" />
            {type}
            <span className="sc-type-count">{contentItems.filter((i) => i.type === type).length}</span>
          </button>
        ))}
      </div>

      <div className="sc-master-detail">
        <div className="sc-list">
          <div className="sc-list-header">
            <span>{currentItems.length} item{currentItems.length !== 1 ? "s" : ""}</span>
            <button type="button" onClick={() => startNew(activeType)}>+ New</button>
          </div>
          <div className="sc-list-items">
            {!selectedId && (
              <div className="sc-item active">
                <span className="sc-status-badge draft">Draft</span>
                <strong>New {activeType}</strong>
                <span className="sc-item-meta">Unsaved</span>
              </div>
            )}
            {currentItems.map((item) => (
              <div key={item.id} className={`sc-item${selectedId === item.id ? " active" : ""}`} onClick={() => selectItem(item)}>
                <span className={`sc-status-badge ${(item.status || "draft").toLowerCase()}`}>{item.status || "Draft"}</span>
                <strong>{item.title}</strong>
                <span className="sc-item-meta">{item.subject} · {item.stage}{item.durationWeeks ? ` · ${item.durationWeeks}w` : ""}{item.durationMinutes ? ` · ${item.durationMinutes}m` : ""}</span>
              </div>
            ))}
            {!currentItems.length && <div className="sc-list-empty">No {activeType.toLowerCase()}s yet.</div>}
          </div>
        </div>

        <form className="sc-detail" onSubmit={submitContent}>
          <div className="sc-detail-header">
            <div>
              <span className="content-type">{selectedId ? "Editing" : "New"}</span>
              <h3>{selectedId ? (draft.title || `Edit ${draft.type}`) : `New ${draft.type}`}</h3>
            </div>
            <div className="sc-detail-actions">
              {selectedId ? <button type="button" className="delete-button" onClick={() => confirmDelete(draft)}>Delete</button> : null}
              <button type="button" className="secondary-button" onClick={() => startNew(activeType)}>Clear</button>
              <button type="submit" disabled={saveState === "saving"}>{saveState === "saving" ? "Saving…" : selectedId ? "Update" : "Save"}</button>
            </div>
          </div>

          <div className="sc-tabs">
            {contentFormTabs.map((tab) => (
              <button key={tab.id} type="button" className={`sc-tab${formTab === tab.id ? " active" : ""}`} onClick={() => setFormTab(tab.id)}>{tab.label}</button>
            ))}
          </div>

          <div className="sc-form-body">
            {formTab === "details" && (
              <div className="sc-fields">
                <div className="sc-field-row">
                  <div className="sc-field"><label>Title</label><input type="text" required value={draft.title} onChange={(e) => updateDraft({ title: e.target.value })} /></div>
                  <div className="sc-field"><label>Status</label><select value={draft.status} onChange={(e) => updateDraft({ status: e.target.value })}><option>Draft</option><option>Review</option><option>Published</option></select></div>
                </div>
                <div className="sc-field-row">
                  <div className="sc-field"><label>Subject</label><select value={draft.subject} onChange={(e) => updateDraft({ subject: e.target.value })}>{subjects.map(([label]) => <option key={label}>{label}</option>)}</select></div>
                  <div className="sc-field"><label>Stage</label><input type="text" value={draft.stage} onChange={(e) => updateDraft({ stage: e.target.value })} /></div>
                </div>
                {draft.type === "Learning Path" && <div className="sc-field"><label>Duration (weeks)</label><input type="number" min="0" value={draft.durationWeeks} style={{maxWidth:140}} onChange={(e) => updateDraft({ durationWeeks: e.target.value })} /></div>}
                {draft.type === "Lesson" && <div className="sc-field"><label>Duration (minutes)</label><input type="number" min="0" value={draft.durationMinutes} style={{maxWidth:140}} onChange={(e) => updateDraft({ durationMinutes: e.target.value })} /></div>}
                <div className="sc-field"><label>Summary</label><input type="text" required value={draft.summary} onChange={(e) => updateDraft({ summary: e.target.value })} placeholder="One-line teacher-facing description" /></div>
                <div className="sc-field"><label>Description</label><textarea value={draft.description} rows={4} onChange={(e) => updateDraft({ description: e.target.value })} /></div>
                <div className="sc-field"><label>Outcomes</label><textarea placeholder="One outcome per line" value={draft.outcomeCodes} rows={3} onChange={(e) => updateDraft({ outcomeCodes: e.target.value })} /></div>
              </div>
            )}

            {formTab === "files" && (
              <div className="sc-fields">
                <div className="sc-image-picker">
                  <div className="sc-image-preview"><img src={selectedImage} alt="" /></div>
                  <div className="sc-image-options">
                    <div className="sc-field"><label>Stock image</label><select value={selectedStockImage ? (selectedStockImage.key || selectedStockImage.src) : ""} onChange={(e) => chooseStockImage(e.target.value)}><option value="">Choose stock image</option>{stockImages.map((si) => <option value={si.key || si.src} key={`${si.label}-${si.src}`}>{si.label}</option>)}</select></div>
                    <div className="sc-field"><label>Image URL</label><input type="url" value={draft.customImageUrl} onChange={(e) => updateDraft({ customImageUrl: e.target.value, uploadedImageDataUrl: "", image: e.target.value, imageKey: "" })} placeholder="https://..." /></div>
                    <div className="sc-field"><label>Upload image</label>
                      <div className="sc-upload-zone" onClick={() => document.getElementById("content-img-upload").click()}><Icon type="plus" className="" /><span>Click to upload</span></div>
                      <input type="file" id="content-img-upload" accept="image/*" onChange={uploadCardImage} style={{display:"none"}} />
                    </div>
                    {imageError ? <p className="auth-error">{imageError}</p> : null}
                  </div>
                </div>

                {draft.type === "Learning Path" && <>
                  <div className="sc-field"><label>Teacher admin documents URL</label><input type="url" value={draft.teacherAdminUrl} onChange={(e) => updateDraft({ teacherAdminUrl: e.target.value })} placeholder="Drive, PDF or Canva link" /></div>
                  <div className="sc-field"><label>Unit plan URL</label><input type="url" value={draft.unitPlanUrl} onChange={(e) => updateDraft({ unitPlanUrl: e.target.value })} placeholder="Scope, sequence or program link" /></div>
                  <div className="sc-field"><label>Teacher notes</label><textarea placeholder="One note per line" value={draft.activityPrompts} rows={3} onChange={(e) => updateDraft({ activityPrompts: e.target.value })} /></div>
                </>}
                {draft.type === "Lesson" && <>
                  <div className="sc-field"><label>Lesson plan URL</label><input type="url" value={draft.lessonPlanUrl} onChange={(e) => updateDraft({ lessonPlanUrl: e.target.value })} placeholder="PDF, Drive or Canva link" /></div>
                  <div className="sc-field"><label>Teacher guide URL</label><input type="url" value={draft.teacherGuideUrl} onChange={(e) => updateDraft({ teacherGuideUrl: e.target.value })} placeholder="Optional support material" /></div>
                </>}
                {draft.type === "Resource" && <>
                  <div className="sc-field"><label>Resource file or Canva URL</label><input type="url" value={draft.resourceUrl} onChange={(e) => updateDraft({ resourceUrl: e.target.value })} placeholder="PDF, image, video, Canva or Drive link" /></div>
                  <div className="sc-field"><label>Student worksheet URL</label><input type="url" value={draft.studentWorksheetUrl} onChange={(e) => updateDraft({ studentWorksheetUrl: e.target.value })} placeholder="Optional worksheet or download" /></div>
                  <div className="sc-field"><label>Extra resource links</label><textarea placeholder="One URL per line" value={draft.resourceLinks} rows={3} onChange={(e) => updateDraft({ resourceLinks: e.target.value })} /></div>
                </>}
                <div className="sc-field"><label>Download links</label><textarea placeholder="One per line: Label | URL" value={draft.downloadLinks} rows={3} onChange={(e) => updateDraft({ downloadLinks: e.target.value })} /></div>
              </div>
            )}

            {formTab === "engagement" && draft.type !== "Learning Path" && (
              <div className="sc-fields">
                <div className="sc-engagement-actions">
                  {["slide", "quiz", "poll", "extended-response"].map((t) => (
                    <button key={t} type="button" className="secondary-button slim-button" onClick={() => addActivityBlock(t)}>+ {t.replace("-", " ")}</button>
                  ))}
                </div>
                {(draft.activityBlocks || []).length ? draft.activityBlocks.map((block, index) => (
                  <div className="sc-block-card" key={block.id}>
                    <div className="sc-block-header">
                      <div className="sc-field" style={{margin:0}}>
                        <label>Type</label>
                        <select value={block.type} onChange={(e) => updateActivityBlock(block.id, { type: e.target.value, options: e.target.value === "slide" || e.target.value === "extended-response" ? [] : (block.options?.length ? block.options : ["Option 1", "Option 2"]) })}>
                          <option value="slide">Slide</option><option value="quiz">Quiz</option><option value="poll">Poll</option><option value="extended-response">Extended response</option>
                        </select>
                      </div>
                      <button type="button" className="delete-button slim-button" onClick={() => removeActivityBlock(block.id)}>Remove</button>
                    </div>
                    <div className="sc-block-fields">
                      <div className="sc-field"><label>Step title</label><input type="text" value={block.title} onChange={(e) => updateActivityBlock(block.id, { title: e.target.value })} placeholder={`Step ${index + 1}`} /></div>
                      <div className="sc-field"><label>Prompt</label><textarea value={block.prompt} rows={2} onChange={(e) => updateActivityBlock(block.id, { prompt: e.target.value })} placeholder="What do students see or respond to?" /></div>
                      <div className="sc-field"><label>Teacher notes</label><textarea value={block.notes || ""} rows={2} onChange={(e) => updateActivityBlock(block.id, { notes: e.target.value })} placeholder="Optional note or transition." /></div>
                      {(block.type === "quiz" || block.type === "poll") && <div className="sc-field"><label>Options</label><textarea value={(block.options || []).join("\n")} rows={3} onChange={(e) => updateActivityBlock(block.id, { options: listFromText(e.target.value) })} placeholder="One option per line" /></div>}
                      {block.type === "quiz" && <div className="sc-field"><label>Correct answer</label><input type="text" value={block.answer || ""} onChange={(e) => updateActivityBlock(block.id, { answer: e.target.value })} placeholder="Match one option exactly" /></div>}
                    </div>
                  </div>
                )) : (
                  <div className="sc-empty-engagement">
                    <Icon type="plus" className="" />
                    <p>Add slides, quizzes and polls to make this lesson interactive for students.</p>
                  </div>
                )}
              </div>
            )}

            {formTab === "structure" && (
              <div className="sc-fields">
                {draft.type === "Learning Path" && (
                  <div className="sc-field">
                    <label>Lessons in this path</label>
                    <div className="sc-checkbox-list">
                      {lessonOptions.length ? lessonOptions.map((lesson) => (
                        <label key={lesson.id || lesson.title} className="sc-checkbox-item">
                          <input type="checkbox" checked={draft.lessonIds.includes(lesson.id)} onChange={() => toggleListItem("lessonIds", lesson.id)} />
                          <div><strong>{lesson.title}</strong><span>{lesson.subject} · {lesson.stage}</span></div>
                        </label>
                      )) : <p className="mini-empty">Create lessons first, then attach them here.</p>}
                    </div>
                  </div>
                )}
                {draft.type === "Lesson" && <>
                  <div className="sc-field"><label>Parent learning path</label><select value={draft.learningPathId} onChange={(e) => updateDraft({ learningPathId: e.target.value })}><option value="">Standalone lesson</option>{learningPaths.map((p) => <option value={p.id} key={p.id || p.title}>{p.title}</option>)}</select></div>
                  <div className="sc-field">
                    <label>Resources in this lesson</label>
                    <div className="sc-checkbox-list">
                      {resourceOptions.length ? resourceOptions.map((resource) => (
                        <label key={resource.id || resource.title} className="sc-checkbox-item">
                          <input type="checkbox" checked={draft.resourceIds.includes(resource.id)} onChange={() => toggleListItem("resourceIds", resource.id)} />
                          <div><strong>{resource.title}</strong><span>{resource.subject} · {resource.stage}</span></div>
                        </label>
                      )) : <p className="mini-empty">Create resources first, then attach them here.</p>}
                    </div>
                  </div>
                </>}
                {draft.type === "Resource" && <div className="sc-field"><label>Parent lesson</label><select value={draft.lessonId} onChange={(e) => updateDraft({ lessonId: e.target.value })}><option value="">Standalone resource</option>{lessonOptions.map((l) => <option value={l.id} key={l.id || l.title}>{l.title}</option>)}</select></div>}
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function TarongaTvPanel({ items, contentItems, status, saveState, saveVideo, deleteVideo }) {
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(createTarongaTvDraft());
  const [imageError, setImageError] = useState("");
  const [formTab, setFormTab] = useState("details");
  const selectedItem = items.find((item) => item.id === selectedId) || null;
  const lessonOptions = contentItems.filter((item) => item.type === "Lesson");
  const learningPathOptions = contentItems.filter((item) => item.type === "Learning Path");
  const selectedImage = draft.uploadedImageDataUrl || draft.customImageUrl || draft.thumbnailUrl || draft.image || assets[draft.imageKey] || assets.heroKoala;
  const selectedStockImage = stockImages.find((image) => (image.key && image.key === draft.imageKey) || (!draft.imageKey && !draft.uploadedImageDataUrl && !draft.customImageUrl && image.src === draft.thumbnailUrl));
  const normalizedDraftStatus = normalizeEditorialStatus(draft.status, "Draft");
  const submitLabel = saveState === "saving"
    ? "Saving..."
    : normalizedDraftStatus === "Published"
      ? (selectedItem ? "Publish video" : "Save and publish video")
      : (selectedItem ? "Update draft" : "Save draft");

  useEffect(() => {
    setFormTab("details");
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
    const savedId = await saveVideo(draft);
    if (savedId) {
      setSelectedId(savedId);
    }
  }

  async function handleDelete() {
    if (!selectedItem) return;
    if (!window.confirm(`Delete Taronga TV video "${selectedItem.title}"?`)) return;
    await deleteVideo(selectedItem);
    setSelectedId("");
  }

  const tvFormTabs = [
    { id: "details", label: "Details" },
    { id: "thumbnail", label: "Thumbnail" },
    { id: "curriculum", label: "Curriculum" },
    { id: "discussion", label: "Discussion Points" },
  ];

  return (
    <section className="staff-section staff-panel active">
      <div className="sc-panel-header">
        <div>
          <h2>Taronga TV</h2>
          <p>Curriculum-aligned videos with linked lessons, outcomes and timed discussion prompts.</p>
        </div>
      </div>
      <ContentFirestoreStatus status={status} saveState={saveState} />

      <div className="sc-master-detail">
        <div className="sc-list">
          <div className="sc-list-header">
            <span>{items.length} video{items.length !== 1 ? "s" : ""}</span>
            <button type="button" onClick={startNew}>+ New</button>
          </div>
          <div className="sc-list-items">
            {!selectedId && (
              <div className="sc-item active">
                <span className="sc-status-badge draft">Draft</span>
                <strong>New video</strong>
                <span className="sc-item-meta">Unsaved</span>
              </div>
            )}
            {items.map((item) => (
              <div key={item.id} className={`sc-item${selectedId === item.id ? " active" : ""}`} onClick={() => setSelectedId(item.id)}>
                <span className={`sc-status-badge ${(item.status || "draft").toLowerCase()}`}>{item.status || "Draft"}</span>
                <strong>{item.title}</strong>
                <span className="sc-item-meta">{item.subject} · {item.stage}{item.duration ? ` · ${item.duration}` : ""}</span>
              </div>
            ))}
            {!items.length && <div className="sc-list-empty">No videos yet.</div>}
          </div>
        </div>

        <form className="sc-detail" onSubmit={handleSubmit}>
          <div className="sc-detail-header">
            <div>
              <span className="content-type">{selectedId ? "Editing" : "New"}</span>
              <h3>{selectedId ? (draft.title || "Edit video") : "New Taronga TV video"}</h3>
            </div>
            <div className="sc-detail-actions">
              {selectedItem ? <a className="secondary-button slim-button" style={{textDecoration:"none",display:"inline-flex",alignItems:"center"}} href={teacherTvRoute(selectedItem.id)} target="_blank" rel="noreferrer">Preview</a> : null}
              {selectedItem ? <button type="button" className="delete-button" onClick={handleDelete}>Delete</button> : null}
              <button type="button" className="secondary-button" onClick={startNew}>Clear</button>
              <button type="submit" disabled={saveState === "saving"}>{saveState === "saving" ? "Saving…" : submitLabel}</button>
            </div>
          </div>

          <div className="sc-tabs">
            {tvFormTabs.map((tab) => (
              <button key={tab.id} type="button" className={`sc-tab${formTab === tab.id ? " active" : ""}`} onClick={() => setFormTab(tab.id)}>{tab.label}</button>
            ))}
          </div>

          <div className="sc-form-body">
            {formTab === "details" && (
              <div className="sc-fields">
                <div className="sc-field-row">
                  <div className="sc-field"><label>Title</label><input type="text" required value={draft.title} onChange={(e) => updateDraft({ title: e.target.value })} /></div>
                  <div className="sc-field"><label>Status</label><select value={draft.status} onChange={(e) => updateDraft({ status: e.target.value })}><option>Draft</option><option>Published</option></select></div>
                </div>
                <div className="sc-field-row">
                  <div className="sc-field"><label>Subject</label><select value={draft.subject} onChange={(e) => updateDraft({ subject: e.target.value })}>{subjects.map(([label]) => <option key={label}>{label}</option>)}</select></div>
                  <div className="sc-field"><label>Stage</label><input type="text" value={draft.stage} onChange={(e) => updateDraft({ stage: e.target.value })} /></div>
                </div>
                <div className="sc-field-row">
                  <div className="sc-field"><label>Duration</label><input type="text" value={draft.duration} onChange={(e) => updateDraft({ duration: e.target.value })} placeholder="6 min" /></div>
                  <div className="sc-field"><label>YouTube or Embed URL</label><input type="url" value={draft.embedUrl} onChange={(e) => updateDraft({ embedUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." /></div>
                </div>
                <div className="sc-field"><label>Summary</label><input type="text" required value={draft.summary} onChange={(e) => updateDraft({ summary: e.target.value })} /></div>
                <div className="sc-field"><label>Description</label><textarea value={draft.description} rows={4} onChange={(e) => updateDraft({ description: e.target.value })} /></div>
                <div className="sc-field">
                  <label>Categories</label>
                  <div className="sc-checkbox-list" style={{maxHeight:160}}>
                    {tarongaTvCategories.map((cat) => (
                      <label key={cat} className="sc-checkbox-item">
                        <input type="checkbox" checked={draft.categories.includes(cat)} onChange={() => toggleRelation("categories", cat)} />
                        <div><strong>{cat}</strong></div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="sc-field"><label>Download links</label><textarea placeholder="One per line: Label | URL" value={draft.downloadLinks} rows={3} onChange={(e) => updateDraft({ downloadLinks: e.target.value })} /></div>
              </div>
            )}

            {formTab === "thumbnail" && (
              <div className="sc-fields">
                <div className="sc-image-picker">
                  <div className="sc-image-preview"><img src={selectedImage} alt="" /></div>
                  <div className="sc-image-options">
                    <div className="sc-field"><label>Stock image</label><select value={selectedStockImage ? (selectedStockImage.key || selectedStockImage.src) : ""} onChange={(e) => chooseStockImage(e.target.value)}><option value="">Choose stock image</option>{stockImages.map((si) => <option value={si.key || si.src} key={`${si.label}-${si.src}`}>{si.label}</option>)}</select></div>
                    <div className="sc-field"><label>Thumbnail URL</label><input type="url" value={draft.customImageUrl} onChange={(e) => updateDraft({ customImageUrl: e.target.value, uploadedImageDataUrl: "", thumbnailUrl: e.target.value, imageKey: "" })} placeholder="https://..." /></div>
                    <div className="sc-field"><label>Upload thumbnail</label>
                      <div className="sc-upload-zone" onClick={() => document.getElementById("tv-thumb-upload").click()}><Icon type="plus" className="" /><span>Click to upload</span></div>
                      <input type="file" id="tv-thumb-upload" accept="image/*" onChange={uploadCardImage} style={{display:"none"}} />
                    </div>
                    {imageError ? <p className="auth-error">{imageError}</p> : null}
                  </div>
                </div>
              </div>
            )}

            {formTab === "curriculum" && (
              <div className="sc-fields">
                <div className="sc-field"><label>Curriculum outcomes</label><textarea placeholder="One outcome per line" value={draft.outcomeCodes} rows={4} onChange={(e) => updateDraft({ outcomeCodes: e.target.value })} /></div>
                <div className="sc-field">
                  <label>Linked lessons</label>
                  <div className="sc-checkbox-list">
                    {lessonOptions.length ? lessonOptions.map((lesson) => (
                      <label key={lesson.id || lesson.title} className="sc-checkbox-item">
                        <input type="checkbox" checked={draft.lessonIds.includes(lesson.id)} onChange={() => toggleRelation("lessonIds", lesson.id)} />
                        <div><strong>{lesson.title}</strong><span>{lesson.subject} · {lesson.stage}</span></div>
                      </label>
                    )) : <p className="mini-empty">Create lessons first.</p>}
                  </div>
                </div>
                <div className="sc-field">
                  <label>Linked learning paths</label>
                  <div className="sc-checkbox-list">
                    {learningPathOptions.length ? learningPathOptions.map((path) => (
                      <label key={path.id || path.title} className="sc-checkbox-item">
                        <input type="checkbox" checked={draft.learningPathIds.includes(path.id)} onChange={() => toggleRelation("learningPathIds", path.id)} />
                        <div><strong>{path.title}</strong><span>{path.subject} · {path.stage}</span></div>
                      </label>
                    )) : <p className="mini-empty">Create learning paths first.</p>}
                  </div>
                </div>
              </div>
            )}

            {formTab === "discussion" && (
              <div className="sc-fields">
                <p style={{margin:0,color:"var(--muted)",fontSize:13}}>Add pause moments with timestamps so teachers know exactly when to stop the video and prompt discussion.</p>
                {draft.discussionPoints.map((point, index) => (
                  <div key={`dp-${index}`} className="sc-discussion-point">
                    <div className="sc-field" style={{margin:0}}><label>Timestamp</label><input type="text" value={point.time} onChange={(e) => updateDiscussionPoint(index, { time: e.target.value })} placeholder="02:15" /></div>
                    <div className="sc-field" style={{margin:0}}><label>Talking point</label><textarea value={point.prompt} rows={2} onChange={(e) => updateDiscussionPoint(index, { prompt: e.target.value })} placeholder="Pause and ask..." /></div>
                    <button type="button" className="delete-button slim-button" style={{alignSelf:"flex-end",marginBottom:2}} onClick={() => removeDiscussionPoint(index)}>✕</button>
                  </div>
                ))}
                <button type="button" className="secondary-button" onClick={addDiscussionPoint}>+ Add discussion point</button>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function ProfessionalLearningPanel({ items, status, saveState, saveItem, deleteItem }) {
  const [selectedId, setSelectedId] = useState("");
  const [formTab, setFormTab] = useState("details");
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
    setFormTab("details");
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

  const plFormTabs = [
    { id: "details", label: "Session Details" },
    { id: "links", label: "Links & Files" },
  ];

  return (
    <section className="staff-section staff-panel active">
      <div className="sc-panel-header">
        <div>
          <h2>Professional Learning</h2>
          <p>Publish sessions for teachers — they surface in the PL page, calendar and notification bell.</p>
        </div>
      </div>
      <ContentFirestoreStatus status={status} saveState={saveState} />

      <div className="sc-master-detail">
        <div className="sc-list">
          <div className="sc-list-header">
            <span>{items.length} session{items.length !== 1 ? "s" : ""}</span>
            <button type="button" onClick={() => setSelectedId("")}>+ New</button>
          </div>
          <div className="sc-list-items">
            {!selectedId && (
              <div className="sc-item active">
                <span className="sc-status-badge draft">Draft</span>
                <strong>New session</strong>
                <span className="sc-item-meta">Unsaved</span>
              </div>
            )}
            {items.map((item) => (
              <div key={item.id} className={`sc-item${selectedId === item.id ? " active" : ""}`} onClick={() => setSelectedId(item.id)}>
                <span className={`sc-status-badge ${(item.status || "draft").toLowerCase()}`}>{item.status || "Draft"}</span>
                <strong>{item.title}</strong>
                <span className="sc-item-meta">{item.date || "No date set"}{item.time ? ` · ${item.time}` : ""}</span>
              </div>
            ))}
            {!items.length && <div className="sc-list-empty">No sessions yet.</div>}
          </div>
        </div>

        <form className="sc-detail" onSubmit={handleSubmit}>
          <div className="sc-detail-header">
            <div>
              <span className="content-type">{selectedItem ? "Editing" : "New"}</span>
              <h3>{selectedItem ? (draft.title || "Edit session") : "New PL session"}</h3>
            </div>
            <div className="sc-detail-actions">
              {selectedItem ? <button type="button" className="delete-button" onClick={handleDelete}>Delete</button> : null}
              <button type="button" className="secondary-button" onClick={() => setSelectedId("")}>Clear</button>
              <button type="submit" disabled={saveState === "saving"}>{saveState === "saving" ? "Saving…" : selectedItem ? "Update" : "Save"}</button>
            </div>
          </div>

          <div className="sc-tabs">
            {plFormTabs.map((tab) => (
              <button key={tab.id} type="button" className={`sc-tab${formTab === tab.id ? " active" : ""}`} onClick={() => setFormTab(tab.id)}>{tab.label}</button>
            ))}
          </div>

          <div className="sc-form-body">
            {formTab === "details" && (
              <div className="sc-fields">
                <div className="sc-field-row">
                  <div className="sc-field"><label>Title</label><input type="text" required value={draft.title} onChange={(e) => setDraft((c) => ({ ...c, title: e.target.value }))} /></div>
                  <div className="sc-field"><label>Status</label><select value={draft.status} onChange={(e) => setDraft((c) => ({ ...c, status: e.target.value }))}><option>Draft</option><option>Published</option></select></div>
                </div>
                <div className="sc-field-row">
                  <div className="sc-field"><label>Date</label><input type="date" value={draft.date} onChange={(e) => setDraft((c) => ({ ...c, date: e.target.value }))} /></div>
                  <div className="sc-field"><label>Time</label><input type="text" value={draft.time} onChange={(e) => setDraft((c) => ({ ...c, time: e.target.value }))} placeholder="4:00 PM AEST" /></div>
                </div>
                <div className="sc-field"><label>Summary</label><input type="text" value={draft.summary} onChange={(e) => setDraft((c) => ({ ...c, summary: e.target.value }))} placeholder="One-line description teachers will see" /></div>
                <div className="sc-field"><label>Description</label><textarea value={draft.description} rows={5} onChange={(e) => setDraft((c) => ({ ...c, description: e.target.value }))} /></div>
              </div>
            )}

            {formTab === "links" && (
              <div className="sc-fields">
                <div className="sc-field"><label>Registration link</label><input type="url" value={draft.registrationUrl} onChange={(e) => setDraft((c) => ({ ...c, registrationUrl: e.target.value }))} placeholder="https://..." /></div>
                <div className="sc-field"><label>Information link</label><input type="url" value={draft.infoUrl} onChange={(e) => setDraft((c) => ({ ...c, infoUrl: e.target.value }))} placeholder="https://..." /></div>
                <div className="sc-field"><label>PDF link</label><input type="url" value={draft.pdfUrl} onChange={(e) => setDraft((c) => ({ ...c, pdfUrl: e.target.value }))} placeholder="https://..." /></div>
                <div className="sc-field"><label>Download links</label><textarea placeholder="One per line: Label | URL" value={draft.downloadLinks} rows={4} onChange={(e) => setDraft((c) => ({ ...c, downloadLinks: e.target.value }))} /></div>
                <p style={{margin:0,padding:"12px 14px",borderRadius:8,background:"#f0f6f0",color:"#3a5244",fontSize:13}}>Published sessions appear in the Professional Learning page, teacher calendar and notification bell.</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function UpcomingEventsPanel({ events = [], saveEvent, deleteEvent }) {
  const emptyDraft = { title: "", date: "", description: "" };
  const [draft, setDraft] = useState(emptyDraft);
  const [editing, setEditing] = useState(null);

  function updateDraft(patch) { setDraft((d) => ({ ...d, ...patch })); }

  async function handleSave() {
    if (!draft.title.trim() || !draft.date) return;
    await saveEvent(editing ? { ...draft, id: editing } : draft);
    setDraft(emptyDraft);
    setEditing(null);
  }

  function startEdit(event) {
    setEditing(event.id);
    setDraft({ title: event.title, date: event.date, description: event.description || "" });
  }

  function cancelEdit() {
    setEditing(null);
    setDraft(emptyDraft);
  }

  return (
    <section className="staff-section staff-panel active">
      <div className="section-heading">
        <div><h2>Upcoming Events</h2><p>Add events and sessions that appear on every teacher's dashboard. Past events are hidden automatically.</p></div>
      </div>
      <div className="upcoming-editor">
        <div className="upcoming-form-card">
          <h3>{editing ? "Edit event" : "Add new event"}</h3>
          <form className="editor-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <label>Event title<input type="text" value={draft.title} onChange={(e) => updateDraft({ title: e.target.value })} placeholder="e.g. Wildlife Photography Workshop" required /></label>
            <label>Date<input type="date" value={draft.date} onChange={(e) => updateDraft({ date: e.target.value })} required /></label>
            <label>Description (optional)<textarea value={draft.description} onChange={(e) => updateDraft({ description: e.target.value })} rows={2} placeholder="Short note for teachers about this event" /></label>
            <div className="form-actions">
              <button type="submit" className="primary-action">{editing ? "Update event" : "Add event"}</button>
              {editing && <button type="button" className="secondary-action" onClick={cancelEdit}>Cancel</button>}
            </div>
          </form>
        </div>
        <div className="upcoming-list">
          <h3>Current upcoming events ({events.length})</h3>
          {events.length === 0 ? (
            <p className="col-empty">No upcoming events added yet. Events you add will appear on teacher dashboards.</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="upcoming-event-row">
                <div className="upcoming-event-info">
                  <time className="upcoming-date">{event.date}</time>
                  <strong>{event.title}</strong>
                  {event.description && <p>{event.description}</p>}
                </div>
                <div className="upcoming-event-actions">
                  <button type="button" onClick={() => startEdit(event)}>Edit</button>
                  <button type="button" className="delete-btn" onClick={() => deleteEvent(event)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function DashboardEditor({ config, contentItems, updateConfig, reset, previewKey, publish, status, saveState }) {
  const saveText = saveState === "saving" ? "Publishing..." : "Publish changes";
  return <section className="staff-section staff-panel active"><div className="section-heading"><div><h2>Edit teacher dashboard</h2><p>Live-edit teacher-facing dashboard text, imagery and visibility flags before publishing.</p></div><div className="heading-actions"><button type="button" onClick={reset}>Reset preview</button><button type="button" onClick={publish} disabled={saveState === "saving"}>{saveText}</button></div></div><article className="dashboard-editor live-dashboard-editor"><div className="editor-copy"><span className="content-type">Teacher Dashboard Editor</span><h3>Update teacher-facing dashboard content</h3><p>Changes below update the preview immediately. Publishing writes the values to Firestore at dashboardConfig/main.</p><FirestoreStatus status={status} saveState={saveState} /></div><form className="editor-form"><label>Hero headline<input type="text" value={config.heroTitle} onChange={(event) => updateConfig({ heroTitle: event.target.value })} /></label><label>Hero subheading<input type="text" value={config.heroSubtitle} onChange={(event) => updateConfig({ heroSubtitle: event.target.value })} /></label><label>Hero image<select value={config.heroImageUrl} onChange={(event) => updateConfig({ heroImageUrl: event.target.value })}><option value={assets.heroKoala}>Koala with joey</option><option value={assets.giraffe}>Giraffe at Taronga</option><option value={assets.binturong}>Binturong encounter</option><option value={assets.gorilla}>Gorilla habitat</option></select></label><label>Featured resource title<select value={config.featuredResourceTitle} onChange={(event) => updateConfig({ featuredResourceTitle: event.target.value })}>{contentItems.map((item) => <option key={item.id || item.title}>{item.title}</option>)}</select></label></form><div className="flag-grid" aria-label="Teacher dashboard content flags"><label><input type="checkbox" checked={config.showTrackaCard} onChange={(event) => updateConfig({ showTrackaCard: event.target.checked })} /> Feature Taronga Tracka card</label><label><input type="checkbox" /> Show beta student insights</label><label><input type="checkbox" defaultChecked /> Display new resource badges</label><label><input type="checkbox" /> Lock subject cards during review</label></div><div className="teacher-live-preview"><div className="preview-toolbar"><span>Live teacher dashboard preview</span><a href={routePath("teacher")} target="_blank" rel="noreferrer">Open full view</a></div><div className="preview-frame" key={previewKey}><TeacherDashboard config={config} contentItems={contentItems} /></div></div></article></section>;
}

function FirestoreStatus({ status, saveState }) {
  if (status === "live" && !saveState) return null;

  const messages = {
    loading: "Loading Firestore dashboard config...",
    missing: "Firestore connected. dashboardConfig/main has not been published yet.",
    fallback: "Firestore denied access. Showing the built-in dashboard defaults until rules are updated.",
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
    fallback: `Firestore denied access to ${collectionName}. Showing built-in demo ${collectionLabel} until rules are updated.`,
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
      <SiteHeader />
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

function StudentJoinCard({ compact = false }) {
  const [code, setCode] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!code.trim()) return;
    window.location.hash = `#student/code/${code.trim().toUpperCase()}`;
  }

  return (
    <form className={`student-code-card ${compact ? "compact" : ""}`} onSubmit={handleSubmit}>
      <div>
        <span className="audience-pill">Students</span>
        <h3>Join with a lesson code</h3>
        <p>Enter the code from your teacher to join a live lesson or a student-paced activity.</p>
      </div>
      <div className="student-code-row">
        <input type="text" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} />
        <button type="submit" className="primary-action">Join</button>
      </div>
    </form>
  );
}

function StudentExperience({ session, contentItem, studentName }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responseValue, setResponseValue] = useState("");
  const blocks = buildLessonActivityBlocks(contentItem);
  const sessionIndex = Math.min(session.currentStep || 0, Math.max(blocks.length - 1, 0));
  const activeIndex = session.mode === "student-paced" ? currentIndex : sessionIndex;
  const block = blocks[activeIndex];

  useEffect(() => {
    if (session.mode !== "student-paced") {
      setCurrentIndex(sessionIndex);
    }
  }, [session.mode, sessionIndex]);

  useEffect(() => {
    setResponseValue("");
  }, [activeIndex, session.id]);

  async function submitResponse(event) {
    event.preventDefault();
    if (!block) return;

    const safeStudent = studentName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "student";
    await setDoc(doc(db, "liveResponses", `${session.id}_${safeStudent}_${block.id}`), {
      sessionId: session.id,
      contentId: contentItem.id,
      blockId: block.id,
      blockType: block.type,
      studentName,
      response: responseValue,
      submittedAt: serverTimestamp(),
    }, { merge: true });

    if (session.mode === "student-paced" && activeIndex < blocks.length - 1) {
      setCurrentIndex((current) => current + 1);
    }
  }

  if (!block) {
    return <section className="student-shell"><article className="student-panel"><h1>Lesson unavailable</h1><p>This session does not have any student activity blocks yet.</p></article></section>;
  }

  return (
    <section className="student-shell">
      <article className="student-panel">
        <div className="student-session-meta">
          <span className="pill">{session.mode === "student-paced" ? "Student-Paced" : "Live lesson"}</span>
          <small>{contentItem.subject} · {contentItem.stage}</small>
        </div>
        <h1>{contentItem.title}</h1>
        <p>{contentItem.summary || contentItem.description}</p>
        <div className="student-block-card">
          <div className="student-block-header">
            <strong>{block.title}</strong>
            <small>Step {activeIndex + 1} of {blocks.length}</small>
          </div>
          <p>{block.prompt}</p>
          {block.notes ? <div className="student-teacher-note">{block.notes}</div> : null}
          {block.type === "slide" ? (
            <div className="teacher-card-actions">
              {session.mode === "student-paced" && activeIndex < blocks.length - 1 ? <button type="button" className="primary-action" onClick={() => setCurrentIndex((current) => current + 1)}>Next</button> : null}
              {session.mode !== "student-paced" ? <p className="mini-empty">Wait for your teacher to move to the next step.</p> : null}
            </div>
          ) : (
            <form className="student-response-form" onSubmit={submitResponse}>
              {block.type === "extended-response" ? (
                <textarea value={responseValue} onChange={(event) => setResponseValue(event.target.value)} placeholder="Write your response here" />
              ) : (
                <div className="student-options-list">
                  {(block.options || []).map((option) => (
                    <label key={option} className="student-option">
                      <input type="radio" name={`block-${block.id}`} value={option} checked={responseValue === option} onChange={(event) => setResponseValue(event.target.value)} />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
              <div className="teacher-card-actions">
                <button type="submit" className="primary-action">Submit response</button>
                {session.mode === "student-paced" && activeIndex > 0 ? <button type="button" className="secondary-action" onClick={() => setCurrentIndex((current) => current - 1)}>Back</button> : null}
              </div>
            </form>
          )}
        </div>
      </article>
    </section>
  );
}

function StudentPage({ code = "" }) {
  const [lessonCode, setLessonCode] = useState(code.toUpperCase());
  const [studentName, setStudentName] = useState("");
  const [joined, setJoined] = useState(false);
  const { items: contentItems } = useContentItems();
  const { item: session, status } = useLiveSessionByCode(lessonCode);

  useEffect(() => {
    setLessonCode(code.toUpperCase());
    setJoined(false);
  }, [code]);

  const contentItem = contentItems.find((item) => item.id === session?.contentId) || null;

  function handleLookup(event) {
    event.preventDefault();
    if (!lessonCode.trim()) return;
    window.location.hash = `#student/code/${lessonCode.trim().toUpperCase()}`;
  }

  function handleJoin(event) {
    event.preventDefault();
    if (!studentName.trim()) return;
    setJoined(true);
  }

  if (joined && session && contentItem) {
    return <StudentExperience session={session} contentItem={contentItem} studentName={studentName.trim()} />;
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide student-entry-card">
        <a className="site-logo auth-logo" href={routePath()} aria-label="Wildly home">
          <img src={assets.wildlyLogo} alt="Wildly by Taronga" />
        </a>
        <span className="audience-pill">Student join</span>
        <h1>Join a Wildly lesson</h1>
        <p>Enter your lesson code, then add your name to join the live or student-paced experience on your device.</p>
        <form className="auth-form" onSubmit={handleLookup}>
          <label>
            Lesson code
            <input type="text" value={lessonCode} onChange={(event) => setLessonCode(event.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} />
          </label>
          <button type="submit">Find lesson</button>
        </form>
        {status === "missing" && lessonCode ? <p className="auth-error">That code is not active right now.</p> : null}
        {session && contentItem ? (
          <form className="auth-form" onSubmit={handleJoin}>
            <label>
              Your name
              <input type="text" value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Enter your first name" />
            </label>
            <div className="student-session-summary">
              <strong>{contentItem.title}</strong>
              <span>{session.classTitle} · {session.mode === "student-paced" ? "Student-Paced" : "Live lesson"}</span>
            </div>
            <button type="submit">Join lesson</button>
          </form>
        ) : null}
      </section>
    </main>
  );
}

function TeacherLiveSessionPage({ sessionId = "" }) {
  const { item: session, status } = useLiveSessionById(sessionId);
  const responses = useLiveResponsesForSession(sessionId);
  const { items: contentItems } = useContentItems();
  const contentItem = contentItems.find((item) => item.id === session?.contentId) || null;
  const blocks = contentItem ? buildLessonActivityBlocks(contentItem) : [];
  const currentIndex = Math.min(session?.currentStep || 0, Math.max(blocks.length - 1, 0));
  const activeBlock = blocks[currentIndex];
  const blockResponses = responses.filter((response) => response.blockId === activeBlock?.id);

  async function updateStep(nextStep) {
    if (!session) return;
    await updateDoc(doc(db, "liveSessions", session.id), { currentStep: nextStep, updatedAt: serverTimestamp() });
  }

  async function endSession() {
    if (!session) return;
    await updateDoc(doc(db, "liveSessions", session.id), { state: "ended", endedAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }

  if (status === "loading") {
    return <main className="auth-page"><section className="auth-card"><p>Loading live session...</p></section></main>;
  }

  if (!session || !contentItem) {
    return <main className="auth-page"><section className="auth-card"><p>Live session not found.</p></section></main>;
  }

  return (
    <div className="teacher-live-shell">
      <aside className="teacher-live-sidebar">
        <span className="content-type">{session.mode === "student-paced" ? "Student-Paced" : "Live lesson"}</span>
        <h1>{contentItem.title}</h1>
        <p>{contentItem.summary || contentItem.description}</p>
        <div className="teacher-live-session-code">
          <strong>{session.code}</strong>
          <small>{session.classTitle}</small>
          <a className="secondary-action" href={studentRoute(`code/${session.code}`)}>Student join page</a>
        </div>
        <div className="teacher-live-step-list">
          {blocks.map((block, index) => (
            <button type="button" key={block.id} className={`teacher-live-step ${index === currentIndex ? "active" : ""}`} onClick={() => updateStep(index)}>
              <span>{index + 1}</span>
              <div>
                <strong>{block.title}</strong>
                <small>{block.type}</small>
              </div>
            </button>
          ))}
        </div>
        <div className="teacher-card-actions">
          <button type="button" className="secondary-action" onClick={() => updateStep(Math.max(currentIndex - 1, 0))}>Previous</button>
          <button type="button" className="primary-action" onClick={() => updateStep(Math.min(currentIndex + 1, blocks.length - 1))}>Next</button>
          <button type="button" className="secondary-action" onClick={endSession}>End session</button>
        </div>
      </aside>
      <main className="teacher-live-main">
        <section className="teacher-live-stage">
          <span className="pill">{activeBlock?.type || "slide"}</span>
          <h2>{activeBlock?.title}</h2>
          <p>{activeBlock?.prompt}</p>
          {activeBlock?.notes ? <div className="student-teacher-note">{activeBlock.notes}</div> : null}
          {activeBlock?.options?.length ? <ul className="teacher-live-options">{activeBlock.options.map((option) => <li key={option}>{option}</li>)}</ul> : null}
        </section>
        <section className="teacher-live-analytics">
          <div className="teacher-panel-header">
            <div>
              <h2>Live responses</h2>
              <p>{blockResponses.length} students have responded to this step.</p>
            </div>
          </div>
          <div className="student-card-grid">
            {blockResponses.length ? blockResponses.map((response) => (
              <article className="student-card" key={response.id}>
                <div className="student-card-head">
                  <div>
                    <h3>{response.studentName}</h3>
                    <p>{response.blockType}</p>
                  </div>
                  <span className="pill">Response</span>
                </div>
                <p>{response.response}</p>
              </article>
            )) : <article className="placeholder-card"><h3>No responses yet</h3><p>Students will appear here as they submit answers on their devices.</p></article>}
          </div>
        </section>
      </main>
    </div>
  );
}

function TeacherPresenterPage({ contentId = "" }) {
  const { items: contentItems } = useContentItems();
  const contentItem = contentItems.find((item) => item.id === contentId) || null;
  const blocks = contentItem ? buildLessonActivityBlocks(contentItem) : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const block = blocks[currentIndex];

  if (!contentItem) {
    return <main className="auth-page"><section className="auth-card"><p>Presentation not found.</p></section></main>;
  }

  return (
    <div className="teacher-live-shell presenter-shell">
      <aside className="teacher-live-sidebar">
        <span className="content-type">Front of class</span>
        <h1>{contentItem.title}</h1>
        <p>{contentItem.summary || contentItem.description}</p>
        <div className="teacher-live-step-list">
          {blocks.map((entry, index) => (
            <button type="button" key={entry.id} className={`teacher-live-step ${index === currentIndex ? "active" : ""}`} onClick={() => setCurrentIndex(index)}>
              <span>{index + 1}</span>
              <div>
                <strong>{entry.title}</strong>
                <small>{entry.type}</small>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <main className="teacher-live-main">
        <section className="teacher-live-stage">
          <span className="pill">{block?.type || "slide"}</span>
          <h2>{block?.title}</h2>
          <p>{block?.prompt}</p>
          {block?.notes ? <div className="student-teacher-note">{block.notes}</div> : null}
          {block?.options?.length ? <ul className="teacher-live-options">{block.options.map((option) => <li key={option}>{option}</li>)}</ul> : null}
          <div className="teacher-card-actions">
            <button type="button" className="secondary-action" onClick={() => setCurrentIndex((current) => Math.max(current - 1, 0))}>Previous</button>
            <button type="button" className="primary-action" onClick={() => setCurrentIndex((current) => Math.min(current + 1, blocks.length - 1))}>Next</button>
          </div>
        </section>
      </main>
    </div>
  );
}

function getRoutePath() {
  const hashPath = window.location.hash.replace(/^#\/?/, "");
  return hashPath || window.location.pathname.replace(basePath, "").replace(/^\//, "").replace(/\/$/, "");
}

export default function AuthenticatedApp() {
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
  if (path === "/student" || path === "student") return <StudentPage />;
  if (path.startsWith("student/")) {
    const [, section = "", third = ""] = path.split("/");
    if (section === "code") return <StudentPage code={third} />;
    return <StudentPage />;
  }
  if (path === "/teacher" || path === "/teacher.html" || path === "teacher" || path === "teacher.html") return <TeacherPage />;
  if (path.startsWith("teacher/")) {
    const [, section = "dashboard", third = ""] = path.split("/");
    if (section === "preview") return <TeacherPage preview />;
    if (section === "subjects") return <TeacherPage page="subjects" subject={third} />;
    if (section === "content") return <TeacherPage page="content" contentId={third} />;
    if (section === "taronga-tv") return <TeacherPage page="taronga-tv" tvVideoId={third} />;
    if (section === "live") return <TeacherLiveSessionPage sessionId={third} />;
    if (section === "present") return <TeacherPresenterPage contentId={third} />;
    if (section === "professional-learning") return <TeacherPage page="professional-learning" />;
    return <TeacherPage page={section || "dashboard"} />;
  }
  if (path === "/staff" || path === "/staff.html") return <StaffPage />;
  if (path === "staff" || path === "staff.html") return <StaffPage />;
  if (path === "demo-booking") return <PlaceholderExperiencePage eyebrow="Demo Booking" title="Book a Wildly demo" description="This page is ready for your real demo booking workflow. Use it for school enquiries, implementation calls and onboarding sessions." points={["Demo request form or embedded scheduler", "School details and contact intake", "Implementation readiness checklist"]} primaryLabel="Teacher Dashboard" primaryHref={teacherRoute()} secondaryLabel="Support" secondaryHref={appLinks.support} />;
  if (path === "support") return <PlaceholderExperiencePage eyebrow="Support" title="Wildly support" description="This is the right place for help content, onboarding docs, support contact details and troubleshooting guidance." points={["Teacher help centre or FAQs", "Support email, form or live chat", "Technical setup and Firestore guidance"]} primaryLabel="Teacher Dashboard" primaryHref={teacherRoute()} secondaryLabel="Professional Learning" secondaryHref={appLinks.professionalLearning} />;
  if (path === "excursions") return <PlaceholderExperiencePage eyebrow="Excursions" title="Excursions and zoo links" description="Use this space for visit planning, excursion bookings, pre-visit resources and Tracka-connected field learning." points={["Excursion booking links", "Pre-visit teacher packs", "On-site learning workflows and Tracka links"]} primaryLabel="Teacher Dashboard" primaryHref={teacherRoute("calendar")} secondaryLabel="Home" secondaryHref={routePath()} />;
  if (path === "professional-learning") return <TeacherPage page="professional-learning" />;
  return <AuthScreen mode="login" />;
}
