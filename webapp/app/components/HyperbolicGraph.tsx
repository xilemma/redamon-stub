"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { stubGraphData, NODE_COLORS, GraphNode } from "./graphData";

// ── Poincaré disk math ────────────────────────────────────────────────────

/** Möbius transformation: maps unit disk to itself.
 *  T_a(z) = (z − a) / (1 − ā·z)
 *  Moves the point `a` to the origin (i.e., re-centres the view). */
function mobius(x: number, y: number, ax: number, ay: number): [number, number] {
  const nx = x - ax;
  const ny = y - ay;
  const dx = 1 - (ax * x + ay * y);
  const dy = ax * y - ay * x;          // Im(ā·z) = ax·y − ay·x
  const denom = dx * dx + dy * dy;
  return [(nx * dx + ny * dy) / denom, (ny * dx - nx * dy) / denom];
}

/** Map Euclidean force-layout position → Poincaré disk via tanh model.
 *  K is the scale factor: large K → mild compression, small K → strong. */
function euclidToDisk(x: number, y: number, K: number): [number, number] {
  const r = Math.sqrt(x * x + y * y);
  if (r < 1e-12) return [0, 0];
  const rDisk = Math.tanh(r / K);
  return [(rDisk / r) * x, (rDisk / r) * y];
}

/** Draw the unique Poincaré geodesic (hyperbolic straight line) between two
 *  disk-coordinate points.  All coordinates must be given in unit-disk space;
 *  the function accounts for the pixel transform (cx, cy, R) internally. */
