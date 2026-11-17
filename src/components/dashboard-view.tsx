"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Search,
  Download,
  Image as ImageIcon,
  Video as VideoIcon,
  Clock,
  HardDrive,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowUpRight,
  Filter,
  Scissors,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PROMPT_INSPIRATIONS } from "@/data/dashboard-data";

export interface GenerationRecord {
  id: string;
  prompt: string;
  type: "image" | "video";
  timestamp: Date;
  itemsCount: number;
  previewUrl?: string;
  modelName?: string;
  isLoading?: boolean;
}

interface DashboardViewProps {
  generations: Array<{
    id: string;
    prompt: string;
    timestamp: Date;
    isLoading?: boolean;
    images?: Array<{ url: string }>;
    videos?: string[];
  }>;
  onSelectPrompt: (promptText: string, modelId?: string) => void;
  onSwitchToStudio: () => void;
  onOpenMediaView?: (id: string, index: number) => void;
  onSwitchToTab?: (tab: "studio" | "dashboard" | "converter" | "bg-remover") => void;
}

export function DashboardView({
  generations,
  onSelectPrompt,
  onSwitchToStudio,
  onOpenMediaView,
  onSwitchToTab,
}: DashboardViewProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<"all" | "image" | "video">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Transform generations into normalized records
  const records = useMemo<GenerationRecord[]>(() => {
    return generations.map((gen) => {
      const isVideo = "videos" in gen && Array.isArray(gen.videos) && gen.videos.length > 0;
      const previewUrl = isVideo
        ? undefined
        : gen.images && gen.images.length > 0
        ? gen.images[0].url
        : undefined;

      const itemsCount = isVideo
        ? gen.videos?.length || 0
        : gen.images?.length || 0;

      return {
        id: gen.id,
        prompt: gen.prompt,
        type: isVideo ? "video" : "image",
        timestamp: gen.timestamp,
        itemsCount,
        previewUrl,
        isLoading: gen.isLoading,
        modelName: isVideo ? "Veo 2.0" : "Nano Banana / Imagen",
      };
    });
  }, [generations]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalImages = 0;
    let totalVideos = 0;

    generations.forEach((g) => {
      if (g.isLoading) return;
      if (g.images) totalImages += g.images.length;
      if (g.videos) totalVideos += g.videos.length;
    });

    const totalRuns = generations.length;
    const avgLength =
      totalRuns > 0
        ? Math.round(
            generations.reduce((acc, curr) => acc + curr.prompt.length, 0) / totalRuns
          )
        : 0;

    // Estimate storage (e.g., 1.5MB per image, 8MB per video)
    const storageMb = (totalImages * 1.5 + totalVideos * 8.2).toFixed(1);

    return {
      totalRuns,
      totalImages,
      totalVideos,
      avgLength,
      storageMb,
      successRate: 100,
      avgSpeed: "3.2s",
    };
  }, [generations]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (mediaFilter !== "all" && rec.type !== mediaFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return rec.prompt.toLowerCase().includes(query);
      }
      return true;
    });
  }, [records, mediaFilter, searchQuery]);

  // Filtered prompt inspirations
  const filteredInspirations = useMemo(() => {
    if (selectedCategory === "all") return PROMPT_INSPIRATIONS;
    return PROMPT_INSPIRATIONS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(generations, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `ai_studio_generations_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-full overflow-hidden">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground truncate">
              {t.dashboardTitle}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground break-words">
            {t.dashboardSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="h-9 px-3 gap-1.5 text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportData}</span>
          </Button>

          <Button
            onClick={onSwitchToStudio}
            size="sm"
            className="h-9 px-3.5 gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.navStudio}</span>
          </Button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Generations */}
        <Card className="p-4 bg-card border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t.totalGenerations}</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.totalRuns}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {metrics.totalRuns > 0 ? "100% active" : "0"}
            </div>
          </div>
        </Card>

        {/* Images Created */}
        <Card className="p-4 bg-card border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t.imagesGenerated}</span>
            <ImageIcon className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.totalImages}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              PNG / JPEG
            </div>
          </div>
        </Card>

        {/* Videos Created */}
        <Card className="p-4 bg-card border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t.videosGenerated}</span>
            <VideoIcon className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.totalVideos}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              MP4 1080p
            </div>
          </div>
        </Card>

        {/* Success Rate */}
        <Card className="p-4 bg-card border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t.successRate}</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.successRate}%
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              Hoàn hảo
            </div>
          </div>
        </Card>

        {/* Average Generation Time */}
        <Card className="p-4 bg-card border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t.avgGenTime}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.avgSpeed}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Flash engine
            </div>
          </div>
        </Card>

        {/* Storage Estimate */}
        <Card className="p-4 bg-card border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t.storageEstimate}</span>
            <HardDrive className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.storageMb} MB
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Asset cache
            </div>
          </div>
        </Card>
      </div>

      {/* Model Distribution & Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-card border-border/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              {t.modelBreakdown}
            </h3>
            <span className="text-xs text-muted-foreground">4 Models</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-foreground">Nano Banana (Flash Image)</span>
                <span className="text-muted-foreground">50%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full w-1/2" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-foreground">Nano Banana Pro (Gemini 3 Pro)</span>
                <span className="text-muted-foreground">25%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-purple-500 h-2 rounded-full w-1/4" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-foreground">Imagen 4.0</span>
                <span className="text-muted-foreground">15%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full w-[15%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-foreground">Veo Video Generator</span>
                <span className="text-muted-foreground">10%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full w-[10%]" />
              </div>
            </div>
          </div>
        </Card>

        {/* Prompt Insights */}
        <Card className="p-5 bg-card border-border/60 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {t.promptInspiration}
            </h3>
            <span className="text-xs text-muted-foreground">
              {PROMPT_INSPIRATIONS.length} gợi ý
            </span>
          </div>

          {/* Categories Tab */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Tất cả
            </button>
            {(["scifi", "nature", "art", "tech", "anime"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t.categories[cat]}
              </button>
            ))}
          </div>

          {/* Inspiration Prompts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
            {filteredInspirations.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const promptToUse = language === "vi" ? item.promptVi : item.promptEn;
                  onSelectPrompt(promptToUse, item.recommendedModel);
                }}
                className="group p-2.5 rounded-lg border border-border/60 bg-background/50 hover:bg-accent/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <p className="text-xs text-foreground line-clamp-2 font-medium mb-1.5 leading-snug group-hover:text-primary transition-colors">
                  {language === "vi" ? item.promptVi : item.promptEn}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {item.type === "video" ? (
                      <VideoIcon className="w-3 h-3 text-purple-500" />
                    ) : (
                      <ImageIcon className="w-3 h-3 text-emerald-500" />
                    )}
                    <span>{item.aspectRatio}</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    {t.usePrompt}
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Creative Utilities Tools Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool 1: Video Format Converter */}
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 via-card to-card border-purple-500/30 flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <RefreshCw className="w-4 h-4" />
              </span>
              <h4 className="font-semibold text-sm text-foreground truncate">
                {t.converterTitle}
              </h4>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Chuyển đổi MP4, WebM, ảnh GIF động, tách âm thanh MP3/WAV
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onSwitchToTab?.("converter")}
            className="h-8 px-3 text-xs shrink-0 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {language === "vi" ? "Mở công cụ" : "Open Tool"}
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Card>

        {/* Tool 2: Background Remover */}
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/30 flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Scissors className="w-4 h-4" />
              </span>
              <h4 className="font-semibold text-sm text-foreground truncate">
                {t.bgRemoverTitle}
              </h4>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Tách nền Video, Ảnh, GIF tự động với Chroma Key & viền mượt
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onSwitchToTab?.("bg-remover")}
            className="h-8 px-3 text-xs shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {language === "vi" ? "Mở công cụ" : "Open Tool"}
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Card>
      </div>

      {/* Media Generations Archive Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {t.recentActivity}
            </h2>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.length} tác phẩm trong lịch sử phiên làm việc
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.searchGenerations}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-background"
              />
            </div>

            <div className="flex items-center gap-1 border border-border/60 rounded-md p-0.5 bg-muted/40">
              <Button
                variant={mediaFilter === "all" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMediaFilter("all")}
                className="h-7 px-2.5 text-xs font-normal"
              >
                {t.filterAll}
              </Button>
              <Button
                variant={mediaFilter === "image" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMediaFilter("image")}
                className="h-7 px-2.5 text-xs font-normal"
              >
                {t.filterImages}
              </Button>
              <Button
                variant={mediaFilter === "video" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMediaFilter("video")}
                className="h-7 px-2.5 text-xs font-normal"
              >
                {t.filterVideos}
              </Button>
            </div>
          </div>
        </div>

        {/* Media List */}
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-xl bg-muted/20">
            <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-60" />
            <p className="text-sm text-muted-foreground">{t.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredRecords.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-4 bg-card border-border/60 hover:border-border transition-all flex gap-3.5 items-start">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0 border border-border/50">
                    {item.previewUrl ? (
                      <Image
                        src={item.previewUrl}
                        alt={item.prompt}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : item.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-purple-950/20 text-purple-400">
                        <VideoIcon className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-semibold tracking-wider h-5 px-1.5"
                        >
                          {item.type}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {new Intl.DateTimeFormat(
                            language === "vi" ? "vi-VN" : "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "numeric",
                              month: "short",
                            }
                          ).format(item.timestamp)}
                        </span>
                      </div>

                      <p
                        className="text-xs text-foreground font-medium line-clamp-2 break-words"
                        title={item.prompt}
                      >
                        {item.prompt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2">
                      <span className="text-[11px] text-muted-foreground">
                        {item.itemsCount} {item.type === "image" ? t.images : t.videos}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (onOpenMediaView) {
                              onOpenMediaView(item.id, 0);
                            } else {
                              onSwitchToStudio();
                            }
                          }}
                          className="h-6 px-2 text-[11px]"
                        >
                          {t.expand}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onSelectPrompt(item.prompt);
                          }}
                          className="h-6 px-2 text-[11px]"
                        >
                          {t.usePrompt}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
