import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Address from '#models/address'
import { inject } from '@adonisjs/core'
import { AddressesService } from '#services/addresses_service'

export default class SyncAll extends BaseCommand {
  static commandName = 'sync:all'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }
  @inject()
  async run(addressesService: AddressesService): Promise<void> {
    this.logger.info('Start syncing all')
    const addresses = await Address.all()
    for (const address of addresses) {
      await addressesService.sync(address)
    }
    this.logger.info('Syncing completed')
  }
}
