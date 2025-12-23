export interface IReviewReplyProps {
  id?: string;
  review_id: string;
  listing_id: string;
  owner_user_id: string;
  reply_text: string;
  created_at?: Date;
  updated_at?: Date;
}

export class ReviewReplyEntity {
  private constructor(public readonly props: IReviewReplyProps) {}

  static create(props: IReviewReplyProps): ReviewReplyEntity {
    return new ReviewReplyEntity({
      ...props,
      created_at: props.created_at || new Date(),
      updated_at: props.updated_at || new Date(),
    });
  }

  get id() {
    return this.props.id;
  }
  get review_id() {
    return this.props.review_id;
  }
  get listing_id() {
    return this.props.listing_id;
  }
  get owner_user_id() {
    return this.props.owner_user_id;
  }
  get reply_text() {
    return this.props.reply_text;
  }
  get created_at() {
    return this.props.created_at;
  }
  get updated_at() {
    return this.props.updated_at;
  }
}
