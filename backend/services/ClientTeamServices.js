require('dotenv').config();
const { Team_User, Team_Client_Page_Acces, Team_Client_Column_Acces, Column_Of_Order, Team_Client_Product_Acces, Product, Team_Client_City_Acces, City_User, Order, Product_Order, User, Client_Page } = require('../models')

class ClientTeamServices {

    static async #findTeamClientById(id) {
        var clientTeamFound = await Team_User.findOne({
            where: { id },
            include: [
                { model: Team_Client_Page_Acces, include: Client_Page },
                { model: Team_Client_Column_Acces, include: Column_Of_Order },
                { model: Team_Client_Product_Acces, include: Product },
                { model: Team_Client_City_Acces, include: City_User }
            ]
        })

        if (clientTeamFound) return clientTeamFound
        return false
    }

    static async #findClientById(id) {
        var clientFound = await User.findOne({
            where: { id }
        })

        if (clientFound) return clientFound
        return false
    }

    static async GetPageAccess({ id_team }) {
        try {
            var isExist = await this.#findTeamClientById(id_team)
            if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

            var pageAccess = isExist.Team_Client_Page_Acces.map(page => page.Client_Page.name)

            return { 'code': 200, 'data': pageAccess }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async GetColumnAccess({ id_team }) {
        try {
            var isExist = await this.#findTeamClientById(id_team)
            if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

            var columnAccess = isExist.Team_Client_Column_Acces.map(column => column.Column_Of_Order.name)

            return { 'code': 200, 'data': columnAccess }

        } catch (error) {

            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async GetProductAccess({ id_team }) {
        try {
            var isExist = await this.#findTeamClientById(id_team)
            if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

            var columnAccess = isExist.Team_Client_Product_Acces.map(column => column.Product)

            return { 'code': 200, 'data': columnAccess }

        } catch (error) {

            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async GetCityAccess({ id_team }) {
        try {
            var isExist = await this.#findTeamClientById(id_team)
            if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

            var columnAccess = isExist.Team_Client_City_Acces.map(column => column.City_User)

            return { 'code': 200, 'data': columnAccess }

        } catch (error) {

            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async AddOrder({ id_user, id_team, date, nom, telephone, id_city, prix, status, adresse, source, last_action, updownsell, id_product_array }) {

        var isExistClient = await this.#findClientById(id_user)
        if (!isExistClient) return { code: 404, message: 'This ressource doesn\'t exist' }

        var isExistTeam = await this.#findTeamClientById(id_team)
        if (!isExistTeam) return { code: 404, message: 'This ressource doesn\'t exist' }

        if (isExistTeam.nb_order >= isExistTeam.max_order) return { code: 400, message: 'Vous avez dépassé le nombre de commande autorisé' }

        var id_team = isExistTeam.id_team

        isExistTeam.nb_order = isExistTeam.nb_order + 1
        await isExistTeam.save()

        var order = await Order.build({ id_user, date, nom, telephone, id_city, prix, status, adresse, source, id_team, last_action, updownsell, date })

        try {
            var orderSaved = await order.save();

            for (let i = 0; i < id_product_array.length; i++) {
                const element = id_product_array[i];
                var product_order = await Product_Order.build({ id_order: orderSaved.id, id_product: element })
                await product_order.save()
            }

            return { 'code': 200, 'data': orderSaved }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetOrder({ id_user, id_team }) {
        var isExistClient = await this.#findClientById(id_user)
        if (!isExistClient) return { code: 404, message: 'This ressource doesn\'t exist' }

        var isExistTeam = await this.#findTeamClientById(id_team)
        if (!isExistTeam) return { code: 404, message: 'This ressource doesn\'t exist' }

        function timeSince(timestamp) {
            var now = new Date();
            var secondsPast = (now.getTime() - timestamp.getTime()) / 1000;
            if (secondsPast < 60) {
                return parseInt(secondsPast) + 's ago';
            }
            if (secondsPast < 3600) {
                return parseInt(secondsPast / 60) + 'm ago';
            }
            if (secondsPast <= 86400) {
                return parseInt(secondsPast / 3600) + 'h ago';
            }
            if (secondsPast > 86400) {
                var day = timestamp.getDate();
                var month = timestamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
                var year = timestamp.getFullYear() == now.getFullYear() ? "" : " " + timestamp.getFullYear();
                return day + " " + month + year;
            }
        }

        try {
            var order = await Order.findAll({
                where: { id_user, id_team },
                include: [
                    {
                        model: Product_Order,
                        include: [
                            {
                                model: Product
                            }
                        ]
                    },
                    {
                        model: City_User
                    },
                    {
                        model: Team_User
                    }

                ]
            })

            var columnFound = await Column_Of_Order.findAll({
                where: { active: true }
            })

            var formatedDataArr = []
            for (let i = 0; i < order.length; i++) {
                var formatedData = {}
                for (let j = 0; j < columnFound.length; j++) {
                    var value = null

                    switch (columnFound[j].name) {
                        case 'Order id':
                            value = order[i].id
                            break;
                        case 'Date':
                            value = order[i].date.toISOString().slice(0, 10)
                            break;
                        case 'Produit':
                            value = ""
                            order[i].Product_Orders.forEach(element => {
                                value += element.Product.name + ', '
                            });
                            break;
                        case 'Nom':
                            value = order[i].nom
                            break;
                        case 'Prix':
                            value = order[i].prix
                            break;
                        case 'Status':
                            value = order[i].status
                            break;
                        case 'Adresse':
                            value = order[i].adresse
                            break;
                        case 'Source':
                            value = order[i].source
                            break;
                        case 'Agent':
                            value = order[i].Team_User.name
                            break;
                        case 'Last Action':
                            value = timeSince(order[i].updatedAt)
                            break;
                        case 'Up/Downsell':
                            value = order[i].updownsell
                            break;
                        case 'Telephone':
                            value = order[i].telephone
                            break;
                        case 'Ville':
                            value = order[i].City_User.name
                            break;
                    }

                    formatedData[columnFound[j].name.replaceAll(' ', '_')] = value
                }
                formatedDataArr.push(formatedData)
            }

            return { 'code': 200, 'data': formatedDataArr, 'order': order }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }
}

module.exports = ClientTeamServices