export class UserQuery {
  constructor(private _email: string) {}

  get email(): string {
    return this._email;
  }
}
