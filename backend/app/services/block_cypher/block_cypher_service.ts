import Address from '#models/address'
import { BlockCypherTransaction } from '#services/block_cypher/block_cypher_model'
import logger from '@adonisjs/core/services/logger'

export class BlockCypherService {
  public async fetchTransactionsFromBlockCypher(
    address: Pick<Address, 'hash'>
  ): Promise<BlockCypherTransaction[]> {
    let attempts = 0
    let transactionsFromApi: Response | null = null
    const maxAttempts = 5
    while (attempts < maxAttempts) {
      logger.info(
        `Fetching transactions from ${address.hash} (attempt ${attempts + 1} / ${maxAttempts})`
      )
      transactionsFromApi = await fetch(
        `https://api.blockcypher.com/v1/btc/main/addrs/${address.hash}?limit=2000`
      )

      if (transactionsFromApi.ok) {
        break
      }

      if (transactionsFromApi.status === 429) {
        const waitTime = Math.pow(4, attempts) * 1000
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        attempts++
      } else {
        throw new Error(`Error fetching transactions: ${transactionsFromApi.statusText}`)
      }
    }

    if (!transactionsFromApi?.ok) {
      throw new Error(`Error fetching transactions after ${maxAttempts} attempts`)
    }

    const json = (await transactionsFromApi.json()) as { txrefs: BlockCypherTransaction[] }
    return json.txrefs
  }
}
