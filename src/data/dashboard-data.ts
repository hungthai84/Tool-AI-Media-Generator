export interface PromptInspirationItem {
  id: string;
  category: "scifi" | "nature" | "art" | "tech" | "anime";
  promptVi: string;
  promptEn: string;
  recommendedModel: string;
  type: "image" | "video";
  aspectRatio: string;
  tags: string[];
}

export const PROMPT_INSPIRATIONS: PromptInspirationItem[] = [
  {
    id: "insp-1",
    category: "tech",
    promptVi: "Chiếc xe đua công thức 1 phong cách tương lai lướt trên đường đua đêm phát sáng neon, hiệu ứng vệt sáng tốc độ cực đại, 8k",
    promptEn: "a race car formula 1 style in a highspeed track, futuristic neon night lighting, cinematic motion blur, 8k",
    recommendedModel: "gemini-2.5-flash-image",
    type: "image",
    aspectRatio: "16:9",
    tags: ["F1", "Cyberpunk", "Speed", "Neon"],
  },
  {
    id: "insp-2",
    category: "art",
    promptVi: "Chiến binh băng tuyết oai vệ trong bộ giáp xanh lam phát sáng đứng giữa cơn bão tuyết hùng vĩ, phong cách hội họa điện ảnh",
    promptEn: "A majestic ice warrior in blue armor standing in a snowy landscape, intricate crystalline details, cinematic lighting",
    recommendedModel: "gemini-3-pro-image-preview",
    type: "image",
    aspectRatio: "1:1",
    tags: ["Warrior", "Fantasy", "Ice", "Cinematic"],
  },
  {
    id: "insp-3",
    category: "nature",
    promptVi: "Cảnh hoàng hôn rực rỡ chiếu qua thác nước kỳ vĩ giữa rừng rậm nguyên sinh nhiệt đới, cầu vồng phản chiếu trên mặt hồ pha lê",
    promptEn: "Golden hour sunset piercing through a magnificent tropical waterfall in primeval jungle, rainbow reflecting on crystal water, ultra realistic",
    recommendedModel: "imagen-4.0-generate-001",
    type: "image",
    aspectRatio: "16:9",
    tags: ["Nature", "Waterfall", "Sunset", "Landscape"],
  },
  {
    id: "insp-4",
    category: "scifi",
    promptVi: "Thành phố trôi nổi lơ lửng trên mây với các phi thuyền không gian qua lại, kiến trúc kính sinh thái hiện đại, ánh sáng ban mai",
    promptEn: "Floating futuristic eco-city above the clouds with soaring starships, glass solarpunk architecture, golden dawn light",
    recommendedModel: "gemini-2.5-flash-image",
    type: "image",
    aspectRatio: "16:9",
    tags: ["Sci-Fi", "SkyCity", "Solarpunk"],
  },
  {
    id: "insp-5",
    category: "anime",
    promptVi: "Nhân vật nữ hiệp sĩ phong cách anime hiện đại đứng trên đỉnh tòa tháp nhìn xuống đô thị Tokyo về đêm lung linh ánh đèn",
    promptEn: "Anime style cyberpunk knight standing on skyscraper rooftop overlooking glittering Tokyo night skyline, soft anime aesthetic",
    recommendedModel: "gemini-3-pro-image-preview",
    type: "image",
    aspectRatio: "9:16",
    tags: ["Anime", "Tokyo", "Cyberpunk", "Rooftop"],
  },
  {
    id: "insp-6",
    category: "art",
    promptVi: "Bức tranh sơn dầu cổ điển vẽ một chú mèo quý tộc mặc trang phục hoàng gia thế kỷ 18, ánh sáng Rembrandt cổ điển",
    promptEn: "Classical oil painting of a distinguished royal cat wearing 18th century velvet regal attire, dramatic Rembrandt lighting",
    recommendedModel: "imagen-4.0-generate-001",
    type: "image",
    aspectRatio: "1:1",
    tags: ["OilPainting", "Cat", "Vintage", "Royal"],
  },
];

export interface DashboardMetric {
  id: string;
  labelKey: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  iconName: string;
  gradient: string;
}
