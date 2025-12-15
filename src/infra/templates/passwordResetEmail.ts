export function generatePasswordResetEmail(userName: string, resetLink: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - Lazer</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🏡 Lazer</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Redefinir sua senha</h2>
              
              <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Olá <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 16px; color: #718096; font-size: 14px; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:
              </p>
              
              <p style="margin: 0 0 24px; padding: 12px; background-color: #f7fafc; border-radius: 4px; color: #4a5568; font-size: 14px; word-break: break-all;">
                ${resetLink}
              </p>
              
              <!-- Warning Box -->
              <div style="margin: 24px 0; padding: 16px; background-color: #fff5f5; border-left: 4px solid #f56565; border-radius: 4px;">
                <p style="margin: 0 0 8px; color: #c53030; font-size: 14px; font-weight: 600;">
                  ⏰ Este link expira em 1 hora
                </p>
                <p style="margin: 0; color: #742a2a; font-size: 14px; line-height: 1.5;">
                  Por motivos de segurança, este link só pode ser usado uma vez e expira em 60 minutos.
                </p>
              </div>
              
              <p style="margin: 24px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Se você não solicitou a redefinição de senha, pode ignorar este email com segurança. Sua senha não será alterada.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #718096; font-size: 12px; line-height: 1.5; text-align: center;">
                Este é um email automático, por favor não responda.
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.5; text-align: center;">
                © ${new Date().getFullYear()} Lazer - Marketplace de Espaços para Eventos
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
