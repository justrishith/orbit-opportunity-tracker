"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, BrainCircuit, Check, Grid2X2, List, LockKeyhole, Plus, Search, Settings2, X } from "lucide-react";
import { deleteUser, onAuthStateChanged, signOut, User } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import MindGraph from "../../components/mind-graph";

type View = "board" | "table" | "catalog" | "mind" | "settings";
type Phase = "saved" | "preparing" | "applied" | "interview" | "offer" | "closed";
type AvatarConfig = { base: string; hair: string; accent: string };
type Opportunity = { id: string; title: string; org: string; type: string; location: string; deadline: string; phase: Phase; tags: string[]; color: string; url: string; sourceVerified?: boolean; grades?: string[] };

const phaseMeta: Record<Phase, { label: string; color: string }> = {
  saved: { label: "Saved", color: "#2463eb" }, preparing: { label: "Preparing", color: "#f28c28" }, applied: { label: "Applied", color: "#11a88a" }, interview: { label: "Interview", color: "#8b5cf6" }, offer: { label: "Offer", color: "#d34f72" }, closed: { label: "Closed", color: "#8b8781" },
};

const starterOpportunities: Opportunity[] = [
  { id: "meta-university", title: "Meta University", org: "Meta", type: "Internship", location: "Menlo Park / remote", deadline: "Dec 12", phase: "saved", tags: ["engineering", "paid"], color: "#2463eb", url: "https://www.metacareers.com/jobs" },
  { id: "hack-north", title: "Hack the North", org: "Waterloo", type: "Competition", location: "Waterloo, ON", deadline: "Dec 19", phase: "preparing", tags: ["team", "travel"], color: "#f28c28", url: "https://hackthenorth.com/" },
  { id: "mlh-fellowship", title: "MLH Fellowship", org: "Major League Hacking", type: "Fellowship", location: "Remote", deadline: "Jan 05", phase: "saved", tags: ["open source", "stipend"], color: "#8b5cf6", url: "https://fellowship.mlh.io/" },
  { id: "coded-by", title: "Coded by â€” Tech & Innovation", org: "Coded by", type: "Internship", location: "Toronto, ON", deadline: "Jan 14", phase: "applied", tags: ["product", "paid"], color: "#11a88a", url: "https://codedby.com/" },
];
const verifiedSources = [
  ["Research Science Institute (RSI)", "Center for Excellence in Education", "Research", "United States", "https://www.cee.org/programs/research-science-institute", ["research", "science"], "#2463eb"],
  ["Summer Science Program", "SSP", "Research", "United States", "https://ssp.org/program-overview/", ["research", "science"], "#315f67"],
  ["MITES Summer", "MIT", "Program", "United States", "https://mites.mit.edu/discover-mites/mites-summer/", ["engineering", "research"], "#8b5cf6"],
  ["PROMYS", "Boston University", "Research", "United States", "https://promys.org/programs/promys/", ["math", "research"], "#f28c28"],
  ["COSMOS", "University of California", "Program", "United States", "https://cosmos-ucop.ucdavis.edu/", ["science", "engineering"], "#11a88a"],
  ["SAMS", "Carnegie Mellon University", "Program", "United States", "https://www.cmu.edu/pre-college/academic-programs/sams.html", ["engineering", "science"], "#ef6b4d"],
  ["National High School Game Academy", "Carnegie Mellon University", "Program", "United States", "https://www.cmu.edu/pre-college/academic-programs/game-academy.html", ["game design", "software"], "#d34f72"],
  ["Simons Summer Research Program", "Stony Brook University", "Research", "United States", "https://www.stonybrook.edu/commcms/simons/", ["research", "science"], "#2463eb"],
  ["Garcia Summer Program", "Stony Brook University", "Research", "United States", "https://www.stonybrook.edu/commcms/garcia/", ["research", "engineering"], "#3f7474"],
  ["Clark Scholars Program", "Texas Tech University", "Research", "United States", "https://www.depts.ttu.edu/honors/academicsandenrichment/affiliatedandhighschool/clarks/", ["research", "science"], "#8b5cf6"],
  ["Jackson Laboratory Summer Student Program", "The Jackson Laboratory", "Research", "United States", "https://www.jax.org/education-and-learning/high-school-students", ["genetics", "research"], "#11a88a"],
  ["Seattle Children’s Research Training", "Seattle Children’s", "Research", "United States", "https://www.seattlechildrens.org/research/centers-programs/science-education-department/high-school-training-programs/", ["health", "research"], "#2463eb"],
  ["TREES", "University of Pennsylvania", "Research", "United States", "https://ceet.upenn.edu/education-training/high-school/", ["environment", "research"], "#3f7474"],
  ["Health Career Scholars Academy", "University of Pittsburgh", "Program", "United States", "https://www.hcsa.pitt.edu/", ["health", "science"], "#ef6b4d"],
  ["Summer Engineering Academy", "University of Washington", "Program", "United States", "https://www.engr.washington.edu/academics/precollege", ["engineering", "robotics"], "#2463eb"],
  ["MathILy", "Bryn Mawr College", "Program", "United States", "https://www.mathily.org/", ["math", "research"], "#8b5cf6"],
  ["Stanford Pre-Collegiate Summer Institutes", "Stanford University", "Program", "United States", "https://summerinstitutes.stanford.edu/", ["research", "writing"], "#d34f72"],
  ["Yale Young Writers’ Workshop", "Yale University", "Program", "United States", "https://writers.yale.edu/yale-young-writers-workshop", ["writing", "arts"], "#315f67"],
  ["Lawrence Teen Research Programs", "UC Berkeley", "Research", "United States", "https://lawrencehallofscience.org/visitors/teen-research-programs/", ["research", "science"], "#11a88a"],
  ["SEED/STEM Summer Program", "Indiana CTSI", "Program", "United States", "https://indianactsi.org/education/student/seed-stem/", ["science", "health"], "#f28c28"],
  ["FIRST Robotics Competition", "FIRST", "Competition", "Global", "https://www.firstinspires.org/robotics/frc", ["robotics", "engineering"], "#e31837"],
  ["VEX V5 Robotics Competition", "REC Foundation", "Competition", "Global", "https://www.vexrobotics.com/v5/competition", ["robotics", "engineering"], "#2463eb"],
  ["Technology Student Association Competitions", "TSA", "Competition", "United States", "https://tsaweb.org/competitions", ["technology", "design"], "#f28c28"],
  ["SkillsUSA Championships", "SkillsUSA", "Competition", "United States", "https://www.skillsusa.org/competitions/", ["technology", "design"], "#d34f72"],
  ["DECA Competitive Events", "DECA", "Competition", "Global", "https://www.deca.org/compete", ["business", "entrepreneurship"], "#11a88a"],
  ["HOSA Competitive Events", "HOSA", "Competition", "Global", "https://hosa.org/guidelines/", ["health", "science"], "#ef6b4d"],
  ["Science Olympiad", "Science Olympiad", "Competition", "United States", "https://www.soinc.org/", ["science", "team"], "#2463eb"],
  ["Blue Ocean Student Entrepreneur Competition", "Blue Ocean", "Competition", "Global", "https://blueoceancompetition.org/", ["business", "entrepreneurship"], "#315f67"],
  ["Diamond Challenge", "University of Delaware", "Competition", "Global", "https://diamondchallenge.org/", ["business", "entrepreneurship"], "#8b5cf6"],
  ["Conrad Challenge", "Conrad Foundation", "Competition", "Global", "https://www.conradchallenge.org/", ["engineering", "entrepreneurship"], "#f28c28"],
  ["Regeneron Science Talent Search", "Society for Science", "Competition", "United States", "https://www.societyforscience.org/regeneron-sts/", ["science", "research"], "#2463eb"],
  ["Regeneron ISEF", "Society for Science", "Competition", "Global", "https://www.societyforscience.org/isef/", ["science", "research"], "#3f7474"],
  ["Junior Science and Humanities Symposium", "U.S. Department of Defense", "Research", "United States", "https://www.jshs.org/", ["science", "research"], "#315f67"],
  ["National History Day", "National History Day", "Competition", "United States", "https://nhd.org/contest/", ["history", "writing"], "#d34f72"],
  ["Scholastic Art & Writing Awards", "Alliance for Young Artists & Writers", "Competition", "United States", "https://www.artandwriting.org/awards/", ["arts", "writing"], "#ef6b4d"],
  ["National Speech & Debate Association", "NSDA", "Competition", "United States", "https://www.speechanddebate.org/", ["speech", "writing"], "#2463eb"],
  ["American Legion Oratorical Contest", "The American Legion", "Competition", "United States", "https://www.legion.org/oratorical", ["speech", "civics"], "#315f67"],
  ["Congressional Art Competition", "U.S. House of Representatives", "Competition", "United States", "https://www.house.gov/educators-and-students/congressional-art-competition", ["arts", "civics"], "#2463eb"],
  ["Congressional App Challenge", "U.S. House of Representatives", "Competition", "United States", "https://www.congressionalappchallenge.us/", ["software", "civics"], "#8b5cf6"],
  ["We the People", "Center for Civic Education", "Competition", "United States", "https://www.civiced.org/we-the-people", ["civics", "speech"], "#f28c28"],
  ["Bank of America Student Leaders", "Bank of America", "Program", "United States", "https://about.bankofamerica.com/en/what-guides-us/student-leaders", ["leadership", "community"], "#e31837"],
  ["QuestBridge College Prep Scholars", "QuestBridge", "Program", "United States", "https://www.questbridge.org/apply-to-college/programs/college-prep-scholars", ["college", "leadership"], "#2463eb"],
  ["Jack Kent Cooke Young Scholars", "Jack Kent Cooke Foundation", "Scholarship", "United States", "https://www.jkcf.org/our-scholarships/young-scholars-program/", ["college", "leadership"], "#315f67"],
  ["Davidson Fellows", "Davidson Institute", "Scholarship", "United States", "https://www.davidsongifted.org/fellows/", ["research", "arts"], "#8b5cf6"],
  ["Coolidge Scholarship", "Calvin Coolidge Foundation", "Scholarship", "United States", "https://coolidgescholarship.org/", ["history", "leadership"], "#f28c28"],
  ["The Gates Scholarship", "Gates Foundation", "Scholarship", "United States", "https://www.thegatesscholarship.org/", ["college", "leadership"], "#11a88a"],
  ["Coca-Cola Scholars Program", "Coca-Cola Scholars Foundation", "Scholarship", "United States", "https://www.coca-colascholarsfoundation.org/apply/", ["leadership", "community"], "#e31837"],
  ["Posse Foundation", "Posse", "Scholarship", "United States", "https://www.possefoundation.org/", ["leadership", "college"], "#2463eb"],
  ["Boys State", "The American Legion", "Program", "United States", "https://www.legion.org/boysnation", ["leadership", "civics"], "#315f67"],
  ["Junior Achievement Learning Experiences", "Junior Achievement USA", "Program", "United States", "https://jausa.ja.org/programs/", ["business", "entrepreneurship"], "#11a88a"],
] as const;
const catalogOpportunities: Opportunity[] = verifiedSources.map(([title, org, type, location, url, tags, color], index) => ({ id: `verified-${index + 1}`, title, org, type, location, deadline: "check official site", phase: "saved", tags: [...tags], color, url, sourceVerified: true, grades: ["9th grade", "10th grade", "11th grade", "12th grade"] }));

