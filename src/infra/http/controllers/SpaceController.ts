/* eslint-disable no-undef */
import { Request, Response } from "express";

import { SpaceAdapter } from "../../adapters/SpaceAdapter";
import { SpaceUseCaseFactory } from "../../factories/SpaceUseCaseFactory";

class SpaceController {
  async add(req: Request, res: Response) {
    try {
      // user_id vem do token JWT (AuthMiddleware)
      const owner_id = req.user_id;

      if (!owner_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Processar imagens se houver
      const imageUrls: string[] = [];

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        // Validar limite de 10 imagens por espaço
        if (req.files.length > 10) {
          return res.status(400).json({
            message: "Máximo de 10 imagens por espaço",
          });
        }

        const { SharpImageService } = await import("../../services/SharpImageService");
        const { SupabaseStorageService } = await import("../../services/SupabaseStorageService");

        const imageService = new SharpImageService();
        const storageService = new SupabaseStorageService();
        const BUCKET_NAME = "space-images";

        // Sanitizar título do espaço para usar como nome da pasta
        const sanitizedTitle = req.body.title
          ? req.body.title.replace(/[^a-zA-Z0-9-_]/g, "_").toLowerCase()
          : `space_${Date.now()}`;

        for (const file of req.files as Express.Multer.File[]) {
          // Validar e processar imagem
          await imageService.validateImage(file.buffer, file.mimetype);
          const processed = await imageService.processImage(file.buffer, file.originalname);

          // Gerar nome único
          const timestamp = Date.now();
          const baseName = file.originalname.replace(/\.[^/.]+$/, "");
          const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
          const uniqueName = `${timestamp}_${sanitizedName}`;

          // Estrutura de pastas: spaces/{owner_id}/{space_title}/
          const basePath = `spaces/${owner_id}/${sanitizedTitle}`;

          // Upload dos 3 tamanhos
          const [thumbnailUrl, mediumUrl, largeUrl] = await Promise.all([
            storageService.uploadImage(
              BUCKET_NAME,
              `${basePath}/thumb_${uniqueName}.webp`,
              processed.thumbnail,
              "image/webp"
            ),
            storageService.uploadImage(
              BUCKET_NAME,
              `${basePath}/medium_${uniqueName}.webp`,
              processed.medium,
              "image/webp"
            ),
            storageService.uploadImage(
              BUCKET_NAME,
              `${basePath}/large_${uniqueName}.webp`,
              processed.large,
              "image/webp"
            ),
          ]);

          // Salvar objeto com os 3 tamanhos
          imageUrls.push(
            JSON.stringify({
              thumbnail: thumbnailUrl,
              medium: mediumUrl,
              large: largeUrl,
            })
          );
        }
      }

      // Parsear dados do formulário
      let spaceData = req.body;

      // Se vier como string (multipart/form-data), fazer parse
      if (typeof spaceData.address === "string") {
        spaceData.address = JSON.parse(spaceData.address);
      }
      if (typeof spaceData.comfort === "string") {
        spaceData.comfort = JSON.parse(spaceData.comfort);
      }
      if (typeof spaceData.price_per_day === "string") {
        spaceData.price_per_day = parseFloat(spaceData.price_per_day);
      }
      if (typeof spaceData.price_per_weekend === "string") {
        spaceData.price_per_weekend = parseFloat(spaceData.price_per_weekend);
      }
      if (typeof spaceData.capacity === "string") {
        spaceData.capacity = parseInt(spaceData.capacity);
      }

      const createSpace = SpaceUseCaseFactory.makeCreateSpace();
      const space = await createSpace.execute({
        ...spaceData,
        owner_id,
        images: imageUrls.length > 0 ? imageUrls : spaceData.images || [],
      });

      const output = SpaceAdapter.toOutputDTO(space);

      return res.status(201).json({
        message: "Espaço criado com sucesso",
        data: output,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao criar espaço" });
    }
  }

  async getSpaces(req: Request, res: Response) {
    try {
      const { owner_id } = req.query;

      // Se owner_id for fornecido, filtra por proprietário
      if (owner_id && typeof owner_id === "string") {
        const listSpaces = SpaceUseCaseFactory.makeListSpaces();
        const spaces = await listSpaces.executeByOwner({ owner_id });
        const output = SpaceAdapter.toListOutputDTO(spaces);
        return res.status(200).json(output);
      }

      // Caso contrário, lista todos os espaços
      const findAllSpaces = SpaceUseCaseFactory.makeFindAllSpaces();
      const spaces = await findAllSpaces.execute();
      const output = SpaceAdapter.toListOutputDTO(spaces);
      return res.status(200).json(output);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao listar espaços" });
    }
  }

  async getAllSpaces(req: Request, res: Response) {
    try {
      const findAllSpaces = SpaceUseCaseFactory.makeFindAllSpaces();
      const spaces = await findAllSpaces.execute();

      const output = SpaceAdapter.toListOutputDTO(spaces);

      return res.status(200).json(output);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao listar espaços" });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const findByIdSpace = SpaceUseCaseFactory.makeFindByIdSpace();
      const space = await findByIdSpace.execute(id);

      if (!space) {
        return res.status(404).json({ message: "Espaço não encontrado" });
      }

      const output = SpaceAdapter.toOutputDTO(space);

      return res.status(200).json({ data: output });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao buscar espaço" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // owner_id vem do token JWT (AuthMiddleware)
      const owner_id = req.user_id;

      if (!owner_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const updateSpace = SpaceUseCaseFactory.makeUpdateSpace();
      await updateSpace.execute({ id, owner_id, ...req.body });

      return res.status(200).json({ message: "Espaço atualizado com sucesso" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao atualizar espaço" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // owner_id vem do token JWT (AuthMiddleware)
      const owner_id = req.user_id;

      if (!owner_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const deleteSpace = SpaceUseCaseFactory.makeDeleteSpace();
      await deleteSpace.execute({ id, owner_id });

      return res.status(200).json({ message: "Espaço excluído com sucesso" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro ao excluir espaço" });
    }
  }
}

export default new SpaceController();
