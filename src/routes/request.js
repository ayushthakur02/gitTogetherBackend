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

			// Check if interaction already exists
			let existingRequest = await ConnectionRequest.findOne({
				initiatorID,
				recipientID,
			})
			if (existingRequest) {
				return res
					.status(400)
					.json({ error: "You've already interacted with this profile." })
			}

			// If starring, check for reciprocal star → it's a match
			const reciprocalStar = await ConnectionRequest.findOne({
				initiatorID: recipientID,
				recipientID: initiatorID,
				status: "starred",
			})
			if (status === "starred") {
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
						.json({ message: "It's a merge! You're now connected 🎉" })
				}
			}

			// If dismissing, update reciprocal star to dismissed
			if (status === "dismissed") {
				if (reciprocalStar) {
					reciprocalStar.status = "dismissed"
					await reciprocalStar.save()
					return res.status(200).json({
						message: "Profile dismissed.",
						data: reciprocalStar,
					})
				}
			}

			// Create new request only if no special conditions apply
			const connectionRequest = new ConnectionRequest({
				initiatorID,
				recipientID,
				status,
			})
			const data = await connectionRequest.save()

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

requestRouter.get("/details/:requestID", authMiddleware, async (req, res) => {
	try {
		const { requestID } = req.params
		const request = await ConnectionRequest.findById(requestID).populate(
			"initiatorID",
			"-password -email -createdAt -updatedAt -__v",
		)
		if (!request) {
			return res.status(404).json({ error: "Request not found." })
		}
		const transformedRequest = {
			requestID: request._id,
			initiatorID: request.initiatorID._id,
			recipientID: request.recipientID,
			firstName: request.initiatorID.firstName,
			lastName: request.initiatorID.lastName,
			bio: request.initiatorID.bio,
			age: request.initiatorID.age,
			gender: request.initiatorID.gender,
			country: request.initiatorID.country,
			state: request.initiatorID.state,
			city: request.initiatorID.city,
			profilePic: request.initiatorID.profilePic,
			morePhotos: request.initiatorID.morePhotos,
			skills: request.initiatorID.skills,
		}
		res.status(200).json({
			message: "Request details fetched successfully",
			data: transformedRequest,
		})
	} catch (error) {
		res
			.status(500)
			.json({ error: "Couldn't fetch request details. Try again?" })
	}
})

requestRouter.patch(
	"/review/:requestID/:action",
	authMiddleware,
	async (req, res) => {
		try {
			const { action, requestID } = req.params
			const loggedInUser = req.user

			const ALLOWED_ACTIONS = ["star", "dismiss"]
			if (!ALLOWED_ACTIONS.includes(action)) {
				return res.status(400).json({
					error: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(", ")}`,
				})
			}
			const request = await ConnectionRequest.findById(requestID)
			if (!request) {
				return res.status(404).json({ error: "Request not found." })
			}
			if (!request.recipientID.equals(loggedInUser._id)) {
				return res
					.status(403)
					.json({ error: "You can only review requests sent to you." })
			}
			if (request.status !== "starred") {
				return res.status(400).json({
					error:
						"This request has already been reviewed or doesn't have valid status",
				})
			}
			if (action === "star") {
				request.status = "matched"
				const data = await request.save()
				return res.status(200).json({ message: "Merged 🎉", data: request })
			} else if (action === "dismiss") {
				request.status = "dismissed"
				await request.save()
			}
			res.status(200).json({ message: "Request reviewed.", data: request })
		} catch (error) {
			res.status(400).send("ERROR", +error.message)
		}
	},
)

module.exports = requestRouter
