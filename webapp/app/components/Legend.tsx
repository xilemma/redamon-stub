import { NODE_COLORS, NodeType } from "./graphData";

const LABELS: Record<NodeType, string> = {
  target: "Target",
  host: "Host",
  service: "Service",
  vulnerability: "Vulnerability",
  credential: "Credential",
};

export default function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-white">
      {(Object.keys(NODE_COLORS) as NodeType[]).map((type) => (
        <div key={type} className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: NODE_COLORS[type] }}
          />
          {LABELS[type]}
        </div>
      ))}
    </div>
  );
}
