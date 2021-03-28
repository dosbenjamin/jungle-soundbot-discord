import Discord from 'discord.js'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import fs from 'fs'

dotenv.config()

const {
  API_URL,
  DISCORD_TOKEN
} = process.env

const bot = new Discord.Client()

const messageHandler = async ({ content, member, channel }) => {
  if (content === '!jungle help') return channel.send(`
    ℹ Pour ajouter des sons, rendez-vous ici : https://jungle-soundbot.netlify.app`
  )

  const request = content.replace('!jungle ', '')
  const apiResponse = await fetch(`${ API_URL }/${ request }`)
  const json = await apiResponse.json()

  if (!json.length) return channel.send('Aucun résulat 😥')

  const [{ url, author, command }] = json
  const cloudinaryResponse = await fetch(url)
  const buffer = await cloudinaryResponse.buffer()
  fs.writeFileSync('audio.ogg', buffer)

  const connection = await member.voice.channel.join()
  const dispatcher = connection.play('./audio.ogg', { volume: 1 })

  channel.send(`▶ Son en cours ➜ **${ command }** ajouté par **${ author }**`)
}

bot.on('message', message => message.content
  .startsWith('!jungle ') && messageHandler(message))

bot.login(DISCORD_TOKEN)
