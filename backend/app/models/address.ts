import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Transaction from '#models/transaction'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export type AddressUuid = string

export default class Address extends BaseModel {
  @column({ isPrimary: true })
  declare id: AddressUuid

  @column()
  declare hash: string

  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
