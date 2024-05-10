export class UserQuery {
  constructor(
    private _id?: string,
    private _email?: string,
  ) {}

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }
}
