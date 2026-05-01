const mongoose = require("mongoose")

const connectionRequestSchema = new mongoose.Schema(
	{
		initiatorID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		recipientID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		status: {
			type: String,
			enum: {
				values: ["pending", "matched", "dismissed", "starred"],
				message: "{VALUE} is not a valid status",
			},
			default: "pending",
			required: true,
		},
	},
	{ timestamps: true },
)

connectionRequestSchema.index(
	{ initiatorID: 1, recipientID: 1 },
	{ unique: true },
)

connectionRequestSchema.pre("save", function (next) {
	const connectionRequest = this
	//Check if the initiator is trying to interact with themselves
	if (connectionRequest.initiatorID.equals(connectionRequest.recipientID)) {
		throw new Error("You can't interact with yourself.")
	}
	next()
})

const ConnectionRequestModel = new mongoose.model(
	"ConnectionRequest",
	connectionRequestSchema,
)
module.exports = ConnectionRequestModel
