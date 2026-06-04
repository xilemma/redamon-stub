# Redamon — Attack Surface Graph (Pedagogical Stub)

A minimal Next.js playground for exploring [Redamon](https://github.com/samugit83/redamon)'s graphical interface concepts — specifically the **attack-surface force graph** that Redamon builds from a Neo4j knowledge graph after a recon pipeline run.

> ⚠️ **Educational purposes only.** No real scanning tools, no live targets. All data is synthetic.

## What's inside

- **Interactive 3D / 2D toggle** force-directed graph (`react-force-graph-3d` / `react-force-graph-2d`)
- **Synthetic attack graph** modelling a fictional `acme-corp.com` engagement:
  - 7 target subdomains → 12 hosts → 16 services → 15 vulnerabilities → 6 credentials
  - Edge types: `resolves_to`, `exposes`, `has_vuln`, `yields`, `lateral_move`
- **Persistent pill labels** on every node in both 2D and 3D modes
- **Click-to-inspect** detail panel per node
- Color-coded legend: Target · Host · Service · Vulnerability · Credential

## Tech stack

| Layer | Library |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| 3D graph | `react-force-graph-3d` + `three.js` + `three-spritetext` |
| 2D graph | `react-force-graph-2d` |

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
        ├── AttackSurfaceGraph.tsx # 2D/3D graph component
        └── Legend.tsx             # Color legend
```
