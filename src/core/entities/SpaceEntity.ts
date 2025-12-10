import { IAddress, IEspace, spaceStatus } from "../../types/Space";

export class SpaceEntity {
  private readonly _id?: string;
  private readonly _owner_id: string;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _address: IAddress;
  private readonly _capacity: number;
  private readonly _price_per_weekend?: number;
  private readonly _price_per_day?: number;
  private readonly _comfort: string[];
  private readonly _images: string[];
  private readonly _status: spaceStatus;

  constructor(props: IEspace) {
    this._id = props.id;
    this._owner_id = props.owner_id;
    this._title = props.title;
    this._description = props.description;
    this._address = props.address;
    this._capacity = props.capacity;
    this._price_per_weekend = props.price_per_weekend;
    this._price_per_day = props.price_per_day;
    this._comfort = props.comfort;
    this._images = props.images;
    this._status = props.status;
    this.validate();
  }

  static create(props: IEspace): SpaceEntity {
    return new SpaceEntity(props);
  }

  public get id(): string | undefined {
    return this._id;
  }

  public get owner_id(): string {
    return this._owner_id;
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string {
    return this._description;
  }

  public get address(): IAddress {
    return this._address;
  }

  public get capacity(): number {
    return this._capacity;
  }

  public get price_per_weekend(): number | undefined {
    return this._price_per_weekend;
  }

  public get price_per_day(): number | undefined {
    return this._price_per_day;
  }

  public get comfort(): string[] {
    return this._comfort;
  }

  public get images(): string[] {
    return this._images;
  }

  public get status(): spaceStatus {
    return this._status;
  }

  public validate(): void {
    this.validateOwnerID();
    this.validateTitle();
    this.validateDescription();
    this.validateAddress();
    this.validateCapacity();
    this.validatePrices();
    this.validateComforts();
    this.validateImages();
    this.validateStatus();
  }

  private validateOwnerID(): void {
    if (!this._owner_id || typeof this._owner_id !== "string") {
      throw new Error("ID do proprietário (owner_id) é obrigatório e deve ser uma string.");
    }
    // TODO: Adicionar validação de formato de UUID/ObjectId, se aplicável.
  }

  private validateTitle(): void {
    if (!this._title || this._title.length < 6 || this._title.length > 100) {
      throw new Error(`O título deve ter entre 6 e 100 caracteres`);
    }
  }

  private validateDescription(): void {
    if (!this._description || this._description.length < 20 || this._description.length > 1000) {
      throw new Error(
        `A descrição é obrigatória e deve ter entre 20 e 1000 caracteres. (Atual: ${this._description.length})`
      );
    }
  }

  private validateAddress(): void {
    const address = this._address;

    if (!address || typeof address !== "object") {
      throw new Error("O objeto endereço é inválido ou não foi fornecido.");
    }

    // Validação de Campos Obrigatórios
    if (!address.street) throw new Error("Endereço: A rua (street) é obrigatória.");
    if (!address.number) throw new Error("Endereço: O número (number) é obrigatório.");
    if (!address.neighborhood) throw new Error("Endereço: O bairro (neighborhood) é obrigatório.");
    if (!address.city) throw new Error("Endereço: A cidade (city) é obrigatória.");
    if (!address.country) throw new Error("Endereço: O país (country) é obrigatório.");

    // Validação de Estado (State)
    if (!address.state || address.state.length !== 2) {
      throw new Error("Endereço: O estado (state) é obrigatório e deve ter 2 caracteres (ex: UF).");
    }

    // Validação de CEP (Zipcode) - Exemplo de formato brasileiro (8 dígitos opcionais com hífen)
    const zipcodeRegex = /^\d{5}-?\d{3}$/;
    if (!address.zipcode || !zipcodeRegex.test(address.zipcode)) {
      throw new Error(
        "Endereço: O CEP (zipcode) é obrigatório e deve ser válido (ex: 12345-678 ou 12345678)."
      );
    }
  }

  private validateCapacity(): void {
    if (!Number.isInteger(this._capacity) || this._capacity <= 0) {
      throw new Error(
        "A capacidade (capacity) deve ser um número inteiro positivo maior que zero."
      );
    }

    if (this._capacity > 1000) {
      throw new Error("A capacidade máxima permitida é 1000.");
    }
  }

  private validatePrices(): void {
    const priceWeekend = this._price_per_weekend;
    const priceDay = this._price_per_day;

    if (priceWeekend !== undefined && (typeof priceWeekend !== "number" || priceWeekend < 0)) {
      throw new Error(
        "O preço por fim de semana (price_per_weekend) deve ser um número não negativo."
      );
    }

    if (priceDay !== undefined && (typeof priceDay !== "number" || priceDay < 0)) {
      throw new Error("O preço por dia (price_per_day) deve ser um número não negativo.");
    }

    if (priceWeekend === undefined && priceDay === undefined) {
      throw new Error(
        "Pelo menos o preço por fim de semana ou o preço por dia deve ser fornecido."
      );
    }
  }

  private validateComforts(): void {
    if (!Array.isArray(this._comfort) || this._comfort.length === 0) {
      throw new Error("É necessário listar pelo menos um item de conforto.");
    }
    if (this._comfort.some(c => !c || c.trim() === "")) {
      throw new Error("Os itens de conforto não podem ser vazios.");
    }
  }

  private validateImages(): void {
    if (!Array.isArray(this._images) || this._images.length === 0) {
      throw new Error("É necessário fornecer pelo menos uma imagem.");
    }

    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (this._images.some(url => !urlRegex.test(url))) {
      throw new Error("Pelo menos um link de imagem fornecido não é um URL válido.");
    }
  }

  private validateStatus(): void {
    const validStatuses = Object.values(spaceStatus).filter(v => typeof v === "number");
    if (!validStatuses.includes(this._status)) {
      throw new Error("O status do espaço é inválido.");
    }
  }
}