const views: { id: View; label: string; icon: typeof BookOpen }[] = [
  { id: "board", label: "Board", icon: Grid2X2 }, { id: "table", label: "Table", icon: List }, { id: "catalog", label: "Catalog", icon: Search }, { id: "mind", label: "Mind map", icon: BrainCircuit }, { id: "settings", label: "Settings", icon: Settings2 },
];

function Locked({ title, text }: { title: string; text: string }) {
  return <div className="locked-state"><LockKeyhole size={20} /><span className="app-eyebrow">private space</span><h2>{title}</h2><p>{text}</p><Link className="app-button dark" href="/auth">sign in to unlock <ArrowUpRight size={15} /></Link></div>;
}

export default function WorkspacePage() {
  const [view, setView] = useState<View>("board");
  const [items, setItems] = useState(starterOpportunities);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<{ roles?: string[]; places?: string[]; grade?: string; rootFileText?: string; avatar?: AvatarConfig }>({});
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<Opportunity | null>(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, "users", user.uid, "opportunities")).then((snapshot) => {
      if (!snapshot.empty) setItems(snapshot.docs.map((entry) => entry.data() as Opportunity));
    }).catch(() => undefined);
  }, [user]);
  useEffect(() => { if (user) getDoc(doc(db, "users", user.uid)).then((entry) => { if (entry.exists()) setPreferences(entry.data() as { roles?: string[]; places?: string[]; grade?: string; rootFileText?: string; avatar?: AvatarConfig }); }).catch(() => undefined); }, [user]);
  const filtered = useMemo(() => items.filter((item) => `${item.title} ${item.org} ${item.type} ${item.location} ${item.deadline} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())).filter((item) => filter === "all" || `${item.type} ${item.location} ${item.deadline} ${item.tags.join(" ")}`.toLowerCase().includes(filter)), [items, query, filter]);
  const counts = Object.keys(phaseMeta).reduce((acc, key) => ({ ...acc, [key]: items.filter((item) => item.phase === key).length }), {} as Record<Phase, number>);

  async function addOpportunity(details: { title: string; org: string; type: string; location: string; url: string; deadline: string }) {
    const item = { id: `new-${Date.now()}`, ...details, phase: "saved" as Phase, tags: ["added by you"], color: phaseMeta.saved.color };
    setItems((current) => [item, ...current]); setShowAdd(false);
    if (user) await addDoc(collection(db, "users", user.uid, "opportunities"), { ...item, createdAt: serverTimestamp() });
  }

  function moveOpportunity(id: string, phase: Phase) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, phase, color: phaseMeta[phase].color } : item));
    if (user && !id.startsWith("new-")) updateDoc(doc(db, "users", user.uid, "opportunities", id), { phase, color: phaseMeta[phase].color }).catch(() => undefined);
  }

  function saveCatalogItem(item: Opportunity) {
    setItems((current) => current.some((entry) => entry.id === item.id) ? current : [...current, item]);
    if (user) addDoc(collection(db, "users", user.uid, "opportunities"), { ...item, createdAt: serverTimestamp() }).catch(() => undefined);
    setView("board");
  }

  return <div className="app-shell">
    <aside className="app-rail">
      <Link href="/" className="app-brand">orbit<span>.</span></Link>
      <div className="app-rail-label">workspace</div>
      <nav className="app-nav">{views.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}><Icon size={16} />{label}{!user && (id === "mind" || id === "settings") && <LockKeyhole className="nav-lock" size={12} />}</button>)}</nav>
      <div className="rail-summary"><div className="app-rail-label">your orbit</div>{(Object.keys(phaseMeta) as Phase[]).slice(0, 4).map((phase) => <div className="rail-phase" key={phase}><i style={{ background: phaseMeta[phase].color }} />{phaseMeta[phase].label}<b>{counts[phase] || 0}</b></div>)}</div>
      <div className="rail-bottom"><button className="user-chip" onClick={() => user && setView("settings")}><span>{user?.photoURL ? <img src={user.photoURL} alt="" /> : (user ? (user.displayName?.[0] || user.email?.[0] || "U") : "G").toUpperCase()}</span><div><strong>{user?.displayName || user?.email || "Guest mode"}</strong><small>{user ? "account settings" : "browse only"}</small></div></button>{user ? <button className="rail-action" onClick={() => signOut(auth)}>sign out â†—</button> : <Link href="/auth">sign in â†—</Link>}</div>
    </aside>
    <main className="app-main">
      <header className="app-header"><div><span className="app-eyebrow">sunday, 01 november 2026</span><h1>{view === "board" ? "your board" : views.find((item) => item.id === view)?.label.toLowerCase()}</h1></div><div className="app-header-actions"><label className="app-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="search your orbit" /></label>{view !== "settings" && <label className="filter-select-label"><span>filter</span><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter opportunities"><option value="all">all</option><option value="remote">remote</option><option value="paid">paid</option><option value="research">research</option><option value="software">software</option><option value="canada">canada</option></select></label>}<button className="app-button dark" onClick={() => setShowAdd(true)}><Plus size={15} /> add opportunity</button></div></header>
      {view === "board" && <><div className="app-intro"><p>Keep the opportunities that matter close. Move them forward when you&apos;re ready.</p><span><span className="live-dot" /> {items.length} opportunities in orbit</span></div><div className="phase-grid">{(Object.keys(phaseMeta) as Phase[]).map((phase) => <section className="phase-column" key={phase} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const id = event.dataTransfer.getData("text/plain"); if (id) moveOpportunity(id, phase); }}><div className="phase-column-head"><span><i style={{ background: phaseMeta[phase].color }} />{phaseMeta[phase].label}</span><b>{counts[phase] || 0}</b></div>{filtered.filter((item) => item.phase === phase).map((item) => <OpportunityCard key={item.id} item={item} onOpen={setSelectedItem} />)}{phase === "saved" && <button className="empty-add" onClick={() => setShowAdd(true)}><Plus size={14} /> add a card</button>}</section>)}</div></>}
      {view === "table" && <TableView items={filtered} />}
      {view === "catalog" && <CatalogView query={query} preferences={preferences} onSave={saveCatalogItem} />}
      {view === "mind" && (user ? <MindView items={items} rootText={preferences.rootFileText || ""} /> : <Locked title="Your map is waiting." text="Sign in to connect opportunities, goals, and the next step into a private map." />)}
      {view === "settings" && (user ? <SettingsView user={user} avatar={preferences.avatar} onAvatarChange={(avatar) => setPreferences((current) => ({ ...current, avatar }))} /> : <Locked title="Settings stay yours." text="Sign in to manage your account, export your data, and keep your orbit private." />)}
    </main>
    {showAdd && <NewProgramModal onClose={() => setShowAdd(false)} onCreate={(details) => { void addOpportunity(details); setShowAdd(false); }} />}
    {selectedItem && <div className="modal-backdrop" onClick={() => setSelectedItem(null)}><div className="add-modal opportunity-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close opportunity details" onClick={() => setSelectedItem(null)}><X size={16} /></button><span className="app-eyebrow">{selectedItem.type} Â· {selectedItem.location}</span><h2>{selectedItem.title}</h2><p>{selectedItem.org} Â· deadline {selectedItem.deadline}</p><div className="detail-tags">{selectedItem.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><a className="app-button dark" href={selectedItem.url} target="_blank" rel="noreferrer">open official site <ArrowUpRight size={15} /></a></div></div>}
  </div>;
}

function OpportunityCard({ item, onOpen }: { item: Opportunity; onOpen: (item: Opportunity) => void }) { return <article className="opportunity-card" style={{ borderTopColor: item.color }} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)} title="Drag this card to another phase"><div className="card-top"><span className="card-type">drag to move</span><a className="card-link" aria-label={`Open ${item.title} website`} href={item.url} target="_blank" rel="noreferrer">â†—</a></div><h3>{item.title}</h3><p>{item.org} Â· {item.location}</p><div className="card-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><footer><span><i style={{ background: item.color }} />deadline</span><button className="card-details" onClick={() => onOpen(item)}>details</button><strong>{item.deadline}</strong></footer></article>; }
function TableView({ items }: { items: Opportunity[] }) { return <div className="table-wrap"><div className="view-toolbar"><p>Everything at a glance.</p></div><table><thead><tr><th>opportunity</th><th>type</th><th>phase</th><th>deadline</th><th>location</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><span className="table-title"><i style={{ background: item.color }} />{item.title}</span><small>{item.org}</small></td><td>{item.type}</td><td><span className="phase-pill" style={{ color: item.color, borderColor: `${item.color}55` }}>{phaseMeta[item.phase].label}</span></td><td>{item.deadline}</td><td>{item.location}</td></tr>)}</tbody></table></div>; }
function CatalogView({ query, preferences, onSave }: { query: string; preferences: { roles?: string[]; places?: string[]; grade?: string }; onSave: (item: Opportunity) => void }) {
  const [category, setCategory] = useState("all");
  const all = catalogOpportunities.filter((item) => `${item.title} ${item.org} ${item.type} ${item.location} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())).filter((item) => category === "all" || item.type === category);
  const ranked = [...all].sort((a, b) => score(b, preferences) - score(a, preferences));
  return <div className="catalog-view"><div className="view-toolbar"><p>{query ? `${ranked.length} results for "${query}"` : `${ranked.length} official sources`}</p><div className="catalog-filters">{["all", "Internship", "Fellowship", "Program", "Research"].map((value) => <button className={category === value ? "selected" : ""} key={value} onClick={() => setCategory(value)}>{value}</button>)}</div></div><div className="catalog-grid">{ranked.map((item) => <article className="catalog-card" key={item.id}><a className="catalog-art" style={{ background: item.color }} href={item.url} target="_blank" rel="noreferrer"><span>{item.org.slice(0, 2).toUpperCase()}</span><ArrowUpRight size={17} /></a><span className="app-eyebrow">{item.type} · {item.location}</span><h2>{item.title}</h2><p>{item.org} · official source</p><span className="source-badge">● source link</span><button className="text-action" onClick={() => onSave(item)}>save to board <Plus size={14} /></button></article>)}</div></div>;
}function score(item: Opportunity, preferences: { roles?: string[]; places?: string[]; grade?: string }) { const haystack = `${item.title} ${item.type} ${item.tags.join(" ")} ${item.location}`.toLowerCase(); const preferenceScore = [...(preferences.roles || []), ...(preferences.places || [])].reduce((total, preference) => total + (haystack.includes(preference.split(" ")[0]) ? 1 : 0), 0); return preferenceScore + (preferences.grade && item.grades?.includes(preferences.grade) ? 5 : 0); }
function MindView({ items, rootText }: { items: Opportunity[]; rootText: string }) { const [simulation, setSimulation] = useState(false); return <div className="mind-view"><div className="mind-copy"><span className="app-eyebrow">root file graph</span><h2>Explore your<br /><em>next move.</em></h2><p>{rootText ? "Enter the simulation to explore ideas from your root file and connect them to opportunities." : "Add a root file during onboarding, then enter the simulation to explore your opportunity network."}</p><div className="graph-legend"><span><i style={{ background: "#2463eb" }} />root</span><span><i style={{ background: "#f28c28" }} />opportunities</span><span><i style={{ background: "#8b5cf6" }} />ideas</span></div><button className="app-button dark mind-enter" onClick={() => setSimulation(true)}>enter simulation <ArrowUpRight size={15} /></button></div><MindGraph rootText={rootText} items={items} />{simulation && <div className="mind-simulation"><div className="simulation-top"><span className="app-brand">orbit<span>.</span></span><span>opportunity simulation</span><button className="modal-close" aria-label="Close simulation" onClick={() => setSimulation(false)}><X size={16} /></button></div><div className="simulation-canvas"><MindGraph rootText={rootText} items={items} /></div><p className="simulation-hint">drag to rotate · select a node to inspect it</p></div>}</div>; }
function NewProgramModal({ onClose, onCreate }: { onClose: () => void; onCreate: (details: { title: string; org: string; type: string; location: string; url: string; deadline: string }) => void }) {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState({ title: "", org: "", type: "Internship", location: "", url: "", deadline: "" });
  const set = (key: keyof typeof details, value: string) => setDetails((current) => ({ ...current, [key]: value }));
  const canContinue = step === 0 ? Boolean(details.title && details.org) : step === 1 ? Boolean(details.location && details.type) : Boolean(details.url);
  return <div className="modal-backdrop" onClick={onClose}><div className="add-modal program-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close add program" onClick={onClose}><X size={16} /></button><div className="modal-step">0{step + 1} / 03</div>{step === 0 && <><span className="app-eyebrow">new program</span><h2>Add the<br /><em>basics.</em></h2><label className="modal-field">program name<input value={details.title} onChange={(event) => set("title", event.target.value)} placeholder="Summer research program" /></label><label className="modal-field">organization<input value={details.org} onChange={(event) => set("org", event.target.value)} placeholder="Organization name" /></label></>}{step === 1 && <><span className="app-eyebrow">new program</span><h2>Set the<br /><em>fit.</em></h2><label className="modal-field">type<select value={details.type} onChange={(event) => set("type", event.target.value)}><option>Internship</option><option>Fellowship</option><option>Program</option><option>Research</option><option>Competition</option></select></label><label className="modal-field">location<input value={details.location} onChange={(event) => set("location", event.target.value)} placeholder="Remote or city" /></label><label className="modal-field">deadline<input value={details.deadline} onChange={(event) => set("deadline", event.target.value)} placeholder="Check official site" /></label></>}{step === 2 && <><span className="app-eyebrow">new program</span><h2>Save the<br /><em>source.</em></h2><label className="modal-field">official URL<input type="url" value={details.url} onChange={(event) => set("url", event.target.value)} placeholder="https://" /></label><p className="modal-help">Use the official program page so the arrow always goes to the source.</p></>}{<div className="modal-actions">{step > 0 && <button className="back-button" onClick={() => setStep(step - 1)}><ArrowLeft size={15} /> back</button>}{step < 2 ? <button className="app-button dark" disabled={!canContinue} onClick={() => setStep(step + 1)}>next <ArrowRight size={15} /></button> : <button className="app-button dark" disabled={!canContinue} onClick={() => onCreate({ ...details, deadline: details.deadline || "check official site" })}>save program <Check size={15} /></button>}</div>}</div></div>;
}

