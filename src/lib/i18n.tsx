"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "vi" | "en";

export interface Translations {
  appTitle: string;
  appDescription: string;
  promptPlaceholder: string;
  generate: string;
  generating: string;
  image: string;
  images: string;
  video: string;
  videos: string;
  imageModels: string;
  videoModels: string;
  aspectRatio: string;
  imageSize: string;
  generationSettings: string;
  generationSettingsDesc: string;
  count: string;
  apiConfiguration: string;
  linkGcp: string;
  apiKeyHelp: string;
  darkMode: string;
  lightMode: string;
  language: string;
  vietnamese: string;
  english: string;
  welcomeTitle: string;
  welcomeDesc: string;
  remixIdeasTitle: string;
  remixIdeasDesc: string;
  remixIdea1: string;
  remixIdea2: string;
  remixIdea3: string;
  remixIdea4: string;
  download: string;
  expand: string;
  previous: string;
  next: string;
  sourceImage: string;
  prompt: string;
  generatedAt: string;
  timeJustNow: string;
  timeMinutesAgo: string;
  timeHoursAgo: string;
  timeDaysAgo: string;
  apiKeyDialogTitle: string;
  apiKeyDialogDesc1: string;
  apiKeyDialogDesc2: string;
  cancel: string;
  selectApiKey: string;
  learnMoreBilling: string;

  // Dashboard specific
  navStudio: string;
  navDashboard: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  totalGenerations: string;
  imagesGenerated: string;
  videosGenerated: string;
  successRate: string;
  avgGenTime: string;
  storageEstimate: string;
  modelBreakdown: string;
  recentActivity: string;
  promptInspiration: string;
  promptInspirationDesc: string;
  searchGenerations: string;
  filterAll: string;
  filterImages: string;
  filterVideos: string;
  exportData: string;
  usePrompt: string;
  noResults: string;
  promptLengthAvg: string;
  activeModels: string;
  categories: {
    scifi: string;
    nature: string;
    art: string;
    tech: string;
    anime: string;
  };

  // Video Converter
  navConverter: string;
  converterTitle: string;
  converterSubtitle: string;
  selectVideo: string;
  targetFormat: string;
  quality: string;
  convertNow: string;
  converting: string;
  convertedSuccess: string;
  extractAudio: string;
  makeGif: string;
  fps: string;
  duration: string;

  // Background Remover
  navBgRemover: string;
  bgRemoverTitle: string;
  bgRemoverSubtitle: string;
  selectMedia: string;
  keyColor: string;
  tolerance: string;
  smoothing: string;
  newBackground: string;
  transparent: string;
  greenScreen: string;
  blueScreen: string;
  whiteBg: string;
  blackBg: string;
  customBg: string;
  applyBgRemove: string;
  processing: string;
  original: string;
  result: string;
  uploadFile: string;
  useSample: string;
  eyedropper: string;
  subjectDetectionMode: string;
  modeSubjectProtect: string;
  modeChromaKey: string;
  subjectProtectRadius: string;
  protectForeground: string;
  autoDetectBg: string;
  showContour: string;
  subjectDetected: string;
  autoDetectSubject: string;
  clickToSetSubject: string;
  edgeSensitivity: string;
  skinToneSafeguard: string;
  outerBgOnly: string;
  characterDetectedBadge: string;

  // Image to Prompt Analyzer
  navPromptAnalyzer: string;
  promptAnalyzerTitle: string;
  promptAnalyzerSubtitle: string;
  uploadOrSelectImage: string;
  analyzingPrompt: string;
  analyzeImageBtn: string;
  masterPrompt: string;
  shortPrompt: string;
  subjectAndAction: string;
  artStyleAndMedium: string;
  lightingAndAtmosphere: string;
  cameraAndComposition: string;
  colorPalette: string;
  negativePrompt: string;
  copyPrompt: string;
  copied: string;
  useInStudio: string;
  midjourneyFormat: string;
  presetStyles: string;
  dragAndDropPromptImg: string;
  sampleImagesToAnalyze: string;
}

