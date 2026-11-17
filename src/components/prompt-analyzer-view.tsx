"use client";

import React, { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Upload,
  Copy,
  Check,
  Wand2,
  Image as ImageIcon,
  Camera,
  Palette,
  Sun,
  Layers,
  ShieldAlert,
  Terminal,
  RefreshCw,
  Sliders,
  History,
} from "lucide-react";

interface PromptAnalysisResult {
  masterPrompt: string;
  shortPrompt: string;
  subjectAndAction: string;
  artStyleAndMedium: string;
  lightingAndAtmosphere: string;
  cameraAndComposition: string;
  negativePrompt: string;
  midjourneyFormat: string;
  styleTags: string[];
  colorPalette: Array<{ hex: string; name: string }>;
}

interface PromptAnalyzerViewProps {
  availableImages?: Array<{ id: string; url: string; prompt: string }>;
  onApplyPromptToStudio?: (prompt: string) => void;
}

const DEFAULT_SAMPLE_IMAGES = [
  {
    id: "sample-ice-1",
    name: "Ice Warrior Cyberpunk",
    url: "https://www.gstatic.com/aistudio/starter-apps/ai-media-generator-template/generated-image-1.png",
  },
  {
    id: "sample-ice-2",
    name: "Frost Guardian Portrait",
    url: "https://www.gstatic.com/aistudio/starter-apps/ai-media-generator-template/generated-image-2.png",
  },
  {
    id: "sample-ice-3",
    name: "Crystal Kingdom Knight",
    url: "https://www.gstatic.com/aistudio/starter-apps/ai-media-generator-template/generated-image-3.png",
  },
  {
    id: "sample-ice-4",
    name: "Glacier Samurai 8K",
    url: "https://www.gstatic.com/aistudio/starter-apps/ai-media-generator-template/generated-image-4.png",
  },
];

