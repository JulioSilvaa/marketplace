import { UserOutputDTO } from "./UserOutputDTO";

export interface LoginResponseDTO {
  accessToken: string;
  user: UserOutputDTO;
}
