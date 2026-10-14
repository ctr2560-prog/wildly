// Separate Vite development entry. Not part of the production build or router.
if (import.meta.env.DEV) {
  import("./staff-preview-app.jsx").then(({ mountStaffPreview }) => mountStaffPreview());
}
