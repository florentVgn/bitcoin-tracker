// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { WalletService } from '#services/wallet_service'

@inject()
export default class WalletsController {
  constructor(private walletService: WalletService) {}
  async store({ request, response }: HttpContext) {
    const wallet = request.only(['address'])
    const id = await this.walletService.create(wallet)
    response.send({ id })
  }
}
