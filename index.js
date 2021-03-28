import Discord from 'discord.js'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

dotenv.config()

const {
  API_URL,
  TOKEN
} = process.env

const bot = new Discord.Client()

bot.on('message', async ({ content, member, channel }) => {
  const apiResponse = await fetch(`${ API_URL }/${ content }`)
  const [{ url }] = await apiResponse.json()

  const cloudinaryResponse = await fetch(url)
  const buffer = await cloudinaryResponse.buffer()

  const connection = await member.voice.channel.join()

  fs.writeFileSync('audio.ogg', buffer)

  const dispatcher = connection.play('./audio.ogg', { volume: 1 })
})

bot.login(TOKEN)
