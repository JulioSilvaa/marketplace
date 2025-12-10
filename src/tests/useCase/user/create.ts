import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { CreateUser } from "../../../core/useCases/users/Create";
import { UserEntity } from "../../../core/entities/UserEntity";

describe("CreateUser UseCase", () => {
  let mockRepo: any;
  let useCase: CreateUser;

  beforeEach(() => {
    mockRepo = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };

    useCase = new CreateUser(mockRepo);
  });

  it("deve lançar erro se o email já existir", async () => {
    mockRepo.findByEmail.mockResolvedValue({
      id: "1",
      email: "teste@email.com",
    });

    await expect(
      useCase.execute({
        email: "teste@email.com",
        password: "123456",
        name: "Teste",
        phone: "1234567890",
      })
    ).rejects.toThrow("email already exists");
  });

  it("deve criar usuário e hashear senha corretamente", async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    const setPasswordMock = vi.fn();
    vi.spyOn(UserEntity, "create").mockReturnValue({
      setPassword: setPasswordMock,
    } as any);

    // Mock do bcrypt.hash
    vi.spyOn(bcrypt, "hash").mockResolvedValue();

    const input = {
      email: "novo@teste.com",
      password: "senha123",
      name: "Novo",
      phone: "0987654321",
    };
    await useCase.execute(input);

    expect(UserEntity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: input.email,
        password: input.password,
      })
    );

    expect(bcrypt.hash).toHaveBeenCalledWith("senha123", 10);

    expect(setPasswordMock).toHaveBeenCalledWith("hashed123");
  });
});
