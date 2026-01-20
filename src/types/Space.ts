export type spaceStatus = "active" | "inactive" | "suspended" | "deleted";

export type IAddress = {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
};

export type IEspace = {
  id?: string;
  owner_id: string;
  category_id?: number;
  category_name?: string;
  title: string;
  description: string;
  address: IAddress;
  capacity?: number;
  price_per_weekend?: number;
  price_per_day?: number;
  comfort: string[];
  specifications?: Record<string, any>;
  images: string[];
  type?: "SPACE" | "SERVICE" | "EQUIPMENT";
  status: spaceStatus;
  contact_whatsapp?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_instagram?: string;
  contact_facebook?: string;
  contact_whatsapp_alternative?: string;
  created_at?: Date;
  updated_at?: Date;
};
