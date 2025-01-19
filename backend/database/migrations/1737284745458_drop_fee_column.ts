import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('fee')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('fee')
    })
  }
}
