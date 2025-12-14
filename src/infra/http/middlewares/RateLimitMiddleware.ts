import rateLimit from "express-rate-limit";

/**
 * Rate Limiting Global
 * Limita requisições gerais para prevenir abuso da API
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo de 100 requisições por IP
  message: {
    error: "Muitas requisições deste IP, tente novamente mais tarde.",
  },
  standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
});

/**
 * Rate Limiting para Login
 * Proteção contra ataques de força bruta
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo de 5 tentativas de login
  message: {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Conta requisições bem-sucedidas também
});

/**
 * Rate Limiting para Registro
 * Previne criação massiva de contas
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo de 3 registros por IP por hora
  message: {
    error: "Muitas tentativas de registro. Tente novamente em 1 hora.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiting para Refresh Token
 * Previne abuso do endpoint de renovação
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo de 10 renovações
  message: {
    error: "Muitas tentativas de renovação de token. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiting para Forgot Password
 * Previne spam de emails de recuperação
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo de 3 solicitações por hora
  message: {
    error: "Muitas solicitações de recuperação de senha. Tente novamente em 1 hora.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiting para Reset Password
 * Previne tentativas massivas de reset
 */
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo de 5 tentativas
  message: {
    error: "Muitas tentativas de redefinição de senha. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
