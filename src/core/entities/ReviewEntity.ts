export interface IReviewProps {
  id?: string;
  space_id: string;
  user_id?: string;
  reviewer_name?: string;
  rating: number;
  comment: string;
  created_at?: Date;
}

export class ReviewEntity {
  private constructor(public readonly props: IReviewProps) {}

  static create(props: IReviewProps): ReviewEntity {
    return new ReviewEntity({
      ...props,
      created_at: props.created_at || new Date(),
    });
  }

  get id() {
    return this.props.id;
  }
  get space_id() {
    return this.props.space_id;
  }
  get user_id() {
    return this.props.user_id;
  }
  get rating() {
    return this.props.rating;
  }
  get comment() {
    return this.props.comment;
  }
  get created_at() {
    return this.props.created_at;
  }
}
