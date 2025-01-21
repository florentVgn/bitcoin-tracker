import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Address from '#models/address'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export type TransactionInsertDTO = Pick<Transaction, 'addressId' | 'hash' | 'amount'>

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare addressId: string

  @belongsTo(() => Address)
  declare address: BelongsTo<typeof Address>

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
