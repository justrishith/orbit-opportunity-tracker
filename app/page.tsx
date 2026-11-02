"use client";

import "./globals.css";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

const phases = [
  { label: "saved", color: "#2463eb", count: "04" },
  { label: "applied", color: "#f28c28", count: "02" },
  { label: "interview", color: "#8b5cf6", count: "01" },
];

const opportunities = [
  { title: "Meta University", org: "Meta Â· engineering", date: "closes in 12 days", color: "#2463eb" },
  { title: "Hack the North", org: "Waterloo Â· competition", date: "closes in 19 days", color: "#f28c28" },
  { title: "MLH Fellowship", org: "MLH Â· open source", date: "closes in 27 days", color: "#8b5cf6" },
];

function PlaneMark() {
  return (
    <svg className="plane-mark" viewBox="0 0 92 58" aria-hidden="true">
      <path d="M4 42 84 5 53 48l-9-19L4 42Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m44 29 40-24M44 29l9 19" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 42 25 31" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" />
    </svg>
  );
}

export default function Landing() {
  return (
    <main className="orbit-site">
      <header className="site-header shell">
        <a className="brand" href="/">orbit<span>.</span></a>
         <nav aria-label="Main navigation">
        </nav>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <h1>Find the work<br /><em>worth doing.</em></h1>
          <p className="hero-lede">Internships, competitions, fellowships, and programs â€” gathered in one clear place, so your attention stays on the opportunity, not the search.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="/app">start your orbit <span>â†—</span></a>
            <a className="text-link" href="#how-it-works">see how it works <span>â†“</span></a>
          </div>
        </div>
        <div className="hero-stage">
          <div className="workspace-card">
            <div className="workspace-top"><span className="mini-brand">orbit<span>.</span></span></div>
            <div className="workspace-heading"><div><h2>opportunities<br />worth your time.</h2></div><PlaneMark /></div>
            <div className="phase-row">
              {phases.map((phase) => <div className="phase" key={phase.label}><span className="phase-bar" style={{ background: phase.color }} /><span>{phase.label}</span><strong>{phase.count}</strong></div>)}
            </div>
            <div className="opportunity-list">
              {opportunities.map((item) => <div className="opportunity" key={item.title}><span className="opportunity-pin" style={{ background: item.color }} /><div><strong>{item.title}</strong><small>{item.org}</small></div><time>{item.date}</time><span className="row-arrow">â†—</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="manifesto shell" id="how-it-works">
        <div className="manifesto-copy"><h2>Find it.<br /><em>Keep it<br />moving.</em></h2></div>
        <div className="manifesto-body"><p>Orbit is a focused tracker for internships, competitions, fellowships, and programs. No vague promises â€” just a better way to collect options and decide what deserves your time.</p><Accordion type="single" collapsible defaultValue="item-1"><AccordionItem value="item-1"><AccordionTrigger>Collect the possibilities</AccordionTrigger><AccordionContent>Save opportunities as you find them, with deadlines, tags, links, and the details you will want later.</AccordionContent></AccordionItem><AccordionItem value="item-2"><AccordionTrigger>Move the right ones forward</AccordionTrigger><AccordionContent>Use the board to turn a saved idea into a plan, an application, an interview, or a finished chapter.</AccordionContent></AccordionItem><AccordionItem value="item-3"><AccordionTrigger>See the pattern</AccordionTrigger><AccordionContent>Your private mind map connects opportunities with the skills and interests behind them.</AccordionContent></AccordionItem></Accordion></div>
      </section>

      <section className="closing shell"><div><h2>Build your<br /><em>shortlist.</em></h2></div><div className="closing-actions"><a className="text-link" href="#how-it-works">how it works <span>↑</span></a><a className="button button-primary" href="/app">open orbit <span>â†—</span></a></div></section>
      <footer className="site-footer shell"><span className="brand">orbit<span>.</span></span><span>Â© 2026</span></footer>
    </main>
  );
}

