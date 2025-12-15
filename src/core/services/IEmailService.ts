export interface IEmailService {
  sendPasswordResetEmail(to: string, resetLink: string, userName: string): Promise<void>;
}
