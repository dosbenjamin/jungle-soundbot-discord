import { Client } from 'discord.js'
import dotenv from 'dotenv'
import fs from 'fs'
import fetch from 'node-fetch'
import { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } from '@discordjs/voice'

dotenv.config()

const {
  API_URL,
  DISCORD_TOKEN
} = process.env

const client = new Client({
  intents: [
    'GUILDS',
    'MESSAGE_CONTENT',
    'GUILD_MESSAGES',
    'GUILD_VOICE_STATES',
  ],
})

const player = createAudioPlayer();

const messageHandler = async ({ content, channel, member, guild }) => {
  const playSound = async sound => {
    const { url, author, command } = sound
    const cloudinaryResponse = await fetch(url)
    const buffer = await cloudinaryResponse.buffer()
    fs.writeFileSync('audio.ogg', buffer)

    const connection = joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator
    })

    const resource = createAudioResource('./audio.ogg', {
      inputType: StreamType.OggOpus,
    })

    player.play(resource)
    connection.subscribe(player)

    channel.send(`▶ Son en cours ➜ **${command}** ajouté par **${author}**`)
  }

  if (content === '!jungle help') return channel.send(`
    ℹ Pour ajouter des sons, rendez-vous ici : https://jungle-soundbot-client-v2.vercel.app`
  )

  if(content === '!jungle list') {
    const apiResponse = await fetch(`${API_URL}`)
    const json = await apiResponse.json()
    const sounds = json.map(({ command }) => command)

    return channel.send(
      `Liste des sons disponibles : \n${sounds.join('\n')}`
    )
  }

  if (content === '!jungle random') {
    const apiResponse = await fetch(API_URL)
    const json = await apiResponse.json()
    const sound = json[Math.floor(Math.random() * json.length)]
    return playSound(sound)
  }

  const request = content.replace('!jungle ', '')
  const apiResponse = await fetch(`${API_URL}/${request}`)
  const json = await apiResponse.json()

  if (!json.length) return channel.send('Aucun résulat 😥')

  playSound(json[0])
}

client.on('messageCreate', message => {
  message.content.startsWith('!jungle ') && messageHandler(message)
})


client.login(DISCORD_TOKEN)
