import mineflayer from 'mineflayer'
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder'

const { GoalFollow } = goals

async function createBot(name: string) {
  try {
    console.log(`Creating bot: ${name}`)

    const bot = mineflayer.createBot({
      host: 'server',  // Make sure this is correct
      port: 25565,     // Ensure the server allows multiple logins
      username: name,
    })

    bot.loadPlugin(pathfinder)

    bot.on('login', () => {
      console.log(`${bot.username} has logged in`)
    })

    bot.once('spawn', () => {
      console.log(`${bot.username} has spawned`)
      const defaultMove = new Movements(bot)
      bot.pathfinder.setMovements(defaultMove)
    })

    bot.on('chat', (username, message) => {
      if (username === bot.username) return

      console.log(`<${username}> ${message}`)

      if (message === 'hello') {
        bot.chat('Hello there!')
      }

      if (message === 'follow me') {
        const player = bot.players[username]
        if (!player || !player.entity) {
          bot.chat("I can't see you!")
          return
        }
        bot.chat(`Following ${username} but staying at least 8 blocks away`)
        bot.pathfinder.setGoal(new GoalFollow(player.entity, 1), true)
      }
    })

    bot.on('error', (err) => {
      console.error(`❌ Error in ${bot.username}:`, err)
    })

    bot.on('kicked', (reason) => {
      console.warn(`⚠️ ${bot.username} was kicked: ${reason}`)
    })

    bot.on('end', () => {
      console.log(`⚠️ ${bot.username} disconnected.`)
    })

  } catch (err) {
    console.error(`❌ Failed to create bot ${name}:`, err)
  }
}

// Create multiple bots
(async () => {
  for (let i = 0; i < 100; i++) {
    setTimeout(() => createBot(`bot${i}`), i * 10) // Introduce a slight delay
  }
})();
