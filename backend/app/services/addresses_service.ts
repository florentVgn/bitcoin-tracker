import Address, { AddressUuid } from '#models/address'
import AddressAlreadyExistsException from '#exceptions/address_already_exists_exception'
import Transaction from '#models/transaction'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

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
    await Transaction.createMany(transactions)
  }

  private async fetchAddressTransactions(address: Address): Promise<SynchronizedTransaction[]> {
    const lastTransaction = await Transaction.query()
      .where('address_id', address.id)
      .orderBy('time', 'desc')
      .first()
    const transactionsFromApi = await fetch(
      `https://api.blockcypher.com/v1/btc/main/addrs/${address.hash}/full`
    )
    if (!transactionsFromApi.ok) {
      throw new Error(`Error fetching transactions: ${transactionsFromApi.statusText}`)
    }
    const json = (await transactionsFromApi.json()) as { txs: any[] }
    const rawTransactions = json.txs
    // logger.info({ rawTransactions })
    const transactions: SynchronizedTransaction[] = []
    console.log(rawTransactions.length)
    for (const transaction of rawTransactions) {
      let sent = 0
      let received = 0

      // Check inputs, ie sent tokens
      transaction.inputs.forEach((input) => {
        if (input.addresses.includes(address.hash)) {
          sent += input.value
        }
      })

      // Check outputs, ie received tokens
      transaction.outputs.forEach((output) => {
        if (output.addresses.includes(address.hash)) {
          received += output.value
        }
      })

      if (lastTransaction && transaction.hash === lastTransaction.hash) {
        break
      }
      transactions.push(this.formatRawTransaction(transaction, address))
    }
    logger.info(`Fetched ${transactions.length} transactions from ${address.hash}`)
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
