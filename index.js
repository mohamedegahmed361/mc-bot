// بوت AFK يخلي سيرفر الماين كرافت (Aternos) شغال 24 ساعة
// AFK bot that keeps an Aternos Minecraft server online 24/7

const mineflayer = require('mineflayer')
const http = require('http')

// --- سيرفر ويب صغير: Render محتاج بورت مفتوح، و UptimeRobot بيعيط عليه عشان البوت مينمش ---
const PORT = process.env.PORT || 3000
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('MC bot is alive')
}).listen(PORT, () => console.log('Health server listening on port ' + PORT))

// --- إعدادات البوت: بتتحط في Render > Environment Variables ---
const HOST = process.env.MC_HOST                       // عنوان السيرفر، مثال: myserver.aternos.me
const MC_PORT = parseInt(process.env.MC_PORT || '25565', 10)
const USERNAME = process.env.MC_USERNAME || 'AFK_Bot_24'

if (!HOST) {
  console.log('MC_HOST is missing! Add it in Render > Environment Variables.')
}

let bot = null
let moveTimer = null

function startBot() {
  if (!HOST) return
  console.log('Connecting to ' + HOST + ':' + MC_PORT + ' as ' + USERNAME + ' ...')

  bot = mineflayer.createBot({
    host: HOST,
    port: MC_PORT,
    username: USERNAME,
    version: false,    // يكشف إصدار السيرفر لوحده
    auth: 'offline'    // مناسب لسيرفرات Aternos
  })

  bot.once('spawn', () => {
    console.log('Bot joined the server')
    // حركة بسيطة كل 45 ثانية عشان السيرفر ميطردش البوت لقلة الحركة
    moveTimer = setInterval(() => {
      if (!bot || !bot.entity) return
      const yaw = Math.random() * Math.PI * 2
      bot.look(yaw, 0)
      const dirs = ['forward', 'back', 'left', 'right']
      const dir = dirs[Math.floor(Math.random() * dirs.length)]
      bot.setControlState(dir, true)
      bot.setControlState('jump', true)
      setTimeout(() => {
        bot.setControlState(dir, false)
        bot.setControlState('jump', false)
      }, 700)
      bot.swingArm('right')
    }, 45000)
  })

  bot.on('kicked', reason => console.log('Kicked from server:', reason))
  bot.on('error', err => console.log('Connection error:', err.message))

  bot.on('end', () => {
    console.log('Disconnected. Retrying in 30 seconds...')
    if (moveTimer) clearInterval(moveTimer)
    moveTimer = null
    bot = null
    setTimeout(startBot, 30000)  // لو السيرفر قفل أو بيعيد التشغيل، البوت يفضل يحاول
  })
}

startBot()
