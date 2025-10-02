export type BannerType = "image" | "html" | "text";
export type BannerPosition =
  | "header"
  | "sidebar"
  | "footer"
  | "between_ads"
  | "category_page"
  | "ad_detail";

export interface PublicBanner {
  id: number;
  title: string;
  banner_type: BannerType;
  image?: string;
  html_content?: string;
  text_content?: string;
  position: BannerPosition;
  click_url?: string;
  open_new_tab: boolean;
  priority: number;
}

export interface BannerListParams {
  position?: BannerPosition;
  state?: string;
  category?: number;
}
