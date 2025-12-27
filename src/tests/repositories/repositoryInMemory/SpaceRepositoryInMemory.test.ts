import { beforeEach, describe, expect, it } from "vitest";

import { SpaceEntity } from "../../../core/entities/SpaceEntity";
import { SpaceRepositoryInMemory } from "../../../infra/repositories/inMemory/SpaceRepositoryInMemory";

describe("SpaceRepositoryInMemory", () => {
  let repository: SpaceRepositoryInMemory;

  const createMockSpace = (id: string, owner_id: string = "owner-1"): SpaceEntity => {
    return SpaceEntity.create({
      id,
      owner_id,
      title: `Espaço de Teste ${id}`,
      description: "Um lugar maravilhoso para testes com ótimas comodidades",
      address: {
        street: "Rua de Teste",
        number: "123",
        neighborhood: "Bairro Teste",
        city: "Cidade Teste",
        state: "TS",
        country: "País Teste",
        zipcode: "12345-678",
      },
      capacity: 50,
      price_per_day: 100,
      comfort: ["Wifi", "Piscina"],
      images: ["http://example.com/image.jpg"],
      status: "active",
    });
  };

  beforeEach(() => {
    repository = new SpaceRepositoryInMemory();
  });

  describe("create", () => {
    it("Deveria criar e retornar um espaço", async () => {
      const space = createMockSpace("space-1");

      const result = await repository.create(space);

      expect(result).toBe(space);
      expect(repository.spaces).toHaveLength(1);
      expect(repository.spaces[0]).toBe(space);
    });

    it("Deveria adicionar múltiplos espaços", async () => {
      const space1 = createMockSpace("space-1");
      const space2 = createMockSpace("space-2");

      await repository.create(space1);
      await repository.create(space2);

      expect(repository.spaces).toHaveLength(2);
    });
  });

  describe("findById", () => {
    it("Deveria encontrar um espaço por id", async () => {
      const space = createMockSpace("space-1");
      await repository.create(space);

      const result = await repository.findById("space-1");

      expect(result).toBe(space);
    });

    it("Deveria retornar null quando o espaço não for encontrado", async () => {
      const result = await repository.findById("id-inexistente");

      expect(result).toBeNull();
    });
  });

  describe("listByOwnerId", () => {
    it("Deveria listar espaços por id do proprietário", async () => {
      const space1 = createMockSpace("space-1", "owner-1");
      const space2 = createMockSpace("space-2", "owner-1");
      const space3 = createMockSpace("space-3", "owner-2");

      await repository.create(space1);
      await repository.create(space2);
      await repository.create(space3);

      const result = await repository.listByOwnerId("owner-1");

      expect(result).toHaveLength(2);
      expect(result).toContain(space1);
      expect(result).toContain(space2);
      expect(result).not.toContain(space3);
    });

    it("Deveria retornar array vazio quando o proprietário não tiver espaços", async () => {
      const result = await repository.listByOwnerId("owner-inexistente");

      expect(result).toEqual([]);
    });
  });

  describe("findAll", () => {
    it("Deveria retornar todos os espaços", async () => {
      const space1 = createMockSpace("space-1");
      const space2 = createMockSpace("space-2");

      await repository.create(space1);
      await repository.create(space2);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result).toContain(space1);
      expect(result).toContain(space2);
    });

    it("Deveria retornar array vazio quando não existirem espaços", async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    it("Deveria atualizar um espaço existente", async () => {
      const space = createMockSpace("space-1");
      await repository.create(space);

      const updatedSpace = SpaceEntity.create({
        id: "space-1",
        owner_id: "owner-1",
        title: "Título Atualizado",
        description: "Descrição atualizada com novas informações para testes",
        address: {
          street: "Rua Atualizada",
          number: "456",
          neighborhood: "Bairro Atualizado",
          city: "Cidade Atualizada",
          state: "US",
          country: "País Atualizado",
          zipcode: "98765-432",
        },
        capacity: 100,
        price_per_day: 200,
        comfort: ["Wifi", "Piscina", "Academia"],
        images: ["http://example.com/updated.jpg"],
        status: "active",
      });

      await repository.update(updatedSpace);

      const result = await repository.findById("space-1");
      expect(result).toBe(updatedSpace);
      expect(result?.title).toBe("Título Atualizado");
      expect(result?.capacity).toBe(100);
    });

    it("Não deveria fazer nada ao atualizar um espaço inexistente", async () => {
      const space = createMockSpace("id-inexistente");

      await repository.update(space);

      expect(repository.spaces).toHaveLength(0);
    });
  });

  describe("delete", () => {
    it("Deveria fazer soft delete marcando status como inactive", async () => {
      const space = createMockSpace("space-1");
      await repository.create(space);

      expect(repository.spaces).toHaveLength(1);

      await repository.delete("space-1");

      // Soft delete: o espaço ainda existe mas com status inactive
      expect(repository.spaces).toHaveLength(1);
      const result = await repository.findById("space-1");
      expect(result).toBeDefined();
      expect(result?.status).toBe("inactive");
    });

    it("Não deveria fazer nada ao deletar um espaço inexistente", async () => {
      const space = createMockSpace("space-1");
      await repository.create(space);

      expect(repository.spaces).toHaveLength(1);

      // Isso deve cobrir o caso de borda onde o id não é encontrado
      await repository.delete("id-inexistente");

      // O espaço ainda deve existir
      expect(repository.spaces).toHaveLength(1);
      const result = await repository.findById("space-1");
      expect(result).toBe(space);
    });

    it("Deveria fazer soft delete apenas do espaço especificado", async () => {
      const space1 = createMockSpace("space-1");
      const space2 = createMockSpace("space-2");
      await repository.create(space1);
      await repository.create(space2);

      await repository.delete("space-1");

      // Ambos os espaços ainda existem
      expect(repository.spaces).toHaveLength(2);
      // Mas apenas space-1 tem status inactive
      const deletedSpace = await repository.findById("space-1");
      expect(deletedSpace?.status).toBe("inactive");
      const activeSpace = await repository.findById("space-2");
      expect(activeSpace?.status).toBe("active");
    });
  });
});
