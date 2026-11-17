"use client";

import { useState, useEffect, useMemo } from "react";
import { ImageGrid } from "@/components/image-grid";
import { VideoGrid } from "@/components/video-grid";
import { LoadingGrid } from "@/components/loading-grid";
import { FocusedMediaView } from "@/components/focused-media-view";
import { motion } from "framer-motion";
import { GenerationConfig } from "@/components/generation-settings";
import { DashboardView } from "@/components/dashboard-view";
import { VideoConverterView } from "@/components/video-converter-view";
import { BgRemoverView } from "@/components/bg-remover-view";
import { PromptAnalyzerView } from "@/components/prompt-analyzer-view";
import { useLanguage } from "@/lib/i18n";
import { AppTab } from "@/components/prompt-bar";

interface ImageGeneration {
  id: string;
  prompt: string;
  images: Array<{
    url: string;
    imageBytes?: string;
    isSample?: boolean;
  }>;
  timestamp: Date;
  isLoading: boolean;
}

interface VideoGeneration {
  id: string;
  prompt: string;
  videos: string[];
  timestamp: Date;
  isLoading: boolean;
  sourceImage?: string;
}

interface LoadingGeneration {
  id: string;
  prompt: string;
  type: "image" | "video";
  timestamp: Date;
  isLoading: true;
  sourceImage?: string;
}

type Generation = ImageGeneration | VideoGeneration | LoadingGeneration;

const sampleImage1 = "https://www.gstatic.com/aistudio/starter-apps/ai-media-generator-template/generated-image-1.png";
const sampleImage2 = "https://www.gstatic.com/aistudio/starter-apps/ai-media-generator-template/generated-image-2.png";
const sampleImage3 = "https://www.gstatic.com/aistudio/starter-apps/ai-media-generator-template/generated-image-3.png";
const sampleImage4 = "https://www.gstatic.com/aistudio/starter-apps/ai-media-generator-template/generated-image-4.png";

