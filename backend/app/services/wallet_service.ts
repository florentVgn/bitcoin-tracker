import Wallet, { WalletUuid } from '#models/wallet'

export class WalletService {
  async create(payload: Pick<Wallet, 'address'>): Promise<WalletUuid> {
    const wallet = new Wallet()
    wallet.address = payload.address
    await wallet.save()
    console.log(wallet.id)
    return wallet.id
  }
}
