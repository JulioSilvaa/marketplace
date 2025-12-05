import { IEspace, spaceStatus } from "../../types/Espace";

export class SpaceEntity {
  private readonly _id?: string;
  private readonly _owner_id: string;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _address: object;
  private readonly _capacity: number;
  private readonly _price_per_weekend?: number;
  private readonly _price_per_day?: number;
  private readonly _comfort: object;
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

  private validate() {
    this.validateOwnerID();
    this.validadeTitle();
  }

  private validateOwnerID() {
    if (!this._owner_id) {
      throw new Error("ID do proprietário é necessário");
    }
  }

  private validadeTitle() {
    if (!this._title || this._title.trim().length === 0) {
      throw new Error(" Titulo é necessário");
    }
  }
  // TODO Adicionar validações depois
}
