const { MessageSupport } = require('../models')

async function socketmsg(io) {
    io.on("connection", (socket) => {
        socket.on('message', async data => {
            const build = await MessageSupport.build({ 'message': data.text, 'id_support': data.chatId, 'id_user': data.ClientId })
            build.save()
            .then(res=>{
                io.emit(String(data.chatId), 'new_message')
            }).catch(err=>{
                console.log('err',err)
            })
        })
    });
}

module.exports = { socketmsg }