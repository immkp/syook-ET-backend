const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const mongoose = require("mongoose")
const crypto = require("crypto")
require("dotenv").config()
const cors = require("cors")
const data = require("./data.json")
const { generateRandomMessage } = require("./utility/utility.js")
const MessageModel = require("./models/message")

const app = express()
app.use(cors())
const server = http.createServer(app)

const options = {
  timeZone: "Asia/Kolkata",
  hour12: true,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
}


// Middleware
app.get("/", (req, res) => {
  res.send("Hello, Welcome to the Home page.")
})

// console.log(process.env.DATABASE_URL)

// MongoDB connection setup
mongoose
  .connect(process.env.DATABASE_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB.")
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
  })

// This allows connections from any origin
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust this to your client's URL
    methods: ["GET", "POST"],
  },
})

let totalTransmissions = 0
let successfulTransmissions = 0
io.on("connection", (socket) => {
  // Emitter Service functionality
  let randomMessage
  const emitSuccessRate = () => {
    if (totalTransmissions === 0) {
      return 0 // Avoid division by zero
    }
    const successRate = (successfulTransmissions / totalTransmissions) * 100
    socket.emit("successRate", successRate)
  }

  setInterval(() => {
    randomMessage = generateRandomMessage()
    let currentDateAndTime = new Date()
    const formattedDate = currentDateAndTime.toLocaleString("en-IN", options)

    if (randomMessage) {
      const { secret_key, encrypted_message } = randomMessage

      try {
        const iv = Buffer.from(encrypted_message.slice(0, 32), "hex") // IV is the first 16 bytes
        const encryptedData = Buffer.from(encrypted_message.slice(32), "hex") // Encrypted data is the rest

        const decipher = crypto.createDecipheriv(
          "aes-256-ctr", // Use AES-256 encryption
          Buffer.from(secret_key, "hex"), // Use the secret_key
          iv
        )

        const decryptedMessage = Buffer.concat([
          decipher.update(encryptedData),
          decipher.final(),
        ]).toString()

        try {
          const messageData = JSON.parse(decryptedMessage)

          const { name, origin, destination, secret_key } = messageData
          const calculatedSecretKey = crypto
            .createHash("sha256")
            .update(JSON.stringify({ name, origin, destination }))
            .digest("hex")

          if (secret_key === calculatedSecretKey) {
            const timestampedMessage = {
              ...messageData,
              timestamp: formattedDate,
            }

            // Insert the new data into the database
            MessageModel.create(timestampedMessage)
              .then((savedMessage) => {
                console.log("New message saved to MongoDB")
                socket.emit("decryptedMessages", [savedMessage])
                console.log("Emitting decrypted message")
                successfulTransmissions++ // Increment successful transmissions
                emitSuccessRate()
              })
              .catch((err) => {
                console.error("Error saving new message to MongoDB:", err)
                emitSuccessRate()
              })
          } else {
            console.error("Secret key mismatch")
            emitSuccessRate()
          }
        } catch (jsonParseError) {
          console.error("Error parsing decrypted JSON message:", jsonParseError)
          emitSuccessRate()
        }
      } catch (decryptionError) {
        console.error("Error decrypting message:", decryptionError)
        emitSuccessRate()
      }
    }
    totalTransmissions++
  }, 10000)
})

server.listen(5000, () => {
  console.log("Server is running on port 5000")
})
