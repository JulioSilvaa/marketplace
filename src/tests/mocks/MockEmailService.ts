import { IEmailService } from "../../core/services/IEmailService";

export class MockEmailService implements IEmailService {
  public sentEmails: Array<{ to: string; resetLink: string; userName: string }> = [];

  async sendPasswordResetEmail(to: string, resetLink: string, userName: string): Promise<void> {
    // Armazenar email enviado para verificação nos testes
    this.sentEmails.push({ to, resetLink, userName });
  }

  // Método auxiliar para limpar emails enviados entre testes
  clear(): void {
    this.sentEmails = [];
  }
}
