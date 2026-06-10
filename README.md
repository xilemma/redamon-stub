# Redamon — Attack Surface Graph (Pedagogical Stub)

A minimal Next.js playground for exploring [Redamon](https://github.com/samugit83/redamon)'s graphical interface concepts — specifically the **attack-surface force graph** that Redamon builds from a Neo4j knowledge graph after a recon pipeline run.

> ⚠️ **Educational purposes only.** No real scanning tools, no live targets. All data is synthetic.

## What's inside

- **Interactive 3D / 2D / Hyperbolic toggle** force-directed graph (`react-force-graph-3d` / `react-force-graph-2d` / custom Poincaré disk renderer)
- **Synthetic attack graph** modelling a fictional `acme-corp.com` engagement:
  - 7 target subdomains → 12 hosts → 16 services → 15 vulnerabilities → 6 credentials
  - Edge types: `resolves_to`, `exposes`, `has_vuln`, `yields`, `lateral_move`
- **Persistent pill labels** on every node in all three modes
- **Click-to-inspect** detail panel per node
- Color-coded legend: Target · Host · Service · Vulnerability · Credential

## Hyperbolic projection (HYP mode)

The **HYP** button switches to a [Poincaré disk](https://en.wikipedia.org/wiki/Poincar%C3%A9_disk_model) rendering of the full graph — the same geometry behind M.C. Escher's *Circle Limit* prints. The entire network fits on one screen: nodes near the centre appear at full size while nodes toward the boundary shrink toward zero, giving an infinite-tree effect.

### How it works

| Feature | Detail |
|---|---|
| **Projection** | Euclidean force-layout coords → disk via $r_\text{disk} = \tanh(r/K)$ |
| **Geodesic links** | Edges rendered as circular arcs orthogonal to the boundary — true hyperbolic straight lines |
| **Panning** | Drag to re-centre via Möbius transformation $T_a(z) = \frac{z-a}{1-\bar{a}z}$ |
| **Projection slider** | Adjusts $K$ (60–400): left = extreme Escher compression, right = flatter layout |
| **Reset view** | Snaps Möbius focus back to origin |
| **Node scaling** | Node radius and label size scale with the conformal factor $(1 - \|z\|^2)$ |

### Controls

| Action | Effect |
|---|---|
| Drag on disk | Pan (Möbius transform — whatever you drag toward the centre becomes focus) |
| **Projection** slider | Adjusts curvature depth |
| **Reset view** button | Returns to default centring |
| Click a node | Opens detail panel |

## Tech stack

| Layer | Library |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| 3D graph | `react-force-graph-3d` + `three.js` + `three-spritetext` |
| 2D graph | `react-force-graph-2d` |
| Hyperbolic graph | Custom Canvas 2D renderer + `d3-force-3d` for layout |

## Getting started

```bash
cd webapp
npm install
npm run dev
# → http://localhost:3000
```

## Project layout

```
webapp/
└── app/
    ├── page.tsx                   # Dashboard shell
    ├── layout.tsx
    └── components/
        ├── graphData.ts           # Synthetic node/edge data
        ├── AttackSurfaceGraph.tsx # 2D / 3D / HYP mode switcher
        ├── HyperbolicGraph.tsx    # Poincaré disk renderer
        └── Legend.tsx             # Color legend
```
