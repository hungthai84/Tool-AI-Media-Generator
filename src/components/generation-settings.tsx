"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { MODELS } from "./prompt-bar";
import { useLanguage } from "@/lib/i18n";

export interface GenerationConfig {
  aspectRatio: string;
  numberOfImages: number;
  resolution: string;
}

interface GenerationSettingsProps {
  selectedModelId: string;
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
}

export function GenerationSettings({
  selectedModelId,
  config,
  onConfigChange,
}: GenerationSettingsProps) {
  const { t, language } = useLanguage();
  const selectedModel = MODELS.find((m) => m.id === selectedModelId);
  if (!selectedModel) return null;

  const isPro = selectedModel.id.includes("pro");

  const handleAspectRatioChange = (value: string) => {
    onConfigChange({ ...config, aspectRatio: value });
  };

  const handleResolutionChange = (value: string) => {
    onConfigChange({ ...config, resolution: value });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-sm leading-none">{t.generationSettings}</h4>
            <p className="text-xs text-muted-foreground">
              {t.generationSettingsDesc}
            </p>
          </div>
          
          <div className="grid gap-4">
            {/* Aspect Ratio - Available for all */}
            <div className="grid gap-2">
              <Label htmlFor="aspect-ratio" className="text-xs font-medium">
                {t.aspectRatio}
              </Label>
              <Select value={config.aspectRatio} onValueChange={handleAspectRatioChange}>
                <SelectTrigger id="aspect-ratio" className="h-9 text-xs">
                  <SelectValue placeholder={t.aspectRatio} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">1:1 {language === "vi" ? "(Vuông)" : "(Square)"}</SelectItem>
                  <SelectItem value="16:9">16:9 {language === "vi" ? "(Ngang)" : "(Landscape)"}</SelectItem>
                  <SelectItem value="9:16">9:16 {language === "vi" ? "(Dọc)" : "(Portrait)"}</SelectItem>
                  <SelectItem value="4:3">4:3 {language === "vi" ? "(Tiêu chuẩn)" : "(Standard)"}</SelectItem>
                  <SelectItem value="3:4">3:4 {language === "vi" ? "(Chân dung)" : "(Portrait)"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resolution/Size - Pro models */}
            {isPro && (
              <div className="grid gap-2">
                <Label htmlFor="resolution" className="text-xs font-medium">
                  {t.imageSize}
                </Label>
                <Select value={config.resolution} onValueChange={handleResolutionChange}>
                  <SelectTrigger id="resolution" className="h-9 text-xs">
                    <SelectValue placeholder={t.imageSize} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1K">1K {language === "vi" ? "(Tiêu chuẩn)" : "(Standard)"}</SelectItem>
                    <SelectItem value="2K">2K {language === "vi" ? "(Cao)" : "(High)"}</SelectItem>
                    <SelectItem value="4K">4K {language === "vi" ? "(Siêu nét)" : "(Ultra)"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
