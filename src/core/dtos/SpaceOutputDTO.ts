import { IAddress, spaceStatus } from "../../types/Space";

export interface SpaceOutputDTO {
  id: string;
  owner_id: string;
  category_name?: string;
  title: string;
  description: string;
  address: IAddress;
  capacity?: number;
  price_per_weekend?: number;
  price_per_day?: number;
  price?: number;
  price_type?: string;
  comfort: string[];
  specifications?: Record<string, any>;
  images: string[];
  status: spaceStatus;
  created_at?: string;
  updated_at?: string;
  average_rating?: number;
  reviews_count?: number;
  views_count?: number;
  contacts_count?: number;
  contact_whatsapp?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_instagram?: string;
  contact_facebook?: string;
  owner?: {
    name: string;
    phone?: string;
    whatsapp?: string;
    facebook_url?: string;
    instagram_url?: string;
    email?: string;
  };
}
