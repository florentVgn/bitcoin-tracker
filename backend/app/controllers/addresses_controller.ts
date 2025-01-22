// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { AddressesService } from '#services/addresses_service'
import {
  createAddressValidator,
  getAddressValidator,
  getAddressTransactionsValidator,
  syncAddressValidator,
} from '#validators/address'
import { TransactionsService } from '#services/transactions_service'

@inject()
export default class AddressesController {
  constructor(
    protected addressesService: AddressesService,
    protected transactionsService: TransactionsService
  ) {}

  async index({ response }: HttpContext): Promise<void> {
    const addresses = await this.addressesService.getAll()
    response.send({ addresses })
  }

  async show({ request, response }: HttpContext): Promise<void> {
    const payload = await request.validateUsing(getAddressValidator)
    const address = await this.addressesService.get({ id: payload.params.id })
    response.send({ address })
  }

  async getTransactions({ request, response }: HttpContext): Promise<void> {
    const payload = await request.validateUsing(getAddressTransactionsValidator)
    const transactions = await this.transactionsService.getAll({
      addressId: payload.params.id,
      limit: payload.params.limit,
      offset: payload.params.offset,
    })
    response.send({ transactions })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAddressValidator)
    const id = await this.addressesService.create(payload)
    response.send({ id })
  }

  async sync({ request, response }: HttpContext): Promise<void> {
    const payload = await request.validateUsing(syncAddressValidator)
    await this.addressesService.sync({ id: payload.params.id })
    response.send({ message: 'Synchronization completed successfully' })
  }
}
