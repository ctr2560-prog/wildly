import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ContentPanel, TarongaTvPanel, ProfessionalLearningPanel, UpcomingEventsPanel, BannerManager, UsersPanel, StaffAnalytics, Icon, defaultContentItems, defaultTarongaTvVideos, defaultProfessionalLearningItems } from "./authenticated-app.jsx";
import StaffWorkspace, { StaffOverview } from "./staff-workspace.jsx";
import "./fonts.css";
import "./tokens.css";
import "./staff-design.css";

// These fixtures never subscribe to live data. All mutation callbacks stay local.
const content = defaultContentItems.map((item, index) => ({ ...item, status: index % 3 === 0 ? "Review" : index % 3 === 1 ? "Draft" : "Published" }));
const videos = defaultTarongaTvVideos;
const sessions = defaultProfessionalLearningItems;
const events = [{ id: "sample-event", title: "Wildlife observation workshop", date: "2026-11-12", description: "A sample teacher workshop for previewing the calendar editor." }];
const users = [
  { id: "sample-teacher", email: "teacher@example.com", role: "Teacher", schoolName: "Example Primary School" },
  { id: "sample-staff", email: "staff@example.com", role: "Education Staff", schoolName: "Taronga Education" },
];
const banners = [{ id: "sample-banner", title: "A little curiosity. A world of discovery.", eyebrow: "Learning with Taronga", message: "Explore classroom-ready lessons inspired by wildlife and conservation.", imageKey: "giraffe", active: true, linkLabel: "Explore the library", linkUrl: "#teacher/content" }];

function StaffPreview() {
  const [panel, setPanel] = useState("overview");
  const [notice, setNotice] = useState("");
  const noSave = async () => { setNotice("Preview only. Nothing was saved or changed in the live platform."); return "preview-only"; };
  return <StaffWorkspace panel={panel} onNavigate={(next) => { setPanel(next); setNotice(""); }} email="Sample staff workspace" onTeacherView={() => { window.location.href = "/#login"; }} onSignOut={() => { window.location.href = "/#staff"; }} Icon={Icon} preview>
    {notice && <p className="staff-preview-notice" role="status">{notice}</p>}
    {panel === "overview" && <StaffOverview contentItems={content} tvVideos={videos} plItems={sessions} upcomingEvents={events} users={users} Icon={Icon} onNavigate={setPanel} />}
    {panel === "content" && <ContentPanel contentItems={content} status="preview" saveState="" seedContentItems={noSave} addContentItem={noSave} deleteContentItem={noSave} preview />}
    {panel === "taronga-tv" && <TarongaTvPanel items={videos} contentItems={content} status="preview" saveState="" saveVideo={noSave} deleteVideo={noSave} />}
    {panel === "professional-learning" && <ProfessionalLearningPanel items={sessions} status="preview" saveState="" saveItem={noSave} deleteItem={noSave} />}
    {panel === "upcoming-events" && <UpcomingEventsPanel events={events} saveEvent={noSave} deleteEvent={noSave} />}
    {panel === "banner" && <BannerManager banners={banners} saveBanners={noSave} />}
    {panel === "users" && <UsersPanel users={users} usersStatus="preview" />}
    {panel === "analytics" && <StaffAnalytics contentItems={content} tvVideos={videos} plItems={sessions} users={users} stats={[]} />}
    {panel === "control-room" && <section className="staff-desk-section"><div className="staff-desk-empty"><h2>Account controls require staff sign-in.</h2><p>The design preview never loads privileged controls or changes account access.</p></div></section>}
  </StaffWorkspace>;
}

export function mountStaffPreview() {
  if (import.meta.env.DEV) createRoot(document.getElementById("root")).render(<StaffPreview />);
}
