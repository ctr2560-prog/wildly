const tabButtons = document.querySelectorAll("[data-panel]");
const panels = document.querySelectorAll("[data-panel-content]");
const teacherFrame = document.querySelector("#teacherDashboardFrame");
const heroHeadlineInput = document.querySelector("#heroHeadlineInput");
const heroSubheadingInput = document.querySelector("#heroSubheadingInput");
const heroImageInput = document.querySelector("#heroImageInput");
const featuredResourceInput = document.querySelector("#featuredResourceInput");
const showContinueInput = document.querySelector("#showContinueInput");
const showUpcomingInput = document.querySelector("#showUpcomingInput");
const showTrackaInput = document.querySelector("#showTrackaInput");
const resetDashboardPreview = document.querySelector("#resetDashboardPreview");

function showPanel(panelName) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panelName);
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.panelContent === panelName;
    panel.hidden = !isActive;
    panel.classList.toggle("active", isActive);
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => showPanel(button.dataset.panel));
});

showPanel("overview");

function getTeacherDocument() {
  return teacherFrame?.contentDocument || teacherFrame?.contentWindow?.document;
}

function setElementVisibility(doc, selector, isVisible) {
  const element = doc.querySelector(selector);
  if (element) {
    element.style.display = isVisible ? "" : "none";
  }
}

function updateTeacherPreview() {
  const doc = getTeacherDocument();
  if (!doc) return;

  const heroTitle = doc.querySelector(".hero h1");
  const heroSubtitle = doc.querySelector(".hero-subtitle");
  const heroImage = doc.querySelector(".hero-animal");
  const firstResourceTitle = doc.querySelector(".learning-card h3");

  if (heroTitle) heroTitle.textContent = heroHeadlineInput?.value || "";
  if (heroSubtitle) heroSubtitle.textContent = heroSubheadingInput?.value || "";
  if (heroImage && heroImageInput?.value) heroImage.src = heroImageInput.value;
  if (firstResourceTitle && featuredResourceInput?.value) {
    firstResourceTitle.textContent = featuredResourceInput.value;
  }

  setElementVisibility(doc, ".content-column .section-title-row", Boolean(showContinueInput?.checked));
  setElementVisibility(doc, "#resourceGrid", Boolean(showContinueInput?.checked));
  setElementVisibility(doc, ".upcoming-panel", Boolean(showUpcomingInput?.checked));
  setElementVisibility(doc, ".tracka-card", Boolean(showTrackaInput?.checked));
}

[
  heroHeadlineInput,
  heroSubheadingInput,
  heroImageInput,
  featuredResourceInput,
  showContinueInput,
  showUpcomingInput,
  showTrackaInput,
].forEach((control) => {
  control?.addEventListener("input", updateTeacherPreview);
  control?.addEventListener("change", updateTeacherPreview);
});

teacherFrame?.addEventListener("load", updateTeacherPreview);

resetDashboardPreview?.addEventListener("click", () => {
  if (heroHeadlineInput) heroHeadlineInput.value = "Learning through nature";
  if (heroSubheadingInput) heroSubheadingInput.value = "Inspire curiosity. Create change.";
  if (heroImageInput) heroImageInput.value = "./assets/hero-koala.jpg";
  if (featuredResourceInput) featuredResourceInput.value = "Sustainable Futures";
  if (showContinueInput) showContinueInput.checked = true;
  if (showUpcomingInput) showUpcomingInput.checked = true;
  if (showTrackaInput) showTrackaInput.checked = true;
  teacherFrame?.contentWindow?.location.reload();
});
