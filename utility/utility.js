const data = require("../data.json")
const crypto = require("crypto")


module.exports.generateRandomMessage = () => {
  try {
    const randomNameIndex = Math.floor(Math.random() * data.names.length)
    const randomOriginIndex = Math.floor(Math.random() * data.cities.length)
    const randomDestinationIndex = Math.floor(
      Math.random() * data.cities.length
    )

    const randomName = data.names[randomNameIndex]
    const randomOrigin = data.cities[randomOriginIndex]
    const randomDestination = data.cities[randomDestinationIndex]

    const messageData = {
      name: randomName,
      origin: randomOrigin,
      destination: randomDestination,
    }

    // Calculate the secret_key as a hash of the messageData object
    const secretKey = crypto
      .createHash("sha256")
      .update(JSON.stringify(messageData))
      .digest("hex")

    messageData.secret_key = secretKey

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
      "aes-256-ctr",
      Buffer.from(secretKey, "hex"),
      iv
    )

    const encryptedMessage = Buffer.concat([
      iv, // Include the IV in the encrypted message
      cipher.update(JSON.stringify(messageData)),
      cipher.final(),
    ])

    // Return the secret key and encrypted message separately
    return {
      secret_key: secretKey,
      encrypted_message: encryptedMessage.toString("hex"),
    }
  } catch (error) {
    console.error("Error generating random message:", error)
    return null // Handle the error gracefully
  }
}
