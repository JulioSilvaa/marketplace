import { IUser, UserRole } from "../../types/user";

export class UserEntity {
  private readonly _id?: string;
  private readonly _email: string;
  private readonly _nome: string;
  private readonly _telefone: string;
  private readonly _tipo: UserRole;
  private readonly _verificado: boolean;
  private readonly _password: string;
  private readonly _isActive: boolean;

  constructor(private props: IUser) {
    this._id = props.id;
    this._email = props.email;
    this._nome = props.nome;
    this._telefone = props.telefone;
    this._tipo = props.tipo;
    this._verificado = props.verificado;
    this._password = props.password;
    this._isActive = props.isActive;
    this.validate();
  }

  static create(props: IUser): UserEntity {
    return new UserEntity(props);
  }

  private validate(): void {
    this.validateName();
    this.validateEmail();
    this.validatePassword();
    this.validateRole();
  }

  private validateName(): void {
    if (!this._nome || this._nome.trim().length === 0) {
      throw new Error("Nome é Obrigatorio");
    }

    if (this._nome.trim().length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }
  }

  private validateEmail(): void {
    if (!this._email || this._email.trim().length === 0) {
      throw new Error("Email é obrigatório");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._email)) {
      throw new Error("Email inválido");
    }
  }

  private validatePassword(): void {
    if (!this._password || this._password.trim().length === 0) {
      throw new Error("Senha é obrigatória");
    }

    if (this._password.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres");
    }
  }

  private validateRole(): void {
    if (!Object.values(UserRole).includes(this._tipo)) {
      throw new Error("Role inválida");
    }
  }

  isAdmin(): boolean {
    return this._tipo === UserRole.proprietario;
  }

  isClient(): boolean {
    return this._tipo === UserRole.cliente;
  }

  get id(): string | undefined {
    return this._id;
  }

  get name(): string {
    return this._nome;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get role(): UserRole {
    return this._tipo;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  public setPassword(hashedPassword: string): void {
    (this as any)._password = hashedPassword;
  }
}
