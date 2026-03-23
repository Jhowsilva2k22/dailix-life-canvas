import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import TasksTab from "./TasksTab";
import GoalsTab from "./GoalsTab";

const tabs = [
  { key: "tarefas", label: "Tarefas" },
  { key: "metas", label: "Metas" },
];

const FocoPage = () => {
  const [activeTab, setActiveTab] = useState("tarefas");
  const revealRef = useScrollReveal();

  return (
    <div ref={revealRef} className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "#F1F5F9" }}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-20 md:pt-8 pb-24 md:pb-10">
        <div className="mb-6" data-reveal>
          <h1 className="font-display" style={{ color: "#0F172A", fontSize: 24, fontWeight: 400, letterSpacing: "0.01em" }}>
            Foco
          </h1>
          <p className="mt-1" style={{ color: "#64748B", fontSize: 15, fontWeight: 300 }}>
            Suas tarefas, metas e produtividade em um so lugar.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-8 border-b" style={{ borderColor: "#E2E8F0" }} data-reveal>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-3 transition-colors relative"
              style={{
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: "0.02em",
                color: activeTab === tab.key ? "#00B4D8" : "#94A3B8",
              }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "#00B4D8" }} />
              )}
            </button>
          ))}
        </div>

        <div style={{ display: activeTab === "tarefas" ? "block" : "none" }}>
          <TasksTab />
        </div>
        <div style={{ display: activeTab === "metas" ? "block" : "none" }}>
          <GoalsTab />
        </div>
      </div>
    </div>
  );
};

export default FocoPage;
