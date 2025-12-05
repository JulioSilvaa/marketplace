export enum spaceStatus {
  ATIVO,
  INATIVIO,
}

export type IEspace = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  address: object;
  capacity: number;
  price_per_weekend?: number;
  price_per_day?: number;
  comfort: object;
  images: string[];
  status: spaceStatus;
};
