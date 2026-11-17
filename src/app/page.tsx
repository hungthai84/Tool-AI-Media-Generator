"use client";

import { useState, useCallback } from "react";
import { PromptBar, AppTab } from "@/components/prompt-bar";
import { ContentGrid } from "@/components/content-grid";
import { GenerationConfig } from "@/components/generation-settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>("studio");
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [generateHandler, setGenerateHandler] = useState<
    ((modelId: string, type: "image" | "video", prompt: string, config: GenerationConfig) => void) | null
  >(null);

  const handleSetGenerator = useCallback(
    (handler: (modelId: string, type: "image" | "video", prompt: string, config: GenerationConfig) => void) => {
      setGenerateHandler(() => handler);
    },
    []
  );

  const handleSelectPrompt = (promptText: string) => {
    setCurrentPrompt(promptText);
    setActiveTab("studio");
  };

  return (
    // Outer canvas wrapper providing ambient background & centering
    <div className="min-h-screen bg-slate-100/80 dark:bg-neutral-950 p-2 sm:p-4 md:p-6 lg:p-7 flex items-center justify-center transition-colors">
      {/* THẺ CHỨA TOÀN BỘ NỘI DUNG WEBSITE: Bo cong 4 góc, padding 15px, Glass Card Design */}
      <div className="w-full max-w-[1520px] rounded-[24px] p-[15px] bg-card/95 dark:bg-card/90 border border-border/80 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden min-h-[94vh] relative transition-all">
        {/* Top Navigation & Prompt Controls */}
        <header className="sticky top-0 z-40 rounded-t-[18px] border-b border-border/60 bg-background/90 backdrop-blur-md">
          <PromptBar
            onGenerate={generateHandler || undefined}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            initialPrompt={currentPrompt}
          />
        </header>

        {/* Main Content Area (Studio / Dashboard / Converter / BgRemover) */}
        <main className="w-full px-2 sm:px-4 lg:px-6 py-6 flex-1 overflow-x-hidden">
          <ContentGrid
            onNewGeneration={handleSetGenerator}
            activeTab={activeTab}
            onSelectPrompt={handleSelectPrompt}
            onSwitchToStudio={() => setActiveTab("studio")}
            onSwitchToTab={setActiveTab}
          />
        </main>

        {/* Footer */}
        <footer className="mt-auto pt-4 pb-2 border-t border-border/50 text-center text-xs text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2">
            <span className="font-medium text-foreground">
              AI Media Studio • Video Converter • AI Background Remover • Image to Prompt AI
            </span>
            <span className="text-[11px]">
              Tách nền Video/Ảnh/GIF • Phân tích Prompt từ Ảnh • Chuyển đổi MP4, WebM, GIF, MP3 • Hỗ trợ Song ngữ 🇻🇳 / 🇬🇧
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
