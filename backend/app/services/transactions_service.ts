import Transaction from '#models/transaction'
import { AddressUuid } from '#models/address'

export class TransactionsService {
  async getAll({
    addressId,
    limit = 2,
    offset = 0,
  }: {
    addressId: AddressUuid
    limit: number | undefined
    offset: number | undefined
  }): Promise<Transaction[]> {
    return Transaction.query().where('addressId', addressId).limit(limit).offset(offset)
  }
}
