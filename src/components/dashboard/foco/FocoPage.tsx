import { useState, useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import TasksTab from "./TasksTab";
import GoalsTab from "./GoalsTab";
import SectionTransitionSkeleton from "@/components/dashboard/SectionTransitionSkeleton";

const tabs = [
  { key: "tarefas", label: "Tarefas" },
  { key: "metas", label: "Metas" },
];

const FocoPage = () => {
  const [activeTab, setActiveTab] = useState("tarefas");
  const [initialLoaded, setInitialLoaded] = useState(false);
  const revealRef = useScrollReveal();
  const loadedTabs = useRef(new Set<string>());

  const handleReadyChange = (tabKey: string, ready: boolean) => {
    if (ready) {
      loadedTabs.current.add(tabKey);
      if (!initialLoaded) setInitialLoaded(true);
    }
  };

  return (
    <div ref={revealRef} className="relative flex-1 min-h-screen md:ml-[240px]" style={{ background: "var(--dash-bg)" }}>
      {!initialLoaded && (
        <div className="absolute inset-0 z-10" style={{ background: "var(--dash-bg)" }}>
          <SectionTransitionSkeleton />
        </div>
      )}

      <div
        className="max-w-4xl mx-auto px-5 md:px-10 pt-20 md:pt-10 pb-24 md:pb-12"
        style={{ visibility: initialLoaded ? "visible" : "hidden" }}
      >
        <div className="mb-8" data-reveal>
          <h1 className="font-display" style={{ color: "var(--dash-text)", fontSize: 24, fontWeight: 400, letterSpacing: "0.01em" }}>
            Foco
          </h1>
          <p className="mt-1.5" style={{ color: "var(--dash-text-muted)", fontSize: 14, fontWeight: 300 }}>
            Suas tarefas, metas e produtividade.
          </p>
        </div>

        <div className="flex gap-0 mb-8" style={{ borderBottom: "1px solid var(--dash-border)" }} data-reveal>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-3 transition-colors relative"
              style={{
                fontSize: 13,
                fontWeight: activeTab === tab.key ? 500 : 400,
                letterSpacing: "0.02em",
                color: activeTab === tab.key ? "var(--dash-text)" : "var(--dash-text-muted)",
              }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "var(--dash-accent)" }} />
              )}
            </button>
          ))}
        </div>

        <div style={{ display: activeTab === "tarefas" ? "block" : "none" }}>
          <TasksTab isActive={activeTab === "tarefas"} onReadyChange={(ready) => handleReadyChange("tarefas", ready)} />
        </div>
        <div style={{ display: activeTab === "metas" ? "block" : "none" }}>
          <GoalsTab isActive={activeTab === "metas"} onReadyChange={(ready) => handleReadyChange("metas", ready)} />
        </div>
      </div>
    </div>
  );
};

export default FocoPage;