function drawGeodesic(
  ctx: CanvasRenderingContext2D,
  x1d: number, y1d: number,
  x2d: number, y2d: number,
  cx: number, cy: number, R: number,
) {
  const sx1 = cx + x1d * R, sy1 = cy + y1d * R;
  const sx2 = cx + x2d * R, sy2 = cy + y2d * R;

  // If the two points and the origin are collinear → straight line through centre
  const cross = x1d * y2d - x2d * y1d;
  if (Math.abs(cross) < 1e-6) {
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    return;
  }

  // Solve for the unique circle orthogonal to the unit circle through z1, z2:
  //   cx_d * (x2-x1) + cy_d * (y2-y1) = (|z2|² − |z1|²) / 2    … (1)
  //   cx_d * x1       + cy_d * y1       = (1 + |z1|²)    / 2    … (2)
  const a11 = x2d - x1d,   a12 = y2d - y1d;
  const b1  = (x2d * x2d + y2d * y2d - x1d * x1d - y1d * y1d) / 2;
  const a21 = x1d,          a22 = y1d;
  const b2  = (1 + x1d * x1d + y1d * y1d) / 2;
  const det = a11 * a22 - a12 * a21;
  if (Math.abs(det) < 1e-10) {
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    return;
  }
  const cxd = (b1 * a22 - b2 * a12) / det;
  const cyd = (a11 * b2 - a21 * b1) / det;
  const rd  = Math.sqrt((cxd - x1d) ** 2 + (cyd - y1d) ** 2);

  // Convert arc centre and radius to screen space
  const cxs = cx + cxd * R;
  const cys = cy + cyd * R;
  const rs  = rd * R;

  const a1   = Math.atan2(sy1 - cys, sx1 - cxs);
  const a2   = Math.atan2(sy2 - cys, sx2 - cxs);
  const diff = ((a2 - a1 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
  ctx.arc(cxs, cys, rs, a1, a2, diff < 0);
}

// ── Types ─────────────────────────────────────────────────────────────────

interface SimNode extends GraphNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  index?: number;
}

interface SimLink {
  source: SimNode | string;
  target: SimNode | string;
  label?: string;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function HyperbolicGraph() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [curvature,  setCurvature]  = useState(180);   // K: 60–400
  const [selected,   setSelected]   = useState<GraphNode | null>(null);

  // Persistent refs (avoid re-creating render loop on every state change)
  const focusRef      = useRef({ x: 0, y: 0 });
  const isDragging    = useRef(false);
  const dragStart     = useRef({ mx: 0, my: 0, fx: 0, fy: 0 });
  const simNodesRef   = useRef<SimNode[]>([]);
  const simLinksRef   = useRef<SimLink[]>([]);
  const curvatureRef  = useRef(curvature);
  const animFrameRef  = useRef(0);

  useEffect(() => { curvatureRef.current = curvature; }, [curvature]);

  // ── Dimension tracking ─────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width:  containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Force simulation (run once, warm up, then render statically) ───────
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } =
      require("d3-force-3d");

    const nodes: SimNode[] = stubGraphData.nodes.map(n => ({ ...n }));
    const links: SimLink[] = stubGraphData.links.map(l => ({ ...l }));

    simNodesRef.current = nodes;
    simLinksRef.current = links;

    const sim = forceSimulation(nodes, 2)                        // numDimensions = 2
      .force("link",    forceLink(links).id((d: SimNode) => d.id).distance(40).strength(0.6))
      .force("charge",  forceManyBody().strength(-120))
      .force("center",  forceCenter(0, 0))
      .force("collide", forceCollide(15))
      .alphaDecay(0.015)
      .stop();

    // Warm-up ticks so the layout is fully settled
    for (let i = 0; i < 500; i++) sim.tick();

    // Normalise positions so the typical spread fills ~K/2
    const xs = nodes.map(n => n.x ?? 0);
    const ys = nodes.map(n => n.y ?? 0);
    const maxR = Math.max(...nodes.map(n => Math.sqrt((n.x ?? 0) ** 2 + (n.y ?? 0) ** 2)));
    const scale = (curvatureRef.current * 0.85) / (maxR || 1);
    nodes.forEach(n => { n.x = (n.x ?? 0) * scale; n.y = (n.y ?? 0) * scale; });
    void xs; void ys;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render loop ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    const cx = width  / 2;
    const cy = height / 2;
    const R  = Math.min(width, height) * 0.455;   // pixel radius of the disk

    // Subtle concentric ring decoration (à la Escher)
    const drawDiskBackground = () => {
      ctx.fillStyle = "#080f1e";
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.fill();

      // Dim rings as distance cue
      for (let ring = 1; ring <= 5; ring++) {
        const rr = (ring / 6) * R;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(30,50,80,${0.35 - ring * 0.05})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Vignette toward the boundary
      const vignette = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R);
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0,0,0,0.92)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.fillStyle = vignette;
      ctx.fill();

      // Boundary ring
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(100,130,180,0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const render = () => {
      const K     = curvatureRef.current;
      const focus = focusRef.current;
      const nodes = simNodesRef.current;
      const links = simLinksRef.current;

      ctx.clearRect(0, 0, width, height);

      // Outer background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      drawDiskBackground();

      // Clipping to disk
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R - 1, 0, 2 * Math.PI);
      ctx.clip();

      // Project all nodes to disk coords (with Möbius pan)
      const proj = new Map<string, [number, number]>();
      for (const node of nodes) {
        const [dx, dy] = euclidToDisk(node.x ?? 0, node.y ?? 0, K);
        const [mx, my] = mobius(dx, dy, focus.x, focus.y);
        proj.set(node.id, [mx, my]);
      }

      // ── Draw links as geodesic arcs ───────────────────────────────────
      for (const link of links) {
        const srcId = typeof link.source === "string" ? link.source : (link.source as SimNode).id;
        const tgtId = typeof link.target === "string" ? link.target : (link.target as SimNode).id;
        const p1 = proj.get(srcId);
        const p2 = proj.get(tgtId);
        if (!p1 || !p2) continue;

        const midR = Math.sqrt(((p1[0] + p2[0]) / 2) ** 2 + ((p1[1] + p2[1]) / 2) ** 2);
        const alpha = Math.max(0, (1 - midR * midR) * 0.55);
        if (alpha < 0.02) continue;

        ctx.strokeStyle = `rgba(100,150,220,${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        drawGeodesic(ctx, p1[0], p1[1], p2[0], p2[1], cx, cy, R);
        ctx.stroke();
      }

      // ── Draw nodes ────────────────────────────────────────────────────
      // Sort by conformal factor so larger (central) nodes paint on top
      const sorted = [...nodes]
        .map(n => ({ n, p: proj.get(n.id)! }))
        .filter(o => o.p)
        .map(o => {
          const r2 = o.p[0] ** 2 + o.p[1] ** 2;
          const cf = Math.max(0, 1 - r2);
          return { ...o, r2, cf };
        })
        .sort((a, b) => a.cf - b.cf);   // paint small first, large last

      for (const { n, p, cf } of sorted) {
        if (cf < 0.02) continue;

        const sx = cx + p[0] * R;
        const sy = cy + p[1] * R;

        const nodeR   = cf * 13;
        const fontSize = cf * 9.5;
        if (nodeR < 0.8) continue;

        const color = NODE_COLORS[n.type] ?? "#999";

        // Glow for central nodes
        if (cf > 0.5) {
          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, nodeR * 2.5);
          glow.addColorStop(0, color + "50");
          glow.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(sx, sy, nodeR * 2.5, 0, 2 * Math.PI);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(sx, sy, nodeR, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${(cf * 0.45).toFixed(3)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Label (only when large enough)
        if (fontSize > 3.5) {
          const label = n.label;
          ctx.font = `500 ${fontSize.toFixed(1)}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          const tw  = ctx.measureText(label).width;
          const pad = fontSize * 0.22;
          const bx  = sx - tw / 2 - pad;
          const by  = sy + nodeR + 2;
          const bw  = tw + pad * 2;
          const bh  = fontSize + pad * 2;
          ctx.fillStyle = `rgba(8,15,30,${Math.min(0.9, cf * 0.95).toFixed(3)})`;
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 2);
          ctx.fill();
          ctx.fillStyle = `rgba(241,245,249,${Math.min(1, cf * 1.4).toFixed(3)})`;
          ctx.fillText(label, sx, by + pad);
        }
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [dimensions]);

  // ── Mouse interaction ──────────────────────────────────────────────────

  const getCanvasPos = useCallback((e: React.MouseEvent | MouseEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const { width, height } = dimensions;
    const R  = Math.min(width, height) * 0.455;
    const cx = width  / 2;
    const cy = height / 2;
    const dx = (e.clientX - rect.left  - cx) / R;
    const dy = (e.clientY - rect.top   - cy) / R;
    return [dx, dy];
  }, [dimensions]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    const [dx, dy] = getCanvasPos(e);
    dragStart.current = {
      mx: dx, my: dy,
      fx: focusRef.current.x,
      fy: focusRef.current.y,
    };
  }, [getCanvasPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const [dx, dy] = getCanvasPos(e);
    const delta_x = dx - dragStart.current.mx;
    const delta_y = dy - dragStart.current.my;

    // Move focus in the opposite direction of the drag (Poincaré pan)
    let newFx = dragStart.current.fx - delta_x * 0.55;
    let newFy = dragStart.current.fy - delta_y * 0.55;
    const r = Math.sqrt(newFx ** 2 + newFy ** 2);
    if (r > 0.96) { newFx = newFx / r * 0.96; newFy = newFy / r * 0.96; }
    focusRef.current = { x: newFx, y: newFy };
  }, [getCanvasPos]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (Math.abs(e.clientX - (canvasRef.current?.getBoundingClientRect().left ?? 0) -
                 (dimensions.width / 2 + dragStart.current.mx * Math.min(dimensions.width, dimensions.height) * 0.455)) > 4) return;

    const [clickDx, clickDy] = getCanvasPos(e);
    const K = curvatureRef.current;
    const focus = focusRef.current;
    const nodes = simNodesRef.current;

    let closest: GraphNode | null = null;
    let closestDist = Infinity;

    for (const node of nodes) {
      const [dx, dy] = euclidToDisk(node.x ?? 0, node.y ?? 0, K);
      const [mx, my] = mobius(dx, dy, focus.x, focus.y);
      const dist = Math.sqrt((mx - clickDx) ** 2 + (my - clickDy) ** 2);
      const { width, height } = dimensions;
      const R = Math.min(width, height) * 0.455;
      const cf = Math.max(0, 1 - mx ** 2 - my ** 2);
      const nodeR = cf * 13 / R;   // in disk units
      if (dist < nodeR + 0.02 && dist < closestDist) {
        closestDist = dist;
        closest = node;
      }
    }
    setSelected(closest);
  }, [getCanvasPos, dimensions]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full gap-3">

      {/* Controls bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-white font-semibold text-sm tracking-wide">
          Attack Surface Graph — Hyperbolic
        </h2>

        <div className="flex items-center gap-3">
          {/* Curvature slider */}
          <label className="flex items-center gap-2 text-xs text-slate-400 select-none">
            <span className="whitespace-nowrap">Projection</span>
            <input
              type="range"
              min={60}
              max={400}
              step={5}
              value={curvature}
              onChange={e => setCurvature(Number(e.target.value))}
              className="w-28 accent-red-500"
            />
            <span className="w-8 text-right text-slate-300">{curvature}</span>
          </label>

          {/* Reset focus */}
          <button
            onClick={() => { focusRef.current = { x: 0, y: 0 }; }}
            className="px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            Reset view
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 rounded-xl overflow-hidden border border-slate-700"
        style={{ minHeight: 0 }}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: "block", cursor: isDragging.current ? "grabbing" : "grab" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
        />
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-base">{selected.label}</p>
            <p className="text-slate-400 capitalize mt-0.5">{selected.type}</p>
            {selected.detail && (
              <p className="mt-1 text-slate-300">{selected.detail}</p>
            )}
          </div>
          <button
            onClick={() => setSelected(null)}
            className="text-slate-500 hover:text-white text-xs shrink-0"
          >
            ✕ close
          </button>
        </div>
      )}

      {/* Hint */}
      <p className="text-xs text-slate-500 text-center">
        Drag to pan · Slider adjusts projection depth · Click a node for details
      </p>
    </div>
  );
}
