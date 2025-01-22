export interface AddressDto extends Address, AddressBalance {}

interface Address {
  id: string
  hash: string
  createdAt: string
}

interface AddressBalance {
  addressBalance: number;
  transactionsCount: number;

}

