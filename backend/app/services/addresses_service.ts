import Address, { AddressUuid } from '#models/address'
import AddressAlreadyExistsException from '#exceptions/address_already_exists_exception'
import Transaction, { TransactionInsertDTO } from '#models/transaction'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import { BlockCypherService } from '#services/block_cypher/block_cypher_service'
import { inject } from '@adonisjs/core'
import { BlockCypherTransaction } from '#services/block_cypher/block_cypher_model'

interface AddressDto extends Pick<Address, 'id' | 'hash' | 'createdAt' | 'updatedAt'> {
  addressBalance: number
  transactionsCount: number
}

@inject()
export class AddressesService {
  constructor(protected blockCypherService: BlockCypherService) {}

  async getAll(): Promise<AddressDto[]> {
    const addresses = await Address.query()
      .withAggregate('transactions', (query) => {
        query.sum('amount').as('addressBalance')
      })
      .withAggregate('transactions', (query) => {
        query.count('id').as('transactionsCount')
      })
    return addresses.map((address) => this.transformModelWithBalanceToDto(address))
  }

  async get({ id }: { id: AddressUuid }): Promise<AddressDto> {
    const address = await Address.query()
      .where('id', id)
      .withAggregate('transactions', (query) => {
        query.sum('amount').as('addressBalance')
      })
      .withAggregate('transactions', (query) => {
        query.count('id').as('transactionsCount')
      })
      .firstOrFail()

    return this.transformModelWithBalanceToDto(address)
  }

  private transformModelWithBalanceToDto(address: Address): AddressDto {
    return {
      ...address.serialize(),
      addressBalance: Number(address.$extras.addressBalance),
      transactionsCount: Number(address.$extras.transactionsCount),
    } as AddressDto
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
    const transactionsToSync = await this.fetchTransactionsToSync(address)
    const obj = transactionsToSync.reduce(
      (acc, transaction) => {
        if (!acc[transaction.hash]) acc[transaction.hash] = 0
        acc[transaction.hash]++
        return acc
      },
      {} as { [hash in string]: number }
    )
    console.log(`Sync sync: ${JSON.stringify(obj)}`)
    Object.entries(obj).forEach(([key, value]) => {
      if (value > 1) console.warn(`${key}: ${value}`)
    })
    await Transaction.createMany(transactionsToSync)
  }

  private async fetchTransactionsToSync(address: Address): Promise<TransactionInsertDTO[]> {
    let lastBlockHeight: number | null = null
    const lastTransaction = await Transaction.query()
      .where('address_id', address.id)
      .orderBy('time', 'desc')
      .first()
    const transactionsToSync: TransactionInsertDTO[] = []
    let lastTransactionFound = false

    let iterations = 0

    while (!lastTransactionFound && iterations < 2) {
      iterations++
      const url = `https://api.blockcypher.com/v1/btc/main/addrs/${address.hash}?limit=2000${lastBlockHeight ? `&before=${lastBlockHeight - 1}` : ''}`
      const transactionsFromApi = await this.blockCypherService.fetchWithRetry({ url })

      console.log(transactionsFromApi.length)
      if (!transactionsFromApi.length) break

      const transactionsByHash = this.groupTransactionsByHash(transactionsFromApi)

      for (const [hash, transactions] of Object.entries(transactionsByHash)) {
        if (lastTransaction && hash === lastTransaction.hash) {
          lastTransactionFound = true
          logger.info(`Transaction ${hash} already synced. Stopping sync`)
          break
        }
        const totalAmount = transactions.reduce(
          (acc: number, tx: BlockCypherTransaction) => acc + (tx.spent ? -tx.value : tx.value),
          0
        )
        const transactionDateTime = DateTime.fromISO(transactions[0].confirmed)

        lastBlockHeight = transactions[0].block_height
        transactionsToSync.push({
          amount: totalAmount,
          hash,
          time: transactionDateTime,
          addressId: address.id,
        })
      }
    }

    logger.info(
      `Found ${transactionsToSync.length} transactions to sync for address ${address.hash}`
    )
    return transactionsToSync
  }

  private groupTransactionsByHash(transactions: BlockCypherTransaction[]) {
    return transactions.reduce(
      (acc, transaction) => {
        if (!acc[transaction.tx_hash]) {
          acc[transaction.tx_hash] = []
        }
        acc[transaction.tx_hash].push(transaction)
        return acc
      },
      {} as Record<BlockCypherTransaction['tx_hash'], BlockCypherTransaction[]>
    )
  }
}
