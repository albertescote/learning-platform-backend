import { InternalServerErrorException } from '../../../app/api/exceptions/internalServerErrorException';

export class NotAbleToExecuteUserDbTransactionException extends InternalServerErrorException {
  constructor(action: string) {
    super(`We have not been able to execute your transaction: ${action}`);
  }
}
