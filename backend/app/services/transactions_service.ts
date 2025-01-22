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
    const paginatedTransactions = await Transaction.query()
      .where('addressId', addressId)
      .orderBy('time', 'desc')
      .limit(limit)
      .paginate(page)
    console.log({ page })
    const transactions = paginatedTransactions.serialize().data as TransactionDto[]
    return transactions
  }
}
