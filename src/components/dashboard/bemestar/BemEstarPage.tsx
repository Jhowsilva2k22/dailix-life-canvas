import { useState, useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import HabitsTab from "./HabitsTab";
import InsightsTab from "./InsightsTab";
import SectionTransitionSkeleton from "@/components/dashboard/SectionTransitionSkeleton";

const tabs = [
  { key: "habitos", label: "Hábitos" },
  { key: "insights", label: "Insights" },
];

const BemEstarPage = () => {
  const [activeTab, setActiveTab] = useState("habitos");
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
            Bem-estar
          </h1>
          <p className="mt-1.5" style={{ color: "var(--dash-text-muted)", fontSize: 14, fontWeight: 300 }}>
            Hábitos, saúde e aprendizado contínuo.
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

        <div style={{ display: activeTab === "habitos" ? "block" : "none" }}>
          <HabitsTab isActive={activeTab === "habitos"} onReadyChange={(ready) => handleReadyChange("habitos", ready)} />
        </div>
        <div style={{ display: activeTab === "insights" ? "block" : "none" }}>
          <InsightsTab isActive={activeTab === "insights"} onReadyChange={(ready) => handleReadyChange("insights", ready)} />
        </div>
      </div>
    </div>
  );
};

export default BemEstarPage;
