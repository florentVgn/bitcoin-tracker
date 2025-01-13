import vine from '@vinejs/vine'

export const createAddressValidator = vine.compile(
  vine.object({
    hash: vine.string().trim().minLength(26),
  })
)

export const syncAddressValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)
