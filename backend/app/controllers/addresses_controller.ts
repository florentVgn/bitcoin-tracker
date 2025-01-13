// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { AddressesService } from '#services/addresses_service'
import { createAddressValidator, syncAddressValidator } from '#validators/address'

@inject()
export default class AddressesController {
  constructor(private addressesService: AddressesService) {}

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAddressValidator)
    const id = await this.addressesService.create(payload)
    response.send({ id })
  }

  async index({ response }: HttpContext): Promise<void> {
    const addresses = await this.addressesService.getAll()
    response.send({ addresses })
  }

  async sync({ request, response }: HttpContext): Promise<void> {
    const payload = await request.validateUsing(syncAddressValidator)
    await this.addressesService.sync({ id: payload.params.id })
    response.send({ message: 'Synchronization completed successfully' })
  }
}
