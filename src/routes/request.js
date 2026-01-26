const requestRouter = require("express").Router()
const { authMiddleware } = require("../middleware/auth")

requestRouter.post("/like/:id", authMiddleware, async (req, res) => {
	try {
		const user = req.user
		res.status(200).send(`${req.user.userName} sent a match request`)
	} catch (error) {
		res.status(500).send("Error sending match request: " + error.message)
	}
})

requestRouter.post("/pass/:id", authMiddleware, async (req, res) => {
	try {
		const user = req.user
		res.status(200).send(`${req.user.userName} declined a match request`)
	} catch (error) {
		res.status(500).send("Error declining match request: " + error.message)
	}
})

requestRouter.get("/match", authMiddleware, async (req, res) => {
	try {
		const user = req.user
		res.status(200).send(`Fetching matches for ${req.user.userName}`)
	} catch (error) {
		res.status(500).send("Error fetching matches: " + error.message)
	}
})

requestRouter.post("/unmatch/:id", authMiddleware, async (req, res) => {
	try {
		const user = req.user
		res.status(200).send(`${req.user.userName} unmatched a user`)
	} catch (error) {
		res.status(500).send("Error unmatching user: " + error.message)
	}
})

module.exports = requestRouter
