// Shared photographic identities keep public and teacher views consistent.
const base = `${import.meta.env.BASE_URL}assets/`;
const images = {
  Science: "subject-science.webp", English: "subject-english.webp",
  "Literacy & Numeracy": "subject-litnum.webp", Mathematics: "subject-mathematics.webp",
  HSIE: "subject-hsie.webp", PDHPE: "subject-pdhpe.webp", CAPA: "subject-capa.jpg",
  "Technology & STEM": "subject-stem.webp", "Early Years": "subject-early-years.webp",
};
export function subjectImage(label) { return base + (images[label] || "subject-sydney.webp"); }
