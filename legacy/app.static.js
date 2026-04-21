const resources = [
  {
    title: "Adaptations of Australian Animals",
    subject: "Science",
    stage: "Stage 2",
    progress: 65,
    image: "./assets/river.png",
    type: "Lesson sequence",
  },
  {
    title: "First Nations Cultures and Country",
    subject: "HSIE",
    stage: "Stage 3",
    progress: 40,
    image: "./assets/rhino.jpg",
    type: "Inquiry resource",
  },
  {
    title: "Design for a Sustainable Future",
    subject: "Technology & STEM",
    stage: "Stage 4",
    progress: 25,
    image: "./assets/binturong.jpg",
    type: "Design challenge",
  },
  {
    title: "Persuasive Texts for Wildlife Action",
    subject: "English",
    stage: "Stage 3",
    progress: 15,
    image: "./assets/koala.jpg",
    type: "Writing task",
  },
  {
    title: "Animal Movement and Data Patterns",
    subject: "Mathematics",
    stage: "Stage 3",
    progress: 55,
    image: "./assets/giraffe.jpg",
    type: "Data activity",
  },
  {
    title: "Wellbeing Through Nature Connection",
    subject: "PDHPE",
    stage: "Stage 2",
    progress: 80,
    image: "./assets/gorilla.jpg",
    type: "Reflection lesson",
  },
];

let activeSubject = null;

const resourceGrid = document.querySelector("#resourceGrid");
const searchInput = document.querySelector("#resourceSearch");
const clearButton = document.querySelector("#clearFilter");
const subjectControls = document.querySelectorAll("[data-filter]");

function normalise(value) {
  return value.toLowerCase().trim();
}

function renderResources() {
  const query = normalise(searchInput.value);
  const filtered = resources.filter((resource) => {
    const matchesSubject = !activeSubject || resource.subject === activeSubject;
    const searchable = `${resource.title} ${resource.subject} ${resource.stage} ${resource.type}`;
    return matchesSubject && normalise(searchable).includes(query);
  });

  resourceGrid.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("article");
    empty.className = "empty-state";
    empty.innerHTML = `
      <h3>No matching resources</h3>
      <p>Try a different subject or search term.</p>
    `;
    resourceGrid.append(empty);
    return;
  }

  filtered.slice(0, 3).forEach((resource) => {
    const card = document.createElement("article");
    card.className = "learning-card";
    card.innerHTML = `
      <img src="${resource.image}" alt="" />
      <div class="learning-body">
        <span class="pill">${resource.subject}</span>
        <h3>${resource.title}</h3>
        <p>${resource.type} - ${resource.stage}</p>
        <div class="progress-row">
          <div class="progress-track">
            <span style="width: ${resource.progress}%"></span>
          </div>
          <small>${resource.progress}% Complete</small>
        </div>
        <button>Continue</button>
      </div>
    `;
    resourceGrid.append(card);
  });
}

function setActiveSubject(subject) {
  activeSubject = subject;
  subjectControls.forEach((control) => {
    control.classList.toggle("selected", control.dataset.filter === activeSubject);
  });
  renderResources();
}

subjectControls.forEach((control) => {
  control.addEventListener("click", () => setActiveSubject(control.dataset.filter));
});

clearButton.addEventListener("click", () => {
  activeSubject = null;
  searchInput.value = "";
  subjectControls.forEach((control) => control.classList.remove("selected"));
  renderResources();
});

searchInput.addEventListener("input", renderResources);

renderResources();
