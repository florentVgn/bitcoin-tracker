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
    await Transaction.createMany(transactionsToSync)
  }

  private async fetchTransactionsToSync(address: Address): Promise<TransactionInsertDTO[]> {
    const transactionsFromApi =
      await this.blockCypherService.fetchTransactionsFromBlockCypher(address)
    logger.info(`Fetched ${transactionsFromApi.length} transactions from ${address.hash}`)

    const transactionsByHash = this.groupTransactionsByHash(transactionsFromApi)
    logger.info(`Grouped ${Object.keys(transactionsByHash).length} transactions by hash`)

    const transactionsWithTotalAmount = this.formatTransactionsByHashToTransactions(
      transactionsByHash,
      address
    )

    const transactionsToSync = await this.findTransactionsToSync(
      transactionsWithTotalAmount,
      address
    )
    logger.info(
      `Found ${transactionsToSync.length} transactions to sync for address ${address.hash}`
    )
    return transactionsToSync
  }

  private async findTransactionsToSync(
    transactionsWithTotalAmount: TransactionInsertDTO[],
    address: Address
  ) {
    const lastTransaction = await Transaction.query()
      .where('address_id', address.id)
      .orderBy('time', 'desc')
      .first()
    const transactionsToSync: TransactionInsertDTO[] = []
    for (const transaction of transactionsWithTotalAmount) {
      if (lastTransaction && transaction.hash === lastTransaction.hash) {
        logger.info(`Transaction ${transaction.hash} already synced. Stopping sync`)
        break
      }
      transactionsToSync.push(transaction)
    }
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

  private formatTransactionsByHashToTransactions(
    transactionsByHash: Record<string, BlockCypherTransaction[]>,
    address: Address
  ) {
    return Object.values(transactionsByHash).map((_transactions) => {
      const totalAmount = _transactions.reduce(
        (acc: number, tx: BlockCypherTransaction) => acc + (tx.spent ? -tx.value : tx.value),
        0
      )
      return {
        amount: totalAmount,
        ...this.transformBlockCypherTransactionToTransaction(_transactions[0], address),
      }
    })
  }

  private transformBlockCypherTransactionToTransaction(
    transaction: BlockCypherTransaction,
    address: Address
  ): Pick<Transaction, 'hash' | 'time' | 'addressId'> {
    const transactionDateTime = DateTime.fromISO(transaction.confirmed)
    return {
      hash: transaction.tx_hash,
      time: transactionDateTime,
      addressId: address.id,
    }
  }
}
