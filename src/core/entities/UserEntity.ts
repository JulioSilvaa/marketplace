import { IUser, UserIsActive, UserRole } from "../../types/user";

export class UserEntity {
  private readonly _id?: string;
  private readonly _email: string;
  private readonly _name: string;
  private readonly _phone: string;
  private readonly _role: UserRole;
  private readonly _checked: boolean;
  private readonly _password: string;
  private readonly _status: UserIsActive;

  constructor(private props: IUser) {
    this._id = props.id;
    this._email = props.email;
    this._name = props.name;
    this._phone = props.phone;
    this._role = props.role;
    this._checked = props.checked;
    this._password = props.password;
    this._status = props.status;
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
    this.validatePhone();
  }

  private validateName(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error("Nome é Obrigatorio");
    }

    if (this.name.trim().length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }
  }

  private validatePhone(): void {
    if (!this._phone || this._phone.trim().length === 0) {
      throw new Error("Telefone é obrigatório");
    }

    const digits = this._phone.replace(/\D/g, "");

    const phoneRegex = /^(\d{10,11})$/;

    if (!phoneRegex.test(digits)) {
      throw new Error("Telefone inválido");
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
    if (!Object.values(UserRole).includes(this._role)) {
      throw new Error("Role inválida");
    }
  }

  isAdmin(): boolean {
    return this._role === UserRole.PROPRIETARIO;
  }

  isClient(): boolean {
    return this._role === UserRole.CLIENTE;
  }

  isActive(): boolean {
    return this._status === UserIsActive.ATIVO;
  }

  isInactive(): boolean {
    return this._status === UserIsActive.INATIVO;
  }

  get id(): string | undefined {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get role(): UserRole {
    return this._role;
  }

  get status(): UserIsActive {
    return this._status;
  }

  get phone(): string {
    return this._phone;
  }

  get checked(): boolean {
    return this._checked;
  }

  public setPassword(hashedPassword: string): void {
    (this as any)._password = hashedPassword;
  }
}
