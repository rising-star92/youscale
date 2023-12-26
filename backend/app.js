require('dotenv').config();

const { sequelize } = require('./models/index')
const logger = require('morgan');
const app = require('./routes')
const server = require("http").createServer(app)
const io = require("socket.io")(server);
const { socketmsg } = require("./socketmsg");
const { task } = require('./cron/updateOrder')

const StartServer = async () => {
  sequelize.query('SELECT NOW()').then((res) => {
    console.log(res[0][0])
  })

  await socketmsg(io)

  app.get('/', (req, res) => {
    res.send('working')
  })

  const PORT = process.env.PORT || 8500
  const ADDRESS = process.env.ADDRESS || "0.0.0.0";

  server.listen(PORT, ADDRESS, async () => {
    try {
      await sequelize.authenticate()
      console.log(`serveur en marche sur http://${ADDRESS}:${PORT}`)
      task.start()
    } catch (error) {
      console.log(error)
      console.log('error to connected server to database')
    }
  })
}

StartServer()