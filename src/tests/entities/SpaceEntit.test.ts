import { describe, expect, it } from "vitest";

import { SpaceEntity } from "../../core/entities/SpaceEntity";
import { IEspace, spaceStatus } from "../../types/Espace";

const mockValidSpaceProps: IEspace = {
  id: "sgdfgdfgdgf",
  owner_id: "valid-owner-id-123",
  title: "Sala de Reunião Central",
  description: "Espaço moderno e bem iluminado.",
  address: { street: "Rua Exemplo", number: 100 },
  capacity: 10,
  price_per_day: 150,
  comfort: { wifi: true, projector: true },
  images: ["image1.jpg", "image2.jpg"],
  status: spaceStatus.ATIVO,
};

describe("SpaceEntity", () => {
  it("deve criar uma instância de SpaceEntity com propriedades válidas", () => {
    const space = SpaceEntity.create(mockValidSpaceProps);

    expect(space).toBeInstanceOf(SpaceEntity);
  });

  describe("Validação: ID do Proprietário (owner_id)", () => {
    it("deve lançar um erro se 'owner_id' estiver faltando ou for vazio", () => {
      expect(() =>
        SpaceEntity.create({
          ...mockValidSpaceProps,
          owner_id: undefined as any,
        })
      ).toThrow("ID do proprietário é necessário");

      expect(() => SpaceEntity.create({ ...mockValidSpaceProps, owner_id: "" })).toThrow(
        "ID do proprietário é necessário"
      );
    });

    // Teste 3: owner_id válido
    it("não deve lançar erro se 'owner_id' for fornecido", () => {
      expect(() =>
        SpaceEntity.create({
          ...mockValidSpaceProps,
          owner_id: "outro-id-valido",
        })
      ).not.toThrow();
    });
  });

  describe("Validação: Título (title)", () => {
    it("deve lançar um erro se 'title' for uma string vazia", () => {
      expect(() => SpaceEntity.create({ ...mockValidSpaceProps, title: "" })).toThrow(
        "Titulo é necessário"
      );
    });

    it("deve lançar um erro se 'title' for undefined", () => {
      expect(() => SpaceEntity.create({ ...mockValidSpaceProps, title: undefined as any })).toThrow(
        "Titulo é necessário"
      );
    });

    it("deve lançar um erro se 'title' contiver apenas espaços em branco", () => {
      expect(() => SpaceEntity.create({ ...mockValidSpaceProps, title: "     " })).toThrow(
        " Titulo é necessário"
      );
    });
  });

  describe("TODO: Adicionar outras validações", () => {
    it.skip("deve lançar um erro se 'capacity' for menor que 1", () => {
      expect(() => SpaceEntity.create({ ...mockValidSpaceProps, capacity: 0 })).toThrow(
        "A capacidade deve ser no mínimo 1."
      );
    });

    it.skip("deve lançar um erro se 'images' for um array vazio", () => {
      expect(() => SpaceEntity.create({ ...mockValidSpaceProps, images: [] })).toThrow(
        "Pelo menos uma imagem é necessária."
      );
    });
  });
});