// Sample data for demonstration with real generated content
const createSampleGenerations = (): Generation[] => [
  // Video generation (most recent)
  {
    id: "sample-video-1",
    prompt: "a race car formula 1 style in a highspeed track",
    videos: [
      "https://www.gstatic.com/aistudio/starter-apps/ai-media-generator-template/video-1.mp4",
      "https://www.gstatic.com/aistudio/starter-apps/ai-media-generator-template/video-2.mp4"
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    isLoading: false
  } as VideoGeneration,
  // Image generation 
  {
    id: "sample-image-1",
    prompt: "A majestic ice warrior in blue armor standing in a snowy landscape",
    images: [
      { url: sampleImage1, isSample: true },
      { url: sampleImage2, isSample: true }, 
      { url: sampleImage3, isSample: true },
      { url: sampleImage4, isSample: true }
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    isLoading: false
  } as ImageGeneration
];

interface ContentGridProps {
  onNewGeneration?: (handler: (modelId: string, type: "image" | "video", prompt: string, config: GenerationConfig) => void) => void;
  activeTab?: AppTab;
  onSelectPrompt?: (prompt: string, modelId?: string) => void;
  onSwitchToStudio?: () => void;
  onSwitchToTab?: (tab: AppTab) => void;
}

export function ContentGrid({ 
  onNewGeneration,
  activeTab = "studio",
  onSelectPrompt,
  onSwitchToStudio,
  onSwitchToTab,
}: ContentGridProps) {
  const { t } = useLanguage();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [hasPrompted, setHasPrompted] = useState(false);
  const [focusedView, setFocusedView] = useState<{
    isOpen: boolean;
    mediaItems: Array<{
      id: string;
      type: 'image' | 'video';
      url: string;
      prompt: string;
      timestamp: Date;
      sourceImage?: string;
    }>;
    initialIndex: number;
  }>({ isOpen: false, mediaItems: [], initialIndex: 0 });

  // Initialize with sample data after mount to avoid hydration issues
  useEffect(() => {
    setGenerations(createSampleGenerations());
  }, []);

  // Compute available media for converter and bg-remover
  const availableVideos = useMemo(() => {
    const list: Array<{ id: string; url: string; prompt: string }> = [];
    generations.forEach((g) => {
      if (!g.isLoading && "videos" in g && g.videos) {
        g.videos.forEach((v, idx) => {
          list.push({ id: `${g.id}-${idx}`, url: v, prompt: g.prompt });
        });
      }
    });
    return list;
  }, [generations]);

  const availableImages = useMemo(() => {
    const list: Array<{ id: string; url: string; prompt: string }> = [];
    generations.forEach((g) => {
      if (!g.isLoading && "images" in g && g.images) {
        g.images.forEach((img, idx) => {
          list.push({ id: `${g.id}-${idx}`, url: img.url, prompt: g.prompt });
        });
      }
    });
    return list;
  }, [generations]);

  // Helper function to gather all media items from generations
  const getAllMediaItems = () => {
    const mediaItems: Array<{
      id: string;
      type: 'image' | 'video';
      url: string;
      prompt: string;
      timestamp: Date;
      sourceImage?: string;
    }> = [];

    generations.forEach((generation) => {
      if (!generation.isLoading) {
        if ('images' in generation) {
          // Image generation
          generation.images.forEach((image, index) => {
            mediaItems.push({
              id: `${generation.id}-img-${index}`,
              type: 'image',
              url: image.url,
              prompt: generation.prompt,
              timestamp: generation.timestamp,
            });
          });
        } else if ('videos' in generation) {
          // Video generation
          generation.videos.forEach((video, index) => {
            mediaItems.push({
              id: `${generation.id}-vid-${index}`,
              type: 'video',
              url: video,
              prompt: generation.prompt,
              timestamp: generation.timestamp,
              sourceImage: generation.sourceImage,
            });
          });
        }
      }
    });

    // Sort by timestamp (newest first)
    return mediaItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Function to open focused view
  const openFocusedView = (generationId: string, itemIndex: number) => {
    const allMediaItems = getAllMediaItems();
    
    // Find the specific item index in the global list
    let globalIndex = 0;
    for (let i = 0; i < generations.length; i++) {
      const gen = generations[i];
      if (gen.isLoading) continue;
      
      if (gen.id === generationId) {
        globalIndex += itemIndex;
        break;
      }
      
      if ('images' in gen) {
        globalIndex += gen.images.length;
      } else if ('videos' in gen) {
        globalIndex += gen.videos.length;
      }
    }

    setFocusedView({
      isOpen: true,
      mediaItems: allMediaItems,
      initialIndex: globalIndex,
    });
  };

  const handleNewGeneration = async (
    modelId: string,
    type: "image" | "video",
    prompt: string,
    config: GenerationConfig
  ) => {
    const loadingGeneration: LoadingGeneration = {
      id: `loading-${Date.now()}`,
      prompt,
      type,
      timestamp: new Date(),
      isLoading: true,
    };

    // Add new loading generation at the top
    setGenerations((prev) => [loadingGeneration, ...prev]);
    setHasPrompted(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId,
          type,
          prompt,
          config,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error ${response.status}`);
      }

      const data = await response.json();

      if (type === "image" && data.images && data.images.length > 0) {
        const completedGeneration: ImageGeneration = {
          id: loadingGeneration.id,
          prompt: loadingGeneration.prompt,
          images: data.images,
          timestamp: loadingGeneration.timestamp,
          isLoading: false,
        };

        setGenerations((prev) =>
          prev.map((gen) =>
            gen.id === loadingGeneration.id ? completedGeneration : gen
          )
        );
      } else if (type === "video" && data.videos && data.videos.length > 0) {
        const completedGeneration: VideoGeneration = {
          id: loadingGeneration.id,
          prompt: loadingGeneration.prompt,
          videos: data.videos,
          timestamp: loadingGeneration.timestamp,
          isLoading: false,
        };

        setGenerations((prev) =>
          prev.map((gen) =>
            gen.id === loadingGeneration.id ? completedGeneration : gen
          )
        );
      } else {
        throw new Error("Không nhận được kết quả phương tiện từ hệ thống");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      setGenerations((prev) => prev.filter((gen) => gen.id !== loadingGeneration.id));
    }
  };

  // Use useEffect to avoid setState during render
  useEffect(() => {
    if (onNewGeneration) {
      onNewGeneration(handleNewGeneration);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {activeTab === "converter" ? (
        <VideoConverterView
          availableVideos={availableVideos}
          onBackToStudio={() => onSwitchToStudio?.()}
        />
      ) : activeTab === "bg-remover" ? (
        <BgRemoverView
          availableImages={availableImages}
          availableVideos={availableVideos}
          onBackToStudio={() => onSwitchToStudio?.()}
        />
      ) : activeTab === "prompt-analyzer" ? (
        <PromptAnalyzerView
          availableImages={availableImages}
          onApplyPromptToStudio={(prompt) => {
            if (onSelectPrompt) onSelectPrompt(prompt);
            if (onSwitchToStudio) onSwitchToStudio();
          }}
        />
      ) : activeTab === "dashboard" ? (
        <DashboardView
          generations={generations}
          onSelectPrompt={(prompt, modelId) => {
            if (onSelectPrompt) onSelectPrompt(prompt, modelId);
          }}
          onSwitchToStudio={() => {
            if (onSwitchToStudio) onSwitchToStudio();
          }}
          onOpenMediaView={openFocusedView}
          onSwitchToTab={onSwitchToTab}
        />
      ) : (
        <div className="space-y-8">
          {!hasPrompted ? (
            <div className="p-6 bg-muted/30 rounded-xl border border-border/50 text-center">
              <h2 className="text-xl font-semibold mb-2">{t.welcomeTitle}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                {t.welcomeDesc}
              </p>
            </div>
          ) : (
            <div className="p-6 bg-muted/30 rounded-xl border border-border/50 text-center">
              <h2 className="text-xl font-semibold mb-3">{t.remixIdeasTitle}</h2>
              <div className="text-muted-foreground max-w-2xl mx-auto text-sm space-y-3">
                <p>{t.remixIdeasDesc}</p>
                <ul className="list-disc text-left pl-8 space-y-1 inline-block">
                  <li>{t.remixIdea1}</li>
                  <li>{t.remixIdea2}</li>
                  <li>{t.remixIdea3}</li>
                  <li>{t.remixIdea4}</li>
                </ul>
              </div>
            </div>
          )}

          {generations.map((generation) => (
            <motion.div
              key={generation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {generation.isLoading ? (
                <LoadingGrid 
                  prompt={generation.prompt}
                  type={"type" in generation ? generation.type : "image"}
                  sourceImage={"sourceImage" in generation ? generation.sourceImage : undefined}
                />
              ) : "images" in generation ? (
                <ImageGrid 
                  generation={generation}
                  onViewFullscreen={openFocusedView}
                />
              ) : (
                <VideoGrid 
                  generation={generation} 
                  onViewFullscreen={openFocusedView}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}

      <FocusedMediaView
        isOpen={focusedView.isOpen}
        onClose={() => setFocusedView(prev => ({ ...prev, isOpen: false }))}
        mediaItems={focusedView.mediaItems}
        initialIndex={focusedView.initialIndex}
      />
    </>
  );
} 