const { Order, Team_User } = require('../models')
const { Op } = require('sequelize');
const axios = require('axios');
const cron = require('node-cron')

const baseUrl = 'https://rest.livo.ma'
var task = cron.schedule('0 0 0 * * *', async () => {
    console.log('running a task every day');

    const result = await Order.findAll({
        where: { LivoId: { [Op.ne]: null }, id_team: { [Op.ne]: null } }, include: [{
            model: Team_User,
            here: { livoToken: { [Op.ne]: null } }
        }]
    });

    var index = 0
    const exec = setInterval(async () => {
        const element = result[index];

        const query = { LivoId: element.LivoId, livoToken: element.Team_User.livoToken }

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${query.livoToken}`
            };

            const response = await axios.get(`${baseUrl}/orders/${query.LivoId}`, { headers })

            if (response.data.data.data.status) {
                const status = response.data.data.data.status === 'fulfilled' ? 'Livre' :
                    response.data.data.data.status === 'cancelled' ? 'Annule livraison' :
                        response.data.data.data.status === 'problem' ? 'Injoignable livraison' :
                            response.data.data.data.status === 'refused' ? 'Refuse' : element.status

                element.status = status
                const save = await element.save()
            }

        } catch (error) {
            console.log('error')
        }

        index++
        if (index === result.length) clearInterval(exec)
    }, 2000);

}, {
    scheduled: false
});

module.exports = { task }