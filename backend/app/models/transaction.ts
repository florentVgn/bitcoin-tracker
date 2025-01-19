import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type TransactionInsertDTO = Pick<Transaction, 'addressId' | 'hash' | 'amount'>

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare addressId: string

  @column()
  declare hash: string

  @column()
  declare amount: number

  @column.dateTime()
  declare time: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
