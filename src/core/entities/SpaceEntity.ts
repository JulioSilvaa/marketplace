import { IAddress, IEspace, spaceStatus } from "../../types/Space";

export class SpaceEntity {
  private readonly _id?: string;
  private readonly _owner_id: string;
  private readonly _category_id?: number;
  private readonly _category_name?: string;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _address: IAddress;
  private readonly _capacity?: number;
  private readonly _price_per_weekend?: number;
  private readonly _price_per_day?: number;
  private readonly _comfort: string[];
  private readonly _specifications?: Record<string, any>;
  private readonly _images: string[];
  private readonly _status: spaceStatus;
  private readonly _contact_whatsapp?: string;
  private readonly _contact_phone?: string;
  private readonly _contact_email?: string;
  private readonly _contact_instagram?: string;
  private readonly _contact_facebook?: string;
  private readonly _contact_whatsapp_alternative?: string;
  private readonly _created_at?: Date;
  private readonly _updated_at?: Date;

  constructor(props: IEspace) {
    this._id = props.id;
    this._owner_id = props.owner_id;
    this._category_id = props.category_id;
    this._category_name = props.category_name;
    this._title = props.title;
    this._description = props.description;
    this._address = props.address;
    this._capacity = props.capacity;
    this._price_per_weekend = props.price_per_weekend;
    this._price_per_day = props.price_per_day;
    this._comfort = props.comfort;
    this._specifications = props.specifications;
    this._images = props.images;
    this._status = props.status;
    this._contact_whatsapp = props.contact_whatsapp;
    this._contact_phone = props.contact_phone;
    this._contact_email = props.contact_email;
    this._contact_instagram = props.contact_instagram;
    this._contact_facebook = props.contact_facebook;
    this._contact_whatsapp_alternative = props.contact_whatsapp_alternative;
    this._created_at = props.created_at;
    this._updated_at = props.updated_at;
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

  public get category_id(): number | undefined {
    return this._category_id;
  }

  public get category_name(): string | undefined {
    return this._category_name;
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

  public get capacity(): number | undefined {
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

  public get specifications(): Record<string, any> | undefined {
    return this._specifications;
  }

  public get images(): string[] {
    return this._images;
  }

  public get status(): spaceStatus {
    return this._status;
  }

  public get contact_whatsapp(): string | undefined {
    return this._contact_whatsapp;
  }

  public get contact_phone(): string | undefined {
    return this._contact_phone;
  }

  public get contact_email(): string | undefined {
    return this._contact_email;
  }

  public get contact_instagram(): string | undefined {
    return this._contact_instagram;
  }

  public get contact_facebook(): string | undefined {
    return this._contact_facebook;
  }

  public get created_at(): Date | undefined {
    return this._created_at;
  }

  public get updated_at(): Date | undefined {
    return this._updated_at;
  }

  public get contact_whatsapp_alternative(): string | undefined {
    return this._contact_whatsapp_alternative;
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

    // Validação de CEP (Zipcode) - Sanitizar antes de validar para remover espaços
    const sanitizedZipcode = address.zipcode?.trim();
    const zipcodeRegex = /^\d{5}-?\d{3}$/;
    if (!sanitizedZipcode || !zipcodeRegex.test(sanitizedZipcode)) {
      throw new Error(
        "Endereço: O CEP (zipcode) é obrigatório e deve ser válido (ex: 12345-678 ou 12345678)."
      );
    }
  }

  private validateCapacity(): void {
    if (this._capacity === undefined || this._capacity === null) return;

    if (!Number.isInteger(this._capacity) || this._capacity <= 0) {
      throw new Error(
        "A capacidade (capacity) deve ser um número inteiro positivo maior que zero."
      );
    }

    if (this._capacity > 10000) {
      throw new Error("A capacidade máxima permitida é 10000.");
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

    if (this._images.length > 10) {
      throw new Error("Máximo de 10 imagens por espaço.");
    }

    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;

    for (const imageUrl of this._images) {
      // Validar como URL simples
      if (typeof imageUrl !== "string" || !urlRegex.test(imageUrl)) {
        throw new Error("Pelo menos um link de imagem fornecido não é um URL válido.");
      }
    }
  }

  private validateStatus(): void {
    const validStatuses: spaceStatus[] = ["active", "inactive"];
    if (!validStatuses.includes(this._status)) {
      throw new Error("O status do espaço é inválido. Use 'active' ou 'inactive'.");
    }
  }
}
