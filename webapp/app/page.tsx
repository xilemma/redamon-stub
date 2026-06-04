import AttackSurfaceGraph from "./components/AttackSurfaceGraph";
import Legend from "./components/Legend";

export default function Home() {
  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-red-500 text-2xl font-black tracking-tight">
            RED<span className="text-white">AMON</span>
          </span>
          <span className="text-slate-500 text-xs border border-slate-700 rounded px-2 py-0.5">
            pedagogical stub
          </span>
        </div>
        <Legend />
      </header>
      <main className="flex-1 min-h-0">
        <AttackSurfaceGraph />
      </main>
    </div>
  );
}
