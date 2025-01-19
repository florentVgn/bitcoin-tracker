export type BlockCypherTransaction = {
  tx_hash: string
  block_height: number
  tx_input_n: number
  tx_output_n: number
  value: number
  ref_balance: number
  spent: boolean
  confirmations: number
  confirmed: string
  double_spend: boolean
}
