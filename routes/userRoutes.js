const router = require('express').Router()
const { registerUser, loginUser, logoutUser, newAccessToken } = require('../controllers/userController')
const { protect } = require('../middlewares/authMiddleware')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', protect, logoutUser)
router.post('/token', newAccessToken)

module.exports = router
