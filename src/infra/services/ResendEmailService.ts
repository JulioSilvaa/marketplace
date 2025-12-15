import { Resend } from "resend";

import { IEmailService } from "../../core/services/IEmailService";
import { generatePasswordResetEmail } from "../templates/passwordResetEmail";

export class ResendEmailService implements IEmailService {
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY não está definida nas variáveis de ambiente");
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
    this.fromName = process.env.EMAIL_FROM_NAME || "Lazer";
  }

  async sendPasswordResetEmail(to: string, resetLink: string, userName: string): Promise<void> {
    try {
      const htmlContent = generatePasswordResetEmail(userName, resetLink);

      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [to],
        subject: "Redefinir sua senha - Lazer",
        html: htmlContent,
      });

      if (error) {
        console.error("Erro ao enviar email:", error);
        throw new Error(`Falha ao enviar email: ${error.message}`);
      }

      console.log(`Email de reset enviado com sucesso para ${to}. ID: ${data?.id}`);
    } catch (error) {
      console.error("Erro ao enviar email de reset de senha:", error);
      throw new Error("Não foi possível enviar o email de recuperação de senha");
    }
  }
}
