import { ISubscription, SubscriptionStatus } from "../../types/Subscription";

export class SubscriptionEntity {
  private readonly _id?: string;
  private readonly _user_id: string;
  private _plan: string;
  private _price: number;
  private _status: SubscriptionStatus;
  private readonly _trial_until?: Date;
  private _next_billing_date?: Date;
  private readonly _created_at: Date;
  private _updated_at: Date;

  constructor(props: ISubscription) {
    this._id = props.id;
    this._user_id = props.user_id;
    this._plan = props.plan || "basic";
    this._price = props.price === undefined || props.price === null ? 30.0 : props.price;
    this._status = props.status || SubscriptionStatus.TRIAL;
    this._trial_until = props.trial_until;
    this._next_billing_date = props.next_billing_date;
    this._created_at = props.created_at || new Date();
    this._updated_at = props.updated_at || new Date();

    this.validate();
  }

  static create(props: ISubscription): SubscriptionEntity {
    return new SubscriptionEntity(props);
  }

  public get id(): string | undefined {
    return this._id;
  }

  public get user_id(): string {
    return this._user_id;
  }

  public get plan(): string {
    return this._plan;
  }

  public get price(): number {
    return this._price;
  }

  public get status(): SubscriptionStatus {
    return this._status;
  }

  public get trial_until(): Date | undefined {
    return this._trial_until;
  }

  public get next_billing_date(): Date | undefined {
    return this._next_billing_date;
  }

  public get created_at(): Date {
    return this._created_at;
  }

  public get updated_at(): Date {
    return this._updated_at;
  }

  public activate(): void {
    if (
      this._status === SubscriptionStatus.TRIAL ||
      this._status === SubscriptionStatus.SUSPENDED
    ) {
      this._status = SubscriptionStatus.ACTIVE;
      this._updated_at = new Date();
      // Lógica adicional, como agendar a primeira cobrança
    } else {
      throw new Error(`Não é possível ativar a assinatura no status atual: ${this._status}`);
    }
  }

  public suspend(): void {
    const invalidStatuses = [
      SubscriptionStatus.CANCELLED,
      SubscriptionStatus.TRIAL,
      // Adicione outros status onde a suspensão não faz sentido, se houver.
    ];

    if (invalidStatuses.includes(this._status)) {
      throw new Error(`Não é possível suspender a assinatura no status atual: ${this._status}`);
    }

    // A transição real
    if (this._status !== SubscriptionStatus.SUSPENDED) {
      this._status = SubscriptionStatus.SUSPENDED;
      this._updated_at = new Date();
    }
  }

  public updateBillingDate(newDate: Date): void {
    const now = new Date();

    // Regra de Validação
    if (newDate <= now) {
      throw new Error("A próxima data de cobrança deve ser uma data futura à data atual.");
    }

    this._next_billing_date = newDate;
    this._updated_at = new Date();
  }

  public changePlan(newPlan: string, newPrice: number): void {
    this._plan = newPlan;
    this._price = newPrice;
    this.validate();
    this._updated_at = new Date();
  }

  public validate(): void {
    this.validateUserId();
    this.validatePlan();
    this.validatePrice();
    // A validação de status já é tratada pelo Enum no construtor
  }

  private validateUserId(): void {
    if (!this._user_id || typeof this._user_id !== "string") {
      throw new Error("ID do usuário (user_id) é obrigatório.");
    }
  }

  private validatePlan(): void {
    if (!this._plan || this._plan.length < 3) {
      throw new Error("O nome do plano deve ser fornecido e ter pelo menos 3 caracteres.");
    }
    // Opcional: Validar se o plano existe em uma lista de planos válidos
  }

  private validatePrice(): void {
    if (typeof this._price !== "number" || this._price <= 0) {
      throw new Error("O preço deve ser um valor numérico positivo.");
    }
  }
}
