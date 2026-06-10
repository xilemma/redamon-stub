"use client";

import { useEffect, useRef, useState } from "react";
import { stubGraphData, NODE_COLORS, GraphNode } from "./graphData";

// react-force-graph-2d and 3d import three.js / WebGL — must be dynamically
// loaded on the client to avoid SSR issues with Next.js.
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });
const HyperbolicGraph = dynamic(() => import("./HyperbolicGraph"), { ssr: false });

interface NodeWithCoords extends GraphNode {
  x?: number;
  y?: number;
  z?: number;
}

export default function AttackSurfaceGraph() {
  const [mode, setMode] = useState<"2d" | "3d" | "hyp">("3d");
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const nodeColor = (node: object) =>
    NODE_COLORS[(node as GraphNode).type] ?? "#999";

  // Hover tooltip (detail text only — label is always visible on the node)
  const nodeLabel = (node: object) => {
    const n = node as GraphNode;
    return n.detail
      ? `<div style="background:#1e293b;color:#fff;padding:6px 10px;border-radius:6px;font-size:12px;max-width:240px">${n.detail}</div>`
      : "";
  };

  const linkColor = () => "rgba(148,163,184,0.4)";

  // 3D: SpriteText pill label on each node
  const nodeThreeObject = (node: object) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SpriteText = require("three-spritetext").default;
    const n = node as GraphNode;
    const sprite = new SpriteText(n.label);
    sprite.color = "#f1f5f9";
    sprite.textHeight = 2.8;
    sprite.fontFace = "-apple-system, BlinkMacSystemFont, sans-serif";
    sprite.fontWeight = "500";
    sprite.backgroundColor = "rgba(15,23,42,0.82)";
    sprite.padding = 1.5;
    sprite.borderRadius = 2;
    sprite.strokeWidth = 0;
    return sprite;
  };

  const sharedProps = {
    graphData: stubGraphData,
    nodeLabel,
    nodeColor,
    linkColor,
    linkDirectionalArrowLength: 4,
    linkDirectionalArrowRelPos: 1,
    linkCurvature: 0.15,
    width: dimensions.width,
    height: dimensions.height,
    onNodeClick: (node: object) => setSelected(node as GraphNode),
    backgroundColor: "#0f172a",
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm tracking-wide">
          Attack Surface Graph
        </h2>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(["3d", "2d", "hyp"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                mode === m
                  ? "bg-red-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              title={m === "hyp" ? "Hyperbolic (Poincaré disk)" : undefined}
            >
              {m === "hyp" ? "HYP" : m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* graph canvas */}
      <div
        ref={containerRef}
        className="flex-1 rounded-xl overflow-hidden border border-slate-700"
        style={{ minHeight: 0 }}
      >
        {mode === "3d" ? (
          <ForceGraph3D
            {...sharedProps}
            nodeResolution={12}
            nodeThreeObject={nodeThreeObject}
            nodeThreeObjectExtend={true}
          />
        ) : mode === "2d" ? (
          <ForceGraph2D
            {...sharedProps}
            nodeCanvasObjectMode={() => "after"}
            nodeCanvasObject={(node, ctx) => {
              const n = node as NodeWithCoords;
              const x = n.x ?? 0;
              const y = n.y ?? 0;
              const label = n.label;
              const fontSize = 4;
              ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
              const textWidth = ctx.measureText(label).width;
              const pad = 1.2;
              const bx = x - textWidth / 2 - pad;
              const by = y + 6;
              const bw = textWidth + pad * 2;
              const bh = fontSize + pad * 2;
              // pill background
              ctx.fillStyle = "rgba(15,23,42,0.82)";
              ctx.beginPath();
              ctx.roundRect(bx, by, bw, bh, 1.5);
              ctx.fill();
              // label text
              ctx.fillStyle = "#f1f5f9";
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillText(label, x, by + pad);
            }}
          />
        ) : (
          <HyperbolicGraph />
        )}
      </div>

      {/* detail panel */}
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
    </div>
  );
}
