import Transaction from '#models/transaction'
import { AddressUuid } from '#models/address'

export interface TransactionDto
  extends Pick<Transaction, 'id' | 'hash' | 'addressId' | 'amount' | 'time'> {}

export class TransactionsService {
  async getAll({
    addressId,
    limit = 20,
    page = 1,
  }: {
    addressId: AddressUuid
    limit?: number | undefined
    page?: number | undefined
  }): Promise<TransactionDto[]> {
    const result = await Transaction.query()
      .where('addressId', addressId)
      .limit(limit)
      .paginate(page)
    const transactions = result.serialize().data as TransactionDto[]
    return transactions
  }
}
