/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const AddressesController = () => import('#controllers/addresses_controller')

router.get('/addresses', [AddressesController, 'index'])
router.post('/addresses', [AddressesController, 'store'])
router.get('/addresses/:id', [AddressesController, 'show'])
router.get('/addresses/:id/transactions', [AddressesController, 'getTransactions'])
router.post('/addresses/:id/sync', [AddressesController, 'sync'])
