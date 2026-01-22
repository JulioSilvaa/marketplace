import { IAddress } from "../../types/Space";

export interface CreateSpaceDTO {
  owner_id: string;
  title: string;
  description: string;
  address: IAddress;
  capacity: number;
  price_per_weekend?: number;
  price_per_day?: number;
  price_unit?: string;
  comfort: string[];
  images: string[];
  contact_whatsapp?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_instagram?: string;
  contact_facebook?: string;
  contact_whatsapp_alternative?: string;
}
