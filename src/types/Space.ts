export type spaceStatus = "active" | "inactive";

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
  title: string;
  description: string;
  address: IAddress;
  capacity: number;
  price_per_weekend?: number;
  price_per_day?: number;
  comfort: string[];
  images: string[];
  status: spaceStatus;
  created_at?: Date;
  updated_at?: Date;
};