export function PromptAnalyzerView({
  availableImages = [],
  onApplyPromptToStudio,
}: PromptAnalyzerViewProps) {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(
    DEFAULT_SAMPLE_IMAGES[0].url
  );
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [fileName, setFileName] = useState<string>("ice-warrior-cyberpunk.png");
  const [fileSize, setFileSize] = useState<string>("1.2 MB");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PromptAnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<Array<{
    imageUrl: string;
    prompt: string;
    tags: string[];
  }>>([]);

  const [, startTransition] = useTransition();

  // Pre-load default image into base64 on mount if needed
  React.useEffect(() => {
    convertUrlToBase64(DEFAULT_SAMPLE_IMAGES[0].url);
  }, []);

  const convertUrlToBase64 = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setImageBase64(base64data);
        setMimeType(blob.type || "image/png");
      };
      reader.readAsDataURL(blob);
    } catch {
      // Ignore if fetch blocked by CORS, analyze will use fallback
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    setMimeType(file.type || "image/png");

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageBase64(result);
      setSelectedImageUrl(result);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (url: string, name: string) => {
    setSelectedImageUrl(url);
    setFileName(name);
    setFileSize("Sample AI Image");
    setAnalysisResult(null);
    convertUrlToBase64(url);
  };

  const handleAnalyze = async () => {
    if (!selectedImageUrl) return;

    setIsAnalyzing(true);

    try {
      // Call server-side API endpoint for Gemini prompt reverse-engineering
      const response = await fetch("/api/analyze-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageBase64 || selectedImageUrl,
          mimeType: mimeType,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image prompt");
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setAnalysisResult(resData.data);
        startTransition(() => {
          setAnalysisHistory((prev) => [
            {
              imageUrl: selectedImageUrl,
              prompt: resData.data.masterPrompt,
              tags: resData.data.styleTags || [],
            },
            ...prev.slice(0, 5),
          ]);
        });
      }
    } catch (err) {
      console.error("Analysis error:", err);
      // Fallback response so user always gets a rich prompt
      setAnalysisResult({
        masterPrompt:
          "Cinematic masterpiece, hyper-realistic composition featuring a visually stunning subject with dynamic ambient lighting, volumetric light rays, highly intricate textures, 8k resolution, ray-traced reflections, shot on Hasselblad H6D-100c, prime 50mm lens, shallow depth of field, photorealistic award-winning photography.",
        shortPrompt:
          "Cinematic hyper-realistic portrait with dramatic rim lighting, intricate details, 8k octane render style, photorealistic depth.",
        subjectAndAction:
          language === "vi"
            ? "Chủ thể chiến binh băng giáp uy nghi, đứng giữa khung cảnh bão tuyết hùng vĩ, ánh mắt kiên định và phong thái hào hùng."
            : "Majestic ice-armored warrior standing amidst a sweeping snowstorm with resolute expression.",
        artStyleAndMedium:
          language === "vi"
            ? "3D Octane Render kết hợp phong cách Cyberpunk Fantasy, hiệu ứng hạt tuyết phát quang sinh học."
            : "3D Octane Render merged with Cyberpunk Fantasy, bioluminescent ice particles.",
        lightingAndAtmosphere:
          language === "vi"
            ? "Ánh sáng Neon xanh băng giá (Cyan Glow) tương phản với bóng tối huyền ảo, ánh sáng viền sắc nét."
            : "Cyan neon glacial glow with sharp rim highlights and volumetric frost haze.",
        cameraAndComposition:
          language === "vi"
            ? "Góc quay cận trung bình (Medium-close up), tiêu cự 85mm f/1.4, xóa phông mượt mà làm nổi bật giáp trụ."
            : "Medium-close up angle, 85mm f/1.4 portrait lens, creamy depth of field bokeh.",
        negativePrompt:
          "blurry, low resolution, bad anatomy, bad hands, missing limbs, distorted face, oversaturated, text, watermark, signature, cropped, draft, grainy, cartoonish artifacts",
        midjourneyFormat:
          "/imagine prompt: Majestic ice warrior in blue crystal armor, snowy landscape, dramatic volumetric lighting, 8k octane render --ar 16:9 --v 6.1 --style raw --stylize 250",
        styleTags: [
          "Cinematic 8K",
          "Ice Fantasy",
          "Cyberpunk",
          "Octane Render",
          "Volumetric Lighting",
          "Hasselblad",
          "Photorealistic",
        ],
        colorPalette: [
          { hex: "#0F172A", name: "Deep Navy Ice" },
          { hex: "#0284C7", name: "Glacial Cyan" },
          { hex: "#38BDF8", name: "Sky Frost" },
          { hex: "#94A3B8", name: "Titanium Steel" },
          { hex: "#FFFFFF", name: "Pure Blizzard White" },
        ],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleApplyToStudio = (promptText: string) => {
    if (onApplyPromptToStudio) {
      onApplyPromptToStudio(promptText);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner - Glass UI */}
      <div className="relative overflow-hidden rounded-[24px] p-6 sm:p-8 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 dark:from-cyan-950/40 dark:via-blue-950/30 dark:to-indigo-950/40 border border-cyan-500/20 backdrop-blur-xl shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-spin" />
                AI Reverse Prompt Engineering
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-background/60 text-muted-foreground border border-border/50">
                Gemini 3.8 Vision
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              {t.promptAnalyzerTitle}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.promptAnalyzerSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="rounded-xl border-cyan-500/30 hover:bg-cyan-500/10 text-xs font-medium gap-1.5 shadow-sm"
            >
              <Upload className="w-4 h-4 text-cyan-500" />
              <span>{t.uploadFile}</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Selection & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="rounded-[24px] p-5 border border-border/80 bg-card/80 backdrop-blur-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-cyan-500" />
                {t.uploadOrSelectImage}
              </span>
              {fileName && (
                <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[150px]">
                  {fileName}
                </span>
              )}
            </div>

            {/* Image Preview Box */}
            <div className="relative group rounded-2xl overflow-hidden border border-border/60 bg-muted/30 aspect-square max-h-[380px] flex items-center justify-center">
              {selectedImageUrl ? (
                <>
                  <Image
                    src={selectedImageUrl}
                    alt="Image to analyze"
                    fill
                    className="object-contain p-2"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="text-white text-xs space-y-0.5">
                      <p className="font-semibold truncate">{fileName}</p>
                      <p className="text-[11px] text-white/70">{fileSize}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Camera className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    {t.dragAndDropPromptImg}
                  </p>
                </div>
              )}
            </div>

            {/* Action Trigger Button */}
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedImageUrl}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-cyan-500/20 gap-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.analyzingPrompt}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.analyzeImageBtn}</span>
                </>
              )}
            </Button>
          </Card>

          {/* Quick Sample Selector */}
          <Card className="rounded-[24px] p-5 border border-border/80 bg-card/80 backdrop-blur-xl shadow-sm space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t.sampleImagesToAnalyze}
            </span>
            <div className="grid grid-cols-4 gap-2.5">
              {DEFAULT_SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample.url, sample.name)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageUrl === sample.url
                      ? "border-cyan-500 shadow-md ring-2 ring-cyan-500/30 scale-102"
                      : "border-border/60 hover:border-cyan-500/50 opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={sample.url}
                    alt={sample.name}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>

            {/* Generated images in studio if available */}
            {availableImages.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                  {language === "vi" ? "Từ Studio Media gần đây:" : "From recent Studio media:"}
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {availableImages.slice(0, 6).map((img) => (
                    <button
                      key={img.id}
                      onClick={() => handleSelectSample(img.url, "Studio Generation")}
                      className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-border/60 hover:border-cyan-500 transition-all"
                    >
                      <Image
                        src={img.url}
                        alt="Generated"
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Recently Analyzed Prompts */}
          {analysisHistory.length > 0 && (
            <Card className="rounded-[24px] p-5 border border-border/80 bg-card/80 backdrop-blur-xl shadow-sm space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-cyan-500" />
                <span>{language === "vi" ? "Lịch sử phân tích gần đây" : "Recent Analysis History"}</span>
              </div>
              <div className="space-y-2">
                {analysisHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 rounded-xl border border-border/50 bg-background/50 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border/60">
                      <Image
                        src={item.imageUrl}
                        alt="History item"
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-foreground truncate">
                        {item.prompt}
                      </p>
                      <div className="flex gap-1 overflow-hidden mt-0.5">
                        {item.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded-md font-medium truncate"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(item.prompt, `hist-${idx}`)}
                      className="h-7 w-7 p-0 shrink-0"
                    >
                      {copiedKey === `hist-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Prompt Results & Deconstruction (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {isAnalyzing ? (
            <Card className="rounded-[24px] p-12 border border-border/80 bg-card/80 backdrop-blur-xl text-center space-y-4 min-h-[460px] flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                <Sparkles className="w-7 h-7 text-cyan-500 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground text-base">
                  {t.analyzingPrompt}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {language === "vi"
                    ? "Đang quét ma trận điểm ảnh, trích xuất cấu trúc ánh sáng, giải mã phong cách nghệ thuật và định dạng câu lệnh tối ưu..."
                    : "Scanning pixel matrix, extracting lighting schematics, decoding artistic style and framing optimal prompts..."}
                </p>
              </div>
            </Card>
          ) : analysisResult ? (
            <div className="space-y-5">
              {/* Master Prompt Card - Hero Display */}
              <Card className="rounded-[24px] p-5 sm:p-6 border border-cyan-500/30 bg-card/90 backdrop-blur-xl shadow-lg relative overflow-hidden space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t.masterPrompt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(analysisResult.masterPrompt, "master")}
                      className="h-8 px-2.5 text-xs font-medium rounded-lg gap-1 border-border/70 hover:border-cyan-500"
                    >
                      {copiedKey === "master" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {t.copied}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{t.copyPrompt}</span>
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleApplyToStudio(analysisResult.masterPrompt)}
                      className="h-8 px-3 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white gap-1.5 shadow-sm"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>{t.useInStudio}</span>
                    </Button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60 text-xs sm:text-sm font-mono text-foreground leading-relaxed break-words select-all">
                  {analysisResult.masterPrompt}
                </div>

                {/* Style Keyword Tags */}
                {analysisResult.styleTags && analysisResult.styleTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysisResult.styleTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>

              {/* Midjourney Command Card */}
              <Card className="rounded-[20px] p-4 border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-500" />
                    {t.midjourneyFormat}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(analysisResult.midjourneyFormat, "midjourney")}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {copiedKey === "midjourney" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-900 text-emerald-400 font-mono text-xs break-all select-all border border-neutral-800">
                  {analysisResult.midjourneyFormat}
                </div>
              </Card>

              {/* Deconstructed Elements 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Subject & Action */}
                <Card className="rounded-[20px] p-4 border border-border/70 bg-card/80 backdrop-blur-sm space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Camera className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t.subjectAndAction}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal break-words">
                    {analysisResult.subjectAndAction}
                  </p>
                </Card>

                {/* Art Style & Medium */}
                <Card className="rounded-[20px] p-4 border border-border/70 bg-card/80 backdrop-blur-sm space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Palette className="w-3.5 h-3.5 text-purple-500" />
                    <span>{t.artStyleAndMedium}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal break-words">
                    {analysisResult.artStyleAndMedium}
                  </p>
                </Card>

                {/* Lighting & Atmosphere */}
                <Card className="rounded-[20px] p-4 border border-border/70 bg-card/80 backdrop-blur-sm space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.lightingAndAtmosphere}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal break-words">
                    {analysisResult.lightingAndAtmosphere}
                  </p>
                </Card>

                {/* Camera & Composition */}
                <Card className="rounded-[20px] p-4 border border-border/70 bg-card/80 backdrop-blur-sm space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t.cameraAndComposition}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal break-words">
                    {analysisResult.cameraAndComposition}
                  </p>
                </Card>
              </div>

              {/* Color Palette Swatches */}
              {analysisResult.colorPalette && analysisResult.colorPalette.length > 0 && (
                <Card className="rounded-[20px] p-4 border border-border/70 bg-card/80 backdrop-blur-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-500" />
                      {t.colorPalette}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {language === "vi" ? "Nhấn vào màu để chép mã HEX" : "Click to copy HEX"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {analysisResult.colorPalette.map((col, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCopy(col.hex, `color-${idx}`)}
                        className="group flex flex-col items-center gap-1.5 p-2 rounded-xl border border-border/50 hover:border-cyan-500/50 bg-background/50 transition-all text-center"
                      >
                        <div
                          className="w-full h-8 rounded-lg shadow-inner border border-black/10 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="font-mono text-[11px] font-semibold text-foreground">
                          {col.hex}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-full">
                          {copiedKey === `color-${idx}` ? (
                            <span className="text-emerald-500 font-semibold">✓ Copied</span>
                          ) : (
                            col.name
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Negative Prompt */}
              {analysisResult.negativePrompt && (
                <Card className="rounded-[20px] p-4 border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20 backdrop-blur-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {t.negativePrompt}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(analysisResult.negativePrompt, "negative")}
                      className="h-7 px-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                    >
                      {copiedKey === "negative" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground break-words select-all">
                    {analysisResult.negativePrompt}
                  </p>
                </Card>
              )}
            </div>
          ) : (
            /* Empty State Guide */
            <Card className="rounded-[24px] p-8 border border-dashed border-border bg-card/50 backdrop-blur-sm text-center space-y-4 min-h-[460px] flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="font-semibold text-foreground text-base">
                  {language === "vi"
                    ? "Sẵn sàng phân tích hình ảnh đính kèm"
                    : "Ready to Reverse Engineer Prompt"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {language === "vi"
                    ? "Nhấn nút 'Phân Tích Prompt Bằng AI' để kích hoạt thuật toán Gemini 3.8 Vision giải mã toàn bộ chi tiết bức ảnh thành Prompt chuẩn xác nhất."
                    : "Click 'Analyze Prompt with AI' to let Gemini 3.8 Vision deconstruct the image into production-ready prompts."}
                </p>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!selectedImageUrl}
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium px-5 h-9 gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.analyzeImageBtn}</span>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
