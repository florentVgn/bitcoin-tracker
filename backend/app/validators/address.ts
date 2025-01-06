import vine from '@vinejs/vine'

/**
 * Validates the post's creation action
 */
export const createAddressValidator = vine.compile(
  vine.object({
    hash: vine.string().trim().minLength(26),
  })
)