function Avatar({ config, size = 47 }: { config?: AvatarConfig; size?: number }) {
  const value = config || { base: "#f1b58b", hair: "#242424", accent: "#2463eb" };
  return <svg className="avatar-art" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="31" fill={value.accent} opacity=".18" /><circle cx="32" cy="34" r="20" fill={value.base} /><path d="M13 31c0-14 8-23 20-23s20 9 20 23c-6-5-13-8-21-8-7 0-13 2-19 8Z" fill={value.hair} /><circle cx="24" cy="35" r="2" fill="#171717" /><circle cx="40" cy="35" r="2" fill="#171717" /><path d="M27 43c3 2 7 2 10 0" fill="none" stroke="#171717" strokeWidth="2" strokeLinecap="round" /><path d="M13 59c3-11 11-16 19-16s16 5 19 16" fill={value.accent} /></svg>;
}

function SettingsView({ user, avatar, onAvatarChange }: { user: User; avatar?: AvatarConfig; onAvatarChange: (avatar: AvatarConfig) => void }) {
  const [reminders, setReminders] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState<AvatarConfig>(avatar || { base: "#f1b58b", hair: "#242424", accent: "#2463eb" });
  useEffect(() => { if (avatar) setDraft(avatar); }, [avatar]);
  const [avatarOpen, setAvatarOpen] = useState(true);
  function updateAvatar(next: Partial<AvatarConfig>) { setDraft((current) => ({ ...current, ...next })); }
  async function saveAvatar() { try { await setDoc(doc(db, "users", user.uid), { avatar: draft }, { merge: true }); } catch { /* Keep the local avatar usable while Firestore rules are being configured. */ } onAvatarChange(draft); setAvatarOpen(false); }
  function exportData() { const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), account: user.email, avatar: draft }, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "orbit-export.json"; link.click(); URL.revokeObjectURL(link.href); }
  async function removeAccount() { if (!window.confirm("Delete this Orbit account? This cannot be undone.")) return; setDeleting(true); try { await deleteUser(user); window.location.href = "/auth"; } catch { setDeleting(false); window.alert("Firebase requires a fresh sign-in before deleting this account. Sign out and sign back in, then try again."); } }
  return <div className="settings-view"><div className="settings-heading"><span className="account-avatar"><Avatar config={draft} /></span><span className="app-eyebrow">private space</span><h2>Make orbit<br /><em>your own.</em></h2></div><div className="settings-list"><section className="avatar-setting"><span className="setting-icon">01</span><div><div className="setting-row"><div><h3>Avatar</h3><p>Choose a base, hair, and accent color.</p></div><button className="setting-toggle" onClick={() => setAvatarOpen((current) => !current)}>{avatarOpen ? "close" : "edit"}</button></div>{avatarOpen && <><div className="avatar-controls"><label>base<select value={draft.base} onChange={(event) => updateAvatar({ base: event.target.value })}><option value="#f1b58b">warm</option><option value="#8d5524">deep</option><option value="#f7d7b5">light</option><option value="#c68642">golden</option></select></label><label>hair<select value={draft.hair} onChange={(event) => updateAvatar({ hair: event.target.value })}><option value="#242424">ink</option><option value="#5a3825">brown</option><option value="#d6a21e">gold</option><option value="#2463eb">blue</option></select></label><label>accent<select value={draft.accent} onChange={(event) => updateAvatar({ accent: event.target.value })}><option value="#2463eb">blue</option><option value="#3f7474">teal</option><option value="#f28c28">orange</option><option value="#8b5cf6">violet</option></select></label></div><button className="app-button dark avatar-save" onClick={saveAvatar}>save avatar <Check size={14} /></button></>}</div></section><section><span className="setting-icon">02</span><div><h3>Account</h3><p>{user.displayName || "Orbit member"}<br />{user.email || "Signed in with Firebase Auth"}</p></div><a href={`mailto:${user.email || "support@orbit.app"}`}>contact ↗</a></section><section><span className="setting-icon">03</span><div><h3>Data</h3><p>Your opportunities are stored in your private Firestore workspace.</p></div><button onClick={exportData}>export JSON ↗</button></section><section><span className="setting-icon">04</span><div><h3>Preferences</h3><p>{reminders ? "You will see deadline reminders here." : "Deadline reminders are currently quiet."}</p></div><button onClick={() => setReminders((current) => !current)}>{reminders ? <Check size={14} /> : null} {reminders ? "on" : "off"}</button></section><section className="danger-setting"><span className="setting-icon">05</span><div><h3>Delete account</h3><p>Remove your authentication account. This is permanent.</p></div><button onClick={removeAccount} disabled={deleting}>{deleting ? "deleting…" : "delete ↗"}</button></section></div></div>;
}



