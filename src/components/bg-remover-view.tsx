"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Scissors,
  Download,
  Upload,
  Sparkles,
  Pipette,
  Play,
  Pause,
  Layers,
  Image as ImageIcon,
  Video as VideoIcon,
  UserCheck,
  Crosshair,
  ShieldCheck,
  Eye,
  EyeOff,
  RotateCcw,
  Sliders,
  CheckCircle2,
} from "lucide-react";

interface BgRemoverViewProps {
  availableImages: Array<{ id: string; url: string; prompt: string }>;
  availableVideos: Array<{ id: string; url: string; prompt: string }>;
  initialMedia?: { url: string; type: "image" | "video" };
  onBackToStudio: () => void;
}

export function BgRemoverView({
  availableImages,
  availableVideos,
  initialMedia,
  onBackToStudio,
}: BgRemoverViewProps) {
  const { t } = useLanguage();

  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mediaUrl, setMediaUrl] = useState<string>(
    initialMedia?.url ||
      (availableImages.length > 0
        ? availableImages[0].url
        : "https://www.gstatic.com/aistudio/starter-apps/ai-media-generator-template/generated-image-1.png")
  );

  // Mode: "subject-protect" (Xác định & bảo vệ nhân vật, chỉ xóa nền xung quanh) vs "chroma-key" (Tách phông màu)
  const [removalMode, setRemovalMode] = useState<"subject-protect" | "chroma-key">("subject-protect");

  // Character detection & anchor parameters
  const [subjectAnchor, setSubjectAnchor] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.48 }); // Normalized (0..1)
  const [subjectProtectRadius, setSubjectProtectRadius] = useState<number>(55); // 10% - 90%
  const [edgeSensitivity, setEdgeSensitivity] = useState<number>(40); // 10% - 90%
  const [skinToneSafeguard, setSkinToneSafeguard] = useState<boolean>(true);
  const [showContour, setShowContour] = useState<boolean>(true);
  const [isSubjectDetected, setIsSubjectDetected] = useState<boolean>(true);

  // Background removal parameters
  const [keyColor, setKeyColor] = useState<string>("#FFFFFF");
  const [tolerance, setTolerance] = useState<number>(36);
  const [smoothing, setSmoothing] = useState<number>(18);
  const [bgType, setBgType] = useState<"transparent" | "black" | "white" | "custom" | "gradient">("transparent");
  const [customBgColor, setCustomBgColor] = useState<string>("#6366F1");

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPickingColor, setIsPickingColor] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (initialMedia) {
      setMediaType(initialMedia.type);
      setMediaUrl(initialMedia.url);
    }
  }, [initialMedia]);

  // Convert HEX to RGB
  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  // Convert RGB to HEX
  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (n: number) => {
      const h = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return h.length === 1 ? "0" + h : h;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Human skin tone detector (RGB/YCbCr heuristic)
  const isSkinTone = (r: number, g: number, b: number): boolean => {
    // Basic human skin range in RGB
    if (r <= 60 || g <= 40 || b <= 20) return false;
    if (r <= g || r <= b) return false;
    if (r - g < 10) return false;
    // YCbCr approximation
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cr = (r - y) * 0.713 + 128;
    const cb = (b - y) * 0.564 + 128;
    return cr >= 133 && cr <= 173 && cb >= 77 && cb <= 127;
  };

  // Automatic perimeter sampling to detect dominant background color
  const autoSampleBorderColor = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    try {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;
      const frame = ctx.getImageData(0, 0, w, h);
      const data = frame.data;

      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;

      // Sample along 4 borders: top, bottom, left, right (step 4)
      for (let x = 0; x < w; x += 4) {
        // Top border (y = 2)
        const idxTop = (2 * w + x) * 4;
        rSum += data[idxTop];
        gSum += data[idxTop + 1];
        bSum += data[idxTop + 2];
        count++;

        // Bottom border (y = h - 3)
        const idxBottom = ((h - 3) * w + x) * 4;
        rSum += data[idxBottom];
        gSum += data[idxBottom + 1];
        bSum += data[idxBottom + 2];
        count++;
      }

      for (let y = 0; y < h; y += 4) {
        // Left border (x = 2)
        const idxLeft = (y * w + 2) * 4;
        rSum += data[idxLeft];
        gSum += data[idxLeft + 1];
        bSum += data[idxLeft + 2];
        count++;

        // Right border (x = w - 3)
        const idxRight = (y * w + (w - 3)) * 4;
        rSum += data[idxRight];
        gSum += data[idxRight + 1];
        bSum += data[idxRight + 2];
        count++;
      }

      if (count > 0) {
        const avgR = rSum / count;
        const avgG = gSum / count;
        const avgB = bSum / count;
        setKeyColor(rgbToHex(avgR, avgG, avgB));
      }
    } catch {
      // Cross-origin fallback
    }
  }, []);

  // Automatic character / subject finder: computes centroid of high variance & skin tones
  const autoDetectSubjectAnchor = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    try {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;
      const frame = ctx.getImageData(0, 0, w, h);
      const data = frame.data;

      let weightX = 0;
      let weightY = 0;
      let totalWeight = 0;

      // Downsampled scan (step 8 for speed)
      for (let y = Math.floor(h * 0.15); y < Math.floor(h * 0.85); y += 8) {
        for (let x = Math.floor(w * 0.15); x < Math.floor(w * 0.85); x += 8) {
          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Score pixel based on variance from border/key color and skin presence
          let weight = 1;
          if (isSkinTone(r, g, b)) {
            weight += 8;
          }

          // Prioritize central vertical third for human figures
          const distFromCenter = Math.abs(x - w / 2) / (w / 2);
          weight *= Math.max(0.2, 1 - distFromCenter * 0.7);

          weightX += x * weight;
          weightY += y * weight;
          totalWeight += weight;
        }
      }

      if (totalWeight > 0) {
        const foundX = Math.max(0.2, Math.min(0.8, (weightX / totalWeight) / w));
        const foundY = Math.max(0.2, Math.min(0.8, (weightY / totalWeight) / h));
        setSubjectAnchor({ x: foundX, y: foundY });
        setIsSubjectDetected(true);
      }
    } catch {
      // Fallback
      setSubjectAnchor({ x: 0.5, y: 0.48 });
    }
  }, []);

  // Draw HUD overlay (Target Anchor & Character detection outline)
  const drawOverlay = useCallback(
    (w: number, h: number) => {
      const overlay = overlayCanvasRef.current;
      if (!overlay) return;
      overlay.width = w;
      overlay.height = h;
      const octx = overlay.getContext("2d");
      if (!octx) return;
      octx.clearRect(0, 0, w, h);

      if (removalMode === "subject-protect" && showContour) {
        const ax = subjectAnchor.x * w;
        const ay = subjectAnchor.y * h;
        const rad = (subjectProtectRadius / 100) * Math.min(w, h) * 0.42;

        // Soft glow ring around subject center
        octx.save();
        octx.strokeStyle = "rgba(16, 185, 129, 0.7)"; // Emerald neon
        octx.lineWidth = 2;
        octx.setLineDash([6, 6]);
        octx.beginPath();
        octx.ellipse(ax, ay, rad * 0.8, rad * 1.1, 0, 0, Math.PI * 2);
        octx.stroke();

        // Target Crosshair
        octx.setLineDash([]);
        octx.strokeStyle = "rgba(52, 211, 153, 0.9)";
        octx.fillStyle = "rgba(16, 185, 129, 0.25)";
        octx.lineWidth = 2;

        octx.beginPath();
        octx.arc(ax, ay, 12, 0, Math.PI * 2);
        octx.fill();
        octx.stroke();

        // Crosshair lines
        octx.beginPath();
        octx.moveTo(ax - 20, ay);
        octx.lineTo(ax - 14, ay);
        octx.moveTo(ax + 14, ay);
        octx.lineTo(ax + 20, ay);
        octx.moveTo(ax, ay - 20);
        octx.lineTo(ax, ay - 14);
        octx.moveTo(ax, ay + 14);
        octx.lineTo(ax, ay + 20);
        octx.stroke();

        // Text Badge
        octx.font = "bold 11px system-ui, sans-serif";
        octx.fillStyle = "rgba(6, 78, 59, 0.85)";
        const labelText = "👤 " + t.characterDetectedBadge;
        const textWidth = octx.measureText(labelText).width;
        const badgeX = Math.max(10, Math.min(w - textWidth - 24, ax - textWidth / 2 - 8));
        const badgeY = Math.max(24, ay - rad * 1.1 - 10);

        octx.beginPath();
        octx.roundRect(badgeX, badgeY - 14, textWidth + 16, 20, 6);
        octx.fill();
        octx.strokeStyle = "rgba(52, 211, 153, 0.9)";
        octx.stroke();

        octx.fillStyle = "#ffffff";
        octx.fillText(labelText, badgeX + 8, badgeY);

        octx.restore();
      }
    },
    [removalMode, showContour, subjectAnchor, subjectProtectRadius, t.characterDetectedBadge]
  );

  // Main Background Removal & Subject-Protection Processing Engine
  const processFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let sourceWidth = 512;
    let sourceHeight = 512;

    if (mediaType === "video" && videoRef.current) {
      const v = videoRef.current;
      if (v.videoWidth) {
        sourceWidth = v.videoWidth;
        sourceHeight = v.videoHeight;
      }
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      ctx.drawImage(v, 0, 0, sourceWidth, sourceHeight);
    } else if (mediaType === "image" && imageRef.current) {
      const img = imageRef.current;
      sourceWidth = img.naturalWidth || 512;
      sourceHeight = img.naturalHeight || 512;
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      ctx.drawImage(img, 0, 0, sourceWidth, sourceHeight);
    }

    try {
      const frame = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
      const data = frame.data;
      const targetRgb = hexToRgb(keyColor);
      const customBgRgb = hexToRgb(customBgColor);

      const edgeFactor = 1 - (edgeSensitivity - 50) * 0.005;
      const tolDist = (tolerance / 100) * 441.67 * edgeFactor;
      const smoothDist = (smoothing / 100) * 110;

      const totalPixels = sourceWidth * sourceHeight;

      if (removalMode === "subject-protect") {
        // =========================================================================
        // CƠ CHẾ XÁC ĐỊNH & BẢO VỆ NHÂN VẬT — CHỈ XÓA NỀN XUNG QUANH
        // 1. Flood-fill from the outer 4 borders inward.
        // 2. Character anchor protection zone.
        // 3. Human skin & internal tone safeguard.
        // =========================================================================

        const isOuterBg = new Uint8Array(totalPixels); // 0 = Keep/Subject, 1 = Outer Background, 2 = Feather Edge
        const visited = new Uint8Array(totalPixels);

        const anchorX = Math.round(subjectAnchor.x * sourceWidth);
        const anchorY = Math.round(subjectAnchor.y * sourceHeight);
        const protectRadPx = (subjectProtectRadius / 100) * Math.min(sourceWidth, sourceHeight) * 0.75;
        const protectRadSq = protectRadPx * protectRadPx;

        // BFS Queue for outer boundary flooding (using Int32Array for performance)
        const queue = new Int32Array(totalPixels);
        let head = 0;
        let tail = 0;

        // Helper to push coordinate
        const pushCoord = (x: number, y: number) => {
          const idx = y * sourceWidth + x;
          if (visited[idx] === 0) {
            visited[idx] = 1;
            queue[tail++] = idx;
          }
        };

        // Seed from all 4 borders (Top, Bottom, Left, Right)
        for (let x = 0; x < sourceWidth; x++) {
          pushCoord(x, 0);
          pushCoord(x, sourceHeight - 1);
        }
        for (let y = 0; y < sourceHeight; y++) {
          pushCoord(0, y);
          pushCoord(sourceWidth - 1, y);
        }

        // Flood-fill BFS loop
        while (head < tail) {
          const curr = queue[head++];
          const cx = curr % sourceWidth;
          const cy = Math.floor(curr / sourceWidth);
          const pIdx = curr * 4;

          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];

          // Check color distance to key/background
          const diffR = r - targetRgb.r;
          const diffG = g - targetRgb.g;
          const diffB = b - targetRgb.b;
          const dist = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

          // Check if inside subject anchor core
          const dxAnchor = cx - anchorX;
          const dyAnchor = cy - anchorY;
          const distToAnchorSq = dxAnchor * dxAnchor + dyAnchor * dyAnchor;
          const isInsideCoreSubject = distToAnchorSq < protectRadSq * 0.55;

          // Check skin safeguard
          const isSkin = skinToneSafeguard && isSkinTone(r, g, b);

          // Boundary condition: Do NOT flood if it's skin or inside core subject or exceeds tolerance
          if (isSkin || (isInsideCoreSubject && dist > tolDist * 0.65)) {
            // STOP flood fill — this pixel belongs to the character!
            continue;
          }

          if (dist <= tolDist) {
            // Definite outer background
            isOuterBg[curr] = 1;

            // Expand to 4-neighbors
            if (cx > 0) pushCoord(cx - 1, cy);
            if (cx < sourceWidth - 1) pushCoord(cx + 1, cy);
            if (cy > 0) pushCoord(cx, cy - 1);
            if (cy < sourceHeight - 1) pushCoord(cx, cy + 1);
          } else if (dist <= tolDist + smoothDist) {
            // Transition / feather zone along character silhouette
            isOuterBg[curr] = 2;
          }
        }

        // Apply background removal / replacement according to isOuterBg mask
        for (let i = 0; i < totalPixels; i++) {
          const p = i * 4;
          const bgState = isOuterBg[i];

          if (bgState === 1) {
            // Outer Background -> Replace / Transparent
            if (bgType === "transparent") {
              data[p + 3] = 0;
            } else if (bgType === "black") {
              data[p] = 0;
              data[p + 1] = 0;
              data[p + 2] = 0;
              data[p + 3] = 255;
            } else if (bgType === "white") {
              data[p] = 255;
              data[p + 1] = 255;
              data[p + 2] = 255;
              data[p + 3] = 255;
            } else if (bgType === "gradient") {
              const py = Math.floor(i / sourceWidth) / sourceHeight;
              data[p] = Math.min(255, Math.floor(25 + py * 50));
              data[p + 1] = Math.min(255, Math.floor(15 + py * 70));
              data[p + 2] = Math.min(255, Math.floor(70 + py * 120));
              data[p + 3] = 255;
            } else {
              data[p] = customBgRgb.r;
              data[p + 1] = customBgRgb.g;
              data[p + 2] = customBgRgb.b;
              data[p + 3] = 255;
            }
          } else if (bgState === 2 && smoothDist > 0) {
            // Smooth edge feathering
            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];
            const diffR = r - targetRgb.r;
            const diffG = g - targetRgb.g;
            const diffB = b - targetRgb.b;
            const dist = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);
            const factor = Math.max(0, Math.min(1, (dist - tolDist) / smoothDist));

            if (bgType === "transparent") {
              data[p + 3] = Math.floor(data[p + 3] * factor);
            } else {
              // Blend with replacement bg
              const bgR = bgType === "black" ? 0 : bgType === "white" ? 255 : customBgRgb.r;
              const bgG = bgType === "black" ? 0 : bgType === "white" ? 255 : customBgRgb.g;
              const bgB = bgType === "black" ? 0 : bgType === "white" ? 255 : customBgRgb.b;
              data[p] = Math.floor(r * factor + bgR * (1 - factor));
              data[p + 1] = Math.floor(g * factor + bgG * (1 - factor));
              data[p + 2] = Math.floor(b * factor + bgB * (1 - factor));
            }
          }
          // bgState === 0 -> Protected subject / person, keep original pixels 100%!
        }
      } else {
        // =========================================================================
        // CHROMA KEY TRADITIONAL MODE
        // =========================================================================
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const diffR = r - targetRgb.r;
          const diffG = g - targetRgb.g;
          const diffB = b - targetRgb.b;
          const dist = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

          if (dist < tolDist) {
            if (bgType === "transparent") {
              data[i + 3] = 0;
            } else if (bgType === "black") {
              data[i] = 0;
              data[i + 1] = 0;
              data[i + 2] = 0;
              data[i + 3] = 255;
            } else if (bgType === "white") {
              data[i] = 255;
              data[i + 1] = 255;
              data[i + 2] = 255;
              data[i + 3] = 255;
            } else if (bgType === "gradient") {
              const py = (i / 4 / sourceWidth) / sourceHeight;
              data[i] = Math.min(255, 30 + py * 40);
              data[i + 1] = Math.min(255, 20 + py * 60);
              data[i + 2] = Math.min(255, 60 + py * 100);
              data[i + 3] = 255;
            } else {
              data[i] = customBgRgb.r;
              data[i + 1] = customBgRgb.g;
              data[i + 2] = customBgRgb.b;
              data[i + 3] = 255;
            }
          } else if (dist < tolDist + smoothDist && smoothDist > 0) {
            const factor = (dist - tolDist) / smoothDist;
            if (bgType === "transparent") {
              data[i + 3] = Math.floor(data[i + 3] * factor);
            }
          }
        }
      }

      ctx.putImageData(frame, 0, 0);

      // Render HUD contour / overlay on secondary canvas if requested
      drawOverlay(sourceWidth, sourceHeight);
    } catch {
      // Ignore cross-origin error if any
    }
  }, [
    mediaType,
    removalMode,
    keyColor,
    tolerance,
    smoothing,
    bgType,
    customBgColor,
    subjectAnchor,
    subjectProtectRadius,
    edgeSensitivity,
    skinToneSafeguard,
    drawOverlay,
  ]);

  // Video processing animation loop
  useEffect(() => {
    if (mediaType === "video" && isPlaying) {
      const loop = () => {
        processFrame();
        animationFrameId.current = requestAnimationFrame(loop);
      };
      animationFrameId.current = requestAnimationFrame(loop);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [mediaType, isPlaying, processFrame]);

  // Initial render when image loads or settings change
  useEffect(() => {
    if (mediaType === "image") {
      processFrame();
    }
  }, [mediaUrl, mediaType, processFrame]);

  // Handle clicking on Canvas to set Subject Anchor pin or Pipette Key Color
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const normX = Math.max(0.05, Math.min(0.95, clickX / rect.width));
    const normY = Math.max(0.05, Math.min(0.95, clickY / rect.height));

    if (isPickingColor) {
      // Pick color at clicked location
      try {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const pixelX = Math.floor(normX * canvas.width);
          const pixelY = Math.floor(normY * canvas.height);
          const p = ctx.getImageData(pixelX, pixelY, 1, 1).data;
          setKeyColor(rgbToHex(p[0], p[1], p[2]));
          setIsPickingColor(false);
        }
      } catch {
        setIsPickingColor(false);
      }
    } else {
      // Pin subject anchor location
      setSubjectAnchor({ x: normX, y: normY });
      setIsSubjectDetected(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const isVid = file.type.startsWith("video/");
      setMediaType(isVid ? "video" : "image");
      setMediaUrl(url);
    }
  };

  const handleDownloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `tach_nen_nhan_vat_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Scissors className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground truncate">
              {t.bgRemoverTitle}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground break-words">
            {t.bgRemoverSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Badge
            variant="outline"
            className="hidden sm:inline-flex items-center gap-1.5 py-1 px-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Bảo Vệ Nhân Vật</span>
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToStudio}
            className="text-xs h-9"
          >
            {t.navStudio}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Media Display & Output Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-4 bg-card border-border/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  {t.result} ({bgType === "transparent" ? t.transparent : bgType.toUpperCase()})
                </Label>
                {removalMode === "subject-protect" && (
                  <Badge variant="secondary" className="text-[11px] font-normal gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    <UserCheck className="w-3 h-3 text-emerald-500" />
                    <span>{t.outerBgOnly}</span>
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 px-2.5 text-xs text-primary gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t.uploadFile}</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,.gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Interactive Canvas Container */}
            <div
              onClick={handleCanvasClick}
              className={`relative aspect-video rounded-xl overflow-hidden border border-border/50 flex items-center justify-center cursor-crosshair select-none ${
                isPickingColor ? "ring-2 ring-amber-500" : ""
              }`}
              style={{
                backgroundImage:
                  bgType === "transparent"
                    ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)"
                    : undefined,
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                backgroundColor: bgType === "transparent" ? "#f9fafb" : undefined,
              }}
              title={isPickingColor ? t.eyedropper : t.clickToSetSubject}
            >
              {/* Output Processed Canvas */}
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain"
              />

              {/* HUD / Contour Overlay Canvas */}
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />

              {/* Prompt on Hover for Clicking Character Location */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <span className="text-[10px] bg-background/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-border/40 text-muted-foreground flex items-center gap-1">
                  <Crosshair className="w-3 h-3 text-emerald-500" />
                  {isPickingColor ? "Nhấp vào ảnh để hút màu phông" : t.clickToSetSubject}
                </span>

                {isSubjectDetected && (
                  <span className="text-[10px] bg-emerald-500/90 text-white font-medium px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Đã khóa vị trí nhân vật ({Math.round(subjectAnchor.x * 100)}%, {Math.round(subjectAnchor.y * 100)}%)</span>
                  </span>
                )}
              </div>

              {/* Hidden sources */}
              {mediaType === "video" ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  crossOrigin="anonymous"
                  loop
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedData={processFrame}
                  className="hidden"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  ref={imageRef}
                  src={mediaUrl}
                  crossOrigin="anonymous"
                  alt="Source"
                  onLoad={processFrame}
                  className="hidden"
                />
              )}
            </div>

            {/* Video Control Bar if Media is Video */}
            {mediaType === "video" && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlaying) {
                        videoRef.current.pause();
                      } else {
                        videoRef.current.play();
                      }
                    }
                  }}
                  className="h-8 text-xs gap-1.5"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? "Tạm dừng" : "Phát Video để Tách Nền"}</span>
                </Button>
                <Badge variant="outline" className="text-xs">
                  {isPlaying ? "Đang xử lý Real-time" : "Sẵn sàng"}
                </Badge>
              </div>
            )}

            {/* Quick selector of generated images / videos */}
            <div className="space-y-2 pt-1 border-t border-border/40">
              <Label className="text-[11px] text-muted-foreground">
                {t.useSample}:
              </Label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {availableImages.map((img, idx) => (
                  <button
                    key={`img-${img.id || idx}`}
                    onClick={() => {
                      setMediaType("image");
                      setMediaUrl(img.url);
                    }}
                    className={`p-1.5 rounded-lg border text-left text-xs transition-all shrink-0 max-w-[140px] truncate ${
                      mediaUrl === img.url
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <ImageIcon className="w-3 h-3 inline mr-1 text-emerald-500" />
                    <span className="truncate">{img.prompt || `Ảnh #${idx + 1}`}</span>
                  </button>
                ))}

                {availableVideos.map((vid, idx) => (
                  <button
                    key={`vid-${vid.id || idx}`}
                    onClick={() => {
                      setMediaType("video");
                      setMediaUrl(vid.url);
                    }}
                    className={`p-1.5 rounded-lg border text-left text-xs transition-all shrink-0 max-w-[140px] truncate ${
                      mediaUrl === vid.url
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <VideoIcon className="w-3 h-3 inline mr-1 text-purple-500" />
                    <span className="truncate">{vid.prompt || `Video #${idx + 1}`}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: AI Subject Detection & Background Replacement Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 bg-card border-border/60 space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{t.subjectDetectionMode}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Khuyên dùng</span>
              </Label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl border border-border/60">
                <button
                  onClick={() => setRemovalMode("subject-protect")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                    removalMode === "subject-protect"
                      ? "bg-background text-foreground shadow-xs border border-border/80 font-semibold text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="truncate">Xác Định Nhân Vật</span>
                </button>
                <button
                  onClick={() => setRemovalMode("chroma-key")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                    removalMode === "chroma-key"
                      ? "bg-background text-foreground shadow-xs border border-border/80 font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="truncate">{t.modeChromaKey}</span>
                </button>
              </div>
            </div>

            {/* Subject Detection Controls (Visible in subject-protect mode) */}
            {removalMode === "subject-protect" && (
              <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Cơ Chế Bảo Vệ Nhân Vật
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={autoDetectSubjectAnchor}
                    className="h-7 px-2 text-[11px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>{t.autoDetectSubject}</span>
                  </Button>
                </div>

                {/* Safe Radius Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label className="text-[11px] text-muted-foreground font-medium">
                      {t.subjectProtectRadius}
                    </Label>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                      {subjectProtectRadius}%
                    </span>
                  </div>
                  <Slider
                    value={[subjectProtectRadius]}
                    min={15}
                    max={90}
                    step={1}
                    onValueChange={(val) => setSubjectProtectRadius(val[0])}
                  />
                </div>

                {/* Edge Sensitivity Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label className="text-[11px] text-muted-foreground font-medium">
                      {t.edgeSensitivity}
                    </Label>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                      {edgeSensitivity}%
                    </span>
                  </div>
                  <Slider
                    value={[edgeSensitivity]}
                    min={10}
                    max={90}
                    step={1}
                    onValueChange={(val) => setEdgeSensitivity(val[0])}
                  />
                </div>

                {/* Toggles: Skin tone safeguard & Show HUD outline */}
                <div className="space-y-2 pt-1 border-t border-emerald-500/15">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-foreground cursor-pointer flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{t.skinToneSafeguard}</span>
                    </Label>
                    <Switch
                      checked={skinToneSafeguard}
                      onCheckedChange={setSkinToneSafeguard}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-foreground cursor-pointer flex items-center gap-1.5">
                      {showContour ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <span>{t.showContour}</span>
                    </Label>
                    <Switch
                      checked={showContour}
                      onCheckedChange={setShowContour}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Background Color & Edge Sensitivity Section */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  {t.keyColor}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={autoSampleBorderColor}
                  className="h-6 px-2 text-[11px] text-primary gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.autoDetectBg}</span>
                </Button>
              </div>

              {/* Key Color Preset Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Trắng", color: "#FFFFFF", name: "white" },
                  { label: "Xanh lá", color: "#00FF00", name: "green" },
                  { label: "Đen", color: "#000000", name: "black" },
                  { label: "Xanh lam", color: "#0000FF", name: "blue" },
                ].map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setKeyColor(c.color)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      keyColor === c.color
                        ? "border-primary ring-2 ring-primary/40 bg-primary/5"
                        : "border-border/60 hover:bg-muted/50"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-border/60 shadow-xs"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-[10px] font-medium text-foreground">{c.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom Key Color Picker & Eyedropper */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20">
                <Button
                  size="sm"
                  variant={isPickingColor ? "default" : "outline"}
                  onClick={() => setIsPickingColor(!isPickingColor)}
                  className={`h-7 px-2.5 text-xs gap-1.5 ${
                    isPickingColor ? "bg-amber-500 hover:bg-amber-600 text-white" : ""
                  }`}
                >
                  <Pipette className="w-3.5 h-3.5" />
                  <span>{isPickingColor ? "Đang chọn..." : t.eyedropper}</span>
                </Button>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={keyColor}
                    onChange={(e) => setKeyColor(e.target.value)}
                    className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-muted-foreground uppercase">{keyColor}</span>
                </div>
              </div>

              {/* Sliders: Tolerance & Smoothing */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label className="font-medium text-xs">{t.tolerance}</Label>
                    <span className="text-muted-foreground font-mono">{tolerance}%</span>
                  </div>
                  <Slider
                    value={[tolerance]}
                    min={5}
                    max={85}
                    step={1}
                    onValueChange={(val) => setTolerance(val[0])}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label className="font-medium text-xs">{t.smoothing}</Label>
                    <span className="text-muted-foreground font-mono">{smoothing}%</span>
                  </div>
                  <Slider
                    value={[smoothing]}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={(val) => setSmoothing(val[0])}
                  />
                </div>
              </div>
            </div>

            {/* Replacement Background Selection */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <Label className="text-xs font-semibold">{t.newBackground}</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "transparent", label: "Trong suốt (PNG)", icon: "🏁" },
                  { id: "black", label: "Nền Đen Studio", icon: "⬛" },
                  { id: "white", label: "Nền Trắng Sạch", icon: "⬜" },
                  { id: "gradient", label: "Gradient Neon", icon: "✨" },
                  { id: "custom", label: "Màu Tự Chọn", icon: "🎨" },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBgType(b.id as "transparent" | "black" | "white" | "gradient" | "custom")}
                    className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                      bgType === b.id
                        ? "border-primary bg-primary/10 text-primary font-medium shadow-xs"
                        : "border-border/60 hover:bg-muted"
                    }`}
                  >
                    <span>{b.icon}</span>
                    <span className="truncate">{b.label}</span>
                  </button>
                ))}
              </div>

              {bgType === "custom" && (
                <div className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-muted/20">
                  <span className="text-xs text-muted-foreground">{t.customBg}:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-xs uppercase text-muted-foreground">{customBgColor}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Download Button */}
            <div className="pt-2">
              <Button
                onClick={handleDownloadResult}
                className="w-full h-10 text-xs font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                <span>{t.download} ({mediaType === "video" ? "Khung hình PNG" : "PNG Tách Nền"})</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
