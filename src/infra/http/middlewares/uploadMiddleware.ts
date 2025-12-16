import type { NextFunction, Request, Response } from "express";
import multer from "multer";

// Configuração do Multer
const upload = multer({
  storage: multer.memoryStorage(), // Armazena em memória para processar com Sharp
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por arquivo
    files: 10, // Máximo 10 arquivos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Formato inválido. Apenas JPEG, PNG e WebP são permitidos."));
    }
  },
});

// Middleware para upload de múltiplas imagens com tratamento de erros
export const uploadImages = (req: Request, res: Response, next: NextFunction) => {
  const uploadHandler = upload.array("images", 10);

  uploadHandler(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      // Erros do Multer
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "Arquivo muito grande. O tamanho máximo é 5MB por imagem.",
        });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          error: "Muitos arquivos. O máximo é 10 imagens por upload.",
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          error: "Campo de arquivo inesperado. Use o campo 'images'.",
        });
      }
      // Outros erros do Multer
      return res.status(400).json({
        error: `Erro no upload: ${err.message}`,
      });
    } else if (err) {
      // Erros customizados (ex: formato inválido)
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      return res.status(400).json({
        error: errorMessage,
      });
    }

    // Sem erros, continuar
    next();
  });
};
