const { verifyToken } = require("../validation/user")

const authMiddleware = (req, res, next) => {
	const token = req.cookies.token
	if (!token) {
		return res.status(401).send("Please log in to access this resource")
	}
	try {
		const decodedToken = verifyToken(token)
		req.user = decodedToken
		next()
	} catch (error) {
		return res.status(401).send("Invalid or expired token")
	}
}

module.exports = { authMiddleware }
