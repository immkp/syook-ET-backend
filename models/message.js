const express = require("express")
const mongoose = require("mongoose")


const MessageSchema = new mongoose.Schema({
  name: String,
  origin: String,
  destination: String,
  secret_key: String,
  timestamp: String,
})

module.exports = mongoose.model("Message", MessageSchema)
