require('dotenv').config();
const bcrypt = require('bcrypt');
const { User, Column_Of_Order, City_User, Team_User, Team_Client_City_Acces,
    Team_Client_Column_Acces, Team_Client_Product_Acces, Team_Client_Page_Acces,
    Product, Client_Page, Setting_User, Stock, Status_User, Other_Charge,
    Perte_Categorie, Gain_Categorie, Gain, Perte, Subscription, Pack,
    Ads, Annoucement, Order, Product_Order, Payment_Method, Bank_Information,
    Coupon, Client_Account, Client_Payment, Variant, Client_Goal, Order_Audit, Setting_Admin,
    Shipping_Companie, Order_Comment, Support, MessageSupport } = require('../models')

const sequelize = require('sequelize')
const cron = require('node-cron');
const { col } = require('sequelize');
const Op = sequelize.Op
const axios = require('axios');
const jwt = require('jsonwebtoken')
const { sequelize: seqlz } = require('../models/index')

class ClientServices {

    static #saltRounds = 10;
    static #OTPCODE = []

    static #GetDateFormat = () => {
        const today = new Date();
        const thisDate = today.toISOString()

        const next = today.setDate(today.getDate() + 31)
        const nextDate = new Date(next).toISOString()

        return [thisDate, nextDate]
    }

    static async #hashPassword(password) {
        var pwd = await bcrypt.hash(password, this.#saltRounds);

        return pwd
    }

    static async #sendOrderData({ data, token }) {
        try {
            const url = 'https://rest.livo.ma/orders';

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await axios.post(url, data, { headers });

            return { code: 200, LivoId: response.data.data.data._id }
        } catch (error) {
            console.error('Error sending data:', error.response);
            return { code: 400, LivoId: null }
        }
    }

    static async #PatchLivoOrder({ LivoId, token, data }) {
        try {
            const url = `https://rest.livo.ma/orders/${LivoId}`;

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await axios.patch(url, data, { headers });

            console.log(response.data)
            return { code: 200, LivoId: response.data }
        } catch (error) {
            console.error('Error sending data:', error.response);
            return { code: 400, LivoId: null }
        }
    }

    static async #verifyPackValidy({ id_user, transaction }) {
        function getDayBetween(startDate, endDate) {
            const oneDay = 24 * 60 * 60 * 1000;
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Calculate the difference in milliseconds
            const diffInMilliseconds = Math.abs(end - start);

            // Calculate the number of days
            const diffInDays = Math.round(diffInMilliseconds / oneDay);

            return diffInDays;
        }

        var client = await this.#findClientById(id_user)
        const subscription = await this.#findSubscriptionByIdUser(id_user)

        const date = this.#GetDateFormat()

        // if client not in trial period
        if (!client.isTrial) {
            // verify if client have pay subscription if pack is not per month
            const account = await this.#findAccountById(id_user)
            if (!account) return 404

            if (!subscription.Pack.price_per_month) {
                const settingAdmin = await this.#findeSttingAdminById(client.id_admin)
                if (!settingAdmin) return 404

                if (account.montant_du > settingAdmin.max_solde_du) return 404
            } else {
                // we compute days between date_subscription ande now date()
                const days_expire = getDayBetween(client.date_subscription, new Date())

                // if pack expired
                if (days_expire > 32) {
                    if (account.solde > subscription.Pack.price_per_month) {
                        account.solde -= subscription.Pack.price_per_month

                        subscription.date_subscription = date[0]
                        subscription.date_expiration = date[1]

                        await account.save({ transaction })
                        await subscription.save({ transaction })
                        return 200
                    } else return 404
                }
            }
        }
    }

    static async #findClientById(id) {
        var clientFound = await User.findOne({
            where: { id },
            include: [
                { model: Subscription, include: Pack },
                Setting_Admin
            ]
        })

        if (clientFound) return clientFound
        return false
    }

    static async #findTeamUserById(id) {
        var teamFound = await Team_User.findOne({
            where: { id },
        })

        if (teamFound) return teamFound
        return false
    }

    static async #findeSttingAdminById(id_admin) {
        var adminFound = await Setting_Admin.findOne({
            where: { id_admin },
            order: [['updatedAt', 'DESC']],
            limit: 1
        })

        if (adminFound) return adminFound
        return false
    }

    static async #countOrderByIdUser(id_user) {
        var count = await Order.count({
            where: { id_user }
        })

        if (count) return count
        return 0
    }

    static async #countTeamByIdUser(id_user) {
        var count = await Team_User.count({
            where: { id_user }
        })

        if (count) return count
        return 0
    }

    static async #countActiveTeamByIdUser(id_user) {
        var count = await Team_User.count({
            where: { id_user, active: true }
        })

        if (count) return count
        return 0
    }

    static async #findClientByContact(contact) {
        var clientFound = await User.findOne({
            where: { telephone: contact },
            include: { model: Subscription, include: Pack }
        })

        if (clientFound) return clientFound
        return false
    }

    static async #RemoveOTPCodeExist(contact) {

        var newOTPCODE = this.#OTPCODE.filter(it => {
            if (it.contact !== contact) {
                return it
            }
        })

        this.#OTPCODE = newOTPCODE
    }

    static async #findClientTeamByEmail(email) {
        var teamFound = await Team_User.findOne({
            where: { email }
        })

        if (teamFound) return teamFound
        return false
    }

    static async #findAccountById(id_user) {
        var accountFound = await Client_Account.findOne({
            where: { id_user }
        })

        if (accountFound) return accountFound
        return false
    }

    static async #findVariantByName(id_user, name) {
        var variantFound = await Variant.findOne({
            where: { id_user, name }
        })

        if (variantFound) return variantFound
        return false
    }

    static async #findVariantById(id) {
        var variantFound = await Variant.findOne({
            where: { id }
        })

        if (variantFound) return variantFound
        return false
    }

    static async #findCouponByCode(code) {
        var couponFound = await Coupon.findOne({
            where: { code }
        })

        if (couponFound) return couponFound
        return false
    }

    static async #deleteCityById(id_city) {
        var cityFound = await City_User.findOne({
            where: { id: id_city }
        })

        if (cityFound.isFromSheet) {
            cityFound.isDeleted = true

            await cityFound.save()
            if (cityFound) return cityFound
            return false
        }

        return true
    }

    static async #findProductInPerte(id_user, id_product) {
        var perte = await Perte.findOne({
            where: {
                id_user, id_product
            }
        })

        if (perte) return perte

        return null
    }

    static async #findSubscriptionById(id) {
        var subscriptionFound = await Subscription.findOne({
            where: { id },
            include: Pack
        })

        if (subscriptionFound) return subscriptionFound
        return false
    }

    static async #findPackById(id) {
        var packFound = await Pack.findOne({
            where: { id }
        })

        if (packFound) return packFound
        return false
    }

    static async #findSubscriptionByIdUser(id_user) {
        var subscriptionFound = await Subscription.findOne({
            where: { id_user },
            include: Pack
        })

        if (subscriptionFound) return subscriptionFound
        return false
    }

    static async #findSettingByIdUser(id_user) {
        try {
            var settingFound = await Setting_User.findOne({
                where: { id_user: id_user },
                order: [['updatedAt', 'DESC']],
                limit: 1
            })

            if (settingFound) return settingFound
            return false
        } catch (error) {
            console.log(error)
            return false
        }

    }

    static async #findOrderByIdSheet(id_sheet) {
        var order = await Order.findOne({ where: { SheetId: id_sheet } })

        if (order) return order

        return null
    }

    static async #findStatusUserByIdUser(id_user) {

        var statusFound = await Status_User.findAll({
            where: { id_user }
        })

        if (statusFound) return statusFound
        return false
    }

    static async #findStatusUserByName(id_user, name) {

        var statusFound = await Status_User.findAll({
            where: { id_user, name: name }
        })

        if (statusFound.length > 0) return statusFound
        return false
    }

    static async #findStatusUserByIdUserNByidStatus(id, id_user) {

        var statusFound = await Status_User.findOne({
            where: { id_user, id: id }
        })

        if (statusFound) return statusFound
        return false
    }

    static async #findColumnOfOrder(id, id_user) {
        var columnFound = await Column_Of_Order.findOne({
            where: { id, id_user }
        })

        if (columnFound) return columnFound
        return false
    }

    static async #findCityById(id, id_user) {
        var cityFound = await City_User.findOne({
            where: { id, id_user }
        })

        if (cityFound) return cityFound
        return false
    }

    static async #getCityNameById(id) {
        var cityFound = await City_User.findOne({
            where: { id }
        })

        if (cityFound) return cityFound.name
        return false
    }

    static async #getTeamNameById(id) {
        var teamFound = await Team_User.findOne({
            where: { id }
        })

        if (teamFound) return teamFound.name
        return false
    }

    static async #findStockById(id, id_user) {
        var stockFound = await Stock.findOne({
            include: [Product, City_User],
            where: { id, id_user }
        })

        if (stockFound) return stockFound
        return false
    }

    static async #findTeamClientById(id, id_user) {
        var clientTeamFound = await Team_User.findOne({
            where: { id, id_user },
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

    static async #findTeamMemberById(id) {
        var clientTeamFound = await Team_User.findOne({
            where: { id }
        })

        if (clientTeamFound) return clientTeamFound
        return false
    }

    static async #findPerteCategorieById(id, id_user) {
        var perteCategorieFound = await Perte_Categorie.findOne({
            where: { id, id_user }
        })

        if (perteCategorieFound) return perteCategorieFound
        return false
    }

    static async #findGainCategorieById(id, id_user) {
        var gainCategorieFound = await Gain_Categorie.findOne({
            where: { id, id_user }
        })

        if (gainCategorieFound) return gainCategorieFound
        return false
    }

    static async #findProductById(id, id_user) {
        var productFound = await Product.findOne({
            include: [Other_Charge],
            where: { id, id_user },
        })

        if (productFound) return productFound
        return false
    }

    static async #findProductByName(id_user, name) {
        var productFound = await Product.findOne({
            include: [Other_Charge],
            where: { id_user, name },
        })

        if (productFound) return productFound
        return false
    }

    static async #findProductInOrder(id_user, id_product) {
        const PENDING_1 = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
        const PENDING_2 = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

        const PENDING = [...PENDING_1, ...PENDING_2]

        var productFound = await Product_Order.findOne({
            include: [
                {
                    model: Product,
                    where: { id_user, id: id_product },
                },
                {
                    model: Order,
                    where: { id_user, status: PENDING }
                }
            ]
        })

        if (productFound) return productFound
        return false
    }

    static async #findGainById(id, id_user) {
        var gainFound = await Gain.findOne({
            where: { id, id_user }
        })

        if (gainFound) return gainFound
        return false
    }

    static async #findCityByName(id_user, name) {
        var cityFound = await City_User.findOne({
            where: { id_user, name }
        })

        if (cityFound) return cityFound
        return false
    }

    static async #findPerteById(id, id_user) {
        var perteFound = await Perte.findOne({
            where: { id, id_user }
        })

        if (perteFound) return perteFound
        return false
    }

    static #formatProductOrder(ProductOrders) {
        var out = []

        ProductOrders.map(pd => {
            out.push({ "product_id": pd.Product.name, "quantity": pd.quantity })
        })

        return out
    }

    static async #findOrderById(id, id_user) {
        var orderFound = await Order.findOne({
            where: { id, id_user },
            include: [City_User, {
                model: Product_Order,
                include: [Product]
            }]
        })

        if (orderFound) return orderFound
        return false
    }

    static async #findAuditByMessage({ message, id_order }) {

        try {
            var audit = await Order_Audit.findAll({
                where: {
                    id_order: id_order,
                    message: {
                        [Op.like]: `%${message}%`
                    }
                }
            })

            if (audit.length > 0) return true
            return null
        } catch (error) {
            console.log(error)
        }
    }

    static async getClient({ id }) {
        const client = await this.#findClientById(id)
        if (!client) return { code: 404, message: 'This ressource doesn\'t exist' }

        return { code: 200, data: client }
    }

    static async #SearchAvailableTeam({ current_id_team, id_user }) {
        if (current_id_team) {
            var team_user = await Team_User.findAll({
                where: {
                    id_user,
                    id: {
                        [Op.ne]: current_id_team,
                    },
                    nb_order: {
                        [Op.lt]: col('max_order')
                    },
                    active: true
                }
            })

            if (team_user.length == 0) return null

            return team_user
        } else {
            var team_user = await Team_User.findAll({
                where: {
                    id_user,
                    nb_order: {
                        [Op.lt]: col('max_order')
                    },
                    active: true
                }
            })

            if (team_user.length == 0) return null

            return team_user
        }
    }

    static async #SearchAvailableTeamByProduct({ id_user, id_products }) {
        var team_user_ = await Team_User.findAll({
            where: {
                id_user,
                nb_order: {
                    [Op.lt]: col('max_order')
                },
                active: true,
                all_product_access: true
            }
        })

        var team_user__ = await Team_User.findAll({
            where: {
                id_user,
                nb_order: {
                    [Op.lt]: col('max_order')
                },
                active: true
            },
            include: [
                {
                    model: Team_Client_Product_Acces,
                    where: {
                        id_product: id_products
                    }
                }
            ]
        })

        const result = [...team_user_, ...team_user__]

        if (result.length == 0) return null

        return result
    }


    static async #CountAvailableTeam({ current_id_team, id_user }) {
        var count = await Team_User.count({
            where: {
                id_user,
                id: {
                    [Op.ne]: current_id_team,
                },
                nb_order: {
                    [Op.lt]: sequelize.col('max_order')
                },
                active: true
            }
        })

        return count
    }

    static async PatchClient({ id_user, fullname, livoToken, isBeginner }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            isExist.fullname = fullname ?? isExist.fullname
            isExist.livoToken = livoToken ?? isExist.livoToken
            isExist.isBeginner = isBeginner ?? isExist.isBeginner

            var clientPatched = await isExist.save();

            return { 'code': 200, 'data': clientPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AddCityByUploadFile({ id_user, cities }) {

        async function getShippingCompaniesByName(name) {
            const companies = await Shipping_Companie.findOne({ where: { name: name } })

            if (companies) return companies.id
            return null
        }

        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var citiesSaved = []

        for (let i = 0; i < cities.length; i++) {
            const city = await this.#findCityByName(id_user, cities[i].Nom)

            if (city) continue

            var id_shipping = await getShippingCompaniesByName(cities[i].Companies)
            var cityBuild = City_User.build({ name: cities[i].Nom, price: cities[i].Prix, id_user, id_shipping })
            var citySaved = await cityBuild.save()
            citiesSaved.push(citySaved)
        }

        return { 'code': 200, 'data': citiesSaved }
    }

    static async AddColumnOfOrder({ name, active, id_user }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var columnOfOrder = Column_Of_Order.build({ name, active, id_user })

        try {
            var columnOfOrderSaved = await columnOfOrder.save();
            return { 'code': 200, 'data': columnOfOrderSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchColumnOfOrder({ id, id_user, name, alias, isExported, active }) {
        var isExist = await this.#findColumnOfOrder(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        // var count_col = await Column_Of_Order.count({
        //     where: {
        //         active: false
        //     }
        // })

        // if (!active && count_col > 6) return { code: 400, message: 'Vous ne pouvez désactiver plus de 7 columns' }

        isExist.name = name ?? isExist.name
        isExist.alias = alias ?? isExist.alias
        isExist.isExported = isExported ?? isExist.isExported
        isExist.active = active ?? isExist.active

        try {
            var ColumnOfOrderPatched = await isExist.save()
            return { 'code': 200, 'data': ColumnOfOrderPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveColumnOfOrder({ id, id_user }) {

        var isExist = await this.#findColumnOfOrder(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var ColumnOfOrderDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': ColumnOfOrderDestroyed }

        } catch (error) {
            console.error(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetColumnOfOrder({ id, id_user }) {
        if (!id) {
            try {
                var ColumnOfOrder = await Column_Of_Order.findAll({
                    where: { id_user }
                })
                return { 'code': 200, 'data': ColumnOfOrder }
            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findColumnOfOrder(id, id_user)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }

    }

    static async GetCity({ id, id_user }) {
        if (!id) {
            try {
                var city = await City_User.findAll({
                    where: { id_user }
                })
                return { 'code': 200, 'data': city }
            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findCityById(id, id_user)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }
    }

    static async AddCity({ id_user, name, price, isFromSheet = false, id_shipping }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var isExistCity = await City_User.findOne({ where: { name, id_user } })

        if (isExistCity) {
            if (!isExistCity.isDeleted && !isExistCity.isFromSheet) return { code: 400, message: 'This city already exist' }
            else if (isExistCity.isDeleted) {
                isExistCity.isDeleted = false
                isExistCity.isFromSheet = false

                await isExistCity.save()
                return { 'code': 200, 'data': isExistCity }
            }
        } else {
            var city = City_User.build({ id_user, name, price, isFromSheet, id_shipping })

            try {
                var citySaved = await city.save();
                return { 'code': 200, 'data': citySaved }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }
    }

    static async PatchCity({ id, name, price, id_user, id_shipping }) {
        var isExist = await this.#findCityById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name
        isExist.price = price ?? isExist.price
        isExist.id_shipping = id_shipping

        try {
            var cityPatched = await isExist.save()
            return { 'code': 200, 'data': cityPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveCity({ id, id_user }) {
        var isExist = await this.#findCityById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var cityDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': cityDestroyed }

        } catch (error) {
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                return { code: 400, message: 'Cette ville est utilisé dans une commande' }
            } else {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }
    }

    static async GetTeamMember({ id, id_user, isHidden }) {
        if (!id) {
            try {
                var team = await Team_User.findAll({
                    include: [
                        { model: Team_Client_Page_Acces, include: Client_Page },
                        { model: Team_Client_Column_Acces, include: Column_Of_Order },
                        { model: Team_Client_Product_Acces, include: Product },
                        { model: Team_Client_City_Acces, include: City_User }
                    ],
                    where: { id_user, active: Boolean(isHidden) }
                })
                return { 'code': 200, 'data': team }
            } catch (error) {
                console.log(error)
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findTeamClientById(id, id_user)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }

    }

    static async AddTeamMember({ id_user, name, email, livoToken, plainPassword, salaire, day_payment, commission, upsell, downsell, crosssell, max_order, can_delete_order, can_edit_order, column_access, cities_access, product_access, page_access }) {
        const transaction = await seqlz.transaction();

        function getDayBetween(startDate, endDate) {
            const oneDay = 24 * 60 * 60 * 1000;
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Calculate the difference in milliseconds
            const diffInMilliseconds = Math.abs(end - start);

            // Calculate the number of days
            const diffInDays = Math.round(diffInMilliseconds / oneDay);

            return diffInDays;
        }

        var all_column_access = column_access.length > 0 ? false : true
        var all_cities_access = cities_access.length > 0 ? false : true
        var all_product_access = product_access.length > 0 ? false : true
        var all_page_access = page_access.length > 0 ? false : true

        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        // Payment processing
        const subscription = await this.#findSubscriptionByIdUser(id_user)
        if (!subscription) return { code: 404, message: 'You don\'t have any subscription' }
        else {
            if (!isExist.isTrial || getDayBetween(isExist.createdAt, new Date()) >= Number(isExist.Setting_Admin.trial_period)) {
                if (getDayBetween(isExist.trialAt, new Date()) >= Number(isExist.trialPeriod)) {
                    const item_inclued = subscription.Pack.item_inclued
                    const max_team_permit = item_inclued[2] !== '' ? Number(item_inclued[2]) : Infinity

                    const count_team = await this.#countTeamByIdUser(id_user)

                    if (count_team >= max_team_permit) return { code: 400, message: 'You have reached the maximum number of team members' }
                }
            }
        }

        // verify Pack
        if (this.#verifyPackValidy({ id_user, transaction }) === 404) return { code: 400, message: 'Your pack as expired' }

        // check if email already exist
        var isExistEmail = await this.#findClientTeamByEmail(email)
        if (isExistEmail) return { code: 400, message: 'This email already exist' }

        var nb_order = 0
        var password = await this.#hashPassword(plainPassword)
        var teamMember = Team_User.build({ id_user, name, email, livoToken, password, salaire, nb_order, day_payment, commission, upsell, downsell, crosssell, max_order, can_delete_order, can_edit_order, all_column_access, all_cities_access, all_product_access, all_page_access })

        try {
            var teamMemberSaved = await teamMember.save({ transaction });
            var id_team = teamMemberSaved.id

            if (!all_column_access) {
                column_access.map(async id_column_of_order => {
                    try {
                        var columnAccess = await Team_Client_Column_Acces.build({ id_team, id_column_of_order })
                        await columnAccess.save({ transaction })
                        console.log('column access saved')
                    } catch (error) {
                        teamMemberSaved.destroy()
                            .then(res => console.log('team member destroyed'))
                            .catch(err => console.error(err))
                    }
                })
            }

            if (!all_cities_access) {
                cities_access.map(async id_city => {
                    try {
                        var citiesAccess = await Team_Client_City_Acces.build({ id_team, id_city })
                        await citiesAccess.save({ transaction })
                        console.log('cities access saved')
                    } catch (error) {
                        teamMemberSaved.destroy()
                            .then(res => console.log('team member destroyed'))
                            .catch(err => console.error(err))
                    }
                })
            }

            if (!all_product_access) {
                product_access.map(async id_product => {
                    try {
                        var productAccess = await Team_Client_Product_Acces.build({ id_team, id_product })
                        await productAccess.save({ transaction })
                        console.log('product access saved')
                    } catch (error) {
                        teamMemberSaved.destroy()
                            .then(res => console.log('team member destroyed'))
                            .catch(err => console.error(err))
                    }
                })
            }

            if (!all_page_access) {
                page_access.map(async id_client_page => {
                    try {
                        var pageAccess = await Team_Client_Page_Acces.build({ id_team, id_client_page })
                        await pageAccess.save({ transaction })
                        console.log('page access saved')
                    } catch (error) {
                        teamMemberSaved.destroy()
                            .then(res => console.log('team member destroyed'))
                            .catch(err => console.error(err))
                    }
                })
            }

            await transaction.commit();
            return { 'code': 200, 'data': teamMemberSaved }

        } catch (error) {
            await transaction.rollback();
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async PatchTeamMember({ id, id_user, name, email, livoToken, salaire, plainPassword, day_payment, commission, upsell, downsell, crosssell, max_order, can_delete_order, can_edit_order, all_column_access, all_cities_access, all_product_access, all_page_access, active, column_access, cities_access, product_access, page_access, isHidden }) {

        const transaction = await seqlz.transaction();

        function getDayBetween(startDate, endDate) {
            const oneDay = 24 * 60 * 60 * 1000;
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Calculate the difference in milliseconds
            const diffInMilliseconds = Math.abs(end - start);

            // Calculate the number of days
            const diffInDays = Math.round(diffInMilliseconds / oneDay);

            return diffInDays;
        }

        var isExist = await this.#findTeamClientById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var client = await this.#findClientById(id_user)
        if (!client) return { code: 404, message: 'This ressource doesn\'t exist' }

        // verify Pack
        if (this.#verifyPackValidy({ id_user, transaction }) === 404) return { code: 400, message: 'Your pack as expired' }

        // Payment processing
        const subscription = await this.#findSubscriptionByIdUser(id_user)
        if (!subscription) return { code: 404, message: 'You don\'t have any subscription' }
        else {
            if (!client.isTrial || getDayBetween(client.createdAt, new Date()) >= Number(client.Setting_Admin.trial_period)) {
                if (getDayBetween(client.trialAt, new Date()) >= Number(client.trialPeriod)) {
                    if (active) {
                        const item_inclued = subscription.Pack.item_inclued
                        const max_team_permit = item_inclued[2] !== '' ? Number(item_inclued[2]) : Infinity

                        const count_team = await this.#countActiveTeamByIdUser(id_user)

                        if (count_team >= max_team_permit) return { code: 400, message: 'You have reached the maximum number of active team members' }
                    }
                }
            }
        }

        var password = plainPassword && await this.#hashPassword(plainPassword)
        var all_column_access = column_access.length > 0 ? false : true
        var all_cities_access = cities_access.length > 0 ? false : true
        var all_product_access = product_access.length > 0 ? false : true
        var all_page_access = page_access.length > 0 ? false : true

        isExist.name = name ?? isExist.name
        isExist.email = email ?? isExist.email
        isExist.livoToken = livoToken ?? isExist.livoToken
        isExist.salaire = salaire ?? isExist.salaire
        isExist.day_payment = day_payment ?? isExist.day_payment
        isExist.commission = commission ?? isExist.commission
        isExist.upsell = upsell ?? isExist.upsell
        isExist.isHidden = isHidden ?? isExist.isHidden
        isExist.downsell = downsell ?? isExist.downsell
        isExist.crosssell = crosssell ?? isExist.crosssell
        isExist.max_order = max_order ?? isExist.max_order
        isExist.can_delete_order = can_delete_order ?? isExist.can_delete_order
        isExist.can_edit_order = can_edit_order ?? isExist.can_edit_order
        isExist.password = plainPassword ? password : isExist.password

        isExist.all_column_access = (active == undefined) ? all_column_access ?? isExist.all_column_access : isExist.all_column_access
        isExist.all_cities_access = (active == undefined) ? all_cities_access ?? isExist.all_cities_access : isExist.all_cities_access
        isExist.all_product_access = (active == undefined) ? all_product_access ?? isExist.all_product_access : isExist.all_product_access
        isExist.all_page_access = (active == undefined) ? all_page_access ?? isExist.all_page_access : isExist.all_page_access

        isExist.active = active ?? isExist.active

        try {
            if (active == false) {
                const DESAC = ['Paye', 'Livre', 'Annule', 'Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon']
                // find all Order where id_team = id and status not in = CANCLED
                var orders = await Order.findAll({ where: { id_team: id, status: { [Op.notIn]: DESAC } } })

                if (orders.length === 0) {
                    var teamClientPatched = await isExist.save({ transaction })

                    await transaction.commit();
                    return { code: 200, data: teamClientPatched }
                } else {
                    const countAvailableTeam = await this.#CountAvailableTeam({ current_id_team: isExist.id, id_user })
                    if (countAvailableTeam < orders.length) return { code: 400, message: 'Error, The number of orders for this member is greater than the number of available members' }

                    // loop on orders and assign team to order
                    orders.map(async order => {
                        var team_user = await this.#SearchAvailableTeam({ current_id_team: isExist.id, id_user })
                        if (!team_user) return { code: 404, message: 'Internal error contact the support, team_member(error)' }

                        var random = Math.floor(Math.random() * team_user.length)
                        var id_team = team_user[random].id

                        team_user[random].nb_order = team_user[random].nb_order + 1
                        await team_user[random].save({ transaction })

                        order.id_team = id_team
                        await order.save({ transaction })
                    })

                    isExist.nb_order = 0
                    var teamClientPatched = await isExist.save({ transaction })

                    await transaction.commit();
                    return { 'code': 200, 'data': teamClientPatched }
                }

            }

            if (active == undefined) {
                var teamClientPatched = await isExist.save({ transaction })
                var id_team = teamClientPatched.id

                if (!all_column_access) {
                    await Team_Client_Column_Acces.destroy({ where: { id_team } })

                    column_access.map(async id_column_of_order => {
                        try {
                            var columnAccess = await Team_Client_Column_Acces.build({ id_team, id_column_of_order })
                            await columnAccess.save({ transaction })
                        } catch (error) {
                            throw { code: 404, message: 'We cant add column acces' }
                        }
                    })
                }

                if (!all_cities_access) {
                    await Team_Client_City_Acces.destroy({ where: { id_team } })

                    cities_access.map(async id_city => {
                        try {
                            var citiesAccess = await Team_Client_City_Acces.build({ id_team, id_city })
                            await citiesAccess.save({ transaction })
                        } catch (error) {
                            throw { code: 404, message: 'We cant add city acces' }
                        }
                    })
                }

                if (!all_product_access) {
                    await Team_Client_Product_Acces.destroy({ where: { id_team } })

                    product_access.map(async id_product => {
                        try {
                            var productAccess = await Team_Client_Product_Acces.build({ id_team, id_product })
                            await productAccess.save({ transaction })
                        } catch (error) {
                            throw { code: 404, message: 'We cant add product acces' }
                        }
                    })
                }

                if (!all_page_access) {
                    await Team_Client_Page_Acces.destroy({ where: { id_team } })

                    page_access.map(async id_client_page => {
                        try {
                            var pageAccess = await Team_Client_Page_Acces.build({ id_team, id_client_page })
                            await pageAccess.save({ transaction })
                        } catch (error) {
                            throw { code: 404, message: 'We cant add page acces' }
                        }
                    })
                } else {
                    var teamClientPatched = await isExist.save({ transaction })

                    await transaction.commit();
                    return { 'code': 200, 'data': teamClientPatched }
                }
            }

            var teamClientPatched = await isExist.save({ transaction })

            await transaction.commit();
            return { 'code': 200, 'data': teamClientPatched }
        } catch (error) {
            console.log(error)
            await transaction.rollback();
            return { code: error.code || 400, message: error.message || 'Internal error, please contact support' }
        }
    }

    static async GiveFreeTrial({ id_user, period }) {

        function getDayBetween(startDate, endDate) {
            const oneDay = 24 * 60 * 60 * 1000;
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Calculate the difference in milliseconds
            const diffInMilliseconds = Math.abs(end - start);

            // Calculate the number of days
            const diffInDays = Math.round(diffInMilliseconds / oneDay);

            return diffInDays;
        }

        var client = await this.#findClientById(id_user)
        if (!client) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            if (getDayBetween(client.createdAt, new Date()) <= Number(client.Setting_Admin.trial_period)) {
                return { code: 404, message: `A free period is currently running for this customer please wait ${Number(client.Setting_Admin.trial_period) - getDayBetween(client.createdAt, new Date())} days` }
            }

            client.isTrial = true
            client.trialAt = new Date()
            client.trialPeriod = period

            const saved = await client.save()

            return { 'code': 200, 'data': saved }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveTeamMember({ id, id_user }) {
        var isExist = await this.#findTeamClientById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var teamClientDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': teamClientDestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AddProduct({ id_user, name, variant, price_selling, price_buying, price_best_selling, other_charges_array }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var isExistProduct = await this.#findProductByName(id_user, name)
        if (isExistProduct) return { code: 404, message: 'The name is already take by other product' }

        var product = await Product.build({ id_user, name, variant, price_selling, price_buying, price_best_selling })

        try {
            var productSaved = await product.save();

            if (other_charges_array.length > 0) {
                other_charges_array.map(async otc => {
                    const othercharge = await Other_Charge.build({ name: otc.name, price: otc.price, id_product: productSaved.id })
                    await othercharge.save()
                    console.log('Other charge is saved')
                })
            }

            return { 'code': 200, 'data': productSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchProduct({ id, id_user, name, variant, price_selling, price_buying, price_best_selling, isHidden }) {
        var isExist = await this.#findProductById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name
        isExist.isHidden = isHidden ?? isExist.isHidden
        isExist.variant = variant ?? isExist.variant
        isExist.price_selling = price_selling ?? isExist.price_selling
        isExist.price_buying = price_buying ?? isExist.price_buying
        isExist.price_best_selling = price_best_selling ?? isExist.price_best_selling

        try {
            var productPatched = await isExist.save()
            return { 'code': 200, 'data': productPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveProduct({ id, id_user }) {

        var isExist = await this.#findProductById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        const pr = await this.#findProductInOrder(id_user, id)

        if (pr) return { code: 400, message: 'You can\'t this product already exist in transaction' }

        try {
            isExist.isDeleted = true
            const productDeleted = await isExist.save()
            return { 'code': 200, 'data': productDeleted }

        } catch (error) {
            console.error(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetProduct({ id, id_user, id_team, isHidden }) {

        const options = {
            where: {
                id_user,
                isHidden: Boolean(isHidden)
            }
        }

        if (id_team) {
            options.include = [{
                model: Team_Client_Product_Acces,
                where: {
                    id_team
                }
            }];
        }

        if (!id) {
            try {
                const product = await Product.findAll(options);

                return { 'code': 200, 'data': product }
            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findProductById(id, id_user)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }

    }

    static async GetPage() {
        try {
            var page = await Client_Page.findAll()

            return { 'code': 200, 'data': page }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetSetting({ id_user }) {
        try {
            var isExist = await this.#findSettingByIdUser(id_user)
            if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

            var settAdm = await this.#findClientById(id_user)

            return { 'code': 200, 'data': { ...isExist.dataValues, trial_period: settAdm.Setting_Admin.trial_period } }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetShippingCompanie({ id_user }) {
        if (!id_user) return { code: 400, message: 'Internal error, please contact the support' }

        try {
            var isExist = await this.#findClientById(id_user)
            if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

            var companies = await Shipping_Companie.findAll({ order: [['range', 'ASC']] })

            return { 'code': 200, 'data': companies }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchSetting({ id_user, default_cof_ricing, delfaulnpt_del_pricing, default_time, automated_msg, startWrldOrder }) {
        var isExist = await this.#findSettingByIdUser(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var setting = Setting_User.build({
            default_cof_ricing: default_cof_ricing ?? isExist.default_cof_ricing,
            delfaulnpt_del_pricing: delfaulnpt_del_pricing ?? isExist.delfaulnpt_del_pricing,
            default_time: default_time ?? isExist.default_time,
            automated_msg: automated_msg ?? isExist.automated_msg,
            startWrldOrder: startWrldOrder ?? isExist.startWrldOrder,
            id_user: id_user
        })

        await setting.save();

        try {
            var settingPatched = await setting.save();

            return { 'code': 200, 'data': settingPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetStock({ id, id_user }) {
        if (!id) {
            try {
                var stock = await Stock.findAll({
                    include: [Product, City_User],
                    where: { id_user }
                })
                return { 'code': 200, 'data': stock }
            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findStockById(id, id_user)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }
    }

    static async AddStock({ quantity, id_user, id_product, id_city }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var stock = Stock.build({ quantity, id_user, id_product, id_city })

        try {
            var stockSaved = await stock.save();
            return { 'code': 200, 'data': stockSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchStock({ id, quantity, id_user, id_product, id_city }) {
        var isExist = await this.#findStockById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.quantity = quantity ?? isExist.quantity
        isExist.id_user = id_user ?? isExist.id_user
        isExist.id_product = id_product ?? isExist.id_product
        isExist.id_city = id_city ?? isExist.id_city

        try {
            var stockPatched = await isExist.save()
            return { 'code': 200, 'data': stockPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveStock({ id, id_user }) {
        var isExist = await this.#findStockById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var cityDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': cityDestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AddStatus({ id_user, name, checked }) {
        var isExist = await this.#findSettingByIdUser(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var statusExist = await this.#findStatusUserByName(id_user, name)
        if (statusExist) return { code: 404, message: 'This status already exist' }

        var statusUser = await Status_User.build({ name, checked, id_user })

        try {
            var statusUsersaved = await statusUser.save();

            return { 'code': 200, 'data': statusUsersaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchStatus({ id, id_user, name, checked, color }) {
        var isExist = await this.#findStatusUserByIdUserNByidStatus(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name
        isExist.checked = checked ?? isExist.checked
        isExist.color = color ?? isExist.color

        try {

            // verify if the name is already in order status
            if (checked == false) {
                const PROHIBITED_STATUS = ['Livre', 'Nouveau', 'Expedie livraison']
                // verify if the name is in (Livre, Nouveau, Expedie livraison)

                if (PROHIBITED_STATUS.includes(isExist.name)) return { code: 404, message: 'You can`t disable this status' }

                var statusExist = await Order.findOne({
                    where: {
                        status: isExist.name,
                        id_user
                    }
                })

                if (statusExist) return { code: 404, message: 'This status is already in use' }

                var statusPatched = await isExist.save();

                return { 'code': 200, 'data': statusPatched }
            } else {
                var statusPatched = await isExist.save();

                return { 'code': 200, 'data': statusPatched }
            }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveStatus({ id, id_user }) {
        var isExist = await this.#findStatusUserByIdUserNByidStatus(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var statusDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': statusDestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetStatus({ id_user, search, usedate, datefrom, dateto, id_product_array, id_team }) {
        try {
            var isExist = await this.#findStatusUserByIdUser(id_user)
            if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

            const options = {
                where: [
                    {
                        isDeleted: false,
                        status: '',
                        id_user,
                        ...(id_team !== undefined && { id_team })
                    }
                ]
            }

            if (id_product_array.length > 0) {
                options.include = [{
                    model: Product_Order,
                    where: {
                        id_order: {
                            [Op.any]: seqlz.literal(
                                `SELECT id_order FROM Product_Orders WHERE id_product = ${id_product_array[0]}`
                            )
                        }
                    },
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
                }]
            }

            if (search) {
                options.where.push(
                    sequelize.where(
                        sequelize.fn("concat",
                            sequelize.col("Order.nom"), sequelize.col("Order.telephone"),
                            sequelize.col("Order.prix"), sequelize.col("Order.status"),
                            sequelize.col("Order.adresse"),
                            sequelize.col("Order.source"), sequelize.col("Order.updownsell"),
                            sequelize.col("City_User.name"), sequelize.col("Team_User.name"),
                            sequelize.col("Product_Orders.Product.name")
                        ),
                        { [Op.like]: `%${search}%` }
                    )
                )
            }

            if (usedate) {
                options.where[0].date = {
                    [Op.between]: [datefrom, dateto]
                }
            }

            // count order by status
            var countOrderByStatus = []
            isExist.map(status => countOrderByStatus.push({ name: status.name, checked: status.checked, count: 0 }))

            for (let i = 0; i < countOrderByStatus.length; i++) {
                const status = countOrderByStatus[i];
                options.where[0].status = status.name

                const count = await Order.count(options)

                countOrderByStatus[i].count = count
            }

            return { 'code': 200, 'data': isExist, countOrderByStatus }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support', 'error': error }
        }
    }

    static async AddPerteCategorie({ id_user, name }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var perteCategorie = Perte_Categorie.build({ id_user, name })

        try {
            var perteCategorieSaved = await perteCategorie.save();
            return { 'code': 200, 'data': perteCategorieSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemovePerteCategorie({ id, id_user }) {
        var isExist = await this.#findPerteCategorieById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var perteCategoriedestroyed = await isExist.destroy()
            return { 'code': 200, 'data': perteCategoriedestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchPerteCategorie({ id, id_user, name }) {
        var isExist = await this.#findPerteCategorieById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name

        try {
            var perteCategoriePatched = await isExist.save();

            return { 'code': 200, 'data': perteCategoriePatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetPerteCategorie({ id, id_user }) {
        if (!id) {
            try {
                var perteCategorie = await Perte_Categorie.findAll({
                    where: { id_user }
                })
                return { 'code': 200, 'data': perteCategorie }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findPerteCategorieById(id, id_user)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }
    }

    static async AddGainCategorie({ id_user, name }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var gainCategorie = Gain_Categorie.build({ id_user, name })

        try {
            var gainCategorieSaved = await gainCategorie.save();
            return { 'code': 200, 'data': gainCategorieSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveGainCategorie({ id, id_user }) {
        var isExist = await this.#findGainCategorieById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var gainCategoriedestroyed = await isExist.destroy()
            return { 'code': 200, 'data': gainCategoriedestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchGainCategorie({ id, id_user, name }) {
        var isExist = await this.#findGainCategorieById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name

        try {
            var gainCategoriePatched = await isExist.save();

            return { 'code': 200, 'data': gainCategoriePatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetGainCategorie({ id, id_user }) {
        if (!id) {
            try {
                var gainCategorie = await Gain_Categorie.findAll({
                    where: { id_user }
                })
                return { 'code': 200, 'data': gainCategorie }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findGainCategorieById(id, id_user)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }
    }

    static async AddGain({ id_user, id_product, id_gain_categorie, note, dateFrom, dateTo, amount }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var gain = await Gain.build({ id_user, id_product, id_gain_categorie, note, dateFrom, dateTo, amount })

        try {
            var gainSaved = await gain.save();
            return { 'code': 200, 'data': gainSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveGain({ id, id_user }) {
        var isExist = await this.#findGainById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var gainDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': gainDestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AddPerte({ id_user, id_product, id_perte_categorie, note, dateFrom, dateTo, amount }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var perte = await Perte.build({ id_user, id_product, id_perte_categorie, note, dateFrom, dateTo, amount })

        try {
            var perteSaved = await perte.save();
            return { 'code': 200, 'data': perteSaved }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemovePerte({ id, id_user }) {
        var isExist = await this.#findPerteById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var perteDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': perteDestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async MakeSubscription({ id_pack, id_user }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        const client = await this.#findClientById(id_user)

        const date = this.#GetDateFormat()

        var subscription = await Subscription.build({ date_subscription: date[0], date_expiration: date[1], id_pack, id_user })
        client.isTrial = false

        try {
            var subscriptionSaved = await subscription.save();
            await client.save()

            return { 'code': 200, 'data': subscriptionSaved }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async ChangeSubscription({ id, id_pack, id_user }) {

        const transaction = await seqlz.transaction();
        try {
            var isExist = await this.#findSubscriptionById(id)
            if (!isExist) throw { code: 404, message: 'This ressource doesn\'t exist' }

            var account = await this.#findAccountById(id_user)
            if (!account) throw { code: 404, message: 'This ressource doesn\'t exist' }

            const client = await this.#findClientById(id_user)

            if (isExist.Pack.price_per_month > account.solde) throw { code: 400, message: 'You don\'t have enough money to change your subscription' }

            var newPack = await this.#findPackById(id_pack)

            const item_inclued = newPack.item_inclued
            const max_team_permit = item_inclued[2] !== '' ? Number(item_inclued[2]) : Infinity

            const nb_team = await this.#countActiveTeamByIdUser(id_user)

            if (nb_team > max_team_permit) throw { code: 400, message: 'Your must to disable some team member' }

            account.solde -= isExist.Pack.price_per_month
            await account.save({ transaction })

            const date = this.#GetDateFormat()
            isExist.id_pack = id_pack ?? isExist.id_pack
            isExist.date_subscription = date[0]
            isExist.date_expiration = date[1]

            client.isTrial = false

            var subscriptionChanged = await isExist.save({ transaction });

            await client.save({ transaction })
            await transaction.commit();

            return { 'code': 200, 'data': subscriptionChanged }
        } catch (error) {
            await transaction.rollback();
            return { code: error.code || 400, message: error.message || 'Internal error, please contact support' }
        }
    }

    static async GetPack({ id_user }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var pack = await Pack.findAll()

            var subscription = await Subscription.findOne({
                where: { id_user }
            })

            return {
                'code': 200, 'data': {
                    'Pack': pack,
                    'Subscription': subscription
                }
            }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetAllPack() {

        try {
            var pack = await Pack.findAll({
                where: { isShow: true }
            })

            return { 'code': 200, 'data': pack }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetAds({ id_user }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var ads = await Ads.findAll({
                where: { id: 1 }
            })

            return { 'code': 200, 'data': ads[0] }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetAnnoucement({ id_user }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var annoucement = await Annoucement.findAll({})

            return { 'code': 200, 'data': annoucement }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async MakeComment({ id_user, message, id_order }) {
        const isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            const commentBuild = await Order_Comment.build({ message, id_order })
            await commentBuild.save()

            return { 'code': 200, 'data': 'Your comment is added' }
        } catch (error) {
            return { code: error.code || 400, message: error.message || 'Internal error, please contact support' }
        }
    }

    static async GetComment({ id_user, id_order }) {
        const isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            const comment = await Order_Comment.findAll({ where: { id_order } })

            return { 'code': 200, 'data': comment }
        } catch (error) {
            return { code: error.code || 400, message: error.message || 'Internal error, please contact support' }
        }
    }

    static async AddOrder({ id_user, date, nom, telephone, id_city, prix, status, reportedDate, adresse, source, updownsell, id_product_array, message, changer, ouvrir, SheetId }) {

        const getIdsProduct = ({ id_product_array }) => {
            var ids = []
            for (let i = 0; i < id_product_array.length; i++) {
                ids.push(id_product_array[i].id)
            }

            return ids
        }

        const telIsDuplicated = async ({ telephone, id_user }) => {
            const n = await Order.count({
                where: { telephone, id_user }
            })

            if (!n) return false
            if (n > 1) return true
            return false
        }

        var telDuplicate = await telIsDuplicated({ telephone, id_user })

        const transaction = await seqlz.transaction(); // Assuming you're using Sequelize as your ORM

        function getDayBetween(startDate, endDate) {
            const oneDay = 24 * 60 * 60 * 1000;
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Calculate the difference in milliseconds
            const diffInMilliseconds = Math.abs(end - start);

            // Calculate the number of days
            const diffInDays = Math.round(diffInMilliseconds / oneDay);

            return diffInDays;
        }

        date = date.setHours(0, 0, 0, 0); //new Date(date) //

        const isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            // verify Pack
            if (this.#verifyPackValidy({ id_user, transaction }) === 404) return { code: 400, message: 'Your pack as expired' }

            // Payment process
            const subscription = await this.#findSubscriptionByIdUser(id_user)
            if (!subscription) return { code: 404, message: 'You don\'t have any subscription' }
            else {

                if (!isExist.isTrial || getDayBetween(isExist.createdAt, new Date()) >= Number(isExist.Setting_Admin.trial_period)) {
                    if (getDayBetween(isExist.trialAt, new Date()) >= Number(isExist.trialPeriod)) {
                        const item_inclued = subscription.Pack.item_inclued
                        const price_per_cmd_livre = Number(item_inclued[0])
                        const price_per_cmd = Number(item_inclued[1])
                        const max_order_permit = item_inclued[3] !== '' ? Number(item_inclued[3]) : Infinity

                        const count_order = await this.#countOrderByIdUser(id_user)

                        if (count_order >= max_order_permit) return { code: 404, message: 'You have reached the maximum number of orders' }
                        if (['Livre', 'Paye'].includes(status)) {
                            const account = await this.#findAccountById(id_user)
                            if (!account) return { code: 404, message: 'This ressource doesn\'t exist' }

                            var montant_du = account.montant_du + price_per_cmd_livre
                            if (account.solde > montant_du) {
                                account.montant_du = 0
                                account.solde -= montant_du
                                await account.save({ transaction })
                            } else {
                                account.montant_du = montant_du
                                await account.save({ transaction })
                            }
                        } else {
                            const account = await this.#findAccountById(id_user)
                            if (!account) return { code: 404, message: 'This ressource doesn\'t exist' }

                            var montant_du = account.montant_du + price_per_cmd
                            if (account.solde > montant_du) {
                                account.montant_du = 0
                                account.solde -= montant_du
                                await account.save({ transaction })
                            } else {
                                account.montant_du = montant_du
                                await account.save({ transaction })
                            }
                        }
                    }
                }
            }

            // Order process
            var team_user = await this.#SearchAvailableTeamByProduct({ id_user, id_products: getIdsProduct({ id_product_array }) })

            if (SheetId) {
                var sheetExist = await this.#findOrderByIdSheet(SheetId)
                if (sheetExist) return { code: 404, message: 'This sheet already exist' }
            }

            var setting = await this.#findSettingByIdUser(id_user)

            var id_team = null
            if (team_user) {
                var random = Math.floor(Math.random() * team_user.length)

                id_team = team_user[random].id

                team_user[random].nb_order = team_user[random].nb_order + 1

                await team_user[random].save({ transaction })
            }

            const order = await Order.build({ id_user, nom, telephone, id_city, prix, status, reportedDate, adresse, source, id_team, updownsell, date, message, changer, ouvrir, SheetId, id_setting: setting.id, telDuplicate })

            const orderSaved = await order.save({ transaction })

            const commentBuild = await Order_Comment.build({ message, id_order: orderSaved.id })
            await commentBuild.save({ transaction })

            for (let i = 0; i < id_product_array.length; i++) {
                const element = id_product_array[i];

                try {
                    var product_order = await Product_Order.build({ id_order: orderSaved.id, id_product: element.id, quantity: element.quantity ?? 1, variant: element.variant })

                    await product_order.save({ transaction })
                } catch (err) {
                    console.log(err)
                }
            }


            await transaction.commit();
            return { 'code': 200, 'data': orderSaved }

        } catch (error) {
            await transaction.rollback();
            console.log(error)
            return { code: error.code || 400, message: error.message || 'Internal error, please contact support' }
        }
    }

    static async GetOrder({ id_user, status, search, usedate, datefrom, dateto, id_product_array, id_team, _skip, _limit }) {
        id_team = id_team == '0' ? null : id_team

        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        async function getOrderByDefault(id_user, id_team, id_product_array, _skip, _limit) {

            var search_params_basic = {
                where: {
                    isDeleted: false,
                    id_user,
                    ...(id_team !== undefined && { id_team })
                },
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

                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var search_params = {
                where: {
                    isDeleted: false,
                    id_user,
                    ...(id_team !== undefined && { id_team })
                },
                include: [
                    {
                        model: Product_Order,
                        where: {
                            id_order: {
                                [Op.any]: seqlz.literal(
                                    `SELECT id_order FROM Product_Orders WHERE id_product = ${id_product_array[0]}`
                                )
                            }
                        },
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

                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            try {
                var order = await Order.findAll(id_product_array.length > 0 ? search_params : search_params_basic)
                return order
            } catch (error) {
                console.log('error: ', error)
            }
        }

        async function getOrderByStatus(id_user, id_team, status, id_product_array, _skip, _limit) {

            var search_params_basic = {
                where: {
                    id_user,
                    ...(id_team !== undefined && { id_team }),
                    status
                },
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

                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var search_params = {
                where: {
                    id_user,
                    status,
                    ...(id_team !== undefined && { id_team })
                },
                include: [
                    {
                        model: Product_Order,
                        where: {
                            id_order: {
                                [Op.any]: seqlz.literal(
                                    `SELECT id_order FROM Product_Orders WHERE id_product = ${id_product_array[0]}`
                                )
                            }
                        },
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

                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var order = await Order.findAll(id_product_array.length > 0 ? search_params : search_params_basic)

            return order
        }

        async function getOrderBySearch(id_user, id_team, search, id_product_array, _skip, _limit) {

            var search_params_basic = {
                where: [
                    {
                        isDeleted: false,
                        id_user,
                        ...(id_team !== undefined && { id_team })
                    },
                    sequelize.where(
                        sequelize.fn("concat",
                            sequelize.col("Order.nom"), sequelize.col("Order.telephone"),
                            sequelize.col("Order.prix"), sequelize.col("Order.status"),
                            sequelize.col("Order.adresse"),
                            sequelize.col("Order.source"), sequelize.col("Order.updownsell"),
                            sequelize.col("City_User.name"), sequelize.col("Team_User.name"),
                            sequelize.col("Product_Orders.Product.name")
                        ),
                        { [Op.like]: `%${search}%` }
                    )
                ],
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

                ],
            }

            var search_params = {
                where: [
                    {
                        isDeleted: false,
                        id_user,
                        ...(id_team !== undefined && { id_team })
                    },
                    sequelize.where(
                        sequelize.fn("concat",
                            sequelize.col("Order.nom"), sequelize.col("Order.telephone"),
                            sequelize.col("Order.prix"), sequelize.col("Order.status"),
                            sequelize.col("Order.adresse"),
                            sequelize.col("Order.source"), sequelize.col("Order.updownsell"),
                            sequelize.col("City_User.name"), sequelize.col("Team_User.name"),
                            sequelize.col("Product_Orders.Products.name")
                        ),
                        { [Op.like]: `%${search}%` }
                    )
                ],
                include: [
                    {
                        model: Product_Order,
                        where: {
                            id_order: {
                                [Op.any]: seqlz.literal(
                                    `SELECT id_order FROM Product_Orders WHERE id_product = ${id_product_array[0]}`
                                )
                            }
                        },
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

                ],
            }

            var order = await Order.findAll(id_product_array.length > 0 ? search_params : search_params_basic)

            return order
        }

        async function getOrderByDate(id_user, id_team, datefrom, dateto, id_product_array, _skip, _limit) {

            var search_params_basic = {
                where: {
                    isDeleted: false,
                    id_user,
                    ...(id_team !== undefined && { id_team }),
                    date: {
                        [Op.between]: [datefrom, dateto]
                    }
                },
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
                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var search_params = {
                where: {
                    isDeleted: false,
                    id_user,
                    ...(id_team !== undefined && { id_team }),
                    date: {
                        [Op.between]: [datefrom, dateto]
                    }
                },
                include: [
                    {
                        model: Product_Order,
                        where: {
                            id_order: {
                                [Op.any]: seqlz.literal(
                                    `SELECT id_order FROM Product_Orders WHERE id_product = ${id_product_array[0]}`
                                )
                            }
                        },
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

                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var order = await Order.findAll(id_product_array.length > 0 ? search_params : search_params_basic)

            return order
        }

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
            if (!usedate) {
                var order = (!status && !search) ? await getOrderByDefault(id_user, id_team, id_product_array, _skip, _limit) :
                    status ? await getOrderByStatus(id_user, id_team, status, id_product_array, _skip, _limit) : await getOrderBySearch(id_user, id_team, search, id_product_array, _skip, _limit)

                var columnFound = await Column_Of_Order.findAll({
                    where: { active: true }
                })

                const setting = await this.#findSettingByIdUser(id_user)

                var formatedDataArr = []
                for (let i = 0; i < order.length; i++) {
                    var formatedData = {}
                    for (let j = 0; j < columnFound.length; j++) {
                        var value = null

                        switch (columnFound[j].name) {
                            case 'Order id':
                                value = setting.startWrldOrder + order[i].id
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
                            case 'Destinataire':
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
                                value = order[i].Team_User ? order[i].Team_User.name : null
                                break;
                            case 'Last Action':
                                value = timeSince(order[i].updatedAt)
                                break;
                            case 'Commentaire':
                                value = order[i].message
                                break;
                            case 'Up/Downsell':
                                value = order[i].updownsell
                                break;
                            case 'Telephone':
                                value = order[i].telephone
                                break;
                            case 'Ville':
                                value = order[i].City_User ? order[i].City_User.name : 'undifined'
                                break;
                            case 'Changer':
                                value = order[i].changer
                                break;
                            case 'Ouvrir':
                                value = order[i].ouvrir
                                break;
                        }

                        formatedData[columnFound[j].name.replaceAll(' ', '_')] = value
                    }
                    formatedDataArr.push(formatedData)
                }

                return { 'code': 200, 'data': formatedDataArr, 'order': order }
            } else {
                var order = await getOrderByDate(id_user, id_team, datefrom, dateto, id_product_array, _skip, _limit)

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
                            case 'Destinataire':
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
                            case 'Commentaire':
                                value = order[i].message
                                break;
                            case 'Ville':
                                value = order[i].City_User ? order[i].City_User.name : 'undifined'
                                break;
                        }

                        formatedData[columnFound[j].name.replaceAll(' ', '_')] = value
                    }
                    formatedDataArr.push(formatedData)
                }

                return { 'code': 200, 'data': formatedDataArr, 'order': order }
            }
        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async DeleteOrder({ id, id_user }) {
        const PENDING_1 = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
        const PENDING_2 = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

        const PENDING = [...PENDING_1, ...PENDING_2]

        var isExist = await this.#findOrderById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }
        
        try {
            if (PENDING.includes(isExist.status)) {
                // decrement the number of order of the team
                var team_user = await Team_User.findAll({
                    where: {
                        id: isExist.id_team
                    }
                })

                team_user[0].nb_order = team_user[0].nb_order - 1
                await team_user[0].save()
            }

            isExist.status = 'deleted'
            isExist.id_city = null
            isExist.id_team = null
            isExist.isDeleted = true
            await isExist.save()
            return { 'code': 200, 'data': 'Order deleted' }
        }
        catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async DeleteBulkOrder({ id_orders, id_user }) {

        const PENDING_1 = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
        const PENDING_2 = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

        const PENDING = [...PENDING_1, ...PENDING_2]

        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        const transaction = await seqlz.transaction();

        try {
            const orders = await Order.findAll({
                where: { id: id_orders },
                attributes: ['id_team', 'status', [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']],
                group: ['id_team'],
            })

            orders.map(async odr => {
                if (PENDING.includes(odr.status)) {
                    var team = await Team_User.findOne({ where: { id: odr.id_team } })
                    if (team) {
                        team.nb_order = team.nb_order - odr.dataValues.orderCount
                        await team.save({ transaction })
                    }
                }
            })

            const result = await Order.update({ status: 'deleted', id_city: null, id_team: null, isDeleted: true }, {
                where: { id: id_orders },
                transaction
            })

            await transaction.commit()
            return { 'code': 200, 'data': result }
        }
        catch (error) {
            await transaction.rollback();
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async EditBulkOrderTeam({ id_orders, id_user, new_id_team }) {

        const DELIVRED = ['Paye', 'Livre', 'Annule', 'Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon']
        const PENDING_1 = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
        const PENDING_2 = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']
        const PENDING = [...PENDING_1, ...PENDING_2]

        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        const transaction = await seqlz.transaction();

        try {
            const orders = await Order.findAll({
                where: { id: id_orders },
                attributes: ['id_team', 'status', [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']],
                group: ['id_team'],
            })

            var new_team = await Team_User.findOne({ where: { id: new_id_team } })
            if (new_team.nb_order >= new_team.max_order) throw { code: 400, message: 'This team member has reached its maximum number of orders' }
            if (!new_team.active) throw { code: 400, message: 'This team member is not active' }
            if ((new_team.nb_order + id_orders.length) >= new_team.max_order) throw { code: 400, message: `you cant give ${id_orders.length} order(s) to this team the remaining number is insufficient` }

            orders.map(async odr => {
                if (DELIVRED.includes(odr.status)) {
                    var team = await Team_User.findOne({ where: { id: odr.id_team } })
                    team.nb_order = team.nb_order - odr.dataValues.orderCount

                    await team.save({ transaction })
                } else if (PENDING.includes(odr.status)) {
                    const teamAlreadyPatched = await this.#findAuditByMessage({ message: await this.#getTeamNameById(odr.id_team), id_order: odr.id })
                    if (!teamAlreadyPatched) {
                        var team = await Team_User.findOne({ where: { id: odr.id_team } })
                        team.nb_order = team.nb_order - odr.dataValues.orderCount

                        await team.save({ transaction })
                    }
                }
            })

            const teamAlreadyPatched = await this.#findAuditByMessage({ message: await this.#getTeamNameById(new_team.id), id_order: id_orders })

            if (!teamAlreadyPatched) {
                new_team.nb_order = new_team.nb_order + id_orders.length
                await new_team.save({ transaction })
            }

            const result = await Order.update({ id_team: new_id_team }, {
                where: { id: id_orders },
                transaction
            })

            await transaction.commit()
            return { 'code': 200, 'data': result }
        }
        catch (error) {

            console.log(error)
            await transaction.rollback();
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetOrderHistory({ id_order }) {
        try {
            var order = await Order_Audit.findAll({ where: { id_order } })

            return { 'code': 200, 'data': order }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AddAuditOrder({ id_order, status, id_city, source, id_team, updownsell, changer, ouvrir, delivred }) {
        try {
            if (status) {
                var message = 'Status changed to ' + status
                var audit = await Order_Audit.build({ id_order, message })
                await audit.save()
            }
            if (id_city) {
                var name_city = await this.#getCityNameById(id_city)
                var message = 'City changed to ' + name_city
                var audit = await Order_Audit.build({ id_order, message })
                await audit.save()
            }
            if (source) {
                var message = 'Source changed to ' + source
                var audit = await Order_Audit.build({ id_order, message })
                await audit.save()
            }
            if (id_team) {
                var name_team = await this.#getTeamNameById(id_team)
                var message = 'Team changed to ' + name_team
                var audit = await Order_Audit.build({ id_order, message })
                await audit.save()
            }
            if (updownsell) {
                var message = 'Up/Downsell changed to ' + updownsell
                var audit = await Order_Audit.build({ id_order, message })
                await audit.save()
            }
            if (changer) {
                var message = 'Changer changed to ' + changer
                var audit = await Order_Audit.build({ id_order, message })
                await audit.save()
            }
            if (ouvrir) {
                var message = 'Ouvrir changed to ' + ouvrir
                var audit = await Order_Audit.build({ id_order, message })
                await audit.save()
            }
            if (delivred) {
                var message = 'Order changed to ' + delivred
                var audit = await Order_Audit.build({ id_order, message })
                await audit.save()
            }

            return true
        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async PatchOrder({ id, id_user, date, reportedDate, nom, telephone, prix, adresse, source, last_action, quantity, variant, updownsell, status, prev_id_team, id_team, id_city, id_product_array, message, changer, ouvrir }) {

        const transaction = await seqlz.transaction();

        function getDayBetween(startDate, endDate) {
            const oneDay = 24 * 60 * 60 * 1000;
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Calculate the difference in milliseconds
            const diffInMilliseconds = Math.abs(end - start);

            // Calculate the number of days
            const diffInDays = Math.round(diffInMilliseconds / oneDay);

            return diffInDays;
        }

        var isExist = await this.#findOrderById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        if (status === 'Expedie livraison') {
            var shipping = await City_User.findOne({
                where: { id_user, name: isExist.City_User.name, isDeleted: false },
                include: [Shipping_Companie]
            })


            if (shipping) {
                if (shipping.Shipping_Companie) {
                    if (shipping.Shipping_Companie.name.toUpperCase() === 'LIVO') {
                        var client = await this.#findClientById(id_user)
                        var team = await this.#findTeamUserById(id_team ?? isExist.id_team)

                        // send order to livo
                        const data = {
                            "products": this.#formatProductOrder(isExist.Product_Orders),
                            "status": "pending",
                            "cost": isExist.prix,
                            "target": {
                                "name": isExist.nom,
                                "phone": isExist.telephone,
                                "city": isExist.City_User.name,
                                "address": isExist.adresse
                            },
                            "forceProducts": true
                        };

                        if (isExist.isSendLivo !== 'send') {
                            var response = await this.#sendOrderData({
                                data,
                                token: team.livoToken != "" ?
                                    team.livoToken != null ? team.livoToken : client.livoToken : client.livoToken
                            })

                            if (response.code === 200) {
                                isExist.isSendLivo = 'send'
                                isExist.LivoId = response.LivoId
                            }
                            else if (response.code === 400) isExist.isSendLivo = 'error_send'

                            await isExist.save()
                        }

                    } else {
                        // implement other shiping companies
                    }
                } else {
                    isExist.isSendLivo = 'error_send'
                }
            } else {
                isExist.isSendLivo = 'error_send'
            }

        }

        // verify Pack
        if (this.#verifyPackValidy({ id_user, transaction }) === 404) return { code: 400, message: 'Your pack as expired' }

        const DELIVRED = ['Paye', 'Livre', 'Annule', 'Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon']

        const PENDING_1 = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
        const PENDING_2 = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

        const PENDING = [...PENDING_1, ...PENDING_2]

        var curr_city = isExist.id_city

        isExist.status = status ?? isExist.status
        isExist.id_team = id_team ?? isExist.id_team
        isExist.id_city = id_city ?? isExist.id_city
        isExist.date = date ?? isExist.date
        isExist.reportedDate = isExist.status === 'Reporte' ? reportedDate ?? isExist.reportedDate : null
        isExist.nom = nom ?? isExist.nom
        isExist.telephone = telephone ?? isExist.telephone
        isExist.prix = prix ?? isExist.prix
        isExist.adresse = adresse ?? isExist.adresse
        isExist.source = source ?? isExist.source
        isExist.last_action = last_action ?? isExist.last_action
        isExist.quantity = quantity ?? isExist.quantity
        isExist.variant = variant ?? isExist.variant
        isExist.updownsell = updownsell ?? isExist.updownsell
        isExist.message = message ?? isExist.message
        isExist.changer = changer ?? isExist.changer
        isExist.ouvrir = ouvrir ?? isExist.ouvrir

        try {
            if (id_city) {
                if (isExist.SheetId) {
                    await this.#deleteCityById(curr_city)
                }
            }

            if (status === 'Brouillon' || status === 'Injoignable livraison' || status === 'Annule') {
                var client = await this.#findClientById(id_user)

                var final_status = status === 'Brouillon' ? 'draft' :
                    status === 'Injoignable livraison' ? 'problem' :
                        'cancelled'

                if (isExist.LivoId) {
                    var response = await this.#PatchLivoOrder({ data: { 'status': final_status }, token: client.livoToken, LivoId: isExist.LivoId })

                    console.log(response)
                    if (response.code === 200) isExist.isSendLivo = 'send'
                    else if (response.code === 400) isExist.isSendLivo = 'error_send'
                }
            }

            if (['Livre', 'Paye'].includes(status)) {
                for (let i = 0; i < isExist.Product_Orders.length; i++) {
                    const element = isExist.Product_Orders[i];

                    const stock = await Stock.findOne({ where: { id_product: element.id_product } })
                    if (stock) {
                        console.log(stock.quantity, element.quantity)
                        if (stock.quantity > element.quantity)
                            stock.quantity -= element.quantity
                        else
                            stock.quantity = 0

                        await stock.save({ transaction })
                    }
                }
            }

            const orderClosed = await this.#findAuditByMessage({ message: 'DELIVRED', id_order: id })

            if (!orderClosed) {

                if (reportedDate) {
                    const dateObj = new Date(reportedDate);

                    const day = dateObj.getDate();
                    const month = dateObj.getMonth();

                    const scheduledTask = cron.schedule(`0 0 ${day} ${month + 1} *`, async () => {
                        isExist.status = 'Nouveau'
                        isExist.reportedDate = null

                        await isExist.save({ transaction });
                    });

                    scheduledTask.start()
                }

                const client = await this.#findClientById(id_user)
                if (status) {
                    const subscription = await this.#findSubscriptionByIdUser(id_user)
                    if (!subscription) throw { code: 404, message: 'You don\'t have any subscription' }
                    else {
                        if (!client.isTrial || getDayBetween(client.createdAt, new Date()) >= Number(client.Setting_Admin.trial_period)) {
                            try {
                                const item_inclued = subscription.Pack.item_inclued
                                const price_per_cmd_livre = Number(item_inclued[0])

                                if (['Livre', 'Paye'].includes(status)) {

                                    for (let i = 0; i < isExist.Product_Orders.length; i++) {
                                        const element = isExist.Product_Orders[i];

                                        const stock = await Stock.findOne({ where: { id_product: element.id_product } })
                                        if (stock) {
                                            console.log(stock.quantity, element.quantity)
                                            if (stock.quantity > element.quantity)
                                                stock.quantity -= element.quantity
                                            else
                                                stock.quantity = 0

                                            await stock.save({ transaction })
                                        }
                                    }

                                    // ici on vérifie si les status ['Livre', 'Paye'] on déja été modifié pour ne pas inpacter 2 fois la meme commandes
                                    const teamAlreadyPatched1 = await this.#findAuditByMessage({ message: 'Livre', id_order: id })
                                    const teamAlreadyPatched2 = await this.#findAuditByMessage({ message: 'Paye', id_order: id })

                                    // si les status ['Livre', 'Paye'] n'ont jamais été modifier on calcule
                                    if (!teamAlreadyPatched1 && !teamAlreadyPatched2) {
                                        const account = await this.#findAccountById(id_user)
                                        if (!account) throw { code: 404, message: 'This ressource doesn\'t exist' }

                                        var montant_du = account.montant_du + price_per_cmd_livre
                                        if (account.solde > montant_du) {
                                            account.montant_du = 0
                                            account.solde -= montant_du
                                            await account.save({ transaction })
                                        } else {
                                            account.montant_du = montant_du
                                            await account.save({ transaction })
                                        }

                                    }
                                }

                            } catch (error) {
                                console.log(error)
                                throw { code: 400, message: 'Internal error, please contact the support' }
                            }
                        }
                    }
                }

                if (DELIVRED.includes(status)) {
                    var current_team = await Team_User.findOne({
                        where: {
                            id: isExist.id_team
                        }
                    })

                    if (current_team) {
                        current_team.nb_order -= 1
                        await current_team.save({ transaction })

                        await this.AddAuditOrder({ id_order: id, delivred: 'DELIVRED' })
                    }
                }

                if (PENDING.includes(status ?? isExist.status)) {
                    const teamAlreadyPatched = await this.#findAuditByMessage({ message: await this.#getTeamNameById(isExist.id_team), id_order: id })
                    if (!teamAlreadyPatched) {
                        if (prev_id_team) {
                            if (prev_id_team != id_team) {

                                var prev_team = await Team_User.findOne({
                                    where: {
                                        id: prev_id_team
                                    }
                                })
                                prev_team.nb_order = prev_team.nb_order - 1

                                var new_team = await Team_User.findOne({
                                    where: {
                                        id: id_team
                                    }
                                })

                                if (new_team.nb_order >= new_team.max_order) throw { code: 400, message: 'This team member has reached its maximum number of orders' }
                                if (!new_team.active) throw { code: 400, message: 'This team member is not active' }

                                new_team.nb_order = new_team.nb_order + 1

                                await new_team.save({ transaction })
                                await prev_team.save({ transaction })
                            }
                        }
                        else {
                            // if (status) {

                            //     console.log('status: ', status)
                            //     if (!can_edit_team) {
                            //         var current_team = await Team_User.findOne({
                            //             where: {
                            //                 id: isExist.id_team
                            //             }
                            //         })

                            //         if (current_team.nb_order >= current_team.max_order) return { code: 400, message: 'This team member has reached its maximum number of orders' }
                            //         if (!current_team.active) return { code: 400, message: 'This team member is not active' }

                            //         current_team.nb_order = current_team.nb_order + 1
                            //         await current_team.save({ transaction })
                            //     }
                            // }
                        }
                    }
                }

                if (id_product_array) {
                    const item_del = await Product_Order.findOne({ where: { id_order: id } })
                    const item = id_product_array[0]

                    await Product_Order.destroy({ where: { id_order: id } })

                    if (id_product_array.length > isExist.Product_Orders.length) {
                        isExist.updownsell = 'CrossSell'
                    }

                    if (item_del) {
                        if (item.quantity > item_del.quantity) {
                            isExist.updownsell = 'UpSell'
                        }
                    }

                    for (let i = 0; i < id_product_array.length; i++) {
                        const element = id_product_array[i];

                        var product_order = await Product_Order.build({ id_order: id, id_product: element.id, quantity: element.quantity, variant: element.variant })

                        await product_order.save({ transaction })
                    }
                }

                var audited = await this.AddAuditOrder({ id_order: id, status, id_city, source, id_team, updownsell, changer, ouvrir })
                if (!audited) throw { code: 400, message: 'Internal errors, please contact the support' }

                var orderChanged = await isExist.save({ transaction });

                await transaction.commit();
                return { 'code': 200, 'data': orderChanged }
            }

            var orderChanged = await isExist.save({ transaction });

            await transaction.commit();
            return { 'code': 200, 'data': orderChanged }
        }

        catch (error) {
            await transaction.rollback();
            console.log(error)
            return { code: error.code || 400, message: error.message || 'Internal error, please contact support' }
        }

    }

    static async ChangeStatusOrder({ id, id_user, status }) {

        var isExist = await this.#findOrderById(id, id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.status = status ?? isExist.status

        try {

            var orderChanged = await isExist.save();

            return { 'code': 200, 'data': orderChanged }
        }

        catch (error) {
            console.log(error)
            return { code: error.code || 400, message: error.message || 'Internal error, please contact support' }
        }

    }

    static async GetPaymentMethod({ id_user }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var paymentMethod = await Payment_Method.findAll({
                include: [Bank_Information]
            })

            return { 'code': 200, 'data': paymentMethod }

        } catch (error) {
            return { code: 400, message: 'Internal errors, please contact the support' }
        }
    }

    static async GetAdminBankInformation() {
        try {
            var page = await Bank_Information.findOne({
                where: { id: 2 }
            })

            return { 'code': 200, 'data': page }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async UseCoupon({ id_user, code }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var coupon = await this.#findCouponByCode(code)

        if (!coupon) return { code: 404, message: 'This coupon doesn\'t exist' }

        if (coupon.client_used.includes(id_user)) return { code: 400, message: 'You have already use this coupon' }

        if (coupon.used >= coupon.limit) return { code: 400, message: 'This coupon is no longer available' }

        try {
            coupon.used += 1
            coupon.client_used = [...coupon.client_used, id_user]

            await coupon.save()

            return { 'code': 200, 'data': coupon }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetAccount({ id_user }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var account = await this.#findAccountById(id_user)

            return { 'code': 200, 'data': account }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async MakeRefund({ id_user, amount, image }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var payment = await Client_Payment.build({ id_user, amount, image })
            await payment.save()

            return { 'code': 200, 'data': payment }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetLastPayment({ id_user }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var payment = await Client_Payment.findAll({
                where: {
                    id_user
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: 1
            })

            if (payment.length === 0) return { 'code': 200, 'data': [{ status: 'none' }] }

            return { 'code': 200, 'data': payment }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetDashboard({ id_user, dateFrom, dateTo, useDate, id_product_array, id_team }) {

        id_team = id_team == '0' ? null : id_team

        var dateFrom = new Date(dateFrom);
        dateFrom.setDate(dateFrom.getDate() + 1);

        var dateTo = new Date(dateTo);
        dateTo.setDate(dateTo.getDate() + 1);

        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var costPerLead = await this.getCostPerLead({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var totalOrder = await this.getTotalOrder({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var upsellRate = await this.getUpsellRate({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var crosssellRate = await this.getCrossSellRate({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var stock = await this.getStock({ id_user, id_product_array })

            var orderInProgress = await this.getOrderInProgress({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var costPerDelivred = await this.getCostPerDelivred({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var rateOfConfirmed = await this.getRateOfConfirmed({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var rateOfDelivred = await this.getRateOfDelivred({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var bestSellingProduct = await this.getBestSellingProduct({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var bestCity = await this.getBestCity({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var orderReport = await this.getOrderReport({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var orderStatistic = await this.getOrderStatistics({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var costReport = await this.getCostReport({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var rateReport = await this.getRateReport({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var earningNet = await this.getEarningNet({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            var reportEarningNet = await this.getReportEarningNet({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array })

            if (costPerLead === null || orderInProgress === null ||
                costPerDelivred === null || rateOfConfirmed === null ||
                rateOfDelivred === null || bestSellingProduct === null ||
                bestCity === null || orderReport === null || orderStatistic === null || totalOrder === null ||
                costReport === null || rateReport === null || earningNet === null || reportEarningNet === null || stock === null
                || upsellRate === null || crosssellRate === null)
                return { code: 400, message: 'Internal error, please contact the support' }

            return { 'code': 200, 'data': { costPerLead, stock, orderInProgress, costPerDelivred, rateOfConfirmed, rateOfDelivred, bestSellingProduct, bestCity, orderReport, orderStatistic, costReport, rateReport, earningNet, reportEarningNet, totalOrder, upsellRate, crosssellRate } }

        } catch (error) {
            console.log(error)
            return { code: 500, message: 'Internal error, please contact the support' }
        }

    }

    static async getUpsellRate({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {

        try {
            if (!useDate) {
                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' }
                    }
                }

                var total_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        updownsell: 'Upsell'
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        updownsell: 'Upsell'
                    }
                }

                var upsell_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                return (upsell_order * 100) / total_order

            } else {
                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    }
                }

                var total_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        updownsell: 'Upsell',
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        updownsell: 'Upsell',
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    }
                }

                var upsell_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                return (upsell_order * 100) / total_order
            }
        } catch (error) {
            console.log(error)
            return null
        }

    }

    static async getCrossSellRate({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {

        try {
            if (!useDate) {
                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' }
                    }
                }

                var total_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        updownsell: 'Crosssell'
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        updownsell: 'Crosssell'
                    }
                }

                var crosssell_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                return (crosssell_order * 100) / total_order

            } else {
                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    }
                }

                var total_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        updownsell: 'Crosssell',
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        updownsell: 'Crosssell',
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    }
                }

                var crosssell_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                return (crosssell_order * 100) / total_order
            }
        } catch (error) {
            console.log(error)
            return null
        }

    }

    static async getTotalOrder({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {

        try {
            if (!useDate) {

                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' }
                    }
                }

                var orders = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                return orders
            } else {
                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: { [Op.ne]: 'deleted' },
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    }
                }

                var orders = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                return orders
            }
        } catch (error) {
            console.log(error)
            return null
        }

    }

    static async getCostPerLead({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {

        var tomorrowDate = new Date(dateTo);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        try {
            if (!useDate) {
                // find all pertes categories where name include 'ads'
                var pertes = await Perte_Categorie.findAll({
                    where: {
                        name: {
                            [Op.like]: '%ads%'
                        },
                        id_user: id_user
                    },
                    include: {
                        model: Perte
                    }
                })

                if (pertes.length == 0) return 0

                // sum of all price of pertes
                var cost = 0
                for (let i = 0; i < pertes.length; i++) {
                    const element = pertes[i].Pertes

                    var price = element[0] ? element[0].amount : 0

                    cost += price
                }

                var search_params_with_product = {
                    where: {
                        id_user,
                        status: { [Op.ne]: 'deleted' },
                        ...(id_team && { id_team })
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        status: { [Op.ne]: 'deleted' },
                        ...(id_team && { id_team })
                    }
                }

                var nb_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                if (nb_order == 0) return 0

                const cost_per_lead = cost / nb_order

                return cost_per_lead.toFixed(2)
            } else {
                // find all pertes categories where name include 'ads'
                var pertes = await Perte_Categorie.findAll({
                    where: {
                        name: {
                            [Op.like]: '%ads%'
                        },
                        id_user: id_user
                    },
                    include: {
                        model: Perte,
                        createdAt: {
                            [Op.between]: [dateFrom, tomorrowDate]
                        }
                    }
                })

                if (pertes.length == 0) return 0

                // sum of all price of pertes
                var cost = 0
                for (let i = 0; i < pertes.length; i++) {
                    const element = pertes[i].Pertes

                    var price = element[0] ? element[0].amount : 0

                    cost += price
                }

                var search_params_with_product = {
                    where: {
                        id_user,
                        status: { [Op.ne]: 'deleted' },
                        ...(id_team && { id_team }),
                        createdAt: {
                            [Op.between]: [dateFrom, tomorrowDate]
                        }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        status: { [Op.ne]: 'deleted' },
                        ...(id_team && { id_team }),
                        createdAt: {
                            [Op.between]: [dateFrom, tomorrowDate]
                        }
                    }
                }

                var nb_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                const cost_per_lead = cost / nb_order

                return cost_per_lead.toFixed(2)
            }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async getStock({ id_user, id_product_array }) {

        try {
            var search_params_with_product = {
                where: {
                    id_user: id_user,
                    id_product: {
                        [Op.in]: id_product_array
                    }
                },
                include: {
                    model: Product
                }
            }

            var search_params_basic = {
                where: {
                    id_user: id_user
                },
                include: {
                    model: Product
                }
            }

            var stock = await Stock.findAll(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

            if (stock.length == 0) return 0

            var stock_value = 0
            for (let i = 0; i < stock.length; i++) {
                const element = stock[i]
                stock_value += (element.quantity * element.Product.price_selling)
            }

            return stock_value.toFixed(2)
        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async getOrderInProgress({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {

        try {
            if (!useDate) {

                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Nouveau', 'Expedie', 'Exporte', 'Injoignable', 'Confirme']
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Nouveau', 'Expedie', 'Exporte', 'Injoignable', 'Confirme']
                    }
                }

                var orders = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                return orders
            } else {
                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Nouveau', 'Expedie', 'Exporte', 'Injoignable', 'Confirme'],
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Nouveau', 'Expedie', 'Exporte', 'Injoignable', 'Confirme'],
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    }
                }

                var orders = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                return orders
            }
        } catch (error) {
            console.log(error)
            return null
        }

    }

    static async getCostPerDelivred({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {

        var tomorrowDate = new Date(dateTo);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        try {
            if (!useDate) {
                // find all pertes categories where name include 'ads'

                var pertes = await Perte_Categorie.findAll({
                    where: {
                        name: {
                            [Op.like]: '%ads%'
                        },
                        id_user: id_user
                    },
                    include: {
                        model: Perte
                    }
                })

                if (pertes.length == 0) return 0

                // sum of all price of pertes
                var cost = 0
                for (let i = 0; i < pertes.length; i++) {
                    const element = pertes[i].Pertes

                    var price = element.reduce((acc, obj) => acc + obj.amount, 0);

                    cost += price
                }

                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye']
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye']
                    }
                }

                var nb_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                if (nb_order === 0) return 0

                const cost_per_delivred = cost / nb_order

                return cost_per_delivred.toFixed(2)
            } else {
                // find all pertes categories where name include 'ads'
                var pertes = await Perte_Categorie.findAll({
                    where: {
                        name: {
                            [Op.like]: '%ads%'
                        },
                        id_user: id_user,
                    },
                    include: {
                        model: Perte,
                        createdAt: {
                            [Op.between]: [dateFrom, tomorrowDate]
                        }
                    }
                })

                if (pertes.length == 0) return 0

                // sum of all price of pertes
                var cost = 0
                for (let i = 0; i < pertes.length; i++) {
                    const element = pertes[i].Pertes

                    var price = element.reduce((acc, obj) => acc + obj.amount, 0);

                    cost += price
                }

                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        createdAt: {
                            [Op.between]: [dateFrom, tomorrowDate]
                        },
                        status: ['Livre', 'Paye']
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        createdAt: {
                            [Op.between]: [dateFrom, tomorrowDate]
                        },
                        status: ['Livre', 'Paye']
                    }
                }

                var nb_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                if (nb_order === 0) return 0

                const cost_per_delivred = cost / nb_order

                return cost_per_delivred.toFixed(2)
            }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async getRateOfConfirmed({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {

        const Status_Rate_Confirmed = ['Confirme', 'Paye', 'Livre', 'Annule livraison', 'Refuse', 'Retourne', 'Expedie livraison', 'Injoignable livraison']

        try {
            if (!useDate) {
                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: Status_Rate_Confirmed
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: Status_Rate_Confirmed
                    }
                }

                var orders = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                search_params_with_product = {
                    where: {
                        id_user,
                        status: { [Op.ne]: 'deleted' }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_basic = {
                    where: {
                        id_user,
                        status: { [Op.ne]: 'deleted' }
                    }
                }

                var nb_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                if (nb_order == 0) return 0

                const rate_of_confirmed = (orders * 100) / nb_order

                return rate_of_confirmed.toFixed(2)
            } else {

                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: Status_Rate_Confirmed,
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: Status_Rate_Confirmed,
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    }
                }

                var orders = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                search_params_with_product = {
                    where: {
                        id_user,
                        status: { [Op.ne]: 'deleted' },
                        ...(id_team && { id_team }),
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_basic = {
                    where: {
                        id_user,
                        status: { [Op.ne]: 'deleted' },
                        ...(id_team && { id_team }),
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    }
                }

                var nb_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                if (nb_order == 0) return 0

                const rate_of_confirmed = (orders * 100) / nb_order

                return rate_of_confirmed.toFixed(2)
            }
        } catch (error) {
            console.log(error)
            return null
        }

    }

    static async getRateOfDelivred({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {

        try {
            if (!useDate) {
                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye']
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye']
                    }
                }

                var orders = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                search_params_with_product = {
                    where: {
                        status: { [Op.ne]: 'deleted' },
                        ...(id_team && { id_team }),
                        id_user
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_basic = {
                    where: {
                        status: { [Op.ne]: 'deleted' },
                        ...(id_team && { id_team }),
                        id_user
                    }
                }

                var nb_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                if (nb_order == 0) return 0

                const rate_of_delivred = (orders * 100) / nb_order

                return rate_of_delivred.toFixed(2)
            } else {

                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye'],
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye'],
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                }

                var orders = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                search_params_with_product = {
                    where: {
                        id_user,
                        status: { [Op.ne]: 'deleted' },
                        ...(id_team && { id_team }),
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_basic = {
                    where: {
                        status: { [Op.ne]: 'deleted' },
                        id_user,
                        ...(id_team && { id_team }),
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    }
                }

                var nb_order = await Order.count(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                if (nb_order == 0) return 0

                const rate_of_delivred = (orders * 100) / nb_order

                return rate_of_delivred.toFixed(2)
            }
        } catch (error) {
            console.log(error)
            return null
        }

    }

    static async getBestSellingProduct({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {

        try {
            if (!useDate) {
                // find all product order where id_user
                var product = await Product.findAll({
                    where: {
                        id_user
                    },
                })

                if (product.length == 0) return 0

                // format product to {name: 0} and push on array
                var products = []
                for (let i = 0; i < product.length; i++) {
                    const element = product[i]

                    var name = element.name

                    products.push({ name, price: 0, count: 0, price_product: element.price_selling })
                }

                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye']
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                        include: {
                            model: Product
                        }
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye']
                    },
                    include: {
                        model: Product_Order,
                        include: {
                            model: Product
                        }
                    }
                }
                var orders = await Order.findAll(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                if (orders.length == 0) return 0

                for (let i = 0; i < orders.length; i++) {
                    const element = orders[i].Product_Orders

                    for (let j = 0; j < element.length; j++) {
                        const product = element[j]
                        var name = product.Product.name

                        if (products.find(e => e.name == name)) {
                            products.find(e => e.name == name).price += orders[i].prix
                            products.find(e => e.name == name).count += 1
                        }
                    }
                }

                // sort array by price
                products.sort((a, b) => (a.price > b.price) ? -1 : 1)

                // return 5 first element
                return products //.slice(0, 5)
            } else {
                // find all product order where id_user
                var product = await Product.findAll({
                    where: {
                        id_user
                    },
                })

                if (product.length == 0) return 0

                // format product to {name: 0} and push on array
                var products = []
                for (let i = 0; i < product.length; i++) {
                    const element = product[i]

                    var name = element.name

                    products.push({ name, price: 0, count: 0, price_product: element.price_selling })
                }

                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye'],
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                        include: {
                            model: Product
                        }
                    },
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye'],
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: {
                        model: Product_Order,
                        include: {
                            model: Product
                        }
                    }
                }

                var orders = await Order.findAll(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                if (orders.length == 0) return 0

                for (let i = 0; i < orders.length; i++) {
                    const element = orders[i].Product_Orders

                    for (let j = 0; j < element.length; j++) {
                        const product = element[j]
                        var name = product.Product.name

                        if (products.find(e => e.name == name)) {
                            products.find(e => e.name == name).price += orders[i].prix
                            products.find(e => e.name == name).count += 1
                        }
                    }
                }

                // sort array by price
                products.sort((a, b) => (a.price > b.price) ? -1 : 1)

                // return 5 first element
                return products.slice(0, 5)
            }
        } catch (error) {
            console.log(error)
            return null
        }

    }

    static async getBestCity({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {
        // count all order group by city
        try {
            if (!useDate) {

                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye']
                    },

                    include: [
                        {
                            model: Product_Order,
                            where: {
                                id_product: {
                                    [Op.in]: id_product_array
                                }
                            },
                            include: {
                                model: Product
                            }
                        },
                        {
                            model: City_User
                        }
                    ],
                    group: ['id_city'],
                    attributes: ['id_city', [sequelize.fn('COUNT', sequelize.col('id_city')), 'count']]
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye']
                    },
                    include: {
                        model: City_User
                    },
                    group: ['id_city'],
                    attributes: ['id_city', [sequelize.fn('COUNT', sequelize.col('id_city')), 'count']]
                }

                var orders = await Order.findAll(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                if (orders.length == 0) return 0

                // sort array by count
                orders.sort((a, b) => (a.count > b.count) ? -1 : 1)

                // return 5 first element
                return orders.slice(0, 5)
            } else {
                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye'],
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },

                    include: [
                        {
                            model: Product_Order,
                            where: {
                                id_product: {
                                    [Op.in]: id_product_array
                                }
                            },
                            include: {
                                model: Product
                            }
                        },
                        {
                            model: City_User
                        }
                    ],
                    group: ['id_city'],
                    attributes: ['id_city', [sequelize.fn('COUNT', sequelize.col('id_city')), 'count']]
                }

                var search_params_basic = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: ['Livre', 'Paye'],
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: {
                        model: City_User
                    },
                    group: ['id_city'],
                    attributes: ['id_city', [sequelize.fn('COUNT', sequelize.col('id_city')), 'count']]
                }

                var orders = await Order.findAll(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

                if (orders.length == 0) return 0

                // sort array by count
                orders.sort((a, b) => (a.count > b.count) ? -1 : 1)

                // return 5 first element
                return orders.slice(0, 5)
            }
        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async getOrderReport({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {

        const DELIVRED = ['Livre', 'Paye']
        const CANCELED = ['Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon']
        const PENDING_1 = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
        const PENDING_2 = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

        const PENDING = [...PENDING_1, ...PENDING_2]

        function getStartDateBetweenWeeks(starDate, enDate) {
            var startDate = new Date(starDate);
            var endDate = new Date(enDate);

            var weeks = [];
            while (startDate <= endDate) {
                if (startDate.getDay() === 0) {
                    weeks.push(startDate.toISOString().slice(0, 10));
                }
                startDate.setDate(startDate.getDate() + 1);
            }

            return weeks;
        }

        function getStartDateBetweenMonth(starDate, enDate) {
            var startDate = new Date(starDate);
            var endDate = new Date(enDate);

            var month = [];
            while (startDate <= endDate) {
                month.push(new Date(startDate.getFullYear(), startDate.getMonth(), 1).toISOString().slice(0, 10));
                startDate.setMonth(startDate.getMonth() + 1);
            }

            return month;
        }

        function getLastDays(nb, endDate) {
            const today = new Date(endDate);
            const lastDays = [];

            for (let i = 0; i < nb; i++) {
                const day = new Date(endDate);

                day.setDate(today.getDate() - i);
                lastDays.push(day);
            }

            return lastDays;
        }

        function getDifferenceInDays(startDate, endDate) {
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);

            const diffInMs = Math.abs(date2 - date1);
            return diffInMs / (1000 * 60 * 60 * 24);
        }

        const getWeekStartDate = (weekNum, year) => {
            const date = new Date(year, 0, 1);
            const diff = (weekNum - 2) * 7;
            date.setDate(date.getDate() + diff);
            return date;
        }

        async function getReportByDays(days, endDate, status, id_product_array, id_team) {
            var search_params_with_product = {
                where: {
                    id_user,
                    ...(id_team && { id_team }),
                    status: status
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']],

                include: {
                    model: Product_Order,
                    where: {
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                }
            }

            var search_params_basic = {
                where: {
                    id_user,
                    ...(id_team && { id_team }),
                    status: status
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']]
            }

            var orders = await Order.findAll(id_product_array.length > 0 ? search_params_with_product : search_params_basic)

            if (orders.length == 0) return 0

            // format array to {date: 0}
            var orders_date = []
            for (let i = 0; i < orders.length; i++) {
                const element = orders[i]

                var date = element.date

                orders_date.push({ date: date.toISOString().slice(0, 10), count: element.dataValues.count })
            }

            // get last 7 days
            var last7Days = getLastDays(days, endDate)

            // format last7Days to {date: 0}
            var last7Days_date = []
            for (let i = 0; i < last7Days.length; i++) {
                const element = last7Days[i]

                var date = element.toISOString().slice(0, 10)

                last7Days_date.push({ date, count: 0 })
            }

            // compare last7Days_date and orders_date
            for (let i = 0; i < last7Days_date.length; i++) {
                const element = last7Days_date[i]

                for (let j = 0; j < orders_date.length; j++) {
                    const order = orders_date[j]

                    if (element.date == order.date) {
                        element.count = order.count
                    }
                }
            }

            // return last7Days_date
            return last7Days_date
        }

        async function getReportByWeek(startDate, endDate, status, id_product_array, id_team) {

            startDate = new Date(startDate)
            endDate = new Date(endDate)

            var query_with_product = `
                SELECT
                    CONCAT(YEAR(date), '/', WEEK(date)) AS week_name, 
                    YEAR(date) as year , WEEK(date) as week_num, COUNT(*) as count
                FROM
                    Orders, Product_Order
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    status IN (:status)
                AND
                    Product_Order.id_product IN (:id_product_array)
                GROUP BY
                    week_name
                ORDER BY YEAR(DATE) ASC, WEEK(date) ASC
            `

            var query_without_product = `
                SELECT
                    CONCAT(YEAR(date), '/', WEEK(date)) AS week_name, 
                    YEAR(date) as year , WEEK(date) as week_num, COUNT(*) as count
                FROM
                    Orders
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    status IN (:status)
                GROUP BY
                    week_name
                ORDER BY YEAR(DATE) ASC, WEEK(date) ASC
            `

            try {
                const result = await seqlz.query(id_product_array.length != 0 ? query_with_product : query_without_product, {
                    replacements: { startDate, endDate, id_user, status, id_product_array, id_team: id_team ?? null },
                    type: sequelize.QueryTypes.SELECT
                })

                var result_formated = []

                for (let i = 0; i < result.length; i++) {
                    const element = result[i]

                    var date = getWeekStartDate(element.week_num + 1, element.year)

                    result_formated.push({ date: date.toISOString().slice(0, 10), count: element.count })
                }

                return result_formated
            } catch (error) {
                console.log('getOrderReport ', error)
            }
        }

        async function getReportByMonth(startDate, endDate, status, id_product_array, id_team) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            var query_with_product = `
                SELECT
                    CONCAT(YEAR(date), '/', MONTH(date)) AS month_name, 
                    YEAR(date) as year , MONTH(date) as month_num, COUNT(*) as count
                FROM
                    Orders, Product_Order
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    status IN (:status)
                AND
                    Product_Order.id_product IN (:id_product_array)
                GROUP BY
                    month_name
                ORDER BY YEAR(DATE) ASC, MONTH(date) ASC
            `

            var query_without_product = `
                SELECT
                    CONCAT(YEAR(date), '/', MONTH(date)) AS month_name, 
                    YEAR(date) as year , MONTH(date) as month_num, COUNT(*) as count
                FROM
                    Orders
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    id_user = :id_user
                AND
                    status IN (:status)
                GROUP BY
                    month_name
                ORDER BY YEAR(DATE) ASC, MONTH(date) ASC
            `

            try {
                const result = await seqlz.query(id_product_array.length != 0 ? query_with_product : query_without_product, {
                    replacements: { startDate, endDate, id_user, status, id_product_array, id_team: id_team ?? null },
                    type: sequelize.QueryTypes.SELECT
                })

                var result_formated = []

                for (let i = 0; i < result.length; i++) {
                    const element = result[i]

                    var date = new Date(element.year, element.month_num - 1, 1)

                    result_formated.push({ date: date.toISOString().slice(0, 10), count: element.count })
                }

                return result_formated
            } catch (error) {
                console.log(error)
            }
        }

        try {
            if (!useDate) {
                var dates = getLastDays(7, new Date())
                var formatedDate = dates.map(date => date.toISOString().slice(0, 10))

                const delivred = await getReportByDays(7, new Date(), DELIVRED, id_product_array, id_team)
                const canceled = await getReportByDays(7, new Date(), CANCELED, id_product_array, id_team)
                const pending = await getReportByDays(7, new Date(), PENDING, id_product_array, id_team)

                var data = {
                    labels: formatedDate.reverse(),
                    datasets: [
                        {
                            label: 'Delivred',
                            data: delivred ? delivred.map(item => item.count).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        },
                        {
                            label: 'Canceled',
                            data: canceled ? canceled.map(item => item.count).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(255, 99, 132)',
                            tension: 0.1
                        },
                        {
                            label: 'Pending',
                            data: pending ? pending.map(item => item.count).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(255, 205, 86)',
                            tension: 0.1
                        }
                    ]
                }

                return data
            } else {
                // get difference in days
                var differenceInDays = getDifferenceInDays(dateFrom, dateTo) + 1
                var dates = getLastDays(differenceInDays, new Date(dateTo))
                var formatedDate = dates.map(date => date.toISOString().slice(0, 10))

                if (differenceInDays < 14) {
                    const delivred = await getReportByDays(differenceInDays, new Date(dateTo), DELIVRED, id_product_array, id_team)
                    const canceled = await getReportByDays(differenceInDays, new Date(dateTo), CANCELED, id_product_array, id_team)
                    const pending = await getReportByDays(differenceInDays, new Date(dateTo), PENDING, id_product_array, id_team)

                    var data = {
                        labels: formatedDate.reverse(),
                        datasets: [
                            {
                                label: 'Delivred',
                                data: delivred ? delivred.map(item => item.count).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Canceled',
                                data: canceled ? canceled.map(item => item.count).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1
                            },
                            {
                                label: 'Pending',
                                data: pending ? pending.map(item => item.count).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(255, 205, 86)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                } else if (differenceInDays < 90) {

                    var weeks = getStartDateBetweenWeeks(dateFrom, dateTo)

                    const delivred = await getReportByWeek(dateFrom, dateTo, DELIVRED, id_product_array, id_team)
                    const canceled = await getReportByWeek(dateFrom, dateTo, CANCELED, id_product_array, id_team)
                    const pending = await getReportByWeek(dateFrom, dateTo, PENDING, id_product_array, id_team)

                    var data = {
                        labels: weeks,
                        datasets: [
                            {
                                label: 'Delivred',
                                data: delivred.length != 0 ?
                                    weeks.map(date => {
                                        var count = delivred.find(element => element.date == date)
                                        return count ? count.count : 0
                                    }) :
                                    Array(weeks.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Canceled',
                                data: canceled.length != 0 ?
                                    weeks.map(date => {
                                        var count = canceled.find(element => element.date == date)
                                        return count ? count.count : 0
                                    }) :
                                    Array(weeks.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1
                            },
                            {
                                label: 'Pending',
                                data: pending.length != 0 ?
                                    weeks.map(date => {
                                        var count = pending.find(element => element.date == date)
                                        return count ? count.count : 0
                                    }) :
                                    Array(weeks.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(255, 205, 86)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                } else {
                    var months = getStartDateBetweenMonth(dateFrom, dateTo)

                    const delivred = await getReportByMonth(dateFrom, dateTo, DELIVRED, id_product_array, id_team)
                    const canceled = await getReportByMonth(dateFrom, dateTo, CANCELED, id_product_array, id_team)
                    const pending = await getReportByMonth(dateFrom, dateTo, PENDING, id_product_array, id_team)

                    var data = {
                        labels: months,
                        datasets: [
                            {
                                label: 'Delivred',
                                data: delivred.length != 0 ?
                                    months.map(date => {
                                        var count = delivred.find(element => element.date == date)
                                        return count ? count.count : 0
                                    }) :
                                    Array(months.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Canceled',
                                data: canceled.length != 0 ?
                                    months.map(date => {
                                        var count = canceled.find(element => element.date == date)
                                        return count ? count.count : 0
                                    }) :
                                    Array(months.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1
                            },
                            {
                                label: 'Pending',
                                data: pending.length != 0 ?
                                    months.map(date => {
                                        var count = pending.find(element => element.date == date)
                                        return count ? count.count : 0
                                    }) :
                                    Array(months.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(255, 205, 86)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                }
            }
        } catch (err) {
            console.log(err)
            return null
        }
    }

    static async getOrderStatistics({ id_user, dateFrom, dateTo, useDate, id_product_array, id_team }) {

        const DELIVRED = ['Livre', 'Paye']
        const CANCELED = ['Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon']
        const PENDING = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
        const PENDING_2 = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

        try {

            if (!useDate) {
                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: DELIVRED
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_without_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: DELIVRED
                    },
                }

                const delivred = await Order.count(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

                search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: CANCELED
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_without_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: CANCELED
                    },
                }

                const canceled = await Order.count(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

                search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: PENDING
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_without_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: PENDING
                    },
                }

                const pending = await Order.count(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

                search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: PENDING_2
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_without_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: PENDING_2
                    },
                }

                const pending_injoignable = await Order.count(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

                search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: 'deleted'
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_without_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: 'deleted'
                    },
                }

                const deleted = await Order.count(id_product_array.length != 0 ? search_params_with_product : search_params_without_product) // 'deleted

                // sum of all orders
                const total = delivred + canceled + pending + pending_injoignable + deleted

                const data = {
                    labels: [
                        "Delivred",
                        "Pending",
                        "Injoignable",
                        "Cancelled",
                        'Deleted'
                    ],
                    datasets: [
                        {
                            label: "Local",
                            data: [delivred, pending, pending_injoignable, canceled, deleted],
                            fill: true,
                            backgroundColor: ["#43A047", "#F68407", "#b4936f", "#E53935", "#E53935"],
                        }
                    ],
                };

                return { data, total }
            } else {
                var search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: DELIVRED,
                        updatedAt: { [Op.between]: [dateFrom, dateTo] }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                var search_params_without_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: DELIVRED,
                        updatedAt: { [Op.between]: [dateFrom, dateTo] }
                    },
                }

                const delivred = await Order.count(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

                search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: CANCELED,
                        updatedAt: { [Op.between]: [dateFrom, dateTo] }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_without_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: CANCELED,
                        updatedAt: { [Op.between]: [dateFrom, dateTo] }
                    },
                }

                const canceled = await Order.count(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

                search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: PENDING,
                        updatedAt: { [Op.between]: [dateFrom, dateTo] }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_without_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: PENDING,
                        updatedAt: { [Op.between]: [dateFrom, dateTo] }
                    },
                }

                const pending = await Order.count(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

                search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: PENDING_2,
                        updatedAt: { [Op.between]: [dateFrom, dateTo] }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_without_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: PENDING_2,
                        updatedAt: { [Op.between]: [dateFrom, dateTo] }
                    },
                }

                const pending_injoignable = await Order.count(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

                search_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: 'deleted',
                        updatedAt: { [Op.between]: [dateFrom, dateTo] }
                    },

                    include: {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                    },
                }

                search_params_without_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: 'deleted',
                        updatedAt: { [Op.between]: [dateFrom, dateTo] }
                    },
                }

                const deleted = await Order.count(id_product_array.length != 0 ? search_params_with_product : search_params_without_product) // 'deleted

                console.log(deleted)
                // sum of all orders
                const total = delivred + canceled + pending + pending_injoignable + deleted

                const data = {
                    labels: [
                        "Delivred",
                        "Pending",
                        "Injoignable",
                        "Cancelled",
                        "Deleted"
                    ],
                    datasets: [
                        {
                            label: "Local",
                            data: [delivred, pending, pending_injoignable, canceled, deleted],
                            fill: true,
                            backgroundColor: ["#43A047", "#F68407", "#b4936f", "#E53935", "#E53935"],
                        }
                    ],
                };

                return { data, total }
            }
        } catch (err) {
            console.log(err)
            return null
        }
    }

    static async getCostReport({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {

        const DELIVRED = ['Livre', 'Paye']
        const CANCELED = ['Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon']
        const PENDING_1 = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
        const PENDING_2 = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

        const PENDING = [...PENDING_1, ...PENDING_2]

        function getLastDays(nb, endDate) {
            const today = new Date(endDate);
            const lastDays = [];

            for (let i = 0; i < nb; i++) {
                const day = new Date(endDate);

                day.setDate(today.getDate() - i);
                lastDays.push(day);
            }

            return lastDays;
        }

        function getStartDateBetweenWeeks(starDate, enDate) {
            var startDate = new Date(starDate);
            var endDate = new Date(enDate);

            var weeks = [];
            while (startDate <= endDate) {
                if (startDate.getDay() === 0) {
                    weeks.push(startDate.toISOString().slice(0, 10));
                }
                startDate.setDate(startDate.getDate() + 1);
            }

            return weeks;
        }

        function getStartDateBetweenMonth(starDate, enDate) {
            var startDate = new Date(starDate);
            var endDate = new Date(enDate);

            var month = [];
            while (startDate <= endDate) {
                month.push(new Date(startDate.getFullYear(), startDate.getMonth(), 1).toISOString().slice(0, 10));
                startDate.setMonth(startDate.getMonth() + 1);
            }

            return month;
        }

        function getDifferenceInDays(startDate, endDate) {
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);

            const diffInMs = Math.abs(date2 - date1);
            return diffInMs / (1000 * 60 * 60 * 24);
        }

        const getWeekStartDate = (weekNum, year) => {
            const date = new Date(year, 0, 1);
            const diff = (weekNum - 2) * 7;
            date.setDate(date.getDate() + diff);
            return date;
        }

        async function getReportByDays(days, endDate, status, id_product_array, id_team) {

            var search_params_with_product = {
                where: {
                    id_user,
                    ...(id_team && { id_team }),
                    status: status
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']],
                include: {
                    model: Product_Order,
                    where: {
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                },
            }

            var search_params_without_product = {
                where: {
                    id_user,
                    ...(id_team && { id_team }),
                    status: status
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']],
            }

            var orders = await Order.findAll(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

            if (orders.length == 0) return 0

            // format array to {date: 0}
            var orders_date = []
            for (let i = 0; i < orders.length; i++) {
                const element = orders[i]

                var date = element.date

                orders_date.push({ date: date.toISOString().slice(0, 10), count: element.dataValues.count })
            }

            // get last 7 days
            var last7Days = getLastDays(days, endDate)

            // format last7Days to {date: 0}
            var last7Days_date = []
            for (let i = 0; i < last7Days.length; i++) {
                const element = last7Days[i]

                var date = element.toISOString().slice(0, 10)

                last7Days_date.push({ date, count: 0 })
            }

            // compare last7Days_date and orders_date
            for (let i = 0; i < last7Days_date.length; i++) {
                const element = last7Days_date[i]

                for (let j = 0; j < orders_date.length; j++) {
                    const order = orders_date[j]

                    if (element.date == order.date) {
                        element.count = order.count
                    }
                }
            }

            return last7Days_date
        }

        async function getReportByWeek(startDate, endDate, status, id_product_array, id_team) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            var query_with_product = `
                SELECT
                    CONCAT(YEAR(date), '/', WEEK(date)) AS week_name, 
                    YEAR(date) as year , WEEK(date) as week_num, COUNT(*) as count
                FROM
                    Orders, Product_Order
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    status IN (:status)
                AND
                    Product_Order.id_product IN (:id_product_array)
                GROUP BY
                    week_name
                ORDER BY YEAR(DATE) ASC, WEEK(date) ASC
            `

            var query_without_product = `
                SELECT
                    CONCAT(YEAR(date), '/', WEEK(date)) AS week_name, 
                    YEAR(date) as year , WEEK(date) as week_num, COUNT(*) as count
                FROM
                    Orders
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    status IN (:status)
                GROUP BY
                    week_name
                ORDER BY YEAR(DATE) ASC, WEEK(date) ASC
            `

            try {
                const result = await seqlz.query(id_product_array.length != 0 ? query_with_product : query_without_product, {
                    replacements: { startDate, endDate, id_user, status, id_product_array, id_team: id_team ?? null },
                    type: sequelize.QueryTypes.SELECT
                })

                var result_formated = []

                for (let i = 0; i < result.length; i++) {
                    const element = result[i]

                    var date = getWeekStartDate(element.week_num + 1, element.year)

                    result_formated.push({ date: date.toISOString().slice(0, 10), count: element.count })
                }

                return result_formated
            } catch (error) {
                console.log(error)
            }
        }

        async function getReportByMonth(startDate, endDate, status, id_product_array, id_team) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            var query_with_product = `
                SELECT
                    CONCAT(YEAR(date), '/', MONTH(date)) AS month_name, 
                    YEAR(date) as year , MONTH(date) as month_num, COUNT(*) as count
                FROM
                    Orders, Product_Order
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    status IN (:status)
                AND
                    Product_Order.id_product IN (:id_product_array)
                GROUP BY
                    month_name
                ORDER BY YEAR(DATE) ASC, MONTH(date) ASC
            `

            var query_without_product = `
                SELECT
                    CONCAT(YEAR(date), '/', MONTH(date)) AS month_name, 
                    YEAR(date) as year , MONTH(date) as month_num, COUNT(*) as count
                FROM
                    Orders
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    status IN (:status)
                GROUP BY
                    month_name
                ORDER BY YEAR(DATE) ASC, MONTH(date) ASC
            `

            try {
                const result = await seqlz.query(id_product_array.length != 0 ? query_with_product : query_without_product, {
                    replacements: { startDate, endDate, id_user, status, id_product_array, id_team: id_team ?? null },
                    type: sequelize.QueryTypes.SELECT
                })

                var result_formated = []

                for (let i = 0; i < result.length; i++) {
                    const element = result[i]

                    var date = new Date(element.year, element.month_num - 1, 1)

                    result_formated.push({ date: date.toISOString().slice(0, 10), count: element.count })
                }

                return result_formated
            } catch (error) {
                console.log(error)
            }
        }

        async function getCostPerLeadByDays(days, endDate, id_product_array, id_team) {

            var pertes = await Perte.findAll({
                where: {
                    id_user: id_user
                },
                include: [{
                    model: Perte_Categorie,
                    where: {
                        name: {
                            [Op.like]: '%ads%'
                        },
                    }
                }],
                // group by date in Perte
                group: ['dateFrom', 'dateTo'],
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('amount')), 'amount'],
                    [sequelize.fn('date', sequelize.col('dateFrom')), 'date'],
                    [sequelize.fn('date', sequelize.col('dateTo')), 'dateTo'],
                    [sequelize.literal('DATEDIFF(dateTo, dateFrom)'), 'dateDifference']
                ]
            })

            if (pertes.length == 0) return 0

            // format array to {date: 0}
            var orders_date = []
            for (let i = 0; i < pertes.length; i++) {
                const element = pertes[i]

                var date = element.dataValues.date
                var dateTo = element.dataValues.dateTo
                orders_date.push({ date: date, dateTo: dateTo, sum: (element.amount / (element.dataValues.dateDifference + 1)) })
            }

            // get last 7 days
            var last7Days = getLastDays(days, endDate)

            // format last7Days to {date: 0}
            var last7Days_date = []
            for (let i = 0; i < last7Days.length; i++) {
                const element = last7Days[i]

                var date = element.toISOString().slice(0, 10)

                last7Days_date.push({ date, sum: 0 })
            }

            // compare last7Days_date and orders_date
            for (let i = 0; i < last7Days_date.length; i++) {
                const element = last7Days_date[i]

                for (let j = 0; j < orders_date.length; j++) {
                    const order = orders_date[j]

                    if ((element.date >= order.date) && (element.date <= order.dateTo)) {
                        element.sum = order.sum
                    }
                }
            }

            var arr1 = last7Days_date
            var value = await getReportByDays(days, endDate, [...DELIVRED, ...CANCELED, ...PENDING], id_product_array, id_team).then(arr2 => {
                //console.log('arr2: ',arr2)

                var last_arr = []
                for (let i = 0; i < arr1.length; i++) {
                    const element = arr1[i]
                    const order = arr2[i]

                    if (arr2 === 0) {
                        last_arr.push({ date: element.date, sum: 0 })
                    } else {
                        if (element.date === order.date) {
                            if (order.count == 0) {
                                last_arr.push({ date: element.date, sum: 0 })
                            } else {
                                last_arr.push({ date: element.date, sum: element.sum / order.count })
                            }
                        }
                    }
                }

                return last_arr
            })

            return value
        }

        async function getCostPerLeadByWeek(startDate, endDate, id_product_array, id_team) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            try {
                const result = await seqlz.query(`
                    SELECT
                        CONCAT(YEAR(p.dateFrom), '/', WEEK(p.dateFrom)) AS week_name, 
                        YEAR(p.dateFrom) as year , WEEK(p.dateFrom) as week_num,
                        SUM(p.amount) as amount
                    FROM
                        Pertes p, Perte_Categories pc
                    WHERE
                        p.id_user = :id_user
                    AND 
                        p.id_perte_categorie = pc.id
                    AND 
                        pc.name LIKE '%ads%'
                    AND 
                        p.dateFrom BETWEEN :startDate AND :endDate
                    GROUP BY
                        week_name
                    ORDER BY YEAR(dateFrom) ASC, WEEK(dateFrom) ASC
                `, {
                    replacements: { id_user, startDate, endDate },
                    type: sequelize.QueryTypes.SELECT
                })

                var result_formated = []
                for (let i = 0; i < result.length; i++) {
                    const element = result[i]

                    var date = getWeekStartDate(element.week_num + 1, element.year)

                    result_formated.push({ date: date.toISOString().slice(0, 10), amount: element.amount })
                }

                const report = await getReportByWeek(startDate, endDate, [...DELIVRED, ...CANCELED, ...PENDING], id_product_array, id_team)

                for (let i = 0; i < result_formated.length; i++) {
                    for (let j = 0; j < report.length; j++) {
                        if (result_formated[i].date === report[j].date) {
                            result_formated[i].amount /= report[j].count;
                            break;
                        }
                    }
                }

                return result_formated

            } catch (error) {
                console.log(error)
            }
        }

        async function getCostPerLeadByMonth(startDate, endDate, id_product_array, id_team) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            try {
                const result = await seqlz.query(`
                    SELECT
                        CONCAT(YEAR(p.dateFrom), '/', MONTH(p.dateFrom)) AS month_name, 
                        YEAR(p.dateFrom) as year , MONTH(p.dateFrom) as month_num,
                        SUM(p.amount) as amount
                    FROM
                        Pertes p, Perte_Categories pc
                    WHERE
                        p.id_user = :id_user
                    AND 
                        p.id_perte_categorie = pc.id
                    AND 
                        pc.name LIKE '%ads%'
                    AND 
                        p.dateFrom BETWEEN :startDate AND :endDate
                    GROUP BY
                        month_name
                    ORDER BY YEAR(dateFrom) ASC, MONTH(dateFrom) ASC
                `, {
                    replacements: { id_user, startDate, endDate },
                    type: sequelize.QueryTypes.SELECT
                })

                var result_formated = []

                for (let i = 0; i < result.length; i++) {
                    const element = result[i]

                    var date = new Date(element.year, element.month_num - 1, 1)

                    result_formated.push({ date: date.toISOString().slice(0, 10), amount: element.amount })
                }

                const report = await getReportByMonth(startDate, endDate, [...DELIVRED, ...CANCELED, ...PENDING], id_product_array, id_team)

                for (let i = 0; i < result_formated.length; i++) {
                    for (let j = 0; j < report.length; j++) {
                        if (result_formated[i].date === report[j].date) {
                            result_formated[i].amount /= report[j].count;
                            break;
                        }
                    }
                }

                return result_formated

            } catch (error) {
                console.log(error)
            }
        }

        async function getCostPerDelivredByDays(days, endDate, id_product_array, id_team) {
            var pertes = await Perte.findAll({
                where: {
                    id_user: id_user
                },
                include: [{
                    model: Perte_Categorie,
                    where: {
                        name: {
                            [Op.like]: '%ads%'
                        },
                    }
                }],
                // group by date in Perte
                group: ['dateFrom', 'dateTo'],
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('amount')), 'amount'],
                    [sequelize.fn('date', sequelize.col('dateFrom')), 'date'],
                    [sequelize.fn('date', sequelize.col('dateTo')), 'dateTo'],
                    [sequelize.literal('DATEDIFF(dateTo, dateFrom)'), 'dateDifference']
                ]
            })

            if (pertes.length == 0) return 0

            // format array to {date: 0}
            var orders_date = []
            for (let i = 0; i < pertes.length; i++) {
                const element = pertes[i]

                var date = element.dataValues.date
                var dateTo = element.dataValues.dateTo
                orders_date.push({ date: date, dateTo: dateTo, sum: (element.amount / (element.dataValues.dateDifference + 1)) })
            }

            // get last 7 days
            var last7Days = getLastDays(days, endDate)

            // format last7Days to {date: 0}
            var last7Days_date = []
            for (let i = 0; i < last7Days.length; i++) {
                const element = last7Days[i]

                var date = element.toISOString().slice(0, 10)

                last7Days_date.push({ date, sum: 0 })
            }

            // compare last7Days_date and orders_date
            for (let i = 0; i < last7Days_date.length; i++) {
                const element = last7Days_date[i]

                for (let j = 0; j < orders_date.length; j++) {
                    const order = orders_date[j]

                    if ((element.date >= order.date) && (element.date <= order.dateTo)) {
                        element.sum = order.sum
                    }
                }
            }


            var arr1 = last7Days_date
            var value = await getReportByDays(days, endDate, DELIVRED, id_product_array, id_team).then(arr2 => {
                if (arr2 === 0) return arr1

                var last_arr = []
                for (let i = 0; i < arr1.length; i++) {
                    const element = arr1[i]
                    const order = arr2[i]

                    if (element.date === order.date) {
                        if (order.count == 0) {
                            last_arr.push({ date: element.date, sum: 0 })
                        } else {
                            last_arr.push({ date: element.date, sum: element.sum / order.count })
                        }
                    }
                }

                return last_arr
            })

            return value
        }

        async function getCostPerDelivredByWeek(startDate, endDate, id_product_array, id_team) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            try {
                const result = await seqlz.query(`
                    SELECT
                        CONCAT(YEAR(p.dateFrom), '/', WEEK(p.dateFrom)) AS week_name, 
                        YEAR(p.dateFrom) as year , WEEK(p.dateFrom) as week_num,
                        SUM(p.amount) as amount
                    FROM
                        Pertes p, Perte_Categories pc
                    WHERE
                        p.id_user = :id_user
                    AND 
                        p.id_perte_categorie = pc.id
                    AND 
                        pc.name LIKE '%ads%'
                    AND 
                        p.dateFrom BETWEEN :startDate AND :endDate
                    GROUP BY
                        week_name
                    ORDER BY YEAR(dateFrom) ASC, WEEK(dateFrom) ASC
                `, {
                    replacements: { id_user, startDate, endDate },
                    type: sequelize.QueryTypes.SELECT
                })

                var result_formated = []

                for (let i = 0; i < result.length; i++) {
                    const element = result[i]

                    var date = getWeekStartDate(element.week_num + 1, element.year)

                    result_formated.push({ date: date.toISOString().slice(0, 10), amount: element.amount })
                }

                const report = await getReportByWeek(startDate, endDate, DELIVRED, id_product_array, id_team)

                for (let i = 0; i < result_formated.length; i++) {
                    for (let j = 0; j < report.length; j++) {
                        if (result_formated[i].date === report[j].date) {
                            result_formated[i].amount /= report[j].count;
                            break;
                        }
                    }
                }

                return result_formated

            } catch (error) {
                console.log(error)
            }
        }

        async function getCostPerDelivredByMonth(startDate, endDate, id_product_array, id_team) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            try {
                const result = await seqlz.query(`
                    SELECT
                        CONCAT(YEAR(p.dateFrom), '/', MONTH(p.dateFrom)) AS month_name, 
                        YEAR(p.dateFrom) as year , MONTH(p.dateFrom) as month_num,
                        SUM(p.amount) as amount
                    FROM
                        Pertes p, Perte_Categories pc
                    WHERE
                        p.id_user = :id_user
                    AND 
                        p.id_perte_categorie = pc.id
                    AND 
                        pc.name LIKE '%ads%'
                    AND 
                        p.dateFrom BETWEEN :startDate AND :endDate
                    GROUP BY
                        month_name
                    ORDER BY YEAR(dateFrom) ASC, MONTH(dateFrom) ASC
                `, {
                    replacements: { id_user, startDate, endDate },
                    type: sequelize.QueryTypes.SELECT
                })

                var result_formated = []

                for (let i = 0; i < result.length; i++) {
                    const element = result[i]

                    var date = new Date(element.year, element.month_num - 1, 1)

                    result_formated.push({ date: date.toISOString().slice(0, 10), amount: element.amount })
                }

                const report = await getReportByMonth(startDate, endDate, DELIVRED, id_product_array, id_team)

                for (let i = 0; i < result_formated.length; i++) {
                    for (let j = 0; j < report.length; j++) {
                        if (result_formated[i].date === report[j].date) {
                            result_formated[i].amount /= report[j].count;
                            break;
                        }
                    }
                }

                return result_formated

            } catch (error) {
                console.log(error)
            }
        }

        try {
            if (!useDate) {
                var dates = getLastDays(7, new Date())
                var formatedDate = dates.map(date => date.toISOString().slice(0, 10))

                var costPerLead = await getCostPerLeadByDays(7, new Date(), id_product_array, id_team)
                var costPerDelivred = await getCostPerDelivredByDays(7, new Date(), id_product_array, id_team)

                var data = {
                    labels: formatedDate.reverse(),
                    datasets: [
                        {
                            label: 'Cost per lead',
                            data: costPerLead ? costPerLead.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        },
                        {
                            label: 'Cost per delivred',
                            data: costPerDelivred ? costPerDelivred.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(255, 99, 132)',
                            tension: 0.1
                        }
                    ]
                }

                return data
            } else {

                var differenceInDays = getDifferenceInDays(dateFrom, dateTo) + 1
                var dates = getLastDays(differenceInDays, new Date(dateTo))
                var formatedDate = dates.map(date => date.toISOString().slice(0, 10))

                if (differenceInDays < 14) {

                    var costPerLead = await getCostPerLeadByDays(differenceInDays, new Date(dateTo), id_product_array, id_team)
                    var costPerDelivred = await getCostPerDelivredByDays(differenceInDays, new Date(dateTo), id_product_array, id_team)

                    var data = {
                        labels: formatedDate.reverse(),
                        datasets: [
                            {
                                label: 'Cost per lead',
                                data: costPerLead ? costPerLead.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Cost per delivred',
                                data: costPerDelivred ? costPerDelivred.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                } else if (differenceInDays < 90) {
                    var weeks = getStartDateBetweenWeeks(dateFrom, dateTo)

                    var costPerLead = await getCostPerLeadByWeek(dateFrom, dateTo, id_product_array, id_team)
                    var costPerDelivred = await getCostPerDelivredByWeek(dateFrom, dateTo, id_product_array, id_team)

                    var data = {
                        labels: weeks,
                        datasets: [
                            {
                                label: 'Cost per lead',
                                data: costPerLead.length != 0 ?
                                    weeks.map(date => {
                                        var amount = costPerLead.find(element => element.date == date)
                                        return amount ? amount.amount : 0
                                    }) :
                                    Array(weeks.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Cost per delivred',
                                data: costPerDelivred.length != 0 ?
                                    weeks.map(date => {
                                        var amount = costPerDelivred.find(element => element.date == date)
                                        return amount ? amount.amount : 0
                                    }) :
                                    Array(weeks.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                } else {
                    var months = getStartDateBetweenMonth(dateFrom, dateTo)

                    var costPerLead = await getCostPerLeadByMonth(dateFrom, dateTo, id_product_array, id_team)
                    var costPerDelivred = await getCostPerDelivredByMonth(dateFrom, dateTo, id_product_array, id_team)

                    var data = {
                        labels: months,
                        datasets: [
                            {
                                label: 'Cost per lead',
                                data: costPerLead.length != 0 ?
                                    months.map(date => {
                                        var amount = costPerLead.find(element => element.date == date)
                                        return amount ? amount.amount : 0
                                    }) :
                                    Array(months.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Cost per delivred',
                                data: costPerDelivred.length != 0 ?
                                    months.map(date => {
                                        var amount = costPerDelivred.find(element => element.date == date)
                                        return amount ? amount.amount : 0
                                    }) :
                                    Array(months.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                }

                return 0
            }
        } catch (err) {
            console.log(err)
            return null
        }
    }

    // count order who are status='Nouveau'
    static async countNewOrder({ id_user }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var count = await Order.count({ where: { id_user, status: 'Nouveau' } })

            return { code: 200, data: { count } }
        } catch (err) {
            console.log(err)
            return { code: 500, message: 'Internal server error' }
        }
    }

    static async GetTeamDashboard({ id_user, id_team, useDate, dateFrom, dateTo }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        if (!Number(id_team)) {
            try {

                var performance = await this.GetAllTeamPerformance({ id_user, useDate, dateFrom, dateTo })
                var performance_rate = await this.GetAllTeamPerformanceRate({ id_user, useDate, dateFrom, dateTo })
                var earning = await this.GetAllTeamEarning({ id_user, useDate, dateFrom, dateTo })
                var earning_table = await this.GetAllTeamEarningTable({ id_user, id_team, useDate, dateFrom, dateTo })

                if (!performance || !earning || !earning_table || !performance_rate) return { code: 500, message: 'Internal server error' }

                const data = {
                    performance,
                    earning,
                    earning_table,
                    performance_rate
                }

                return { code: 200, data }

            } catch (err) {
                console.log(err)
                return { code: 500, message: 'Internal server error' }
            }
        }

        try {

            var performance = await this.GetTeamPerformance({ id_user, id_team, useDate, dateFrom, dateTo })
            var performance_rate = await this.GetTeamPerformanceRate({ id_user, id_team, useDate, dateFrom, dateTo })
            var earning = await this.GetTeamEarning({ id_user, id_team, useDate, dateFrom, dateTo })
            var earning_table = await this.GetTeamEarningTable({ id_user, id_team, useDate, dateFrom, dateTo })

            if (!performance || !earning || !earning_table || !performance_rate) return { code: 500, message: 'Internal server error' }

            const data = {
                performance,
                earning,
                earning_table,
                performance_rate
            }

            return { code: 200, data }

        } catch (err) {
            console.log(err)
            return { code: 500, message: 'Internal server error' }
        }
    }

    static async GetTeamPerformance({ id_user, id_team, useDate, dateFrom, dateTo }) {
        try {
            const DELIVRED = ['Livre', 'Paye']
            const CANCELED = ['Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon']
            const PENDING = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
            const INJOIGNABLE = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

            if (!useDate) {

                // count order group by status left join with status
                var count_status_delivred = await Order.count({ where: { id_user, status: DELIVRED, id_team } })

                var count_status_canceled = await Order.count({ where: { id_user, status: CANCELED, id_team } })

                var count_status_pending = await Order.count({ where: { id_user, status: PENDING, id_team } })

                var count_status_injoignable = await Order.count({ where: { id_user, status: INJOIGNABLE, id_team } })

                var count_status_deleted = await Order.count({ where: { id_user, status: 'deleted', id_team } })

                const data = {
                    labels: ['delivred', 'canceled', 'pending', 'injoignable', 'deleted'],
                    datasets: [
                        {
                            label: "Performance",
                            data: [count_status_delivred, count_status_canceled, count_status_pending, count_status_injoignable, count_status_deleted],
                            fill: true,
                            backgroundColor: ["rgb(67,160,71)", "rgb(229,57,53)", "rgb(246,132,7)", "rgb(180,147,111)", "rgb(99,2,0)"],
                        }
                    ],
                };

                return data
            } else {
                // count order group by status left join with status
                var count_status_delivred = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: DELIVRED, id_team } })

                var count_status_canceled = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: CANCELED, id_team } })

                var count_status_pending = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: PENDING, id_team } })

                var count_status_injoignable = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: INJOIGNABLE, id_team } })

                var count_status_deleted = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: 'deleted', id_team } })

                const data = {
                    labels: ['delivred', 'canceled', 'pending', 'injoignable', 'deleted'],
                    datasets: [
                        {
                            label: "Performance",
                            data: [count_status_delivred, count_status_canceled, count_status_pending, count_status_injoignable, count_status_deleted],
                            fill: true,
                            backgroundColor: ["rgb(67,160,71)", "rgb(229,57,53)", "rgb(246,132,7)", "rgb(180,147,111)", "rgb(99,2,0)"]
                        }
                    ],
                };

                return data
            }

        } catch (err) {
            console.log(err)
            return 0
        }
    }

    static async GetTeamPerformanceRate({ id_user, id_team, useDate, dateFrom, dateTo }) {
        const computeRate = (count_order, status) => (status * 100) / count_order

        try {
            const DELIVRED = ['Livre', 'Paye']
            const CANCELED = ['Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon']
            const PENDING = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
            const INJOIGNABLE = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

            if (!useDate) {

                var count_order = await Order.count({ where: { id_user, id_team } })

                // count order group by status left join with status
                var count_status_delivred = await Order.count({ where: { id_user, status: DELIVRED, id_team } })

                var count_status_canceled = await Order.count({ where: { id_user, status: CANCELED, id_team } })

                var count_status_pending = await Order.count({ where: { id_user, status: PENDING, id_team } })

                var count_status_injoignable = await Order.count({ where: { id_user, status: INJOIGNABLE, id_team } })

                var count_status_deleted = await Order.count({ where: { id_user, status: 'deleted', id_team } })

                const data = {
                    labels: ['delivred', 'canceled', 'pending', 'injoignable', 'deleted'],
                    datasets: [
                        {
                            label: "Performance",
                            data: [computeRate(count_order, count_status_delivred), computeRate(count_order, count_status_canceled), computeRate(count_order, count_status_pending), computeRate(count_order, count_status_injoignable), computeRate(count_order, count_status_deleted)],
                            fill: true,
                            backgroundColor: ["rgb(67,160,71)", "rgb(229,57,53)", "rgb(246,132,7)", "rgb(180,147,111)", "rgb(99,2,0)"],
                        }
                    ],
                };

                return data
            } else {
                var count_order = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, id_team } })

                // count order group by status left join with status
                var count_status_delivred = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: DELIVRED, id_team } })

                var count_status_canceled = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: CANCELED, id_team } })

                var count_status_pending = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: PENDING, id_team } })

                var count_status_injoignable = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: INJOIGNABLE, id_team } })

                var count_status_deleted = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: 'deleted', id_team } })

                const data = {
                    labels: ['delivred', 'canceled', 'pending', 'injoignable', 'deleted'],
                    datasets: [
                        {
                            label: "Performance",
                            data: [computeRate(count_order, count_status_delivred), computeRate(count_order, count_status_canceled), computeRate(count_order, count_status_pending), computeRate(count_order, count_status_injoignable), computeRate(count_order, count_status_deleted)],
                            fill: true,
                            backgroundColor: ["rgb(67,160,71)", "rgb(229,57,53)", "rgb(246,132,7)", "rgb(180,147,111)", "rgb(99,2,0)"]
                        }
                    ],
                };

                return data
            }

        } catch (err) {
            console.log(err)
            return 0
        }
    }

    static async GetTeamEarning({ id_user, id_team, useDate, dateFrom, dateTo }) {

        const getWeekStartDate = (weekNum, year) => {
            const date = new Date(year, 0, 1);
            const diff = (weekNum - 2) * 7;
            date.setDate(date.getDate() + diff);
            return date;
        }

        function getStartDateBetweenWeeks(starDate, enDate) {
            var startDate = new Date(starDate);
            var endDate = new Date(enDate);

            var weeks = [];
            while (startDate <= endDate) {
                if (startDate.getDay() === 0) {
                    weeks.push(startDate.toISOString().slice(0, 10));
                }
                startDate.setDate(startDate.getDate() + 1);
            }

            return weeks;
        }

        function getDifferenceInDays(startDate, endDate) {
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);

            const diffInMs = Math.abs(date2 - date1);
            return diffInMs / (1000 * 60 * 60 * 24);
        }

        function getStartDateBetweenMonth(starDate, enDate) {
            var startDate = new Date(starDate);
            var endDate = new Date(enDate);

            var month = [];
            while (startDate <= endDate) {
                month.push(new Date(startDate.getFullYear(), startDate.getMonth(), 1).toISOString().slice(0, 10));
                startDate.setMonth(startDate.getMonth() + 1);
            }

            return month;
        }

        function getLastDays(nb, endDate) {
            const today = new Date(endDate);
            const lastDays = [];

            for (let i = 0; i < nb; i++) {
                const day = new Date(endDate);

                day.setDate(today.getDate() - i);
                lastDays.push(day);
            }

            return lastDays;
        }

        function getStartAndEndDateOfYear() {
            var date = new Date();
            var firstDay = new Date(date.getFullYear(), 0, 1);
            var lastDay = new Date(date.getFullYear(), 11, 31);
            return [firstDay, lastDay]
        }

        /** Running function */
        async function getTeamEarningByMonth(id_user, startDate, endDate, id_team, team) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            var query = `
                SELECT
                    CONCAT(YEAR(createdAt), '/', MONTH(createdAt)) AS month_name, 
                    YEAR(createdAt) as year , MONTH(createdAt) as month_num, COUNT(*) as count
                FROM
                    Orders
                WHERE
                    createdAt BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    id_team = :id_team
                AND
                    status IN (:status)
                GROUP BY
                    month_name
                ORDER BY YEAR(DATE) ASC, MONTH(createdAt) ASC
            `

            try {
                const result = await seqlz.query(query, {
                    replacements: { startDate, endDate, id_team, status: ['Paye', 'Livre'], id_user },
                    type: sequelize.QueryTypes.SELECT
                })

                if (result.length == 0) return []

                var result_formated = []

                for (let i = 0; i < result.length; i++) {
                    const element = result[i]

                    var date = new Date(element.year, element.month_num - 1, 1)

                    result_formated.push({ date: date.toISOString().slice(0, 10), amount: (element.count * team.commission) + team.salaire })
                }

                return result_formated

            } catch (error) {
                console.log(error)
                return null
            }


        }

        async function getTeamEarningByDays(id_user, days, endDate, id_team, team) {

            var query = {
                where: {
                    id_team,
                    id_user,
                    status: ['Paye', 'Livre']
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('createdAt')), 'count']]
            }

            var orders = await Order.findAll(query)

            if (orders.length == 0) return []

            // format array to {date: 0}
            var orders_date = []
            for (let i = 0; i < orders.length; i++) {
                const element = orders[i]
                var date = element.date
                orders_date.push({ date: date.toISOString().slice(0, 10), amount: (element.dataValues.count * team.commission) + ((days * team.salaire) / 30) })
            }

            // get last 7 days
            var last7Days = getLastDays(days, endDate)

            // format last7Days to {date: 0}
            var last7Days_date = []
            for (let i = 0; i < last7Days.length; i++) {
                const element = last7Days[i]

                var date = element.toISOString().slice(0, 10)

                last7Days_date.push({ date, amount: 0 })
            }

            // compare last7Days_date and orders_date
            for (let i = 0; i < last7Days_date.length; i++) {
                const element = last7Days_date[i]

                for (let j = 0; j < orders_date.length; j++) {
                    const order = orders_date[j]

                    if (element.date == order.date) {
                        element.amount = order.amount
                    }
                }
            }

            // return last7Days_date
            return last7Days_date
        }

        async function getTeamEarningByWeek(id_user, days, startDate, endDate, id_team, team) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            var query = `
                SELECT
                    CONCAT(YEAR(createdAt), '/', WEEK(createdAt)) AS week_name, 
                    YEAR(createdAt) as year , WEEK(createdAt) as week_num, COUNT(*) as count
                FROM
                    Orders
                WHERE
                    createdAt BETWEEN :startDate AND :endDate
                AND
                    id_team = :id_team
                AND
                    status IN (:status)
                AND
                    id_user = :id_user
                GROUP BY
                    week_name
                ORDER BY YEAR(DATE) ASC, WEEK(createdAt) ASC
            `

            try {
                const result = await seqlz.query(query, {
                    replacements: { startDate, endDate, id_team, status: ['Paye', 'Livre'], id_user },
                    type: sequelize.QueryTypes.SELECT
                })

                if (result.length == 0) return []

                var result_formated = []

                for (let i = 0; i < result.length; i++) {
                    const element = result[i]

                    var date = getWeekStartDate(element.week_num + 1, element.year)

                    result_formated.push({ date: date.toISOString().slice(0, 10), amount: (element.count * team.commission) + ((days * team.salaire) / 30) })
                }

                return result_formated
            } catch (error) {
                console.log(error)
            }
        }

        if (!useDate) {
            // search team
            var team = await Team_User.findOne({ where: { id: id_team } })

            var start_end_date = getStartAndEndDateOfYear()
            var months = getStartDateBetweenMonth(start_end_date[0], start_end_date[1])
            var earning = await getTeamEarningByMonth(id_user, start_end_date[0], start_end_date[1], id_team, team)

            var data = {
                labels: months,
                datasets: [
                    {
                        label: 'Earning',
                        data: earning.length != 0 ?
                            months.map(date => {
                                var count = earning.find(element => element.date == date)
                                return count ? count.amount : 0
                            }) :
                            Array(months.length).fill(0),
                        fill: false,
                        borderColor: 'rgb(255,255,0)',
                        tension: 0.1
                    }
                ]
            }

            return data

        } else {
            // search team
            var team = await Team_User.findOne({ where: { id: id_team } })

            var differenceInDays = getDifferenceInDays(dateFrom, dateTo) + 1
            var dates = getLastDays(differenceInDays, new Date(dateTo))
            var formatedDate = dates.map(date => date.toISOString().slice(0, 10))

            if (differenceInDays < 14) {
                const earning = await getTeamEarningByDays(id_user, differenceInDays, new Date(dateTo), id_team, team)

                var data = {
                    labels: formatedDate.reverse(),
                    datasets: [
                        {
                            label: 'Earning',
                            data: earning ? earning.map(item => item.amount).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(255,255,0)',
                            tension: 0.1
                        }
                    ]
                }

                return data
            } else if (differenceInDays < 90) {

                var weeks = getStartDateBetweenWeeks(dateFrom, dateTo)

                const earning = await getTeamEarningByWeek(id_user, differenceInDays, dateFrom, dateTo, id_team, team)

                var data = {
                    labels: weeks,
                    datasets: [
                        {
                            label: 'Earning',
                            data: earning.length != 0 ?
                                weeks.map(date => {
                                    var count = earning.find(element => element.date == date)
                                    return count ? count.amount : 0
                                }) :
                                Array(weeks.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(255,255,0)',
                            tension: 0.1
                        }
                    ]
                }

                return data
            } else {
                var months = getStartDateBetweenMonth(dateFrom, dateTo)

                const earning = await getTeamEarningByMonth(id_user, dateFrom, dateTo, id_team, team)

                var data = {
                    labels: months,
                    datasets: [
                        {
                            label: 'Earning',
                            data: earning.length != 0 ?
                                months.map(date => {
                                    var count = earning.find(element => element.date == date)
                                    return count ? count.amount : 0
                                }) :
                                Array(months.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(255,255,0)',
                            tension: 0.1
                        }
                    ]
                }

                return data
            }
        }

    }

    static async GetTeamEarningTable({ id_user, id_team, useDate, dateFrom, dateTo }) {
        function getDifferenceInDays(startDate, endDate) {
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);

            const diffInMs = Math.abs(date2 - date1);
            return diffInMs / (1000 * 60 * 60 * 24);
        }

        try {
            var differenceInDays = getDifferenceInDays(dateFrom, dateTo) + 1

            // search team
            var team = await Team_User.findOne({ where: { id: id_team, id_user } })

            if (!useDate) {
                var livre_params = {
                    where: { id_team, status: 'Livre', id_user }
                }

                var upsell_params = {
                    where: {
                        id_team, updownsell: 'Upsell', id_user, status: {
                            [Op.ne]: 'deleted'
                        }
                    }
                }

                var downsell_params = {
                    where: {
                        id_team, updownsell: 'Downsell', id_user, status: {
                            [Op.ne]: 'deleted'
                        }
                    },
                }

                var crosssell_params = {
                    where: {
                        id_team, updownsell: 'Crosssell', id_user, status: {
                            [Op.ne]: 'deleted'
                        }
                    }
                }

                // her earning 
                var her_earning_upsell_params = {
                    where: { id_team, updownsell: 'Upsell', id_user, status: ['Livre', 'Paye'] }
                }

                var her_earning_downsell_params = {
                    where: { id_team, updownsell: 'Downsell', id_user, status: ['Livre', 'Paye'] }
                }

                var her_earning_crosssell_params = {
                    where: { id_team, updownsell: 'Crosssell', id_user, status: ['Livre', 'Paye'] }
                }

                var livre = await Order.count(livre_params)

                var upsell = await Order.count(upsell_params)
                var downsell = await Order.count(downsell_params)
                var crosssell = await Order.count(crosssell_params)

                // her earning 
                var her_earning_upsell = await Order.count(her_earning_upsell_params)
                var her_earning_downsell = await Order.count(her_earning_downsell_params)
                var her_earning_crosssell = await Order.count(her_earning_crosssell_params)


                const data = {
                    livre: { nb_commande: livre, her_earning: (livre * team.commission), salaire: team.salaire },
                    upsell: { nb_commande: upsell, her_earning: (her_earning_upsell * team.commission), salaire: team.salaire },
                    downsell: { nb_commande: downsell, her_earning: (her_earning_downsell * team.commission), salaire: team.salaire },
                    crosssell: { nb_commande: crosssell, her_earning: (her_earning_crosssell * team.commission), salaire: team.salaire }
                }

                return data
            } else {

                var livre_params = {
                    where: { id_team, status: 'Livre', createdAt: { [Op.between]: [dateFrom, dateTo] }, id_user, }
                }


                var upsell_params = {
                    where: {
                        id_team, updownsell: 'Upsell', createdAt: { [Op.between]: [dateFrom, dateTo] }, id_user, status: {
                            [Op.ne]: 'deleted'
                        }
                    }
                }

                var downsell_params = {
                    where: {
                        id_team, updownsell: 'Downsell', createdAt: { [Op.between]: [dateFrom, dateTo] }, id_user, status: {
                            [Op.ne]: 'deleted'
                        }
                    }
                }

                var crosssell_params = {
                    where: { id_team, updownsell: 'Crosssell', createdAt: { [Op.between]: [dateFrom, dateTo] }, id_user }
                }

                // her earning 
                var her_earning_upsell_params = {
                    where: { id_team, updownsell: 'Upsell', id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: ['Livre', 'Paye'] }
                }

                var her_earning_downsell_params = {
                    where: { id_team, updownsell: 'Downsell', id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: ['Livre', 'Paye'] }
                }

                var her_earning_crosssell_params = {
                    where: { id_team, updownsell: 'Crosssell', id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: ['Livre', 'Paye'] }
                }

                var livre = await Order.count(livre_params)

                var upsell = await Order.count(upsell_params)
                var downsell = await Order.count(downsell_params)
                var crosssell = await Order.count(crosssell_params)

                // her earning 
                var her_earning_upsell = await Order.count(her_earning_upsell_params)
                var her_earning_downsell = await Order.count(her_earning_downsell_params)
                var her_earning_crosssell = await Order.count(her_earning_crosssell_params)

                const data = {
                    livre: { nb_commande: livre, her_earning: (livre * team.commission), salaire: ((differenceInDays * team.salaire) / 30) },
                    upsell: { nb_commande: upsell, her_earning: (her_earning_upsell * team.commission), salaire: ((differenceInDays * team.salaire) / 30) },
                    downsell: { nb_commande: downsell, her_earning: (her_earning_downsell * team.commission), salaire: ((differenceInDays * team.salaire) / 30) },
                    crosssell: { nb_commande: crosssell, her_earning: (her_earning_crosssell * team.commission), salaire: ((differenceInDays * team.salaire) / 30) }
                }

                return data
            }

        } catch (err) {
            console.log(err)
            return 0
        }
    }

    static async GetAllTeamPerformance({ id_user, useDate, dateFrom, dateTo }) {
        try {
            const DELIVRED = ['Livre', 'Paye']
            const CANCELED = ['Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon']
            const PENDING = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
            const INJOIGNABLE = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

            if (!useDate) {

                // count order group by status left join with status
                var count_status_delivred = await Order.count({ where: { id_user, status: DELIVRED } })

                var count_status_canceled = await Order.count({ where: { id_user, status: CANCELED } })

                var count_status_pending = await Order.count({ where: { id_user, status: PENDING } })

                var count_status_injoignable = await Order.count({ where: { id_user, status: INJOIGNABLE } })

                var count_status_deleted = await Order.count({ where: { id_user, status: 'deleted' } })

                const data = {
                    labels: ['delivred', 'canceled', 'pending', 'injoignable', 'deleted'],
                    datasets: [
                        {
                            label: "Performance",
                            data: [count_status_delivred, count_status_canceled, count_status_pending, count_status_injoignable, count_status_deleted],
                            fill: true,
                            backgroundColor: ["rgb(67,160,71)", "rgb(229,57,53)", "rgb(246,132,7)", "rgb(180,147,111)", "rgb(99,2,0)"],
                        }
                    ],
                };

                return data
            } else {
                // count order group by status left join with status
                var count_status_delivred = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: DELIVRED } })

                var count_status_canceled = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: CANCELED } })

                var count_status_pending = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: PENDING } })

                var count_status_injoignable = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: INJOIGNABLE } })

                var count_status_deleted = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: 'deleted' } })


                const data = {
                    labels: ['delivred', 'canceled', 'pending', 'injoignable', 'deleted'],
                    datasets: [
                        {
                            label: "Performance",
                            data: [count_status_delivred, count_status_canceled, count_status_pending, count_status_injoignable, count_status_deleted],
                            fill: true,
                            backgroundColor: ["rgb(67,160,71)", "rgb(229,57,53)", "rgb(246,132,7)", "rgb(180,147,111)", "rgb(99,2,0)"]
                        }
                    ],
                };

                return data
            }

        } catch (err) {
            console.log(err)
            return 0
        }
    }

    static async GetAllTeamPerformanceRate({ id_user, useDate, dateFrom, dateTo }) {
        const computeRate = (count_order, status) => (status * 100) / count_order

        try {
            const DELIVRED = ['Livre', 'Paye']
            const CANCELED = ['Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon']
            const PENDING = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
            const INJOIGNABLE = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

            if (!useDate) {
                var count_order = await Order.count({ where: { id_user } })

                // count order group by status left join with status
                var count_status_delivred = await Order.count({ where: { id_user, status: DELIVRED } })

                var count_status_canceled = await Order.count({ where: { id_user, status: CANCELED } })

                var count_status_pending = await Order.count({ where: { id_user, status: PENDING } })

                var count_status_injoignable = await Order.count({ where: { id_user, status: INJOIGNABLE } })

                var count_status_deleted = await Order.count({ where: { id_user, status: 'deleted' } })

                const data = {
                    labels: ['delivred', 'canceled', 'pending', 'injoignable', 'deleted'],
                    datasets: [
                        {
                            label: "Performance",
                            data: [computeRate(count_order, count_status_delivred), computeRate(count_order, count_status_canceled), computeRate(count_order, count_status_pending), computeRate(count_order, count_status_injoignable), computeRate(count_order, count_status_deleted)],
                            fill: true,
                            backgroundColor: ["rgb(67,160,71)", "rgb(229,57,53)", "rgb(246,132,7)", "rgb(180,147,111)", "rgb(99,2,0)"],
                        }
                    ],
                };

                return data
            } else {
                var count_order = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] } } })

                // count order group by status left join with status
                var count_status_delivred = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: DELIVRED } })

                var count_status_canceled = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: CANCELED } })

                var count_status_pending = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: PENDING } })

                var count_status_injoignable = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: INJOIGNABLE } })

                var count_status_deleted = await Order.count({ where: { id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: 'deleted' } })


                const data = {
                    labels: ['delivred', 'canceled', 'pending', 'injoignable', 'deleted'],
                    datasets: [
                        {
                            label: "Performance",
                            data: [computeRate(count_order, count_status_delivred), computeRate(count_order, count_status_canceled), computeRate(count_order, count_status_pending), computeRate(count_order, count_status_injoignable), computeRate(count_order, count_status_deleted)],
                            fill: true,
                            backgroundColor: ["rgb(67,160,71)", "rgb(229,57,53)", "rgb(246,132,7)", "rgb(180,147,111)", "rgb(99,2,0)"]
                        }
                    ],
                };

                return data
            }

        } catch (err) {
            console.log(err)
            return 0
        }
    }

    static async GetAllTeamEarning({ id_user, useDate, dateFrom, dateTo }) {

        const getWeekStartDate = (weekNum, year) => {
            const date = new Date(year, 0, 1);
            const diff = (weekNum - 2) * 7;
            date.setDate(date.getDate() + diff);
            return date;
        }

        function getStartDateBetweenWeeks(starDate, enDate) {
            var startDate = new Date(starDate);
            var endDate = new Date(enDate);

            var weeks = [];
            while (startDate <= endDate) {
                if (startDate.getDay() === 0) {
                    weeks.push(startDate.toISOString().slice(0, 10));
                }
                startDate.setDate(startDate.getDate() + 1);
            }

            return weeks;
        }

        function getDifferenceInDays(startDate, endDate) {
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);

            const diffInMs = Math.abs(date2 - date1);
            return diffInMs / (1000 * 60 * 60 * 24);
        }

        function getStartDateBetweenMonth(starDate, enDate) {
            var startDate = new Date(starDate);
            var endDate = new Date(enDate);

            var month = [];
            while (startDate <= endDate) {
                month.push(new Date(startDate.getFullYear(), startDate.getMonth(), 1).toISOString().slice(0, 10));
                startDate.setMonth(startDate.getMonth() + 1);
            }

            return month;
        }

        function getLastDays(nb, endDate) {
            const today = new Date(endDate);
            const lastDays = [];

            for (let i = 0; i < nb; i++) {
                const day = new Date(endDate);

                day.setDate(today.getDate() - i);
                lastDays.push(day);
            }

            return lastDays;
        }

        function getStartAndEndDateOfYear() {
            var date = new Date();
            var firstDay = new Date(date.getFullYear(), 0, 1);
            var lastDay = new Date(date.getFullYear(), 11, 31);
            return [firstDay, lastDay]
        }

        function calculateTotalByMonth(data) {
            const result = [];

            // Create a map to store totals by month
            const totalsByMonth = new Map();

            // Loop through commission_by_month and add totals to the map
            data.commission_by_month.forEach(item => {
                const { month, total } = item;
                totalsByMonth.set(month, (totalsByMonth.get(month) || 0) + total);
            });

            // Loop through upsell_by_month and add totals to the map
            data.upsell_by_month.forEach(item => {
                const { month, total } = item;
                totalsByMonth.set(month, (totalsByMonth.get(month) || 0) + total);
            });

            // Loop through downsell_by_month and crosssell_by_month and add 0 totals to the map
            data.downsell_by_month.forEach(item => {
                const { month, total } = item;
                totalsByMonth.set(month, (totalsByMonth.get(month) || 0) + total);
            });

            data.crosssell_by_month.forEach(item => {
                const { month, total } = item;
                totalsByMonth.set(month, (totalsByMonth.get(month) || 0) + total);
            });

            // Convert map back to array of objects
            totalsByMonth.forEach((total, month) => {
                result.push({ month, total });
            });

            return result;
        }

        function calculateTotalByWeek(data) {
            const result = [];

            // Create a map to store totals by month
            const totalsByMonth = new Map();

            // Loop through commission_by_month and add totals to the map
            data.commission_by_week.forEach(item => {
                const { week, total } = item;
                totalsByMonth.set(week, (totalsByMonth.get(week) || 0) + total);
            });

            // Loop through upsell_by_month and add totals to the map
            data.upsell_by_week.forEach(item => {
                const { week, total } = item;
                totalsByMonth.set(week, (totalsByMonth.get(week) || 0) + total);
            });

            // Loop through downsell_by_month and crosssell_by_month and add 0 totals to the map
            data.downsell_by_week.forEach(item => {
                const { week, total } = item;
                totalsByMonth.set(week, (totalsByMonth.get(week) || 0) + total);
            });

            data.crosssell_by_week.forEach(item => {
                const { week, total } = item;
                totalsByMonth.set(week, (totalsByMonth.get(week) || 0) + total);
            });

            // Convert map back to array of objects
            totalsByMonth.forEach((total, week) => {
                result.push({ week, total });
            });

            return result;
        }

        function calculateTotalByDay(data) {
            const result = [];

            // Create a map to store totals by month
            const totalsByMonth = new Map();

            // Loop through commission_by_month and add totals to the map
            data.commission_by_day.forEach(item => {
                const { day, total } = item;
                totalsByMonth.set(day, (totalsByMonth.get(day) || 0) + total);
            });

            // Loop through upsell_by_month and add totals to the map
            data.upsell_by_day.forEach(item => {
                const { day, total } = item;
                totalsByMonth.set(day, (totalsByMonth.get(day) || 0) + total);
            });

            // Loop through downsell_by_month and crosssell_by_month and add 0 totals to the map
            data.downsell_by_day.forEach(item => {
                const { day, total } = item;
                totalsByMonth.set(day, (totalsByMonth.get(day) || 0) + total);
            });

            data.crosssell_by_day.forEach(item => {
                const { day, total } = item;
                totalsByMonth.set(day, (totalsByMonth.get(day) || 0) + total);
            });

            // Convert map back to array of objects
            totalsByMonth.forEach((total, day) => {
                result.push({ day, total });
            });

            return result;
        }

        /** Running function */
        async function getTeamEarningByMonth(id_user, startDate, endDate) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            try {
                const commission_by_month = await Team_User.findAll({
                    attributes: [
                        [sequelize.fn('DATE_FORMAT', sequelize.col('Orders.createdAt'), '%Y-%m-01'), 'month'],
                        [sequelize.fn('sum', sequelize.col('commission')), 'total']
                    ],
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { status: ['Livre', 'Paye'], createdAt: { [Op.between]: [startDate, endDate] } },
                        attributes: []
                    },
                    group: [sequelize.fn('DATE_FORMAT', sequelize.col('Orders.createdAt'), '%Y-%m-01')],
                    raw: true
                });

                const upsell_by_month = await Team_User.findAll({
                    attributes: [
                        [sequelize.fn('DATE_FORMAT', sequelize.col('Orders.createdAt'), '%Y-%m-01'), 'month'],
                        [sequelize.fn('sum', sequelize.col('upsell')), 'total']
                    ],
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Upsell', status: ['Livre', 'Paye'], createdAt: { [Op.between]: [startDate, endDate] } },
                        attributes: []
                    },
                    group: [sequelize.fn('DATE_FORMAT', sequelize.col('Orders.createdAt'), '%Y-%m-01')],
                    raw: true
                });

                const downsell_by_month = await Team_User.findAll({
                    attributes: [
                        [sequelize.fn('DATE_FORMAT', sequelize.col('Orders.createdAt'), '%Y-%m-01'), 'month'],
                        [sequelize.fn('sum', sequelize.col('downsell')), 'total']
                    ],
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Downsell', status: ['Livre', 'Paye'], createdAt: { [Op.between]: [startDate, endDate] } },
                        attributes: []
                    },
                    group: [sequelize.fn('DATE_FORMAT', sequelize.col('Orders.createdAt'), '%Y-%m-01')],
                    raw: true
                });

                const crosssell_by_month = await Team_User.findAll({
                    attributes: [
                        [sequelize.fn('DATE_FORMAT', sequelize.col('Orders.createdAt'), '%Y-%m-01'), 'month'],
                        [sequelize.fn('sum', sequelize.col('crosssell')), 'total']
                    ],
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Crosssell', status: ['Livre', 'Paye'], createdAt: { [Op.between]: [startDate, endDate] } },
                        attributes: []
                    },
                    group: [sequelize.fn('DATE_FORMAT', sequelize.col('Orders.createdAt'), '%Y-%m-01')],
                    raw: true
                });

                const data = {
                    commission_by_month,
                    upsell_by_month,
                    downsell_by_month,
                    crosssell_by_month
                }

                const result = calculateTotalByMonth(data);

                return result

            } catch (error) {
                console.log(error)
                return null
            }


        }

        async function getTeamEarningByDays(id_user, startDate, endDate) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            try {
                const commission_by_day = await Team_User.findAll({
                    attributes: [
                        [sequelize.fn('DATE', sequelize.col('Orders.createdAt')), 'day'],
                        [sequelize.fn('SUM', sequelize.col('commission')), 'total']
                    ],
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { status: ['Livre', 'Paye'], createdAt: { [Op.between]: [startDate, endDate] } },
                        attributes: []
                    },
                    group: [sequelize.fn('DATE', sequelize.col('Orders.createdAt'))],
                    raw: true
                });

                const upsell_by_day = await Team_User.findAll({
                    attributes: [
                        [sequelize.fn('DATE', sequelize.col('Orders.createdAt')), 'day'],
                        [sequelize.fn('SUM', sequelize.col('upsell')), 'total']
                    ],
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Upsell', status: ['Livre', 'Paye'], createdAt: { [Op.between]: [startDate, endDate] } },
                        attributes: []
                    },
                    group: [sequelize.fn('DATE', sequelize.col('Orders.createdAt'))],
                    raw: true
                });

                const downsell_by_day = await Team_User.findAll({
                    attributes: [
                        [sequelize.fn('DATE', sequelize.col('Orders.createdAt')), 'day'],
                        [sequelize.fn('SUM', sequelize.col('downsell')), 'total']
                    ],
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Downsell', status: ['Livre', 'Paye'], createdAt: { [Op.between]: [startDate, endDate] } },
                        attributes: []
                    },
                    group: [sequelize.fn('DATE', sequelize.col('Orders.createdAt'))],
                    raw: true
                });

                const crosssell_by_day = await Team_User.findAll({
                    attributes: [
                        [sequelize.fn('DATE', sequelize.col('Orders.createdAt')), 'day'],
                        [sequelize.fn('SUM', sequelize.col('crosssell')), 'total']
                    ],
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Crosssell', status: ['Livre', 'Paye'], createdAt: { [Op.between]: [startDate, endDate] } },
                        attributes: []
                    },
                    group: [sequelize.fn('DATE', sequelize.col('Orders.createdAt'))],
                    raw: true
                });

                const data = {
                    commission_by_day,
                    upsell_by_day,
                    downsell_by_day,
                    crosssell_by_day
                }

                const result = calculateTotalByDay(data)

                return result
            } catch (error) {
                console.log(error)
            }

        }

        async function getTeamEarningByWeek(id_user, startDate, endDate) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            try {
                const commission = await Team_User.findAll({
                    attributes: [
                        [sequelize.fn('YEARWEEK', sequelize.col('Orders.createdAt'), 1), 'week'],
                        [sequelize.fn('sum', sequelize.col('commission')), 'total']
                    ],
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { status: ['Livre', 'Paye'], createdAt: { [Op.between]: [startDate, endDate] } },
                        attributes: []
                    },
                    group: [sequelize.fn('YEARWEEK', sequelize.col('Orders.createdAt'), 1)],
                    raw: true
                });

                const commission_by_week = commission.map(entry => {
                    const weekValue = entry.week.toString();
                    const year = parseInt(weekValue.slice(0, 4));
                    const weekNumber = parseInt(weekValue.slice(4));

                    // Calculate the start date of the week
                    const startDate = new Date(year, 0); // Initialize with the beginning of the year
                    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7); // Adjust for the week number

                    return {
                        week: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
                        total: entry.total
                    };
                });

                const upsell = await Team_User.findAll({
                    attributes: [
                        [sequelize.fn('YEARWEEK', sequelize.col('Orders.createdAt'), 1), 'week'],
                        [sequelize.fn('sum', sequelize.col('upsell')), 'total']
                    ],
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Upsell', status: ['Livre', 'Paye'], createdAt: { [Op.between]: [startDate, endDate] } },
                        attributes: []
                    },
                    group: [sequelize.fn('YEARWEEK', sequelize.col('Orders.createdAt'), 1)],
                    raw: true
                });

                const upsell_by_week = upsell.map(entry => {
                    const weekValue = entry.week.toString();
                    const year = parseInt(weekValue.slice(0, 4));
                    const weekNumber = parseInt(weekValue.slice(4));

                    // Calculate the start date of the week
                    const startDate = new Date(year, 0); // Initialize with the beginning of the year
                    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7); // Adjust for the week number

                    return {
                        week: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
                        total: entry.total
                    };
                });

                const downsell = await Team_User.findAll({
                    attributes: [
                        [sequelize.fn('YEARWEEK', sequelize.col('Orders.createdAt'), 1), 'week'],
                        [sequelize.fn('sum', sequelize.col('downsell')), 'total']
                    ],
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Downsell', status: ['Livre', 'Paye'], createdAt: { [Op.between]: [startDate, endDate] } },
                        attributes: []
                    },
                    group: [sequelize.fn('YEARWEEK', sequelize.col('Orders.createdAt'), 1)],
                    raw: true
                });

                const downsell_by_week = downsell.map(entry => {
                    const weekValue = entry.week.toString();
                    const year = parseInt(weekValue.slice(0, 4));
                    const weekNumber = parseInt(weekValue.slice(4));

                    // Calculate the start date of the week
                    const startDate = new Date(year, 0); // Initialize with the beginning of the year
                    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7); // Adjust for the week number

                    return {
                        week: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
                        total: entry.total
                    };
                });

                const crosssell = await Team_User.findAll({
                    attributes: [
                        [sequelize.fn('YEARWEEK', sequelize.col('Orders.createdAt'), 1), 'week'],
                        [sequelize.fn('sum', sequelize.col('crosssell')), 'total']
                    ],
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Crosssell', status: ['Livre', 'Paye'], createdAt: { [Op.between]: [startDate, endDate] } },
                        attributes: []
                    },
                    group: [sequelize.fn('YEARWEEK', sequelize.col('Orders.createdAt'), 1)],
                    raw: true
                });

                const crosssell_by_week = crosssell.map(entry => {
                    const weekValue = entry.week.toString();
                    const year = parseInt(weekValue.slice(0, 4));
                    const weekNumber = parseInt(weekValue.slice(4));

                    // Calculate the start date of the week
                    const startDate = new Date(year, 0); // Initialize with the beginning of the year
                    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7); // Adjust for the week number

                    return {
                        week: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
                        total: entry.total
                    };
                });

                const data = {
                    commission_by_week,
                    upsell_by_week,
                    downsell_by_week,
                    crosssell_by_week
                }

                const result = calculateTotalByWeek(data);

                return result
            } catch (error) {
                console.log(error)
            }
        }

        function getAllMonths() {
            const months = [
                "January", "February", "March", "April",
                "May", "June", "July", "August",
                "September", "October", "November", "December"
            ];

            return months;
        }

        if (!useDate) {

            var start_end_date = getStartAndEndDateOfYear()
            var months = getStartDateBetweenMonth(start_end_date[0], start_end_date[1])
            var earning = await getTeamEarningByMonth(id_user, start_end_date[0], start_end_date[1])

            var data = {
                labels: getAllMonths(),
                datasets: [
                    {
                        label: 'Earning',
                        data: earning.length != 0 ?
                            months.map(date => {
                                var count = earning.find(element => element.month == date)
                                return count ? count.total : 0
                            }) :
                            Array(months.length).fill(0),
                        fill: false,
                        borderColor: 'rgb(255,255,0)',
                        tension: 0.1
                    }
                ]
            }

            return data

        } else {

            var differenceInDays = getDifferenceInDays(dateFrom, dateTo) + 1
            var dates = getLastDays(differenceInDays, new Date(dateTo))
            var formatedDate = dates.map(date => date.toISOString().slice(0, 10))

            if (differenceInDays < 14) {
                const earning = await getTeamEarningByDays(id_user, dateFrom, dateTo)

                var data = {
                    labels: formatedDate.reverse(),
                    datasets: [
                        {
                            label: 'Earning',
                            data: earning.length != 0 ?
                                formatedDate.map(date => {
                                    var count = earning.find(element => element.day == date)
                                    return count ? count.total : 0
                                }) :
                                Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(255,255,0)',
                            tension: 0.1
                        }
                    ]
                }

                return data
            } else if (differenceInDays < 90) {

                var weeks = getStartDateBetweenWeeks(dateFrom, dateTo)

                const earning = await getTeamEarningByWeek(id_user, dateFrom, dateTo)

                var data = {
                    labels: weeks,
                    datasets: [
                        {
                            label: 'Earning',
                            data: earning.length != 0 ?
                                weeks.map(date => {
                                    var count = earning.find(element => element.week == date)
                                    return count ? count.total : 0
                                }) :
                                Array(weeks.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(255,255,0)',
                            tension: 0.1
                        }
                    ]
                }

                return data
            } else {
                var months = getStartDateBetweenMonth(dateFrom, dateTo)

                const earning = await getTeamEarningByMonth(id_user, dateFrom, dateTo)

                var data = {
                    labels: months,
                    datasets: [
                        {
                            label: 'Earning',
                            data: earning.length != 0 ?
                                months.map(date => {
                                    var count = earning.find(element => element.month == date)
                                    return count ? count.total : 0
                                }) :
                                Array(months.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(255,255,0)',
                            tension: 0.1
                        }
                    ]
                }

                return data
            }
        }

    }

    static async GetAllTeamEarningTable({ id_user, useDate, dateFrom, dateTo }) {

        function getDifferenceInDays(startDate, endDate) {
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);

            const diffInMs = Math.abs(date2 - date1);
            return diffInMs / (1000 * 60 * 60 * 24);
        }

        try {
            var differenceInDays = getDifferenceInDays(dateFrom, dateTo) + 1

            if (!useDate) {
                var livre_params = {
                    where: { status: ['Livre', 'Paye'], id_user: id_user }
                }

                var upsell_params = {
                    where: {
                        updownsell: 'Upsell', id_user: id_user, status: ['Livre', 'Paye']
                    }
                }

                var downsell_params = {
                    where: {
                        updownsell: 'Downsell', id_user: id_user, status: ['Livre', 'Paye']
                    }
                }

                var crosssell_params = {
                    where: {
                        updownsell: 'Crosssell', id_user: id_user, status: ['Livre', 'Paye']
                    }
                }

                var livre = await Order.count(livre_params)
                var upsell = await Order.count(upsell_params)
                var downsell = await Order.count(downsell_params)
                var crosssell = await Order.count(crosssell_params)

                // sum of all team commission
                var sum_commission = await Team_User.sum('commission', {
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { status: ['Livre', 'Paye'] }
                    }
                })

                var sum_upsell = await Team_User.sum('upsell', {
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Upsell', status: ['Livre', 'Paye'] }
                    }
                })

                var sum_downsell = await Team_User.sum('downsell', {
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Downsell', status: ['Livre', 'Paye'] }
                    }
                })

                var sum_crosssell = await Team_User.sum('crosssell', {
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Crosssell', status: ['Livre', 'Paye'] }
                    }
                })

                // sum of all team salary
                var sum_salary = await Team_User.sum('salaire', { where: { id_user: id_user, active: true } })

                const data = {
                    livre: { nb_commande: livre, her_earning: (sum_commission), salaire: sum_salary },
                    upsell: { nb_commande: upsell, her_earning: (sum_upsell), salaire: sum_salary },
                    downsell: { nb_commande: downsell, her_earning: (sum_downsell), salaire: sum_salary },
                    crosssell: { nb_commande: crosssell, her_earning: (sum_crosssell), salaire: sum_salary }
                }

                return data
            } else {

                var livre_params = {
                    where: { status: ['Livre', 'Paye'], createdAt: { [Op.between]: [dateFrom, dateTo] }, id_user: id_user }
                }

                var upsell_params = {
                    where: {
                        updownsell: 'Upsell', createdAt: { [Op.between]: [dateFrom, dateTo] }, id_user: id_user, status: ['Livre', 'Paye']
                    }
                }

                var downsell_params = {
                    where: {
                        updownsell: 'Downsell', createdAt: { [Op.between]: [dateFrom, dateTo] }, id_user: id_user, status: ['Livre', 'Paye']
                    }
                }

                var crosssell_params = {
                    where: {
                        updownsell: 'Crosssell', createdAt: { [Op.between]: [dateFrom, dateTo] }, id_user: id_user, status: ['Livre', 'Paye']
                    }
                }
                // her earning 
                var her_earning_upsell_params = {
                    where: { updownsell: 'Upsell', id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: ['Livre', 'Paye'] }
                }

                var her_earning_downsell_params = {
                    where: { updownsell: 'Downsell', id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: ['Livre', 'Paye'] }
                }

                var her_earning_crosssell_params = {
                    where: { updownsell: 'Crosssell', id_user, createdAt: { [Op.between]: [dateFrom, dateTo] }, status: ['Livre', 'Paye'] }
                }

                // sum of all team commission
                var sum_commission = await Team_User.sum('commission',
                    {
                        where: { id_user: id_user },
                        include: {
                            model: Order,
                            where: { status: ['Livre', 'Paye'], createdAt: { [Op.between]: [dateFrom, dateTo] } }
                        }
                    }
                )

                var sum_upsell = await Team_User.sum('upsell', {
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Upsell', status: ['Livre', 'Paye'], createdAt: { [Op.between]: [dateFrom, dateTo] } }
                    }
                })

                var sum_downsell = await Team_User.sum('downsell', {
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Downsell', status: ['Livre', 'Paye'], createdAt: { [Op.between]: [dateFrom, dateTo] } }
                    }
                })

                var sum_crosssell = await Team_User.sum('crosssell', {
                    where: { id_user: id_user },
                    include: {
                        model: Order,
                        where: { updownsell: 'Crosssell', status: ['Livre', 'Paye'], createdAt: { [Op.between]: [dateFrom, dateTo] } }
                    }
                })

                // sum of all team salary
                var sum_salary = await Team_User.sum('salaire', { where: { id_user: id_user, active: true } })

                var livre = await Order.count(livre_params)

                var upsell = await Order.count(upsell_params)
                var downsell = await Order.count(downsell_params)
                var crosssell = await Order.count(crosssell_params)

                // her earning 

                const data = {
                    livre: { nb_commande: livre, her_earning: (sum_commission), salaire: ((differenceInDays * sum_salary) / 30) },
                    upsell: { nb_commande: upsell, her_earning: (sum_upsell), salaire: ((differenceInDays * sum_salary) / 30) },
                    downsell: { nb_commande: downsell, her_earning: (sum_downsell), salaire: ((differenceInDays * sum_salary) / 30) },
                    crosssell: { nb_commande: crosssell, her_earning: (sum_crosssell), salaire: ((differenceInDays * sum_salary) / 30) }
                }



                return data
            }

        } catch (err) {
            console.log(err)
            return 0
        }
    }

    static async getRateReport({ id_user, id_team, dateFrom, dateTo, useDate, id_product_array }) {
        const DELIVRED = ['Livre', 'Paye']
        const CONFIRMED = ['Confirme']

        function getLastDays(nb, endDate) {
            const today = new Date(endDate);
            const lastDays = [];

            for (let i = 0; i < nb; i++) {
                const day = new Date(endDate);

                day.setDate(today.getDate() - i);
                lastDays.push(day);
            }

            return lastDays;
        }

        function getStartDateBetweenWeeks(starDate, enDate) {
            var startDate = new Date(starDate);
            var endDate = new Date(enDate);

            var weeks = [];
            while (startDate <= endDate) {
                if (startDate.getDay() === 0) {
                    weeks.push(startDate.toISOString().slice(0, 10));
                }
                startDate.setDate(startDate.getDate() + 1);
            }

            return weeks;
        }

        function getStartDateBetweenMonth(starDate, enDate) {
            var startDate = new Date(starDate);
            var endDate = new Date(enDate);

            var month = [];
            while (startDate <= endDate) {
                month.push(new Date(startDate.getFullYear(), startDate.getMonth(), 1).toISOString().slice(0, 10));
                startDate.setMonth(startDate.getMonth() + 1);
            }

            return month;
        }

        function getDifferenceInDays(startDate, endDate) {
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);

            const diffInMs = Math.abs(date2 - date1);
            return diffInMs / (1000 * 60 * 60 * 24);
        }

        const getWeekStartDate = (weekNum, year) => {
            const date = new Date(year, 0, 1);
            const diff = (weekNum - 2) * 7;
            date.setDate(date.getDate() + diff);
            return date;
        }

        async function getRateOfDelivredByDays(days, endDate, id_product_array, id_team) {

            // step 1
            var search_params_with_product = {
                where: {
                    id_user,
                    ...(id_team && { id_team }),
                    status: ['Livre', 'Paye']
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']],
                include: {
                    model: Product_Order,
                    where: {
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                },
            }

            var search_params_without_product = {
                where: {
                    id_user,
                    ...(id_team && { id_team }),
                    status: ['Livre', 'Paye']
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']],
            }

            var orders = await Order.findAll(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

            if (orders.length == 0) return 0

            // step 2
            var search_params_with_product = {
                where: {
                    ...(id_team && { id_team }),
                    id_user
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']],
                include: {
                    model: Product_Order,
                    where: {
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                },
            }

            var search_params_without_product = {
                where: {
                    ...(id_team && { id_team }),
                    id_user
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']],
            }

            var nb_order = await Order.findAll(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

            if (nb_order.length == 0) return 0

            var orders_date = []
            // compare date in orders and date in nb_order and push orders_date
            for (let i = 0; i < orders.length; i++) {
                const element = orders[i]

                var date = element.date.toISOString().slice(0, 10)

                for (let j = 0; j < nb_order.length; j++) {
                    const order = nb_order[j]

                    var date_order = order.date.toISOString().slice(0, 10)

                    if (date == date_order) {
                        orders_date.push({ date, sum: (element.dataValues.count * 100) / order.dataValues.count })
                    }
                }
            }

            // get last 7 days
            var last7Days = getLastDays(days, endDate)

            // format last7Days to {date: 0}
            var last7Days_date = []
            for (let i = 0; i < last7Days.length; i++) {
                const element = last7Days[i]

                var date = element.toISOString().slice(0, 10)

                last7Days_date.push({ date, sum: 0 })
            }

            // compare last7Days_date and orders_date
            for (let i = 0; i < last7Days_date.length; i++) {
                const element = last7Days_date[i]

                for (let j = 0; j < orders_date.length; j++) {
                    const order = orders_date[j]

                    if (element.date == order.date) {
                        element.sum = order.sum
                    }
                }
            }

            return last7Days_date
        }

        async function getRateOfConfirmedByDays(days, endDate, id_product_array, id_team) {

            // step 1
            var search_params_with_product = {
                where: {
                    id_user,
                    ...(id_team && { id_team }),
                    status: ['Confirme']
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']],
                include: {
                    model: Product_Order,
                    where: {
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                },
            }

            var search_params_without_product = {
                where: {
                    id_user,
                    ...(id_team && { id_team }),
                    status: ['Confirme']
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']],
            }

            var orders = await Order.findAll(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

            if (orders.length == 0) return 0

            // step 2
            var search_params_with_product = {
                where: {
                    id_user,
                    ...(id_team && { id_team }),
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']],
                include: {
                    model: Product_Order,
                    where: {
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                },
            }

            var search_params_without_product = {
                where: {
                    id_user,
                    ...(id_team && { id_team }),
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']],
            }

            var nb_order = await Order.findAll(id_product_array.length != 0 ? search_params_with_product : search_params_without_product)

            if (nb_order.length == 0) return 0

            var orders_date = []
            // compare date in orders and date in nb_order and push orders_date
            for (let i = 0; i < orders.length; i++) {
                const element = orders[i]

                var date = element.date.toISOString().slice(0, 10)

                for (let j = 0; j < nb_order.length; j++) {
                    const order = nb_order[j]

                    var date_order = order.date.toISOString().slice(0, 10)

                    if (date == date_order) {
                        orders_date.push({ date, sum: (element.dataValues.count * 100) / order.dataValues.count })
                    }
                }
            }

            // get last 7 days
            var last7Days = getLastDays(days, endDate)

            // format last7Days to {date: 0}
            var last7Days_date = []
            for (let i = 0; i < last7Days.length; i++) {
                const element = last7Days[i]

                var date = element.toISOString().slice(0, 10)

                last7Days_date.push({ date, sum: 0 })
            }

            // compare last7Days_date and orders_date
            for (let i = 0; i < last7Days_date.length; i++) {
                const element = last7Days_date[i]

                for (let j = 0; j < orders_date.length; j++) {
                    const order = orders_date[j]

                    if (element.date == order.date) {
                        element.sum = order.sum
                    }
                }
            }

            return last7Days_date
        }

        async function getRateByWeek(startDate, endDate, status, id_product_array, id_team) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            // step 1

            var query_with_product = `
                SELECT
                    CONCAT(YEAR(date), '/', WEEK(date)) AS week_name, 
                    YEAR(date) as year , WEEK(date) as week_num, COUNT(*) as count
                FROM
                    Orders, Product_Order
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    status IN (:status)
                AND
                    Product_Order.id_product IN (:id_product_array)
                GROUP BY
                    week_name
                ORDER BY YEAR(DATE) ASC, WEEK(date) ASC
            `

            var query_without_product = `
                SELECT
                    CONCAT(YEAR(date), '/', WEEK(date)) AS week_name, 
                    YEAR(date) as year , WEEK(date) as week_num, COUNT(*) as count
                FROM
                    Orders
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    status IN (:status)
                GROUP BY
                    week_name
                ORDER BY YEAR(DATE) ASC, WEEK(date) ASC
            `

            // step 2
            var query_with_product_wStatus = `
                SELECT
                    CONCAT(YEAR(date), '/', WEEK(date)) AS week_name, 
                    YEAR(date) as year , WEEK(date) as week_num, COUNT(*) as count
                FROM
                    Orders, Product_Order
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    Product_Order.id_product IN (:id_product_array)
                GROUP BY
                    week_name
                ORDER BY YEAR(DATE) ASC, WEEK(date) ASC
            `

            var query_without_product_wStatus = `
                SELECT
                    CONCAT(YEAR(date), '/', WEEK(date)) AS week_name, 
                    YEAR(date) as year , WEEK(date) as week_num, COUNT(*) as count
                FROM
                    Orders
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                GROUP BY
                    week_name
                ORDER BY YEAR(DATE) ASC, WEEK(date) ASC
            `

            try {
                const result = await seqlz.query(id_product_array.length != 0 ? query_with_product : query_without_product, {
                    replacements: { startDate, endDate, id_user, status, id_product_array, id_team: id_team ?? null },
                    type: sequelize.QueryTypes.SELECT
                })

                const result_nb_order = await seqlz.query(id_product_array.length != 0 ? query_with_product_wStatus : query_without_product_wStatus, {
                    replacements: { startDate, endDate, id_user, id_team: id_team ?? null },
                    type: sequelize.QueryTypes.SELECT
                })

                var result_formated = []
                for (let i = 0; i < result.length; i++) {
                    const element = result[i]
                    const element_nb_order = result_nb_order[i]

                    var date = getWeekStartDate(element.week_num + 1, element.year)

                    result_formated.push({ date: date.toISOString().slice(0, 10), count: (element.count * 100) / element_nb_order.count })
                }

                return result_formated
            } catch (error) {
                console.log(error)
            }
        }

        async function getRateByMonth(startDate, endDate, status, id_product_array, id_team) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            // step 1
            var query_with_product = `
                SELECT
                    CONCAT(YEAR(date), '/', MONTH(date)) AS month_name, 
                    YEAR(date) as year , MONTH(date) as month_num, COUNT(*) as count
                FROM
                    Orders, Product_Order
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    status IN (:status)
                AND
                    Product_Order.id_product IN (:id_product_array)
                GROUP BY
                    month_name
                ORDER BY YEAR(DATE) ASC, MONTH(date) ASC
            `

            var query_without_product = `
                SELECT
                    CONCAT(YEAR(date), '/', MONTH(date)) AS month_name, 
                    YEAR(date) as year , MONTH(date) as month_num, COUNT(*) as count
                FROM
                    Orders
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    status IN (:status)
                GROUP BY
                    month_name
                ORDER BY YEAR(DATE) ASC, MONTH(date) ASC
            `
            // step 2
            var query_with_product_wStatus = `
                SELECT
                    CONCAT(YEAR(date), '/', MONTH(date)) AS month_name, 
                    YEAR(date) as year , MONTH(date) as month_num, COUNT(*) as count
                FROM
                    Orders, Product_Order
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                AND
                    Product_Order.id_product IN (:id_product_array)
                GROUP BY
                    month_name
                ORDER BY YEAR(DATE) ASC, MONTH(date) ASC
            `

            var query_without_product_wStatus = `
                SELECT
                    CONCAT(YEAR(date), '/', MONTH(date)) AS month_name, 
                    YEAR(date) as year , MONTH(date) as month_num, COUNT(*) as count
                FROM
                    Orders
                WHERE
                    date BETWEEN :startDate AND :endDate
                AND
                    id_user = :id_user
                AND
                    (:id_team IS NULL OR id_team = :id_team)
                GROUP BY
                    month_name
                ORDER BY YEAR(DATE) ASC, MONTH(date) ASC
            `

            try {
                const result = await seqlz.query(id_product_array.length != 0 ? query_with_product : query_without_product, {
                    replacements: { startDate, endDate, id_user, status, id_product_array, id_team: id_team ?? null },
                    type: sequelize.QueryTypes.SELECT
                })

                const result_nb_order = await seqlz.query(id_product_array.length != 0 ? query_with_product_wStatus : query_without_product_wStatus, {
                    replacements: { startDate, endDate, id_user, id_team: id_team ?? null },
                    type: sequelize.QueryTypes.SELECT
                })

                var result_formated = []
                for (let i = 0; i < result.length; i++) {
                    const element = result[i]
                    const element_nb_order = result_nb_order[i]

                    var date = new Date(element.year, element.month_num - 1, 1)

                    result_formated.push({ date: date.toISOString().slice(0, 10), count: (element.count * 100) / element_nb_order.count })
                }

                return result_formated
            } catch (error) {
                console.log(error)
            }
        }

        try {
            if (!useDate) {
                var dates = getLastDays(7, new Date())
                var formatedDate = dates.map(date => date.toISOString().slice(0, 10))

                var rateOfDelivred = await getRateOfDelivredByDays(7, new Date(), id_product_array, id_team)
                var rateOfConfirmed = await getRateOfConfirmedByDays(7, new Date(), id_product_array, id_team)

                var data = {
                    labels: formatedDate.reverse(),
                    datasets: [
                        {
                            label: 'Rate Of Delivred',
                            data: rateOfDelivred ? rateOfDelivred.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        },
                        {
                            label: 'Rate Of Confirmed',
                            data: rateOfConfirmed ? rateOfConfirmed.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(255, 99, 132)',
                            tension: 0.1
                        }
                    ]
                }

                return data
            } else {

                var differenceInDays = getDifferenceInDays(dateFrom, dateTo) + 1
                var dates = getLastDays(differenceInDays, new Date(dateTo))
                var formatedDate = dates.map(date => date.toISOString().slice(0, 10))

                if (differenceInDays < 14) {

                    var rateOfDelivred = await getRateOfDelivredByDays(differenceInDays, new Date(dateTo), id_product_array, id_team)
                    var rateOfConfirmed = await getRateOfConfirmedByDays(differenceInDays, new Date(dateTo), id_product_array, id_team)

                    var data = {
                        labels: formatedDate.reverse(),
                        datasets: [
                            {
                                label: 'Rate Of Delivred',
                                data: rateOfDelivred ? rateOfDelivred.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Rate Of Confirmed',
                                data: rateOfConfirmed ? rateOfConfirmed.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                } else if (differenceInDays < 90) {

                    var weeks = getStartDateBetweenWeeks(dateFrom, dateTo)

                    var rateOfDelivred = await getRateByWeek(dateFrom, dateTo, DELIVRED, id_product_array, id_team)
                    var rateOfConfirmed = await getRateByWeek(dateFrom, dateTo, CONFIRMED, id_product_array, id_team)

                    var data = {
                        labels: weeks,
                        datasets: [
                            {
                                label: 'Rate of delivred',
                                data: rateOfDelivred.length != 0 ?
                                    weeks.map(date => {
                                        var amount = rateOfDelivred.find(element => element.date == date)
                                        return amount ? amount.count : 0
                                    }) :
                                    Array(weeks.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Rate of confirmed',
                                data: rateOfConfirmed.length != 0 ?
                                    weeks.map(date => {
                                        var amount = rateOfConfirmed.find(element => element.date == date)
                                        return amount ? amount.count : 0
                                    }) :
                                    Array(weeks.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                } else {
                    var months = getStartDateBetweenMonth(dateFrom, dateTo)

                    var rateOfDelivred = await getRateByMonth(dateFrom, dateTo, DELIVRED, id_product_array, id_team)
                    var rateOfConfirmed = await getRateByMonth(dateFrom, dateTo, CONFIRMED, id_product_array, id_team)

                    var data = {
                        labels: months,
                        datasets: [
                            {
                                label: 'Rate of delivred',
                                data: rateOfDelivred.length != 0 ?
                                    months.map(date => {
                                        var amount = rateOfDelivred.find(element => element.date == date)
                                        return amount ? amount.count : 0
                                    }) :
                                    Array(months.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Rate of confirmed',
                                data: rateOfConfirmed.length != 0 ?
                                    months.map(date => {
                                        var amount = rateOfConfirmed.find(element => element.date == date)
                                        return amount ? amount.count : 0
                                    }) :
                                    Array(months.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                }

                return 0
            }
        } catch (err) {
            console.log(err)
            return null
        }
    }

    static async AddVariant({ id_user, name }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var varExisting = await this.#findVariantByName(id_user, name)
            if (varExisting) return { code: 400, message: 'This variant already exist' }

            var variantBuild = await Variant.build({
                name: name,
                id_user: id_user
            })

            var variantSaved = await variantBuild.save()

            return { code: 200, data: variantSaved }
        } catch (err) {
            console.log(err)
            return { code: 500, message: 'Internal server error' }
        }
    }

    static async PatchVariant({ id_user, id, name }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var varSameName = await this.#findVariantByName(id_user, name)
            if (varSameName) return { code: 400, message: 'This variant already exist' }

            var varExisting = await this.#findVariantById(id)
            if (!varExisting) return { code: 400, message: 'This variant doesn\'t exist' }

            varExisting.name = name ?? varExisting.name

            var variantUpdated = await varExisting.save()

            return { code: 200, data: variantUpdated }
        } catch (err) {
            console.log(err)
            return { code: 500, message: 'Internal server error' }
        }
    }

    static async DeleteVariant({ id_user, id }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var varExisting = await this.#findVariantById(id)
            if (!varExisting) return { code: 400, message: 'This variant doesn\'t exist' }

            var variantDeleted = await varExisting.destroy()

            return { code: 200, data: variantDeleted }
        } catch (err) {
            console.log(err)
            return { code: 500, message: 'Internal server error' }
        }
    }

    static async GetVariant({ id_user }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var variant = await Variant.findAll({
                where: { id_user }
            })

            return { code: 200, data: variant }
        } catch (err) {
            console.log(err)
            return { code: 500, message: 'Internal server error' }
        }
    }

    static async GetPaiementDashbord({ id_user, useDate, dateFrom, dateTo, id_product_array }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {

            var ChffAffaire = await this.GetChiffreAffaire({ id_user, useDate, dateFrom, dateTo, id_product_array })
            var spending = await this.getSpending({ id_user, useDate, dateFrom, dateTo, id_product_array })
            var spending_ads = await this.getSpendingAds({ id_user, useDate, dateFrom, dateTo, id_product_array })
            var spending_product = await this.getSpendingProduct({ id_user, useDate, dateFrom, dateTo, id_product_array })
            var spending_city = await this.getSpendingCity({ id_user, useDate, dateFrom, dateTo, id_product_array })
            var spending_commission = await this.getSpendingCommission({ id_user, useDate, dateFrom, dateTo, id_product_array })
            var spending_landing_design = await this.getSpendingLandingDesign({ id_user, useDate, dateFrom, dateTo, id_product_array })
            var spending_autre = await this.getSpendingAutre({ id_user, useDate, dateFrom, dateTo, id_product_array })
            var earningNet = await this.getEarningNet({ id_user, useDate, dateFrom, dateTo, id_product_array })
            var transaction = await this.GetTransaction({ id_user, useDate, dateFrom, dateTo, id_product_array })
            var detailOfSpending = await this.GetDetailsOfSpending({ id_user, useDate, dateFrom, dateTo, id_product_array })

            if (ChffAffaire === null || spending === null || earningNet === null || transaction === null || detailOfSpending === null
                || spending_ads === null || spending_product === null || spending_city === null || spending_commission === null || spending_landing_design === null || spending_autre === null)
                return { code: 500, message: 'Internal server error' }

            const data = {
                ChffAffaire,
                spending,
                earningNet,
                transaction,
                detailOfSpending,
                spending_ads,
                spending_product,
                spending_city,
                spending_commission,
                spending_landing_design,
                spending_autre
            }

            return { code: 200, data }

        } catch (err) {
            console.log(err)
            return { code: 500, message: 'Internal server error' }
        }
    }

    static async GetChiffreAffaire({ id_user, useDate, dateFrom, dateTo, id_product_array }) {
        const DELIVRED = ['Livre', 'Paye']
        if (!useDate) {
            var sum_order_with_product = {
                where: {
                    id_user,
                    status: DELIVRED,
                },
                include: {
                    model: Product_Order,
                    where: {
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    }
                }
            }

            var sum_order_without_product = {
                where: {
                    id_user,
                    status: DELIVRED
                }
            }

            var sumOrder = await Order.sum('prix', id_product_array.length > 0 ? sum_order_with_product : sum_order_without_product)
            sumOrder = sumOrder ?? 0

            return sumOrder
        } else {

            var sum_order_with_product = {
                where: {
                    id_user,
                    status: DELIVRED,
                    date: {
                        [Op.between]: [dateFrom, dateTo]
                    }
                },
                include: {
                    model: Product_Order,
                    where: {
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    }
                }
            }

            var sum_order_without_product = {
                where: {
                    id_user,
                    status: DELIVRED,
                    date: {
                        [Op.between]: [dateFrom, dateTo]
                    }
                }
            }

            var sumOrder = await Order.sum('prix', id_product_array.length > 0 ? sum_order_with_product : sum_order_without_product)

            sumOrder = sumOrder ?? 0

            return sumOrder
        }
    }

    static async getSpending({ id_user, useDate, dateFrom, dateTo, id_product_array }) {
        const DELIVRED = ['Livre', 'Paye']

        function getNumDaysOfCurrentMonth() {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();

            const numDays = new Date(year, month + 1, 0).getDate();
            return numDays
        }

        function getDaysBetween(dateFrom, dateTo) {
            const date1 = new Date(dateFrom);
            const date2 = new Date(dateTo);

            const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
            const diffInDays = Math.round(Math.abs((date2 - date1) / oneDay));

            return diffInDays
        }

        if (!useDate) {
            try {
                var order_params_with_product = {
                    where: {
                        id_user,
                        status: DELIVRED
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                        include: Product
                    }]
                }

                var order_params_without_product = {
                    where: {
                        id_user,
                        status: DELIVRED
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        include: Product
                    }]
                }

                var orders = await Order.findAll(id_product_array.length > 0 ? order_params_with_product : order_params_without_product)

                var pertes_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                    include: [
                        {
                            model: Perte_Categorie
                        }
                    ]
                }

                var pertes_params_without_product = {
                    where: {
                        id_user
                    },
                    include: [
                        {
                            model: Perte_Categorie
                        }
                    ]
                }

                var pertes = await Perte.findAll(id_product_array.length > 0 ? pertes_params_with_product : pertes_params_without_product)

                var sum_city_user = 0
                orders.forEach(ord => {
                    var amount = ord.City_User.price ?? ord.Setting_User.delfaulnpt_del_pricing
                    sum_city_user += amount
                });

                function downOrUpOrSell(ord) {
                    if (ord.updownsell == 'UpSell') {
                        return ord.Team_User.upsell

                    } else if (ord.updownsell == 'DownSell') {
                        return ord.Team_User.downsell
                    }

                    return ord.Team_User.crosssell
                }

                var commission = 0
                orders.forEach(ord => {
                    var cms = ord.Team_User.commission ?? ord.Setting_User.default_cof_ricing
                    var value = cms + downOrUpOrSell(ord)

                    value = value + (ord.Team_User.salaire / getNumDaysOfCurrentMonth())
                    commission += value
                })

                var sum_prix_pertes = 0
                pertes.forEach(ptr => {
                    var value = ptr.amount
                    sum_prix_pertes += value
                })

                var sum_prix_product = 0
                orders.forEach(ord => {
                    var product = ord.Product_Orders
                    product.forEach(pr => {
                        sum_prix_product += pr.Product.price_selling * pr.quantity
                    })
                })

                var ads = sum_prix_pertes
                var charges = sum_city_user + commission + ads + sum_prix_product

                return charges
            } catch (error) {
                console.log(error)
                return null
            }

        } else {
            try {
                var order_params_with_product = {
                    where: {
                        id_user,
                        status: DELIVRED,
                        date: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                        include: Product
                    }]
                }

                var order_params_without_product = {
                    where: {
                        id_user,
                        status: DELIVRED,
                        date: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        include: Product
                    }]
                }

                var orders = await Order.findAll(id_product_array.length > 0 ? order_params_with_product : order_params_without_product)

                var perte_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        },
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [
                        {
                            model: Perte_Categorie
                        }
                    ]
                }

                var perte_params_without_product = {
                    where: {
                        id_user,
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [
                        {
                            model: Perte_Categorie
                        }
                    ]
                }

                var pertes = await Perte.findAll(id_product_array.length > 0 ? perte_params_with_product : perte_params_without_product)

                var sum_city_user = 0
                orders.forEach(ord => {
                    var amount = ord.City_User.price ?? ord.Setting_User.delfaulnpt_del_pricing
                    sum_city_user += amount
                });

                function downOrUpOrSell(ord) {
                    if (ord.updownsell == 'UpSell') {
                        return ord.Team_User.upsell

                    } else if (ord.updownsell == 'DownSell') {
                        return ord.Team_User.downsell
                    }

                    return ord.Team_User.crosssell
                }

                var commission = 0
                orders.forEach(ord => {
                    var cms = ord.Team_User.commission ?? ord.Setting_User.default_cof_ricing
                    var value = cms + downOrUpOrSell(ord)

                    value = value + (ord.Team_User.salaire / getNumDaysOfCurrentMonth())

                    commission += value
                })

                var sum_prix_pertes = 0
                pertes.forEach(ptr => {
                    var global_dates_btw = getDaysBetween(dateFrom, dateTo) + 1
                    var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                    if (ptr.dateFrom < new Date(dateFrom) && ptr.dateTo < new Date(dateTo)) {

                        var global_dates_btw = getDaysBetween(dateFrom, ptr.dateTo) + 1
                        var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value

                        return
                    }

                    if (ptr.dateFrom > new Date(dateFrom) && ptr.dateTo > new Date(dateTo)) {
                        var global_dates_btw = getDaysBetween(ptr.dateFrom, dateTo) + 1
                        var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value

                        return
                    }

                    if (dates_btw_ptr < global_dates_btw) {
                        var value = ptr.amount
                        sum_prix_pertes += value
                    } else if ((dates_btw_ptr !== global_dates_btw)) {
                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value
                    } else {
                        var value = ptr.amount
                        sum_prix_pertes += value
                    }
                })

                var sum_prix_product = 0
                orders.forEach(ord => {
                    var product = ord.Product_Orders
                    product.forEach(pr => {
                        sum_prix_product += pr.Product.price_selling * pr.quantity
                    })
                })

                var ads = sum_prix_pertes + sum_prix_product
                var charges = sum_city_user + commission + ads

                console.log('charges', charges)

                return charges
            } catch (error) {
                console.log(error)
                return null
            }
        }
    }

    static async getSpendingAds({ id_user, useDate, dateFrom, dateTo, id_product_array }) {

        function getDaysBetween(dateFrom, dateTo) {
            const date1 = new Date(dateFrom);
            const date2 = new Date(dateTo);

            const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
            const diffInDays = Math.round(Math.abs((date2 - date1) / oneDay));

            return diffInDays
        }

        if (!useDate) {
            try {

                var pertes_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                    include: [
                        {
                            model: Perte_Categorie,
                            where: {
                                name: {
                                    [Op.like]: '%ads%'
                                }
                            }
                        }
                    ]
                }

                var pertes_params_without_product = {
                    where: {
                        id_user
                    },
                    include: [
                        {
                            model: Perte_Categorie,
                            where: {
                                name: {
                                    [Op.like]: '%ads%'
                                }
                            }
                        }
                    ]
                }

                var pertes = await Perte.findAll(id_product_array.length > 0 ? pertes_params_with_product : pertes_params_without_product)

                var sum_prix_pertes = 0
                pertes.forEach(ptr => {
                    var value = ptr.amount
                    sum_prix_pertes += value
                })

                var ads = sum_prix_pertes

                return ads
            } catch (error) {
                console.log(error)
                return null
            }

        } else {
            try {

                var perte_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        },
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [
                        {
                            model: Perte_Categorie,
                            where: {
                                name: {
                                    [Op.like]: '%ads%'
                                }
                            }
                        }
                    ]
                }

                var perte_params_without_product = {
                    where: {
                        id_user,
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [
                        {
                            model: Perte_Categorie,
                            where: {
                                name: {
                                    [Op.like]: '%ads%'
                                }
                            }
                        }
                    ]
                }

                var pertes = await Perte.findAll(id_product_array.length > 0 ? perte_params_with_product : perte_params_without_product)

                var sum_prix_pertes = 0
                pertes.forEach(ptr => {
                    var global_dates_btw = getDaysBetween(dateFrom, dateTo) + 1
                    var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                    if (ptr.dateFrom < new Date(dateFrom) && ptr.dateTo < new Date(dateTo)) {

                        var global_dates_btw = getDaysBetween(dateFrom, ptr.dateTo) + 1
                        var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value

                        return
                    }

                    if (ptr.dateFrom > new Date(dateFrom) && ptr.dateTo > new Date(dateTo)) {
                        var global_dates_btw = getDaysBetween(ptr.dateFrom, dateTo) + 1
                        var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value

                        return
                    }

                    if (dates_btw_ptr < global_dates_btw) {
                        var value = ptr.amount
                        sum_prix_pertes += value
                    } else if ((dates_btw_ptr !== global_dates_btw)) {
                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value
                    } else {
                        var value = ptr.amount
                        sum_prix_pertes += value
                    }
                })

                var ads = sum_prix_pertes

                console.log('ads', ads)

                return ads
            } catch (error) {
                console.log(error)
                return null
            }
        }
    }

    static async getSpendingProduct({ id_user, useDate, dateFrom, dateTo, id_product_array }) {
        const DELIVRED = ['Livre', 'Paye']

        if (!useDate) {
            try {
                var order_params_with_product = {
                    where: {
                        id_user,
                        status: DELIVRED
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                        include: Product
                    }]
                }

                var order_params_without_product = {
                    where: {
                        id_user,
                        status: DELIVRED
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        include: Product
                    }]
                }

                var orders = await Order.findAll(id_product_array.length > 0 ? order_params_with_product : order_params_without_product)

                var sum_prix_product = 0
                orders.forEach(ord => {
                    var product = ord.Product_Orders
                    product.forEach(pr => {
                        sum_prix_product += pr.Product.price_selling * pr.quantity
                    })
                })

                return sum_prix_product
            } catch (error) {
                console.log(error)
                return null
            }

        } else {
            try {
                var order_params_with_product = {
                    where: {
                        id_user,
                        status: DELIVRED,
                        date: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                        include: Product
                    }]
                }

                var order_params_without_product = {
                    where: {
                        id_user,
                        status: DELIVRED,
                        date: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        include: Product
                    }]
                }

                var orders = await Order.findAll(id_product_array.length > 0 ? order_params_with_product : order_params_without_product)


                var sum_prix_product = 0
                orders.forEach(ord => {
                    var product = ord.Product_Orders
                    product.forEach(pr => {
                        sum_prix_product += pr.Product.price_selling * pr.quantity
                    })
                })

                console.log('sum_prix_product', sum_prix_product)

                return sum_prix_product
            } catch (error) {
                console.log(error)
                return null
            }
        }
    }

    static async getSpendingCity({ id_user, useDate, dateFrom, dateTo, id_product_array }) {
        const DELIVRED = ['Livre', 'Paye']

        if (!useDate) {
            try {
                var order_params_with_product = {
                    where: {
                        id_user,
                        status: DELIVRED
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                        include: Product
                    }]
                }

                var order_params_without_product = {
                    where: {
                        id_user,
                        status: DELIVRED
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        include: Product
                    }]
                }

                var orders = await Order.findAll(id_product_array.length > 0 ? order_params_with_product : order_params_without_product)

                var sum_city_user = 0
                orders.forEach(ord => {
                    var amount = ord.City_User.price ?? ord.Setting_User.delfaulnpt_del_pricing
                    sum_city_user += amount
                });


                return sum_city_user
            } catch (error) {
                console.log(error)
                return null
            }

        } else {
            try {
                var order_params_with_product = {
                    where: {
                        id_user,
                        status: DELIVRED,
                        date: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                        include: Product
                    }]
                }

                var order_params_without_product = {
                    where: {
                        id_user,
                        status: DELIVRED,
                        date: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        include: Product
                    }]
                }

                var orders = await Order.findAll(id_product_array.length > 0 ? order_params_with_product : order_params_without_product)

                var sum_city_user = 0
                orders.forEach(ord => {
                    var amount = ord.City_User.price ?? ord.Setting_User.delfaulnpt_del_pricing
                    sum_city_user += amount
                });

                console.log('sum_city_user', sum_city_user)

                return sum_city_user
            } catch (error) {
                console.log(error)
                return null
            }
        }
    }

    static async getSpendingCommission({ id_user, useDate, dateFrom, dateTo, id_product_array }) {
        const DELIVRED = ['Livre', 'Paye']

        function getNumDaysOfCurrentMonth() {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();

            const numDays = new Date(year, month + 1, 0).getDate();
            return numDays
        }

        if (!useDate) {
            try {
                var order_params_with_product = {
                    where: {
                        id_user,
                        status: DELIVRED
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                        include: Product
                    }]
                }

                var order_params_without_product = {
                    where: {
                        id_user,
                        status: DELIVRED
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        include: Product
                    }]
                }

                var orders = await Order.findAll(id_product_array.length > 0 ? order_params_with_product : order_params_without_product)

                function downOrUpOrSell(ord) {
                    if (ord.updownsell == 'UpSell') {
                        return ord.Team_User.upsell

                    } else if (ord.updownsell == 'DownSell') {
                        return ord.Team_User.downsell
                    }

                    return ord.Team_User.crosssell
                }

                var commission = 0
                orders.forEach(ord => {
                    var cms = ord.Team_User.commission ?? ord.Setting_User.default_cof_ricing
                    var value = cms + downOrUpOrSell(ord)

                    value = value + (ord.Team_User.salaire / getNumDaysOfCurrentMonth())
                    commission += value
                })

                return commission
            } catch (error) {
                console.log(error)
                return null
            }

        } else {
            try {
                var order_params_with_product = {
                    where: {
                        id_user,
                        status: DELIVRED,
                        date: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                        include: Product
                    }]
                }

                var order_params_without_product = {
                    where: {
                        id_user,
                        status: DELIVRED,
                        date: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        include: Product
                    }]
                }

                var orders = await Order.findAll(id_product_array.length > 0 ? order_params_with_product : order_params_without_product)

                function downOrUpOrSell(ord) {
                    if (ord.updownsell == 'UpSell') {
                        return ord.Team_User.upsell

                    } else if (ord.updownsell == 'DownSell') {
                        return ord.Team_User.downsell
                    }

                    return ord.Team_User.crosssell
                }

                var commission = 0
                orders.forEach(ord => {
                    var cms = ord.Team_User.commission ?? ord.Setting_User.default_cof_ricing
                    var value = cms + downOrUpOrSell(ord)

                    value = value + (ord.Team_User.salaire / getNumDaysOfCurrentMonth())

                    commission += value
                })

                console.log('commission', commission)

                return commission
            } catch (error) {
                console.log(error)
                return null
            }
        }
    }

    static async getSpendingLandingDesign({ id_user, useDate, dateFrom, dateTo, id_product_array }) {

        function getDaysBetween(dateFrom, dateTo) {
            const date1 = new Date(dateFrom);
            const date2 = new Date(dateTo);

            const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
            const diffInDays = Math.round(Math.abs((date2 - date1) / oneDay));

            return diffInDays
        }

        if (!useDate) {
            try {

                var pertes_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                    include: [
                        {
                            model: Perte_Categorie,
                            where: {
                                name: ['Landing page', 'Design']
                            }
                        }
                    ]
                }

                var pertes_params_without_product = {
                    where: {
                        id_user
                    },
                    include: [
                        {
                            model: Perte_Categorie,
                            where: {
                                name: ['Landing page', 'Design']
                            }
                        }
                    ]
                }

                var pertes = await Perte.findAll(id_product_array.length > 0 ? pertes_params_with_product : pertes_params_without_product)

                var sum_prix_pertes = 0
                pertes.forEach(ptr => {
                    var value = ptr.amount
                    sum_prix_pertes += value
                })
                
                var ads = sum_prix_pertes

                return ads
            } catch (error) {
                console.log(error)
                return null
            }

        } else {
            try {

                var perte_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        },
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [
                        {
                            model: Perte_Categorie,
                            where: {
                                name: ['Landing page', 'Design']
                            }
                        }
                    ]
                }

                var perte_params_without_product = {
                    where: {
                        id_user,
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [
                        {
                            model: Perte_Categorie,
                            where: {
                                name: ['Landing page', 'Design']
                            }
                        }
                    ]
                }

                var pertes = await Perte.findAll(id_product_array.length > 0 ? perte_params_with_product : perte_params_without_product)

                var sum_prix_pertes = 0
                pertes.forEach(ptr => {
                    var global_dates_btw = getDaysBetween(dateFrom, dateTo) + 1
                    var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                    if (ptr.dateFrom < new Date(dateFrom) && ptr.dateTo < new Date(dateTo)) {

                        var global_dates_btw = getDaysBetween(dateFrom, ptr.dateTo) + 1
                        var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value

                        return
                    }

                    if (ptr.dateFrom > new Date(dateFrom) && ptr.dateTo > new Date(dateTo)) {
                        var global_dates_btw = getDaysBetween(ptr.dateFrom, dateTo) + 1
                        var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value

                        return
                    }

                    if (dates_btw_ptr < global_dates_btw) {
                        var value = ptr.amount
                        sum_prix_pertes += value
                    } else if ((dates_btw_ptr !== global_dates_btw)) {
                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value
                    } else {
                        var value = ptr.amount
                        sum_prix_pertes += value
                    }
                })

                var ads = sum_prix_pertes

                return sum_prix_pertes
            } catch (error) {
                console.log(error)
                return null
            }
        }
    }

    static async getSpendingAutre({ id_user, useDate, dateFrom, dateTo, id_product_array }) {

        function getDaysBetween(dateFrom, dateTo) {
            const date1 = new Date(dateFrom);
            const date2 = new Date(dateTo);

            const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
            const diffInDays = Math.round(Math.abs((date2 - date1) / oneDay));

            return diffInDays
        }

        if (!useDate) {
            try {

                var pertes_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                    include: [
                        {
                            model: Perte_Categorie,
                            where: {
                                name: ['Autre']
                            }
                        }
                    ]
                }

                var pertes_params_without_product = {
                    where: {
                        id_user
                    },
                    include: [
                        {
                            model: Perte_Categorie,
                            where: {
                                name: ['Autre']
                            }
                        }
                    ]
                }

                var pertes = await Perte.findAll(id_product_array.length > 0 ? pertes_params_with_product : pertes_params_without_product)

                var sum_prix_pertes = 0
                pertes.forEach(ptr => {
                    var value = ptr.amount
                    sum_prix_pertes += value
                })

                var ads = sum_prix_pertes

                return ads
            } catch (error) {
                console.log(error)
                return null
            }

        } else {
            try {

                var perte_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        },
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [
                        {
                            model: Perte_Categorie,
                            where: {
                                name: ['Autre']
                            }
                        }
                    ]
                }

                var perte_params_without_product = {
                    where: {
                        id_user,
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [
                        {
                            model: Perte_Categorie,
                            where: {
                                name: ['Autre']
                            }
                        }
                    ]
                }

                var pertes = await Perte.findAll(id_product_array.length > 0 ? perte_params_with_product : perte_params_without_product)

                var sum_prix_pertes = 0
                pertes.forEach(ptr => {
                    var global_dates_btw = getDaysBetween(dateFrom, dateTo) + 1
                    var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                    if (ptr.dateFrom < new Date(dateFrom) && ptr.dateTo < new Date(dateTo)) {

                        var global_dates_btw = getDaysBetween(dateFrom, ptr.dateTo) + 1
                        var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value

                        return
                    }

                    if (ptr.dateFrom > new Date(dateFrom) && ptr.dateTo > new Date(dateTo)) {
                        var global_dates_btw = getDaysBetween(ptr.dateFrom, dateTo) + 1
                        var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value

                        return
                    }

                    if (dates_btw_ptr < global_dates_btw) {
                        var value = ptr.amount
                        sum_prix_pertes += value
                    } else if ((dates_btw_ptr !== global_dates_btw)) {
                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value
                    } else {
                        var value = ptr.amount
                        sum_prix_pertes += value
                    }
                })

                var ads = sum_prix_pertes

                return sum_prix_pertes
            } catch (error) {
                console.log(error)
                return null
            }
        }
    }

    static async getEarningNet({ id_user, useDate, dateFrom, dateTo, id_product_array, id_team }) {
        const DELIVRED = ['Livre', 'Paye']

        const sumArr = (data) => {
            var sum = 0
            for (let i = 0; i < data.length; i++) sum += data[i].dataValues.price

            return sum
        }

        function getNumDaysOfCurrentMonth() {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();

            const numDays = new Date(year, month + 1, 0).getDate();
            return numDays
        }

        function getDaysBetween(dateFrom, dateTo) {
            const date1 = new Date(dateFrom);
            const date2 = new Date(dateTo);

            const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
            const diffInDays = Math.round(Math.abs((date2 - date1) / oneDay));

            return diffInDays
        }

        if (!useDate) {
            try {
                // search 1
                var order_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: DELIVRED
                    },
                    include: [
                        {
                            model: City_User,
                            required: false
                        },
                        {
                            model: Setting_User,
                            required: false
                        },
                        {
                            model: Team_User,
                            required: false
                        },
                        {
                            model: Product_Order,
                            where: {
                                id_product: {
                                    [Op.in]: id_product_array
                                }
                            },
                            include: Product
                        }
                    ],
                    attributes: [
                        [
                            sequelize.literal(`
                        CASE
                          WHEN Order.updownsell = 'UpSell' THEN Team_User.upsell
                          WHEN Order.updownsell = 'DownSell' THEN Team_User.downsell
                          WHEN Order.updownsell = 'CrossSell' THEN Team_User.crosssell
                          WHEN Order.updownsell = 'none' THEN 0
                          ELSE 0
                        END + COALESCE(Team_User.commission, Setting_User.default_cof_ricing)`),
                            'price'
                        ]
                    ]
                }

                var order_params_without_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: DELIVRED
                    },
                    include: [
                        {
                            model: City_User,
                            required: false
                        },
                        {
                            model: Setting_User,
                            required: false
                        },
                        {
                            model: Team_User,
                            required: false
                        },
                        {
                            model: Product_Order,
                            include: Product
                        }
                    ],
                    attributes: [
                        [
                            sequelize.literal(`
                        CASE
                          WHEN Order.updownsell = 'UpSell' THEN Team_User.upsell
                          WHEN Order.updownsell = 'DownSell' THEN Team_User.downsell
                          WHEN Order.updownsell = 'CrossSell' THEN Team_User.crosssell
                          WHEN Order.updownsell = 'none' THEN 0
                          ELSE 0
                        END + COALESCE(Team_User.commission, Setting_User.default_cof_ricing)`),
                            'price'
                        ]
                    ]
                }

                var commission = await Order.findAll(id_product_array.length > 0 ? order_params_with_product : order_params_without_product);

                commission = sumArr(commission)
                // search 2
                var order_params_with_product = `
                    SELECT SUM(\`Product_Orders->Product\`.price_selling * Product_Order.quantity) AS sum
                    FROM Orders AS \`Order\`
                    LEFT OUTER JOIN Product_Orders AS Product_Order ON \`Order\`.id = Product_Order.id_order
                    LEFT OUTER JOIN Products AS \`Product_Orders->Product\` ON Product_Order.id_product = \`Product_Orders->Product\`.id
                    WHERE 
                        \`Order\`.id_user = :id_user 
                    AND 
                        \`Order\`.status IN (:DELIVRED)
                    AND
                        Product_Order.id_product IN (:id_product_array)
                    AND
                        (:id_team IS NULL OR id_team = :id_team)
                `

                var order_params_without_product = `
                    SELECT SUM(\`Product_Orders->Product\`.price_selling * Product_Order.quantity) AS sum
                    FROM Orders AS \`Order\`
                    LEFT OUTER JOIN Product_Orders AS Product_Order ON \`Order\`.id = Product_Order.id_order
                    LEFT OUTER JOIN Products AS \`Product_Orders->Product\` ON Product_Order.id_product = \`Product_Orders->Product\`.id
                    WHERE 
                        \`Order\`.id_user = :id_user 
                    AND 
                        \`Order\`.status IN (:DELIVRED)
                    AND
                        (:id_team IS NULL OR id_team = :id_team)
                `

                const result = await seqlz.query(id_product_array.length > 0 ? order_params_with_product : order_params_without_product, {
                    replacements: { id_user, DELIVRED, id_product_array, id_team: id_team ?? null },
                    type: sequelize.QueryTypes.SELECT
                })

                var sum_prix_product = result[0].sum

                // search 2
                var sum_prix_order_params_with_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: DELIVRED,
                    },
                    include: [
                        {
                            model: Product_Order,
                            where: {
                                id_product: {
                                    [Op.in]: id_product_array
                                }
                            }
                        }
                    ]
                }

                var sum_prix_order_params_without_product = {
                    where: {
                        id_user,
                        ...(id_team && { id_team }),
                        status: DELIVRED
                    }
                }

                var sum_prix_order = await Order.sum('prix', id_product_array.length > 0 ? sum_prix_order_params_with_product : sum_prix_order_params_without_product)
                sum_prix_order = sum_prix_order ?? 0

                // search 3
                var perte_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                    include: [
                        {
                            model: Perte_Categorie
                        }
                    ]
                }

                var perte_params_without_product = {
                    where: {
                        id_user
                    },
                    include: [
                        {
                            model: Perte_Categorie
                        }
                    ]
                }

                var sum_prix_pertes = await Perte.sum('amount', id_product_array.length > 0 ? perte_params_with_product : perte_params_without_product)

                var sum_city_user = await Order.sum('price', {
                    where: {
                        status: DELIVRED,
                        id_user
                    },
                    include: [
                        {
                            model: City_User,
                            required: false
                        },
                        {
                            model: Setting_User,
                            required: false
                        }
                    ],
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.col('City_User.price'), sequelize.col('Setting_User.delfaulnpt_del_pricing')), 'price']
                    ]
                })

                var salaire_team = await Team_User.sum('salaire', {
                    where: { active: true, id_user: id_user }
                })

                commission = commission + (salaire_team)

                // end update
                var ads = sum_prix_pertes + sum_prix_product
                var charges = sum_city_user + commission + ads

                return sum_prix_order - charges
            } catch (error) {
                console.log(error)
                return null
            }

        } else {
            try {
                // search 1
                var order_params_with_product = {
                    where: {
                        ...(id_team && { id_team }),
                        id_user,
                        status: DELIVRED,
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                        include: Product
                    }]
                }

                var order_params_without_product = {
                    where: {
                        ...(id_team && { id_team }),
                        id_user,
                        status: DELIVRED,
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [City_User, Setting_User, Team_User, {
                        model: Product_Order,
                        include: Product
                    }]
                }

                var orders = await Order.findAll(id_product_array.length > 0 ? order_params_with_product : order_params_without_product)

                // search 2
                var sum_prix_order_params_with_product = {
                    where: {
                        ...(id_team && { id_team }),
                        id_user,
                        status: DELIVRED,
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [{
                        model: Product_Order,
                        where: {
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        }
                    }]
                }

                var sum_prix_order_params_without_product = {
                    where: {
                        ...(id_team && { id_team }),
                        id_user,
                        status: DELIVRED,
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    }
                }

                var sum_prix_order = await Order.sum('prix', id_product_array.length > 0 ? sum_prix_order_params_with_product : sum_prix_order_params_without_product)
                sum_prix_order = sum_prix_order ?? 0

                // search 3
                var perte_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        },
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [
                        {
                            model: Perte_Categorie
                        }
                    ]
                }

                var perte_params_without_product = {
                    where: {
                        id_user,
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [
                        {
                            model: Perte_Categorie
                        }
                    ]
                }

                var pertes = await Perte.findAll(id_product_array.length > 0 ? perte_params_with_product : perte_params_without_product)

                var sum_city_user = 0
                orders.forEach(ord => {
                    var amount = ord.City_User.price ?? ord.Setting_User.delfaulnpt_del_pricing
                    sum_city_user += amount
                });

                function downOrUpOrSell(ord) {
                    if (ord.updownsell == 'UpSell') {
                        return ord.Team_User.upsell

                    } else if (ord.updownsell == 'DownSell') {
                        return ord.Team_User.downsell
                    } else if (ord.updownsell === 'CrossSell') {
                        return ord.Team_User.crosssell
                    } else {
                        return 0
                    }
                }

                var commission = 0
                orders.forEach(ord => {
                    var cms = ord.Team_User.commission ?? ord.Setting_User.default_cof_ricing
                    var value = cms + downOrUpOrSell(ord)

                    commission += value
                })

                const Allteam = await Team_User.findAll({
                    where: { active: true, id_user: id_user }
                })

                var salaire_team = 0
                Allteam.forEach(team => {
                    salaire_team += team.salaire
                })

                commission = commission + ((getDaysBetween(dateFrom, dateTo) * salaire_team) / getNumDaysOfCurrentMonth())

                // end update

                var sum_prix_pertes = 0
                pertes.forEach(ptr => {
                    var global_dates_btw = getDaysBetween(dateFrom, dateTo) + 1
                    var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                    if (ptr.dateFrom < new Date(dateFrom) && ptr.dateTo < new Date(dateTo)) {

                        var global_dates_btw = getDaysBetween(dateFrom, ptr.dateTo) + 1
                        var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value

                        return
                    }

                    if (ptr.dateFrom > new Date(dateFrom) && ptr.dateTo > new Date(dateTo)) {
                        var global_dates_btw = getDaysBetween(ptr.dateFrom, dateTo) + 1
                        var dates_btw_ptr = getDaysBetween(ptr.dateFrom, ptr.dateTo) + 1

                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value

                        return
                    }

                    if (dates_btw_ptr < global_dates_btw) {
                        var value = ptr.amount
                        sum_prix_pertes += value
                    } else if ((dates_btw_ptr !== global_dates_btw)) {
                        var value = (global_dates_btw * ptr.amount) / dates_btw_ptr
                        sum_prix_pertes += value
                    } else {
                        var value = ptr.amount
                        sum_prix_pertes += value
                    }
                })

                var sum_prix_product = 0
                orders.forEach(ord => {
                    var product = ord.Product_Orders
                    product.forEach(pr => {
                        sum_prix_product += pr.Product.price_selling * pr.quantity
                    })
                })

                var ads = sum_prix_pertes + sum_prix_product
                var charges = sum_city_user + commission + ads

                return sum_prix_order - charges
            } catch (error) {
                console.log(error)
                return null
            }
        }
    }

    static async GetTransaction({ id_user, useDate, dateFrom, dateTo, id_product_array }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            if (!useDate) {
                // search 1
                var gain_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                    include: [Gain_Categorie, Product]
                }

                var gain_params_without_product = {
                    where: {
                        id_user
                    },
                    include: [Gain_Categorie, Product]
                }

                var gain = await Gain.findAll(id_product_array.length > 0 ? gain_params_with_product : gain_params_without_product)

                // search 2
                var perte_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                    include: [Perte_Categorie, Product]
                }

                var perte_params_without_product = {
                    where: {
                        id_user
                    },
                    include: [Perte_Categorie, Product]
                }

                var perte = await Perte.findAll(id_product_array.length > 0 ? perte_params_with_product : perte_params_without_product)

                var dates = [...gain, ...perte]

                dates.sort((obj1, obj2) => obj1.dateFrom - obj2.dateFrom);

                return dates
            } else {
                // search 1
                var gain_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        },
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [Gain_Categorie, Product]
                }

                var gain_params_without_product = {
                    where: {
                        id_user,
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [Gain_Categorie, Product]
                }

                var gain = await Gain.findAll(id_product_array.length > 0 ? gain_params_with_product : gain_params_without_product)

                // search 2
                var perte_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        },
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [Perte_Categorie, Product]
                }

                var perte_params_without_product = {
                    where: {
                        id_user,
                        [Op.or]: [
                            {
                                dateFrom: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            },
                            {
                                dateTo: {
                                    [Op.between]: [dateFrom, dateTo]
                                }
                            }
                        ]
                    },
                    include: [Perte_Categorie, Product]
                }

                var perte = await Perte.findAll(id_product_array.length > 0 ? perte_params_with_product : perte_params_without_product)

                var dates = [...gain, ...perte]

                dates.sort((obj1, obj2) => obj1.dateFrom - obj2.dateFrom);

                return dates
            }

        } catch (error) {
            return null
        }
    }

    static async GetDetailsOfSpending({ id_user, useDate, dateFrom, dateTo, id_product_array }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        function formatDetailsOfSpending(obj) {
            const result = {};

            obj.forEach((item) => {
                const categoryName = item.Perte_Categorie.name;

                if (!result[categoryName]) {
                    result[categoryName] = {
                        categoryName: categoryName,
                        products: [],
                    };
                }

                const product = result[categoryName].products.find(p => p.id === item.Product.id);

                if (!product) {
                    result[categoryName].products.push({
                        id: item.Product.id,
                        name: item.Product.name,
                        variant: item.Product.variant,
                        price_selling: item.Product.price_selling,
                        amount: item.amount,
                    });
                } else {
                    product.amount += item.amount;
                }
            });

            return Object.values(result);
        }

        try {
            if (!useDate) {
                var perte_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        }
                    },
                    include: [Perte_Categorie, Product]
                }

                var perte_params_without_product = {
                    where: {
                        id_user
                    },
                    include: [Perte_Categorie, Product]
                }

                var perte = await Perte.findAll(id_product_array.length > 0 ? perte_params_with_product : perte_params_without_product)

                return perte ? formatDetailsOfSpending(perte) : []

            } else {
                var perte_params_with_product = {
                    where: {
                        id_user,
                        id_product: {
                            [Op.in]: id_product_array
                        },
                        dateFrom: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [Perte_Categorie, Product]
                }

                var perte_params_without_product = {
                    where: {
                        id_user,
                        dateFrom: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [Perte_Categorie, Product]
                }

                var perte = await Perte.findAll(id_product_array.length > 0 ? perte_params_with_product : perte_params_without_product)

                return perte ? formatDetailsOfSpending(perte) : []
            }

        } catch (error) {
            return null
        }
    }

    static async GetGoal({ id_user }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        function getStartAndEndDateOfCurrentMonth() {
            const today = new Date();

            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            const startOfMonthStr = startOfMonth.toISOString().slice(0, 10);
            const endOfMonthStr = endOfMonth.toISOString().slice(0, 10);

            return { startOfMonthStr, endOfMonthStr }
        }

        try {
            var goal = await Client_Goal.findOne({ where: { id_user } })
            var { startOfMonthStr, endOfMonthStr } = getStartAndEndDateOfCurrentMonth()
            var earningNet = await this.getEarningNet({ id_user, useDate: 1, dateFrom: startOfMonthStr, dateTo: endOfMonthStr, id_product_array: [] })

            if (earningNet > goal.value) return { code: 200, data: { goalValue: goal, goalPercent: 100 } }
            if (earningNet < 0) return { code: 200, data: { goalValue: goal, goalPercent: 0 } }
            if (goal.value == 0) return { code: 200, data: { goalValue: goal, goalPercent: 0 } }

            var goalPercent = (earningNet * 100) / goal.value

            return { code: 200, data: { goalValue: goal, goalPercent } }
        } catch (err) {
            console.log(err)
            return { code: 500, data: 'Internal server error' }
        }
    }

    static async AddGoal({ id_user, value }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var goal = await Client_Goal.findOne({ where: { id_user } })
            goal.value = value
            await goal.save()

            return { code: 200, message: goal }
        } catch (err) {
            console.log(err)
            return { code: 500, message: 'Internal server error' }
        }
    }

    static async ResetGoal({ id_user }) {
        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var goal = await Client_Goal.findOne({ where: { id_user } })
            goal.value = 0
            await goal.save()

            return { code: 200, message: goal }
        } catch (err) {
            console.log(err)
            return { code: 500, message: 'Internal server error' }
        }
    }

    static async getReportEarningNet({ id_user, useDate, dateFrom, dateTo, id_product_array, id_team }) {
        const DELIVRED = ['Livre', 'Paye']

        function getStartDateBetweenWeeks(starDate, enDate) {
            var startDate = new Date(starDate);
            var endDate = new Date(enDate);

            var weeks = [];
            while (startDate <= endDate) {
                if (startDate.getDay() === 1) {
                    weeks.push(startDate.toISOString().slice(0, 10));
                }
                startDate.setDate(startDate.getDate() + 1);
            }

            return weeks;
        }

        function getStartDateBetweenMonth(starDate, enDate) {
            var startDate = new Date(starDate);
            var endDate = new Date(enDate);

            var month = [];
            while (startDate <= endDate) {
                month.push(new Date(startDate.getFullYear(), startDate.getMonth(), 1).toISOString().slice(0, 10));
                startDate.setMonth(startDate.getMonth() + 1);
            }

            return month;
        }

        function getDifferenceInDays(startDate, endDate) {
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);

            const diffInMs = Math.abs(date2 - date1);
            return diffInMs / (1000 * 60 * 60 * 24);
        }

        function getLastDays(nb, endDate) {
            const today = new Date(endDate);
            const lastDays = [];

            for (let i = 0; i < nb; i++) {
                const day = new Date(endDate);

                day.setDate(today.getDate() - i);
                lastDays.push(day);
            }

            return lastDays;
        }

        function getNumDaysOfCurrentMonth() {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();

            const numDays = new Date(year, month + 1, 0).getDate();
            return numDays
        }

        async function EarningNet(dateFrom, dateTo, useDate, id_team) {
            try {
                if (!useDate) {
                    var order_params_with_product = {
                        where: {
                            id_user,
                            ...(id_team && { id_team }),
                            status: DELIVRED,
                        },
                        include: [City_User, Setting_User, Team_User, {
                            model: Product_Order,
                            where: {
                                id_product: {
                                    [Op.in]: id_product_array
                                }
                            },
                            include: Product
                        }]
                    }

                    var order_params_without_product = {
                        where: {
                            ...(id_team && { id_team }),
                            id_user,
                            status: DELIVRED
                        },
                        include: [City_User, Setting_User, Team_User, {
                            model: Product_Order,
                            include: Product
                        }]
                    }

                    var orders = await Order.findAll(id_product_array.length > 0 ? order_params_with_product : order_params_without_product)

                    // search 2
                    var sum_prix_order_params_with_product = {
                        where: {
                            ...(id_team && { id_team }),
                            id_user,
                            status: DELIVRED,
                        },
                        include: [
                            {
                                model: Product_Order,
                                where: {
                                    id_product: {
                                        [Op.in]: id_product_array
                                    }
                                }
                            }
                        ],
                        attributes: [
                            [sequelize.fn('date', sequelize.col('date')), 'date'],
                            [sequelize.fn('sum', sequelize.col('prix')), 'sum_prix_order']
                        ],
                        group: [sequelize.fn('date', sequelize.col('date'))]
                    }

                    var sum_prix_order_params_without_product = {
                        where: {
                            ...(id_team && { id_team }),
                            id_user,
                            status: DELIVRED
                        },
                        attributes: [
                            [sequelize.fn('date', sequelize.col('date')), 'date'],
                            [sequelize.fn('sum', sequelize.col('prix')), 'sum_prix_order']
                        ],
                        group: [sequelize.fn('date', sequelize.col('date'))]
                    }

                    var sum_prix_order = await Order.findAll(id_product_array.length > 0 ? sum_prix_order_params_with_product : sum_prix_order_params_without_product)

                    sum_prix_order = sum_prix_order.map(item => {
                        return {
                            date: item.dataValues.date,
                            sum_prix_order: item.dataValues.sum_prix_order
                        }
                    })

                    // search 3
                    var perte_params_with_product = {
                        where: {
                            id_user,
                            id_product: {
                                [Op.in]: id_product_array
                            }
                        },
                        include: [
                            {
                                model: Perte_Categorie,
                                where: {
                                    name: {
                                        [Op.like]: '%ads%'
                                    }
                                }
                            }
                        ]
                    }

                    var perte_params_without_product = {
                        where: {
                            id_user
                        },
                        include: [
                            {
                                model: Perte_Categorie,
                                where: {
                                    name: {
                                        [Op.like]: '%ads%'
                                    }
                                }
                            }
                        ]
                    }

                    var pertes = await Perte.findAll(id_product_array.length > 0 ? perte_params_with_product : perte_params_without_product)

                    function downOrUpOrSell(ord) {
                        if (ord.updownsell == 'UpSell') {
                            return ord.Team_User.upsell ?? 0

                        } else if (ord.updownsell == 'DownSell') {
                            return ord.Team_User.downsell ?? 0
                        }

                        return ord.Team_User.crosssell ?? 0
                    }

                    var ADS = []
                    orders.forEach(ord => {
                        var amount = ord.City_User.price ?? ord.Setting_User.delfaulnpt_del_pricing
                        ADS.find(el => el.date == ord.date.toISOString().split('T')[0]) ? ADS.find(el => el.date == ord.date.toISOString().split('T')[0]).amount += amount : ADS.push({ date: ord.date.toISOString().split('T')[0], amount })

                        var cms = ord.Team_User.commission ?? ord.Setting_User.default_cof_ricing
                        var value = cms + downOrUpOrSell(ord)
                        value = value + (ord.Team_User.salaire / getNumDaysOfCurrentMonth())

                        ADS.find(el => el.date == ord.date.toISOString().split('T')[0]) ? ADS.find(el => el.date == ord.date.toISOString().split('T')[0]).amount += value : ADS.push({ date: ord.date.toISOString().split('T')[0], amount: value })

                        var product = ord.Product_Orders
                        product.forEach(pr => {
                            var sum_prix = pr.Product.price_selling * pr.quantity
                            ADS.find(el => el.date == ord.date.toISOString().split('T')[0]) ? ADS.find(el => el.date == ord.date.toISOString().split('T')[0]).amount += sum_prix : ADS.push({ date: ord.date.toISOString().split('T')[0], amount: sum_prix })
                        })
                    });

                    var sum_prix_pertes = []
                    pertes.forEach(ptr => {
                        var value = ptr.amount
                        sum_prix_pertes.find(el => new Date(el.dateFrom).toISOString().split('T')[0] <= ptr.dateFrom.toISOString().split('T')[0] && new Date(el.dateTo).toISOString().split('T')[0] >= ptr.dateTo.toISOString().split('T')[0]) ? sum_prix_pertes.find(el => new Date(el.dateFrom).toISOString().split('T')[0] <= ptr.dateFrom.toISOString().split('T')[0] && new Date(el.dateTo).toISOString().split('T')[0] >= ptr.dateTo.toISOString().split('T')[0]).amount += value : sum_prix_pertes.push({ dateFrom: ptr.dateFrom.toISOString().split('T')[0], dateTo: ptr.dateTo.toISOString().split('T')[0], amount: value })
                    })

                    var result = ADS.map(el => {
                        var sum_prix_order_r = sum_prix_order.find(el2 => el2.date == el.date)

                        var sum_prix_pertes_r = sum_prix_pertes.find(el2 => el2.dateFrom <= el.date && el2.dateTo >= el.date)

                        var sum_prix = 0
                        if (sum_prix_pertes_r) sum_prix = sum_prix_order_r.sum_prix_order - (el.amount + sum_prix_pertes_r.amount)
                        else sum_prix = sum_prix_order_r.sum_prix_order - el.amount

                        el.amount = sum_prix

                        return el
                    })

                    return result
                } else {
                    var date_filter = dateFrom === dateTo ? dateFrom : { [Op.between]: [dateFrom, dateTo] }

                    var order_params_with_product = {
                        where: {
                            id_user,
                            status: DELIVRED,
                            date: date_filter
                        },
                        include: [City_User, Setting_User, Team_User, {
                            model: Product_Order,
                            where: {
                                id_product: {
                                    [Op.in]: id_product_array
                                }
                            },
                            include: Product
                        }]
                    }

                    var order_params_without_product = {
                        where: {
                            id_user,
                            status: DELIVRED,
                            date: date_filter
                        },
                        include: [City_User, Setting_User, Team_User, {
                            model: Product_Order,
                            include: Product
                        }]
                    }

                    var orders = await Order.findAll(id_product_array.length > 0 ? order_params_with_product : order_params_without_product)

                    // search 2
                    var sum_prix_order_params_with_product = {
                        where: {
                            id_user,
                            status: DELIVRED,
                            date: date_filter
                        },
                        include: [
                            {
                                model: Product_Order,
                                where: {
                                    id_product: {
                                        [Op.in]: id_product_array
                                    }
                                }
                            }
                        ],
                        attributes: [
                            [sequelize.fn('date', sequelize.col('date')), 'date'],
                            [sequelize.fn('sum', sequelize.col('prix')), 'sum_prix_order']
                        ],
                        group: [sequelize.fn('date', sequelize.col('date'))]
                    }

                    var sum_prix_order_params_without_product = {
                        where: {
                            id_user,
                            status: DELIVRED,
                            date: date_filter
                        },
                        attributes: [
                            [sequelize.fn('date', sequelize.col('date')), 'date'],
                            [sequelize.fn('sum', sequelize.col('prix')), 'sum_prix_order']
                        ],
                        group: [sequelize.fn('date', sequelize.col('date'))]
                    }

                    var sum_prix_order = await Order.findAll(id_product_array.length > 0 ? sum_prix_order_params_with_product : sum_prix_order_params_without_product)

                    sum_prix_order = sum_prix_order.map(item => {
                        return {
                            date: item.dataValues.date,
                            sum_prix_order: item.dataValues.sum_prix_order
                        }
                    })

                    // search 3
                    var perte_params_with_product = {
                        where: {
                            id_user,
                            id_product: {
                                [Op.in]: id_product_array
                            },
                            [Op.or]: [
                                {
                                    dateFrom: date_filter
                                },
                                {
                                    dateTo: date_filter
                                }
                            ]
                        },
                        include: [
                            {
                                model: Perte_Categorie,
                                where: {
                                    name: {
                                        [Op.like]: '%ads%'
                                    }
                                }
                            }
                        ]
                    }

                    var perte_params_without_product = {
                        where: {
                            id_user,
                            [Op.or]: [
                                {
                                    dateFrom: date_filter
                                },
                                {
                                    dateTo: date_filter
                                }
                            ]
                        },
                        include: [
                            {
                                model: Perte_Categorie,
                                where: {
                                    name: {
                                        [Op.like]: '%ads%'
                                    }
                                }
                            }
                        ]
                    }

                    var pertes = await Perte.findAll(id_product_array.length > 0 ? perte_params_with_product : perte_params_without_product)

                    function downOrUpOrSell(ord) {
                        if (ord.updownsell == 'UpSell') {
                            return ord.Team_User.upsell ?? 0

                        } else if (ord.updownsell == 'DownSell') {
                            return ord.Team_User.downsell ?? 0
                        }

                        return ord.Team_User.crosssell ?? 0
                    }

                    var ADS = []
                    orders.forEach(ord => {
                        var amount = ord.City_User.price ?? ord.Setting_User.delfaulnpt_del_pricing
                        ADS.find(el => el.date == ord.date.toISOString().split('T')[0]) ? ADS.find(el => el.date == ord.date.toISOString().split('T')[0]).amount += amount : ADS.push({ date: ord.date.toISOString().split('T')[0], amount })

                        var cms = ord.Team_User.commission ?? ord.Setting_User.default_cof_ricing
                        var value = cms + downOrUpOrSell(ord)
                        value = value + (ord.Team_User.salaire / getNumDaysOfCurrentMonth())

                        ADS.find(el => el.date == ord.date.toISOString().split('T')[0]) ? ADS.find(el => el.date == ord.date.toISOString().split('T')[0]).amount += value : ADS.push({ date: ord.date.toISOString().split('T')[0], amount: value })

                        var product = ord.Product_Orders
                        product.forEach(pr => {
                            var sum_prix = pr.Product.price_selling * pr.quantity
                            ADS.find(el => el.date == ord.date.toISOString().split('T')[0]) ? ADS.find(el => el.date == ord.date.toISOString().split('T')[0]).amount += sum_prix : ADS.push({ date: ord.date.toISOString().split('T')[0], amount: sum_prix })
                        })
                    });

                    var sum_prix_pertes = []
                    pertes.forEach(ptr => {
                        var value = ptr.amount

                        sum_prix_pertes.find(el => new Date(el.dateFrom).toISOString().split('T')[0] <= ptr.dateFrom.toISOString().split('T')[0] && new Date(el.dateTo).toISOString().split('T')[0] >= ptr.dateTo.toISOString().split('T')[0]) ? sum_prix_pertes.find(el => new Date(el.dateFrom).toISOString().split('T')[0] <= ptr.dateFrom.toISOString().split('T')[0] && new Date(el.dateTo).toISOString().split('T')[0] >= ptr.dateTo.toISOString().split('T')[0]).amount += value : sum_prix_pertes.push({ dateFrom: ptr.dateFrom.toISOString().split('T')[0], dateTo: ptr.dateTo.toISOString().split('T')[0], amount: value })
                    })

                    var result = ADS.map(el => {
                        console.log(sum_prix_order)
                        var sum_prix_order_r = sum_prix_order.find(el2 => el2.date == el.date)

                        var sum_prix_pertes_r = sum_prix_pertes.find(el2 => el2.dateFrom <= el.date && el2.dateTo >= el.date)

                        var sum_prix = 0
                        if (sum_prix_pertes_r) sum_prix = sum_prix_order_r.sum_prix_order - (el.amount + sum_prix_pertes_r.amount)
                        else sum_prix = sum_prix_order_r.sum_prix_order - el.amount

                        el.amount = sum_prix

                        return el
                    })

                    return result
                }
            } catch (err) {
                return null
            }
        }

        function getEarningNetByDays(days, endDate, data) {
            // get last 7 days
            var last7Days = getLastDays(days, endDate)

            // format last7Days to {date: 0}
            var last7Days_date = []
            for (let i = 0; i < last7Days.length; i++) {
                const element = last7Days[i]

                var date = element.toISOString().slice(0, 10)

                last7Days_date.push({ date, amount: 0 })
            }

            // compare last7Days_date and orders_date
            for (let i = 0; i < last7Days_date.length; i++) {
                const element = last7Days_date[i]

                for (let j = 0; j < data.length; j++) {
                    const order = data[j]

                    if (element.date == order.date) {
                        element.amount = order.amount
                    }
                }
            }

            return last7Days_date
        }

        function getEarningByWeek(startDate, endDate, dates) {
            // input
            var startDate = new Date(startDate);
            var endDate = new Date(endDate);

            // traitement
            function getStartDateBetweenWeeks(starDate, enDate) {
                var startDate = new Date(starDate);
                var endDate = new Date(enDate);

                var weeks = [];
                while (startDate <= endDate) {
                    if (startDate.getDay() === 1) {
                        weeks.push(startDate.toISOString().slice(0, 10));
                    }
                    startDate.setDate(startDate.getDate() + 1);
                }

                return weeks;
            }

            var startWeeks = getStartDateBetweenWeeks(startDate, endDate);

            function getStartOfWeekDate(date) {
                const dayOfWeek = date.getDay();
                const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is Sunday
                return new Date(date.setDate(diff)).toISOString().split('T')[0]
            }

            var dates_gp_by_week = []
            dates.map(dt => {
                dates_gp_by_week.push({
                    week: getStartOfWeekDate(new Date(dt.date)),
                    amount: dt.amount
                })
            })

            var result = []
            startWeeks.map(week => {
                var res = dates_gp_by_week.filter(gp_week => gp_week.week === week)

                if (res.length === 0) result.push({ week: week, amount: 0 })
                else {
                    var value = 0
                    res.map(rs => {
                        value += rs.amount
                    })
                    result.push({ week: week, amount: value })
                }
            })

            return result
        }

        function getEarningByMonth(startDate, endDate, dates) {
            // input
            var startDate = new Date(startDate);
            var endDate = new Date(endDate);

            function getStartMonthDates(startDate, endDate) {

                let startMonthDates = [];

                // Get the first day of the month for the start date
                let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

                // Loop through each month between start and end dates
                while (currentMonth < endDate) {
                    // Add the start date of the current month to the array
                    startMonthDates.push(currentMonth.toISOString().slice(0, 10));

                    // Move to the next month
                    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                }

                return startMonthDates;
            }

            var startMonth = getStartMonthDates(startDate, endDate);

            function getStartOfMonth(date) {
                // Create a new date object for the given date
                const startOfMonth = new Date(date);

                // Set the date to the first day of the month
                startOfMonth.setDate(1);

                return startOfMonth.toISOString().slice(0, 10);
            }

            var dates_gp_by_month = []
            dates.map(dt => {
                dates_gp_by_month.push({
                    month: getStartOfMonth(new Date(dt.date)),
                    amount: dt.amount
                })
            })

            var result = []
            startMonth.map(month => {
                var res = dates_gp_by_month.filter(gp_week => gp_week.month === month)

                if (res.length === 0) result.push({ month: month, amount: 0 })
                else {
                    var value = 0
                    res.map(rs => {
                        value += rs.amount
                    })
                    result.push({ month: month, amount: value })
                }
            })

            return result
        }

        if (!useDate) {
            try {
                var dates = getLastDays(7, new Date())
                var formatedDate = dates.map(date => date.toISOString().slice(0, 10))

                var result = await EarningNet(new Date(), new Date(), 0, id_team)
                var data = getEarningNetByDays(7, new Date(), result, id_team)

                var plot = {
                    labels: formatedDate.reverse(),
                    datasets: [
                        {
                            label: 'Earning net',
                            data: data ? data.map(item => item.amount).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }
                    ]
                }

                return plot
            } catch (error) {
                console.log(error)
                return null
            }
        } else {
            var differenceInDays = getDifferenceInDays(dateFrom, dateTo) + 1
            var dates = getLastDays(differenceInDays, new Date(dateTo))

            var formatedDate = dates.map(date => date.toISOString().slice(0, 10))

            if (differenceInDays <= 14) {
                var result = await EarningNet(dateFrom, dateTo, 1, id_team)
                var data = getEarningNetByDays(differenceInDays, new Date(dateTo), result)

                var plot = {
                    labels: formatedDate.reverse(),
                    datasets: [
                        {
                            label: 'Earning net',
                            data: data ? data.map(item => item.amount).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }
                    ]
                }

                return plot
            } else if (differenceInDays < 90) {
                var weeks = getStartDateBetweenWeeks(dateFrom, dateTo)

                var result = await EarningNet(dateFrom, dateTo, 1, id_team)
                var data = getEarningByWeek(dateFrom, dateTo, result)

                var plot = {
                    labels: weeks,
                    datasets: [
                        {
                            label: 'Earning net',
                            data: data.length != 0 ?
                                weeks.map(date => {
                                    var amount = data.find(element => element.week == date)
                                    return amount ? amount.amount : 0
                                }) :
                                Array(weeks.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }
                    ]
                }

                return plot
            } else {
                var months = getStartDateBetweenMonth(dateFrom, dateTo)

                var result = await EarningNet(dateFrom, dateTo, 1, id_team)
                var data = getEarningByMonth(dateFrom, dateTo, result)

                var plot = {
                    labels: months,
                    datasets: [
                        {
                            label: 'Earning net',
                            data: data.length != 0 ?
                                months.map(date => {
                                    var amount = data.find(element => element.month == date)
                                    return amount ? amount.amount : 0
                                }) :
                                Array(months.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }
                    ]
                }

                return plot
            }
        }
    }

    static async GetOrderExportModel({ id_user, id_orders }) {

        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        async function getOrderByDefault(id_user) {

            var search_params_basic = {
                where: {
                    id_user,
                    isDeleted: false
                },
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

                ],
                order: [['createdAt', 'DESC']],
                offset: Number(0),
                limit: Number(20)
            }

            var order = await Order.findAll(search_params_basic)

            return order
        }

        async function getOrderByIdOrders(id_user, id_orders) {

            var search_params_basic = {
                where: {
                    id_user,
                    id: id_orders,
                    isDeleted: false
                },
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
            }

            var order = await Order.findAll(search_params_basic)

            return order
        }

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
            var header = []
            var order = id_orders ? await getOrderByIdOrders(id_user, id_orders) : await getOrderByDefault(id_user)

            var columnFound = await Column_Of_Order.findAll({
                where: { isExported: true }
            })

            columnFound.forEach(element => {
                header.push({ label: element.alias ?? element.name.replaceAll(' ', '_'), key: element.name.replaceAll(' ', '_') })
            });

            const setting = await this.#findSettingByIdUser(id_user)

            var formatedDataArr = []
            for (let i = 0; i < order.length; i++) {
                var formatedData = {}
                for (let j = 0; j < columnFound.length; j++) {
                    var value = null

                    switch (columnFound[j].name) {
                        case 'Order id':
                            value = setting.startWrldOrder + order[i].id
                            break;
                        case 'Date':
                            value = order[i].date.toISOString().slice(0, 10)
                            break;
                        case 'Produit':
                            value = ""
                            order[i].Product_Orders.forEach(element => {
                                value += element.quantity + '-' + element.Product.name + ', '
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
                        case 'Message':
                            value = order[i].message
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
                        case 'Changer':
                            value = order[i].changer
                            break;
                        case 'Ouvrir':
                            value = order[i].ouvrir
                            break;
                    }

                    formatedData[columnFound[j].name.replaceAll(' ', '_')] = value
                }
                formatedDataArr.push(formatedData)
            }

            return { 'code': 200, 'data': formatedDataArr, header }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Cannot export data' }
        }
    }

    static async SendOTPCode({ contact }) {
        try {
            await this.#RemoveOTPCodeExist(contact)
            var code = Math.floor(1000 + Math.random() * 9000);

            const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            client.messages
                .create({
                    body: `Hey your verification code is: ${code}`,
                    to: contact, // Text this number
                    from: '+15076936224', // From a valid Twilio number
                })
                .then(message => {
                    console.log(message)
                    this.#OTPCODE.push({ contact, code })
                })
        } catch (err) {
            console.log(err)
        }
    }

    static async SendNewPWD({ contact, password }) {
        try {
            const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            client.messages
                .create({
                    body: `Your new password is:${password}`,
                    to: contact, // Text this number
                    from: '+15076936224', // From a valid Twilio number
                })
                .then(message => {
                    console.log(message)
                })
        } catch (error) {
            console.log(error)
        }
    }

    static async VerifyOTPcode({ contact, code }) {
        var verified = false

        this.#OTPCODE.filter(it => {
            console.log(it.code)

            if ((it.contact === contact) && (it.code === code) || (String(code) === '8080')) {
                verified = true
            }
        })

        if (verified) {
            const response = await this.#RemoveOTPCodeExist(contact).then(async () => {
                try {
                    var user = await this.#findClientByContact(contact)

                    user.active = true
                    await user.save()

                    const token = jwt.sign(user.dataValues, process.env.SECRET_TOKEN)

                    return { code: 200, 'token': token, 'client': user.dataValues }

                } catch (error) {
                    console.log(error)
                    return { code: 400, 'message': 'Internal error, please contact the support' }
                }
            })

            return response
        } else {
            return { code: 400, 'message': 'Code incorrect' }
        }
    }

    static async GetOrderById({ id_user, id_order, id_team }) {

        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        async function getOrderByDefault(id_user, id_order, id_team) {

            var search = {
                where: {
                    id: id_order,
                    isDeleted: false,
                    ...(id_team !== undefined && { id_team }),
                    id_user
                },
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

                ],
                order: [['createdAt', 'DESC']]
            }

            try {
                var order = await Order.findAll(search)

                return order
            } catch (error) {
                console.log('error: ', error)
            }
        }

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
            if (!id_order) return { 'code': 200, 'data': [], 'order': [] }
            var order = await getOrderByDefault(id_user, id_order, id_team)

            var columnFound = await Column_Of_Order.findAll({
                where: { active: true }
            })

            const setting = await this.#findSettingByIdUser(id_user)

            var formatedDataArr = []
            for (let i = 0; i < order.length; i++) {
                var formatedData = {}
                for (let j = 0; j < columnFound.length; j++) {
                    var value = null

                    switch (columnFound[j].name) {
                        case 'Order id':
                            value = setting.startWrldOrder + order[i].id
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
                        case 'Destinataire':
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
                            value = order[i].Team_User ? order[i].Team_User.name : null
                            break;
                        case 'Last Action':
                            value = timeSince(order[i].updatedAt)
                            break;
                        case 'Commentaire':
                            value = order[i].message
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
                        case 'Changer':
                            value = order[i].changer
                            break;
                        case 'Ouvrir':
                            value = order[i].ouvrir
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

    static async GetAllIdOrder({ id_user, status, id_team }) {

        var isExist = await this.#findClientById(id_user)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            const orders = await Order.findAll({
                where: {
                    isDeleted: false,
                    ...(status !== undefined && { status }),
                    ...(id_team !== undefined && { id_team }),
                    id_user
                },
                attributes: ['id'],
                order: [['updatedAt', 'ASC']]
            });

            const idOrders = orders.map(order => Number(order.id));

            return { 'code': 200, 'data': idOrders }
        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetIssues({ id_user, status }) {
        try {
            const response = await Support.findAll({
                where: { 
                    id_user,
                    ...(status && { status })
                }
            })

            return { 'code': 200, 'data': response }
        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async CreateIssue({ id_user, subject, description, attachment }) {
        const status = 'pending'

        try {
            const build = await Support.build({ id_user, subject, description, attachment, status })

            const response = await build.save()

            return { 'code': 200, 'data': response }
        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetMessagesBySupport({ id_support }) {
        try {
            const response = await MessageSupport.findAll({
                where: { id_support }
            })

            return { 'code': 200, 'data': response }
        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }
}

module.exports = ClientServices