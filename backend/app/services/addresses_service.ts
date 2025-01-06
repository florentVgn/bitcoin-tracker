import Address, { AddressUuid } from '#models/address'

type AddressData = { n_tx: number }
export type BlockchainInfoTransaction = {
  hash: string
  fee: number
  time: number
  result: number
}

export type Transaction = {
  hash: string
  fee: number
  time: number
  amount: number
  unitPrice: number | null
}

export class AddressesService {
  async getAll(): Promise<Address[]> {
    return Address.all()
  }

  async create(payload: Pick<Address, 'hash'>): Promise<AddressUuid> {
    const wallet = new Address()
    wallet.hash = payload.hash
    this.sync(payload).then()
    // await wallet.save()
    return wallet.id
  }

  async sync(payload: Pick<Address, 'hash'>): Promise<unknown> {
    try {
      const transactions = await this.fetchTransactionsByAddress(payload)
      const transactionsWithUnitPrice = this.fetchTransactionsUnitPrices(transactions)
      console.log(transactionsWithUnitPrice)
      return transactionsWithUnitPrice
    } catch (error) {
      console.log(error)
    }
  }

  private fetchTransactionsUnitPrices(transactions: Transaction[]) {
    return transactions.map((transaction) => {
      return {
        ...transaction,
        unitPrice: 0,
      }
    })
  }

  private async fetchTransactionsByAddress({
    hash,
  }: Pick<Address, 'hash'>): Promise<Transaction[]> {
    const response = await fetch(`https://blockchain.info/rawaddr/${hash}`)
    if (!response.ok) {
      console.log('Something went wrong')
      return []
    }
    const requests = await this.buildRequests(response, hash)
    const responses = await Promise.all(requests)
    let rawTransactions = await this.extractRawTransactionsFromResponses(responses)
    return this.formatRawTransactions(rawTransactions)
  }

  private formatRawTransactions(rawTransactions: BlockchainInfoTransaction[]): Transaction[] {
    return rawTransactions.map((transaction) => {
      return {
        hash: transaction.hash,
        fee: transaction.fee,
        time: transaction.time,
        amount: transaction.result,
        unitPrice: null,
      }
    })
  }

  private async buildRequests(response: Response, address: string) {
    const { n_tx: numberOfTransactions } = (await response.json()) as AddressData
    const numberOfChunks = Math.ceil(numberOfTransactions / 100)
    const promises = []
    console.log({ numberOfChunks, numberOfTransactions })
    for (let i = 0; i < numberOfChunks; i++) {
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
