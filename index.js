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
  const playSound = async sound => {
    const { url, author, command } = sound
    const cloudinaryResponse = await fetch(url)
    const buffer = await cloudinaryResponse.buffer()
    fs.writeFileSync('audio.ogg', buffer)

    const connection = await member.voice.channel.join()
    connection.play('./audio.ogg', { volume: 1 })

    channel.send(`▶ Son en cours ➜ **${ command }** ajouté par **${ author }**`)
  }

  if (content === '!jungle help') return channel.send(`
    ℹ Pour ajouter des sons, rendez-vous ici : https://jungle-soundbot.netlify.app`
  )

  if(content === '!jungle list') {
    const apiResponse = await fetch(`${ API_URL }`)
    const json = await apiResponse.json()
    const sounds = json.map(({ command }) => command)

    return channel.send(
      `Liste des sons disponibles : \n${ sounds.join('\n') }`
    )
  }

  if (content === '!jungle random') {
    const apiResponse = await fetch(`${ API_URL }/sounds`)
    const json = await apiResponse.json()
    const sound = json[Math.floor(Math.random() * json.length)]
    return playSound(sound)
  }

  const request = content.replace('!jungle ', '')
  const apiResponse = await fetch(`${ API_URL }/${ request }`)
  const json = await apiResponse.json()

  if (!json.length) return channel.send('Aucun résulat 😥')

  playSound(json[0])
}

bot.on('message', message => message.content
  .startsWith('!jungle ') && messageHandler(message))

bot.login(DISCORD_TOKEN)
