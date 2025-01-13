import Address, { AddressUuid } from '#models/address'
import AddressAlreadyExistsException from '#exceptions/address_already_exists_exception'
import Transaction from '#models/transaction'
import { DateTime } from 'luxon'

export type BlockchainInfoTransaction = {
  hash: string
  fee: number
  time: number
  result: number
}

type SynchronizedTransaction = Pick<Transaction, 'hash' | 'fee' | 'time' | 'amount'>

export class AddressesService {
  async getAll(): Promise<Address[]> {
    return Address.all()
  }

  async create({ hash }: Pick<Address, 'hash'>): Promise<AddressUuid> {
    const existingAddress = await Address.findBy('hash', hash)
    if (existingAddress) {
      throw new AddressAlreadyExistsException()
    }
    const address = new Address()
    address.hash = hash
    await address.save()
    return address.id
  }

  async sync(payload: Pick<Address, 'id'>): Promise<void> {
    const address = await Address.findOrFail(payload.id)
    const transactions = await this.fetchAddressTransactions(address)
    console.log(transactions)
    await Transaction.createMany(transactions)
  }

  private async fetchAddressTransactions(address: Address): Promise<SynchronizedTransaction[]> {
    const lastTransaction = await Transaction.query()
      .where('address_id', address.id)
      .orderBy('time', 'desc')
      .first()
    const maxChunks = 2 // To avoid rate limit
    let chunkIndex = 0
    const transactions = []
    while (chunkIndex < maxChunks) {
      const transactionsChunk = await fetch(
        `https://blockchain.info/rawaddr/${address.hash}?limit=100&offset=${chunkIndex * 100}`
      )
      if (!transactionsChunk.ok) {
        throw new Error(
          `Error fetching transactions: chunkId=${chunkIndex}, ${transactionsChunk.statusText}`
        )
      }
      const json = (await transactionsChunk.json()) as { txs: BlockchainInfoTransaction[] }
      const rawTransactions = json.txs
      for (const transaction of rawTransactions) {
        if (lastTransaction && transaction.hash === lastTransaction.hash) {
          break
        }
        transactions.push(this.formatRawTransaction(transaction, address))
      }
      chunkIndex++
    }
    return transactions
  }

  private formatRawTransaction(
    transaction: BlockchainInfoTransaction,
    address: Address
  ): SynchronizedTransaction & { address_id: AddressUuid } {
    const transactionDateTime = DateTime.fromMillis(transaction.time * 1000)
    return {
      hash: transaction.hash,
      fee: transaction.fee,
      time: transactionDateTime,
      amount: transaction.result,
      address_id: address.id,
    }
  }
}
