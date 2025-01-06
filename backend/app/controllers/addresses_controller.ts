// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { AddressesService } from '#services/addresses_service'

@inject()
export default class AddressesController {
  constructor(private addressesService: AddressesService) {}
  async store({ request, response }: HttpContext) {
    const address = request.only(['hash'])
    const id = await this.addressesService.create(address)
    response.send({ id })
  }

  async index({ response }: HttpContext): Promise<void> {
    const addresses = await this.addressesService.getAll()
    response.send({ addresses })
  }
}
