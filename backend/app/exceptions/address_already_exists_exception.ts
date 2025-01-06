import { Exception } from '@adonisjs/core/exceptions'

export default class AddressAlreadyExistsException extends Exception {
  static status = 409
  public code = 'ADDRESS_ALREADY_EXISTS'
}
