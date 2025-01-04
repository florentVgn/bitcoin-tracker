/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const WalletsController = () => import('#controllers/wallets_controller')

router.post('/wallets', [WalletsController, 'store'])
router.get('/wallets', () => 'Hello World')
router.get('/', () => 'Hello World')
