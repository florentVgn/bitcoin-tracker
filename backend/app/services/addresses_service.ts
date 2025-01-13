import Address, { AddressUuid } from '#models/address'
import AddressAlreadyExistsException from '#exceptions/address_already_exists_exception'
import Transaction from '#models/transaction'
import { DateTime } from 'luxon'

type AddressData = { n_tx: number }
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
    try {
      const address = await Address.findOrFail(payload.id)
      const transactions = await this.fetchTransactionsByAddress(address)
      console.log(transactions)
      await Transaction.createMany(transactions)
    } catch (error) {
      console.log(error)
    }
  }

  private async fetchTransactionsByAddress(address: Address): Promise<SynchronizedTransaction[]> {
    const response = await fetch(`https://blockchain.info/rawaddr/${address.hash}`)
    const requests = await this.buildRequests(response, address.hash)
    const responses = await Promise.all(requests)
    let rawTransactions = await this.extractRawTransactionsFromResponses(responses)
    return this.formatRawTransactions(rawTransactions, address)
  }

  private formatRawTransactions(
    rawTransactions: BlockchainInfoTransaction[],
    address: Address
  ): (SynchronizedTransaction & { address_id: AddressUuid })[] {
    return rawTransactions.map((transaction) => {
      const transactionDateTime = DateTime.fromMillis(transaction.time * 1000)
      return {
        hash: transaction.hash,
        fee: transaction.fee,
        time: transactionDateTime,
        amount: transaction.result,
        address_id: address.id,
      }
    })
  }

  private async buildRequests(response: Response, address: string) {
    const { n_tx: numberOfTransactions } = (await response.json()) as AddressData
    const numberOfChunks = Math.ceil(numberOfTransactions / 100)
    const promises = []
    console.log({ numberOfChunks, numberOfTransactions })
    for (let i = 0; i < numberOfChunks && i < 3; i++) {
      const promise = fetch(
        `https://blockchain.info/rawaddr/${address}?limit=100&offset=${i * 100}`
      )
      promises.push(promise)
    }
    return promises
  }

  private async extractRawTransactionsFromResponses(
    responses: Response[]
  ): Promise<BlockchainInfoTransaction[]> {
    const json = responses.map((r) => r.json())
    const data = (await Promise.all(json)) as { txs: BlockchainInfoTransaction[] }[]
    return data.flatMap((x) => x.txs)
  }
}
