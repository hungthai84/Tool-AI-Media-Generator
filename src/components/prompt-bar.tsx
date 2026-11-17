"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ImageIcon,
  VideoIcon,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  Wand2,
  Globe,
  RefreshCw,
  Scissors,
  ScanSearch,
} from "lucide-react";
import { SettingsDropdown } from "@/components/settings-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GenerationSettings, GenerationConfig } from "@/components/generation-settings";
import { useLanguage } from "@/lib/i18n";

export const MODELS = [
  { id: "gemini-2.5-flash-image", name: "Nano Banana", type: "image" },
  { id: "gemini-3-pro-image-preview", name: "Nano Banana Pro", type: "image" },
  { id: "imagen-4.0-generate-001", name: "Imagen", type: "image" },
] as const;

export type AppTab = "studio" | "dashboard" | "converter" | "bg-remover" | "prompt-analyzer";

interface PromptBarProps {
  onGenerate?: (
    modelId: string,
    type: "image" | "video",
    prompt: string,
    config: GenerationConfig
  ) => void;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  initialPrompt?: string;
}

export function PromptBar({
  onGenerate,
  activeTab,
  onTabChange,
  initialPrompt = "",
}: PromptBarProps) {
  const { t, language, setLanguage } = useLanguage();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<typeof MODELS[number]>(MODELS[0]);
  const [config, setConfig] = useState<GenerationConfig>({
    aspectRatio: "1:1",
    numberOfImages: 1,
    resolution: "1080p",
  });

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // If currently on dashboard, switch back to studio to see result
    if (activeTab !== "studio") {
      onTabChange("studio");
    }

    // Call the parent handler to add new generation
    if (onGenerate) {
      onGenerate(selectedModel.id, selectedModel.type, prompt.trim(), config);
    }

    // Clear the prompt
    setPrompt("");

    // Reset generating state
    setTimeout(() => {
      setIsGenerating(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  return (
    <div className="w-full py-3 sm:py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          {/* Top Bar Navigation: Brand & View Switcher */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
                AI
              </div>
              <span className="font-semibold text-base sm:text-lg tracking-tight text-foreground hidden sm:inline">
                {t.appTitle}
              </span>
            </div>

            {/* Navigation Tabs (Studio, Dashboard, Converter, BgRemover) */}
            <div className="flex items-center bg-muted/70 p-1 rounded-xl border border-border/60 overflow-x-auto max-w-[calc(100vw-120px)] sm:max-w-none scrollbar-hide">
              <button
                type="button"
                onClick={() => onTabChange("studio")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === "studio"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-primary" />
                <span>{t.navStudio}</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange("dashboard")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === "dashboard"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-500" />
                <span>{t.navDashboard}</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange("converter")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === "converter"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                <span>{t.navConverter}</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange("bg-remover")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === "bg-remover"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Scissors className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t.navBgRemover}</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange("prompt-analyzer")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === "prompt-analyzer"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ScanSearch className="w-3.5 h-3.5 text-cyan-500" />
                <span>{t.navPromptAnalyzer}</span>
              </button>
            </div>

            {/* Quick Language Toggle & Settings */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                title={language === "vi" ? "Chuyển sang Tiếng Anh" : "Switch to Vietnamese"}
                className="h-8 px-2 text-xs font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground border border-border/40"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === "vi" ? "🇻🇳 VI" : "🇬🇧 EN"}</span>
              </Button>
              <SettingsDropdown />
            </div>
          </div>

          {/* Main prompt input */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
            <div className="relative flex-1 w-full flex gap-2 items-center">
              <div className="relative flex-1">
                <Input
                  placeholder={
                    language === "vi"
                      ? `Mô tả nội dung bạn muốn tạo với ${selectedModel.name}...`
                      : `Describe what you want to create with ${selectedModel.name}...`
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pr-10 h-10 text-sm sm:text-base bg-card border-input"
                  disabled={isGenerating}
                />
                <button
                  type="button"
                  onClick={() => onTabChange("prompt-analyzer")}
                  title={language === "vi" ? "Đính kèm ảnh phân tích ra prompt" : "Analyze image to prompt"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-cyan-500 hover:bg-cyan-500/10 rounded-md transition-colors"
                >
                  <ScanSearch className="w-4 h-4" />
                </button>
              </div>

              {/* Model Dropdown Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 px-3 min-w-[140px] justify-between hidden sm:flex shrink-0"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium">
                      {selectedModel.type === "image" ? (
                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <VideoIcon className="w-4 h-4 text-purple-500" />
                      )}
                      {selectedModel.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel className="text-xs font-semibold">
                    {t.imageModels}
                  </DropdownMenuLabel>
                  {MODELS.filter((m) => m.type === "image").map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setConfig((prev) => ({
                          ...prev,
                          aspectRatio: "1:1",
                          resolution: "1K",
                        }));
                      }}
                      className="justify-between text-xs"
                    >
                      <span className="flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5" />
                        {model.name}
                      </span>
                      {selectedModel.id === model.id && (
                        <Sparkles className="w-3 h-3 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="h-10 px-4 text-xs font-medium shrink-0"
              >
                {isGenerating ? (
                  <span className="animate-pulse">{t.generating}</span>
                ) : (
                  <>
                    {t.generate}{" "}
                    <span className="hidden sm:inline">
                      ({selectedModel.type === "image" ? t.image : t.video})
                    </span>
                  </>
                )}
              </Button>

              <div className="hidden sm:flex gap-1.5 items-center shrink-0">
                {selectedModel.type === "image" && (
                  <Select
                    value={config.numberOfImages.toString()}
                    onValueChange={(val) =>
                      setConfig((prev) => ({
                        ...prev,
                        numberOfImages: parseInt(val),
                      }))
                    }
                  >
                    <SelectTrigger className="w-[110px] h-10 text-xs">
                      <SelectValue placeholder={t.count} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 {t.image}</SelectItem>
                      <SelectItem value="2">2 {t.images}</SelectItem>
                      <SelectItem value="3">3 {t.images}</SelectItem>
                      <SelectItem value="4">4 {t.images}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <GenerationSettings
                  selectedModelId={selectedModel.id}
                  config={config}
                  onConfigChange={setConfig}
                />
              </div>
            </div>
          </div>

          {/* Mobile model selector & options */}
          <div className="flex flex-col sm:hidden gap-2">
            <div className="flex gap-2 w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 h-9 justify-between text-xs">
                    <span className="flex items-center gap-2 truncate">
                      {selectedModel.type === "image" ? (
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <VideoIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      )}
                      <span className="truncate">{selectedModel.name}</span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel className="text-xs">{t.imageModels}</DropdownMenuLabel>
                  {MODELS.filter((m) => m.type === "image").map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setConfig((prev) => ({
                          ...prev,
                          aspectRatio: "1:1",
                          resolution: "1K",
                        }));
                      }}
                      className="justify-between text-xs"
                    >
                      {model.name}
                      {selectedModel.id === model.id && (
                        <Sparkles className="w-3 h-3 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedModel.type === "image" && (
                <Select
                  value={config.numberOfImages.toString()}
                  onValueChange={(val) =>
                    setConfig((prev) => ({ ...prev, numberOfImages: parseInt(val) }))
                  }
                >
                  <SelectTrigger className="w-[100px] h-9 shrink-0 text-xs">
                    <SelectValue placeholder={t.count} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 {t.image}</SelectItem>
                    <SelectItem value="2">2 {t.images}</SelectItem>
                    <SelectItem value="3">3 {t.images}</SelectItem>
                    <SelectItem value="4">4 {t.images}</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <GenerationSettings
                selectedModelId={selectedModel.id}
                config={config}
                onConfigChange={setConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}