const translations: Record<Language, Translations> = {
  vi: {
    appTitle: "Studio Sáng Tạo Media AI",
    appDescription: "Tạo hình ảnh và video chất lượng cao từ mô tả văn bản với AI tiên tiến",
    promptPlaceholder: "Mô tả nội dung bạn muốn tạo với {model}...",
    generate: "Tạo Media",
    generating: "Đang tạo...",
    image: "Hình ảnh",
    images: "Hình ảnh",
    video: "Video",
    videos: "Video",
    imageModels: "Mô hình Hình ảnh",
    videoModels: "Mô hình Video",
    aspectRatio: "Tỷ lệ khung hình",
    imageSize: "Độ phân giải",
    generationSettings: "Cài đặt thông số",
    generationSettingsDesc: "Tùy chỉnh định dạng đầu ra cho hình ảnh & video",
    count: "Số lượng",
    apiConfiguration: "Cấu hình API",
    linkGcp: "Liên kết dự án Google Cloud",
    apiKeyHelp: "Cần thiết cho các mô hình Veo và Nano Banana Pro.",
    darkMode: "Giao diện tối",
    lightMode: "Giao diện sáng",
    language: "Ngôn ngữ",
    vietnamese: "Tiếng Việt",
    english: "English",
    welcomeTitle: "Chào mừng đến với AI Media Studio",
    welcomeDesc: "Khởi tạo tác phẩm nghệ thuật, ảnh minh họa và video sống động từ mô tả bằng trí tuệ nhân tạo.",
    remixIdeasTitle: "Gợi ý nâng cấp hệ thống",
    remixIdeasDesc: "Các tính năng sẵn sàng mở rộng:",
    remixIdea1: "Kho lưu trữ thư viện các tác phẩm yêu thích",
    remixIdea2: "Bộ lọc phong cách (Cyberpunk, Màu nước, Điện ảnh, Anime)",
    remixIdea3: "Chỉnh sửa crop và áp dụng filter trước khi tạo video",
    remixIdea4: "Lưu lịch sử đồng bộ đa thiết bị",
    download: "Tải xuống",
    expand: "Phóng to",
    previous: "Trước",
    next: "Tiếp",
    sourceImage: "Ảnh nguồn",
    prompt: "Câu lệnh mô tả (Prompt)",
    generatedAt: "Khởi tạo lúc",
    timeJustNow: "Vừa xong",
    timeMinutesAgo: "phút trước",
    timeHoursAgo: "giờ trước",
    timeDaysAgo: "ngày trước",
    apiKeyDialogTitle: "Yêu cầu khóa API",
    apiKeyDialogDesc1: "Mô hình bạn đã chọn cần có API Key từ dự án Google Cloud có bật thanh toán.",
    apiKeyDialogDesc2: "Vui lòng chọn khóa API dự án Google Cloud để tiếp tục trải nghiệm.",
    cancel: "Hủy bỏ",
    selectApiKey: "Chọn khóa API",
    learnMoreBilling: "Tìm hiểu thêm về chính sách giá Gemini API",

    // Dashboard
    navStudio: "Studio Tạo Media",
    navDashboard: "Bảng Điều Khiển (Dashboard)",
    dashboardTitle: "Tổng Quan Hoạt Động & Thống Kê",
    dashboardSubtitle: "Theo dõi chỉ số sáng tạo, quản lý kho media và khám phá các prompt thịnh hành",
    totalGenerations: "Tổng lượt tạo",
    imagesGenerated: "Ảnh đã xuất",
    videosGenerated: "Video đã xuất",
    successRate: "Tỷ lệ thành công",
    avgGenTime: "Thời gian TB",
    storageEstimate: "Dung lượng ước tính",
    modelBreakdown: "Phân bổ theo mô hình",
    recentActivity: "Lịch sử tác phẩm gần đây",
    promptInspiration: "Kho Ý Tưởng Prompt Đề Xuất",
    promptInspirationDesc: "Bấm vào để đưa trực tiếp vào studio và tạo ngay",
    searchGenerations: "Tìm kiếm theo từ khóa prompt...",
    filterAll: "Tất cả Media",
    filterImages: "Chỉ Hình ảnh",
    filterVideos: "Chỉ Video",
    exportData: "Xuất dữ liệu (JSON)",
    usePrompt: "Sử dụng prompt này",
    noResults: "Không tìm thấy nội dung phù hợp với từ khóa",
    promptLengthAvg: "Độ dài prompt TB",
    activeModels: "Mô hình khả dụng",
    categories: {
      scifi: "Khoa học Viễn tưởng",
      nature: "Thiên nhiên & Phong cảnh",
      art: "Nghệ thuật & Hội họa",
      tech: "Công nghệ & Tương lai",
      anime: "Hoạt hình & 3D Anime",
    },

    // Video Converter
    navConverter: "Đổi Định Dạng Video",
    converterTitle: "Chuyển Đổi Định Dạng Video",
    converterSubtitle: "Chuyển video sang MP4, WebM, GIF động hoặc tách âm thanh MP3/WAV trực tiếp trên trình duyệt",
    selectVideo: "Chọn Video cần chuyển",
    targetFormat: "Định dạng chuyển đổi mục tiêu",
    quality: "Độ phân giải",
    convertNow: "Chuyển đổi ngay",
    converting: "Đang xử lý chuyển đổi video...",
    convertedSuccess: "Chuyển đổi thành công! Sẵn sàng tải về",
    extractAudio: "Tách âm thanh (MP3 / WAV)",
    makeGif: "Tạo GIF động",
    fps: "Tốc độ khung hình (FPS)",
    duration: "Thời lượng",

    // Background Remover
    navBgRemover: "Xóa Nền Media",
    bgRemoverTitle: "Tách & Xóa Nền AI (Video, Ảnh, GIF)",
    bgRemoverSubtitle: "Tách nền chuyên nghiệp cho Video, Hình ảnh và GIF bằng công nghệ Chroma Key & AI Edge Detection",
    selectMedia: "Chọn Media (Video, Ảnh, GIF)",
    keyColor: "Màu phông cần xóa",
    tolerance: "Độ nhạy tách màu",
    smoothing: "Làm mượt biên viền",
    newBackground: "Phông nền mới",
    transparent: "Trong suốt (Checkerboard)",
    greenScreen: "Phông Xanh (Green Screen)",
    blueScreen: "Phông Lam (Blue Screen)",
    whiteBg: "Nền Trắng Studio",
    blackBg: "Nền Đen Huyền Bí",
    customBg: "Màu Tự Chọn",
    applyBgRemove: "Tiến hành Tách Nền",
    processing: "Đang xử lý tách phông nền...",
    original: "Media Gốc",
    result: "Kết quả Tách Nền",
    uploadFile: "Tải file từ máy tính",
    useSample: "Chọn từ danh sách đã tạo",
    eyedropper: "Hút màu từ màn hình",
    subjectDetectionMode: "Cơ Chế Xác Định Nhân Vật & Tách Nền",
    modeSubjectProtect: "Tự Động Xác Định Nhân Vật (Chỉ xóa nền xung quanh)",
    modeChromaKey: "Tách Phông Màu (Chroma Key)",
    subjectProtectRadius: "Bán kính bảo vệ trung tâm nhân vật",
    protectForeground: "Khóa bảo vệ chủ thể (Không xóa màu bên trong người)",
    autoDetectBg: "Tự động phân tích màu nền từ 4 cạnh viền",
    showContour: "Hiển thị khung viền nhận diện nhân vật",
    subjectDetected: "Đã phân tích & xác định nhân vật thành công!",
    autoDetectSubject: "Tự Động Quét Tìm Nhân Vật",
    clickToSetSubject: "Nhấp vào ảnh để ghim vị trí nhân vật",
    edgeSensitivity: "Độ nhạy biên viền nhân vật",
    skinToneSafeguard: "Bảo vệ màu da & nhân dạng người",
    outerBgOnly: "Chỉ xóa nền xung quanh (Giữ nguyên bên trong người)",
    characterDetectedBadge: "Đã Khóa Mục Tiêu Nhân Vật",

    // Phân tích prompt từ hình ảnh
    navPromptAnalyzer: "Phân Tích Prompt Ảnh",
    promptAnalyzerTitle: "Trích Xuất & Phân Tích Prompt Từ Hình Ảnh",
    promptAnalyzerSubtitle: "Tải lên hoặc đính kèm ảnh bất kỳ để AI phân tích chi tiết phong cách, ánh sáng, góc máy và dịch ngược thành Prompt tối ưu cho Midjourney, SDXL, Flux, DALL-E",
    uploadOrSelectImage: "Đính kèm hoặc tải ảnh lên để giải mã Prompt",
    analyzingPrompt: "Đang giải mã phong cách nghệ thuật, ánh sáng, màu sắc & bố cục...",
    analyzeImageBtn: "Phân Tích Prompt Bằng AI",
    masterPrompt: "Master Prompt Chi Tiết (Tối Ưu Cho Tạo Ảnh)",
    shortPrompt: "Prompt Rút Gọn (Quick Prompt)",
    subjectAndAction: "Chủ Thể & Hành Động Chính",
    artStyleAndMedium: "Phong Cách Nghệ Thuật & Chất Liệu",
    lightingAndAtmosphere: "Ánh Sáng & Không Khí Bối Cảnh",
    cameraAndComposition: "Góc Chụp & Tiêu Cự Camera",
    colorPalette: "Bảng Màu Chủ Đạo",
    negativePrompt: "Negative Prompt (Loại Trừ Khuyết Điểm)",
    copyPrompt: "Sao Chép Prompt",
    copied: "Đã sao chép vào bộ nhớ tạm!",
    useInStudio: "Đưa Prompt Vào Studio Tạo Media",
    midjourneyFormat: "Định Dạng Chuẩn Midjourney v6",
    presetStyles: "Thẻ Từ Khóa Phong Cách (Style Tags)",
    dragAndDropPromptImg: "Kéo & thả file ảnh vào đây, hoặc nhấn để chọn ảnh",
    sampleImagesToAnalyze: "Hoặc chọn nhanh ảnh mẫu có sẵn bên dưới",
  },
  en: {
    appTitle: "AI Media Studio",
    appDescription: "Generate high-quality AI images and videos from text prompts with state-of-the-art models",
    promptPlaceholder: "Describe what you want to create with {model}...",
    generate: "Generate",
    generating: "Generating...",
    image: "Image",
    images: "Images",
    video: "Video",
    videos: "Videos",
    imageModels: "Image Models",
    videoModels: "Video Models",
    aspectRatio: "Aspect Ratio",
    imageSize: "Image Resolution",
    generationSettings: "Generation Settings",
    generationSettingsDesc: "Customize your media output format and size",
    count: "Count",
    apiConfiguration: "API Configuration",
    linkGcp: "Link Google Cloud Project",
    apiKeyHelp: "Required for Veo and Nano Banana Pro models.",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    language: "Language",
    vietnamese: "Tiếng Việt",
    english: "English",
    welcomeTitle: "Welcome to AI Media Studio",
    welcomeDesc: "Generate AI-powered images and videos from text prompts. Customize this studio to build your media app.",
    remixIdeasTitle: "App Remix Ideas",
    remixIdeasDesc: "Here are some ways you could expand this app template:",
    remixIdea1: "Add a gallery view to save your favorite generations",
    remixIdea2: "Implement style presets (e.g., Cyberpunk, Watercolor, Photorealistic)",
    remixIdea3: "Add an image editor to crop or apply filters before animating",
    remixIdea4: "Connect to database to save generation history across sessions",
    download: "Download",
    expand: "Expand",
    previous: "Previous",
    next: "Next",
    sourceImage: "Source Image",
    prompt: "Prompt",
    generatedAt: "Generated at",
    timeJustNow: "Just now",
    timeMinutesAgo: "m ago",
    timeHoursAgo: "h ago",
    timeDaysAgo: "d ago",
    apiKeyDialogTitle: "API Key Required",
    apiKeyDialogDesc1: "The model you selected requires a paid Google Cloud API key.",
    apiKeyDialogDesc2: "Please select your API key from a paid Google Cloud project to continue.",
    cancel: "Cancel",
    selectApiKey: "Select API Key",
    learnMoreBilling: "Learn more about Gemini API billing and pricing",

    // Dashboard
    navStudio: "Creation Studio",
    navDashboard: "Analytics Dashboard",
    dashboardTitle: "Analytics & Creative Overview",
    dashboardSubtitle: "Track creation performance metrics, browse media archives, and explore trending prompts",
    totalGenerations: "Total Runs",
    imagesGenerated: "Images Output",
    videosGenerated: "Videos Output",
    successRate: "Success Rate",
    avgGenTime: "Avg Time",
    storageEstimate: "Estimated Storage",
    modelBreakdown: "Model Distribution",
    recentActivity: "Recent Generations Archive",
    promptInspiration: "Prompt Inspiration Library",
    promptInspirationDesc: "Click any prompt to instantly load it into the Studio",
    searchGenerations: "Search generations by prompt keyword...",
    filterAll: "All Media",
    filterImages: "Images Only",
    filterVideos: "Videos Only",
    exportData: "Export JSON",
    usePrompt: "Use this prompt",
    noResults: "No generations match your search filter",
    promptLengthAvg: "Avg Prompt Length",
    activeModels: "Active Models",
    categories: {
      scifi: "Sci-Fi & Cyberpunk",
      nature: "Nature & Landscapes",
      art: "Fine Art & Concept",
      tech: "Tech & Vehicles",
      anime: "Anime & 3D Style",
    },

    // Video Converter
    navConverter: "Video Converter",
    converterTitle: "Video Format Converter",
    converterSubtitle: "Convert videos to MP4, WebM, animated GIF, or extract MP3 audio directly in-browser",
    selectVideo: "Select Video to Convert",
    targetFormat: "Target Output Format",
    quality: "Resolution Quality",
    convertNow: "Convert Now",
    converting: "Converting video...",
    convertedSuccess: "Conversion completed! Ready to download",
    extractAudio: "Extract Audio (MP3 / WAV)",
    makeGif: "Make Animated GIF",
    fps: "Frame Rate (FPS)",
    duration: "Duration",

    // Background Remover
    navBgRemover: "Background Remover",
    bgRemoverTitle: "AI Background Remover (Video, Image, GIF)",
    bgRemoverSubtitle: "Professional background separation for Video, Images and GIF with Chroma Key and AI edge detection",
    selectMedia: "Select Media (Video, Image, GIF)",
    keyColor: "Background Color to Remove",
    tolerance: "Color Tolerance",
    smoothing: "Edge Smoothing",
    newBackground: "Replacement Background",
    transparent: "Transparent (Checkerboard)",
    greenScreen: "Green Screen",
    blueScreen: "Blue Screen",
    whiteBg: "Studio White",
    blackBg: "Pure Black",
    customBg: "Custom Color",
    applyBgRemove: "Remove Background",
    processing: "Removing background...",
    original: "Original Media",
    result: "Extracted Result",
    uploadFile: "Upload from Computer",
    useSample: "Choose from Generated Media",
    eyedropper: "Eyedropper Color Picker",
    subjectDetectionMode: "Subject Detection & Masking Mode",
    modeSubjectProtect: "Subject AI Detection (Keep Character, Erase Surrounding Only)",
    modeChromaKey: "Chroma Key (Color Filter)",
    subjectProtectRadius: "Central Subject Safe Radius",
    protectForeground: "Foreground Protection (Prevent internal holes)",
    autoDetectBg: "Auto-detect background from outer borders",
    showContour: "Show subject detection outline",
    subjectDetected: "Subject successfully detected!",
    autoDetectSubject: "Auto Detect Character Position",
    clickToSetSubject: "Click on image to pin character location",
    edgeSensitivity: "Edge Boundary Sensitivity",
    skinToneSafeguard: "Protect Skin & Facial Tone",
    outerBgOnly: "Erase Surrounding Background Only (Protect Inner Subject)",
    characterDetectedBadge: "Character Locked",

    // Image to Prompt Analyzer
    navPromptAnalyzer: "Image to Prompt",
    promptAnalyzerTitle: "Reverse Image to Prompt Engineering",
    promptAnalyzerSubtitle: "Upload or attach any image to deconstruct its art style, lighting, composition, and generate optimized prompts for Midjourney, SDXL, Flux, DALL-E",
    uploadOrSelectImage: "Attach or upload an image to decode prompt",
    analyzingPrompt: "Decoding art style, lighting, colors & composition...",
    analyzeImageBtn: "Analyze Prompt with AI",
    masterPrompt: "Detailed Master Prompt (Optimized for GenAI)",
    shortPrompt: "Concise / Quick Prompt",
    subjectAndAction: "Main Subject & Action",
    artStyleAndMedium: "Art Style & Medium",
    lightingAndAtmosphere: "Lighting & Ambient Atmosphere",
    cameraAndComposition: "Camera Shot & Composition",
    colorPalette: "Dominant Color Palette",
    negativePrompt: "Negative Prompt (Exclusions)",
    copyPrompt: "Copy Prompt",
    copied: "Copied to clipboard!",
    useInStudio: "Send Prompt to Media Studio",
    midjourneyFormat: "Midjourney v6 Ready Format",
    presetStyles: "Style Keywords / Tags",
    dragAndDropPromptImg: "Drag & drop image file here, or click to browse",
    sampleImagesToAnalyze: "Or pick a sample image below to test",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "vi",
  setLanguage: () => {},
  t: translations.vi,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("vi");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ai-media-language") as Language | null;
      if (saved === "vi" || saved === "en") {
        setLanguageState(saved);
      }
    } catch {
      // localStorage fallback
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("ai-media-language", lang);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
