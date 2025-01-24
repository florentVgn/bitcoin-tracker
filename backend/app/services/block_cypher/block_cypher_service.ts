import { BlockCypherTransaction } from '#services/block_cypher/block_cypher_model'
import logger from '@adonisjs/core/services/logger'

export class BlockCypherService {
  public async fetchWithRetry({ url }: { url: string }): Promise<BlockCypherTransaction[]> {
    let attempts = 0
    let transactionsFromApi: Response | null = null
    const maxAttempts = 5
    while (attempts < maxAttempts) {
      logger.info(`Fetching ${url} (attempt ${attempts + 1} / ${maxAttempts})`)
      transactionsFromApi = await fetch(url)

      if (transactionsFromApi.ok) {
        break
      }

      if (transactionsFromApi.status === 429) {
        console.log(transactionsFromApi)
        const waitTime = Math.pow(4, attempts) * 1000
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        attempts++
      } else {
        throw new Error(`Error fetching ${url}: ${transactionsFromApi.statusText}`)
      }
    }

    if (!transactionsFromApi?.ok) {
      throw new Error(`Error fetching ${url} after ${maxAttempts} attempts`)
    }

    const json = (await transactionsFromApi.json()) as { txrefs: BlockCypherTransaction[] }
    return json.txrefs ?? []
  }
}
