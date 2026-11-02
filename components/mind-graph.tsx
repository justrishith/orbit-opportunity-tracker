"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type GraphItem = { title: string; org: string; type: string; location: string; deadline: string; phase: string; color: string };
type Node3D = { label: string; detail: string; x: number; y: number; z: number; color: string; kind: "root" | "opportunity" | "idea" };
type ProjectedNode = Node3D & { screenX: number; screenY: number; scale: number };

export default function MindGraph({ rootText, items }: { rootText: string; items: GraphItem[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<Node3D | null>(null);
  const labels = useMemo(() => rootText.split(/\n|,|;/).map((line) => line.replace(/^[-#*\s]+/, "").trim()).filter((line) => line.length > 2).slice(0, 8), [rootText]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const context = canvas.getContext("2d"); if (!context) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth; const height = canvas.clientHeight;
    canvas.width = width * ratio; canvas.height = height * ratio; context.scale(ratio, ratio);
    const nodes: Node3D[] = [
      { label: rootText ? "root file" : "you", detail: rootText ? "Your starting point" : "Add a root file during onboarding", x: 0, y: 0, z: 0, color: "#2463eb", kind: "root" },
      ...items.slice(0, 12).map((item, index) => ({ label: item.title, detail: `${item.org} · ${item.location} · ${item.deadline}`, x: Math.cos(index * 1.9) * (150 + index % 3 * 35), y: Math.sin(index * 1.9) * (95 + index % 2 * 35), z: Math.sin(index * 2.7) * 170, color: item.color, kind: "opportunity" as const })),
      ...labels.map((label, index) => ({ label, detail: "From your root file", x: Math.cos(index * 2.3) * 210, y: Math.sin(index * 2.3) * 130, z: Math.cos(index * 1.7) * 140, color: "#8b5cf6", kind: "idea" as const })),
    ];
    let rotationY = 0; let rotationX = -0.12; let dragging = false; let lastX = 0; let lastY = 0; let raf = 0; let projected: ProjectedNode[] = [];
    const project = (node: Node3D): ProjectedNode => {
      const cy = Math.cos(rotationY); const sy = Math.sin(rotationY); const cx = Math.cos(rotationX); const sx = Math.sin(rotationX);
      const x1 = node.x * cy - node.z * sy; const z1 = node.x * sy + node.z * cy;
      const y = node.y * cx - z1 * sx; const z = node.y * sx + z1 * cx;
      const perspective = 520 / (520 + z);
      return { ...node, screenX: width / 2 + x1 * perspective, screenY: height / 2 + y * perspective, scale: Math.max(.45, Math.min(1.7, perspective)) };
    };
    const draw = (now: number) => {
      context.clearRect(0, 0, width, height); rotationY += dragging ? 0 : 0.0025; projected = nodes.map(project).sort((a, b) => a.scale - b.scale);
      context.lineWidth = 1;
      projected.filter((node) => node.kind !== "root").forEach((node) => { const root = projected.find((entry) => entry.kind === "root")!; context.beginPath(); context.moveTo(root.screenX, root.screenY); context.lineTo(node.screenX, node.screenY); context.strokeStyle = `rgba(90,86,79,${.08 + node.scale * .12})`; context.stroke(); });
      projected.forEach((node) => { const radius = (node.kind === "root" ? 22 : 6) * node.scale; context.beginPath(); context.arc(node.screenX, node.screenY, radius, 0, Math.PI * 2); context.fillStyle = node.color; context.globalAlpha = node.kind === "root" ? 1 : .45 + node.scale * .35; context.shadowColor = node.color; context.shadowBlur = node.kind === "root" ? 24 : 8; context.fill(); context.shadowBlur = 0; context.globalAlpha = 1; if (node.kind === "root" || node.scale > .8) { context.font = `${node.kind === "root" ? 11 : 9 * node.scale}px DMSans`; context.fillStyle = node.kind === "root" ? "#fff" : "#4c4944"; context.fillText(node.label.slice(0, 24), node.screenX + radius + 6, node.screenY + 3); } });
      raf = requestAnimationFrame(draw);
    };
    const onPointerDown = (event: PointerEvent) => { dragging = true; lastX = event.clientX; lastY = event.clientY; canvas.setPointerCapture(event.pointerId); };
    const onPointerMove = (event: PointerEvent) => { if (!dragging) return; rotationY += (event.clientX - lastX) * .008; rotationX += (event.clientY - lastY) * .006; lastX = event.clientX; lastY = event.clientY; };
    const onPointerUp = () => { dragging = false; };
    const onClick = (event: MouseEvent) => { if (dragging) return; const rect = canvas.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; const hit = projected.slice().sort((a, b) => Math.hypot(a.screenX - x, a.screenY - y) - Math.hypot(b.screenX - x, b.screenY - y)).find((node) => Math.hypot(node.screenX - x, node.screenY - y) < Math.max(18, node.scale * 16)); if (hit) setSelected(hit); };
    canvas.addEventListener("pointerdown", onPointerDown); canvas.addEventListener("pointermove", onPointerMove); canvas.addEventListener("pointerup", onPointerUp); canvas.addEventListener("click", onClick); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener("pointerdown", onPointerDown); canvas.removeEventListener("pointermove", onPointerMove); canvas.removeEventListener("pointerup", onPointerUp); canvas.removeEventListener("click", onClick); };
  }, [items, labels, rootText]);

  return <div className="mind-graph-shell"><div className="graph-status"><span className="live-dot" /> 3d opportunity scene<small>drag · click a node</small></div><canvas ref={canvasRef} className="mind-graph-canvas" aria-label="Interactive 3D opportunity scene" />{selected && <div className="graph-summary"><button aria-label="Close summary" onClick={() => setSelected(null)}>×</button><span className="app-eyebrow">{selected.kind}</span><strong>{selected.label}</strong><p>{selected.detail}</p></div>}</div>;
}
