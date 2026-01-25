const { verifyToken } = require("../validation/user")
const User = require("../models/user")

const authMiddleware = async (req, res, next) => {
	const token = req.cookies.token
	if (!token) {
		return res.status(401).send("Please log in to access this resource")
	}
	try {
		const decodedToken = verifyToken(token)
		const user = await User.findById(decodedToken._id)
		if (!user) {
			return res.status(404).send("User not found")
		}
		req.user = user
		next()
	} catch (error) {
		return res.status(401).send("Invalid or expired token")
	}
}

module.exports = { authMiddleware }
