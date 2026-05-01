const requestRouter = require("express").Router()
const { authMiddleware } = require("../middleware/auth")
const ConnectionRequest = require("../models/connectionRequest")
const User = require("../models/user")

requestRouter.post(
	"/send/:status/:recipientID",
	authMiddleware,
	async (req, res) => {
		try {
			const { recipientID, status } = req.params
			const initiatorID = req.user._id

			const ALLOWED_SEND_STATUSES = ["starred", "dismissed"]

			const recipientExists = await User.findById(recipientID)
			if (!recipientExists) {
				return res.status(404).json({ error: "Recipient not found." })
			}
			if (!ALLOWED_SEND_STATUSES.includes(status)) {
				return res.status(400).json({
					error: `Invalid action. Allowed: ${ALLOWED_SEND_STATUSES.join(", ")}`,
				})
			}

			// Block duplicate interactions regardless of status
			const existingRequest = await ConnectionRequest.findOne({
				initiatorID,
				recipientID,
			})
			if (existingRequest) {
				return res
					.status(400)
					.json({ error: "You've already interacted with this profile." })
			}

			const connectionRequest = new ConnectionRequest({
				initiatorID,
				recipientID,
				status,
			})

			const data = await connectionRequest.save()

			// If starring, check for a reciprocal star → it's a match
			if (status === "starred") {
				const reciprocalStar = await ConnectionRequest.findOne({
					initiatorID: recipientID,
					recipientID: initiatorID,
					status: "starred",
				})
				if (reciprocalStar) {
					await ConnectionRequest.updateMany(
						{
							$or: [
								{ initiatorID, recipientID },
								{ initiatorID: recipientID, recipientID: initiatorID },
							],
						},
						{ status: "matched" },
					)
					return res
						.status(200)
						.json({ message: "It's a merge! You're now connected 🎉", data })
				}
			}

			const message =
				status === "starred"
					? "Star sent! Waiting for their response ⭐"
					: "Profile skipped."

			res.status(200).json({ message, data })
		} catch (error) {
			res
				.status(500)
				.json({ error: "Couldn't complete the action. Try again?" })
		}
	},
)

module.exports = requestRouter
