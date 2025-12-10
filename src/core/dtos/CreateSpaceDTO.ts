import { IAddress } from "../../types/Space";

export interface CreateSpaceDTO {
  owner_id: string;
  title: string;
  description: string;
  address: IAddress;
  capacity: number;
  price_per_weekend?: number;
  price_per_day?: number;
  comfort: string[];
  images: string[];
}
