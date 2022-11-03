const asyncHandler = require('express-async-handler')
const User = require('../models/User')

const getChats = asyncHandler(async (req, res) => {})
const setChat = asyncHandler(async (req, res) => {})
const updateChat = asyncHandler(async (req, res) => {})
const deleteChat = asyncHandler(async (req, res) => {})

module.exports = { getChats, setChat, updateChat, deleteChat }
