require('dotenv').config();
const { User, Admin, Setting_Admin, Setting_User, Perte_Categorie, Admin_Perte_Categorie,
    Column_Of_User, Pack, Subscription, Column_Of_Order, Client_Account,
    Team_Admin, Team_User, Client_Goal, Status_User, Client_Response } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const sequelize = require('sequelize')
const Op = sequelize.Op
const { col } = require('sequelize');
const { sequelize: seqlz } = require('../models/index')
const ClientServices = require('./ClientServices')
const { v4: uuidv4 } = require('uuid');

class AuthServices {
    static #saltRounds = 10;

    static #GetDateFormat = () => {
        const today = new Date();
        const thisDate = today.toISOString()

        const next = today.setDate(today.getDate() + 31)
        const nextDate = new Date(next).toISOString()

        return [thisDate, nextDate]
    }

    static async #findSubscriptionByIdUser(id_user) {
        var subscriptionFound = await Subscription.findOne({
            where: { id_user },
            include: Pack
        })

        if (subscriptionFound) return subscriptionFound
        return false
    }

    static async #hashPassword(password) {
        var pwd = await bcrypt.hash(password, this.#saltRounds);

        return pwd
    }

    static async #findClientByEmail(email) {
        var clientFound = await User.findOne({
            where: { email }
        })

        if (clientFound) return clientFound
        return false
    }

    static async #findClientByTelephone(telephone) {
        var clientFound = await User.findOne({
            where: { telephone }
        })

        if (clientFound) return clientFound
        return false
    }

    static async #findClientById(id) {
        var clientFound = await User.findOne({
            where: { id }
        })

        if (clientFound) return clientFound
        return false
    }

    static #generatePassword(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&()_';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    static async #SearchAvailableTeam() {
        var team_user = await Team_Admin.findAll({
            where: {
                nb_order: {
                    [Op.lt]: col('max_order')
                },
                active: true
            }
        })

        if (team_user.length == 0) return null

        var random = Math.floor(Math.random() * team_user.length)
        var id_team = team_user[random].id
        team_user[random].nb_order = team_user[random].nb_order + 1

        await team_user[random].save()

        return id_team
    }

    static async #findAdminByEmail(email) {
        var adminFound = await Admin.findOne({
            where: { email }
        })

        if (adminFound) return adminFound
        return false
    }

    static async #findSettingAdminById(id_admin) {
        var adminFound = await Setting_Admin.findOne({
            where: { id_admin },
            order: [['updatedAt', 'DESC']],
            limit: 1
        })

        if (adminFound) return adminFound
        return false
    }

    static async #findTeamAdminByEmail(email) {
        var teamAdminFound = await Team_Admin.findOne({
            where: { email }
        })

        if (teamAdminFound) return teamAdminFound
        return false
    }

    static async #findTeamUserByEmail(email) {
        var teamUserFound = await Team_User.findOne({
            where: { email }
        })

        if (teamUserFound) return teamUserFound
        return false
    }

    static async #comparePassword(password, userPassword) {
        const match = await bcrypt.compare(password, userPassword)

        return match
    }

    static async ClientRegister({ fullname, plainPassword, email, telephone, role, id_admin }) {

        var settingAdmin = await this.#findSettingAdminById(1)
        if (!settingAdmin) return { code: 400, message: 'System will need to be initialized' }

        var password = await this.#hashPassword(plainPassword)
        var reference = uuidv4()

        var active = false

        var isExitstContact = await this.#findClientByTelephone(telephone)
        if (isExitstContact) return { code: 400, message: 'This contact is already used' }

        var isExitstEmail = await this.#findClientByEmail(email)
        if (isExitstEmail) return { code: 400, message: 'This email is already used' }

        var id_admin_setting = settingAdmin.id

        var id_team = await this.#SearchAvailableTeam()

        var client = User.build({ reference, fullname, password, email, isTrial: 1, telephone, role, id_admin, id_admin_setting, active, id_team_member_confirmation: id_team, step: 'question' })

        try {
            var clientSaved = await client.save();

            // add column of order data
            const columnOfOrderData = [
                { 'name': 'Order id', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Date', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Produit', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Destinataire', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Telephone', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Ville', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Prix', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Status', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Commentaire', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Adresse', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Source', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Agent', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Last Action', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Up/Downsell', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Changer', 'active': true, 'id_user': clientSaved.id },
                { 'name': 'Ouvrir', 'active': true, 'id_user': clientSaved.id },
            ]

            await Column_Of_Order.bulkCreate(columnOfOrderData)

            var setting = Setting_User.build({
                default_cof_ricing: settingAdmin.default_conf_pricing, delfaulnpt_del_pricing: settingAdmin.delfault_del_pricing,
                default_time: settingAdmin.default_time, startWrldOrder: fullname.split(' ')[0].toLowerCase(), automated_msg: 'salam youscale', id_user: clientSaved.id
            })

            await setting.save();

            const PerteData = [
                { 'name': 'Facebook ads', 'id_user': clientSaved.id },
                { 'name': 'Tiktok ads', 'id_user': clientSaved.id },
                { 'name': 'Google ads', 'id_user': clientSaved.id },
                { 'name': 'Design', 'id_user': clientSaved.id },
                { 'name': 'Landing page', 'id_user': clientSaved.id },
                { 'name': 'Autre', 'id_user': clientSaved.id }
            ]

            await Perte_Categorie.bulkCreate(PerteData)

            const STATUS = ['Livre', 'Paye', 'Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon', 'Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison', 'Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

            const StatusData = STATUS.map(statusName => ({ 'name': statusName, 'checked': true, 'id_user': clientSaved.id }));

            await Status_User.bulkCreate(StatusData)

            const date = this.#GetDateFormat()
            var subscription = await Subscription.build({ date_subscription: date[0], date_expiration: date[1], id_pack: 1, id_user: clientSaved.id })
            await subscription.save();

            await Client_Account.build({ id_user: clientSaved.id, solde: 0, montant_du: 0 }).save()

            await Client_Goal.build({ id_user: clientSaved.id, value: 0 }).save()

            if (clientSaved.dataValues) {
                await ClientServices.SendOTPCode({ contact: clientSaved.dataValues.telephone })

                const token = jwt.sign(clientSaved.dataValues, process.env.SECRET_TOKEN)
                return { 'code': 200, 'token': token, 'client': clientSaved.dataValues }
            }

            return { code: 400, message: 'Internal error, please contact the support' }
        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async AdminRegister({ fullname, plainPassword, email }) {

        var password = await this.#hashPassword(plainPassword)

        var admin = Admin.build({ fullname, password, email })

        try {
            var adminSaved = await admin.save();

            var setting = Setting_Admin.build({
                default_conf_pricing: 0.1, delfault_del_pricing: 0.1,
                default_time: 0, trial_period: 0, max_solde_du: 10000.99, automated_msg: 'You can edit this text', id_admin: adminSaved.id
            })

            setting.save();

            const PerteData = [
                { 'name': 'Ads', 'id_admin': adminSaved.id },
                { 'name': 'Dev team', 'id_admin': adminSaved.id },
                { 'name': 'Dev website', 'id_admin': adminSaved.id },
                { 'name': 'Salaire team', 'id_admin': adminSaved.id },
                { 'name': 'Commercial', 'id_admin': adminSaved.id },
                { 'name': 'Materiel', 'id_admin': adminSaved.id },
                { 'name': 'Internet', 'id_admin': adminSaved.id },
                { 'name': 'Marketing', 'id_admin': adminSaved.id },
                { 'name': 'Autre', 'id_admin': adminSaved.id },
            ]

            await Admin_Perte_Categorie.bulkCreate(PerteData)

            const columnOfUserData = [
                { 'name': 'Client id', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Name', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Telephone', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Pack', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Message', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Last activity', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Team member support', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Active', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Payment', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Subscription time', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Discount', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Date of creation', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Total earning', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Total months payed', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Time left', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Payement type', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Payement Method', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Payement Method', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Team member confirmartion', 'active': true, 'id_admin': adminSaved.id },
                { 'name': 'Team member commercial', 'active': true, 'id_admin': adminSaved.id },
            ]

            await Column_Of_User.bulkCreate(columnOfUserData)

            const PackData = [
                { 'name': 'Pack 1', price_per_month: 1200, 'item_inclued': [0, 0, 0, 20] },
                { 'name': 'Pack 2', price_per_month: 3000, 'item_inclued': [0, 0, 0, 0] },
                { 'name': 'Pack 4', price_per_month: 5000, 'item_inclued': [0, 0, 0, 0] },
            ]

            await Pack.bulkCreate(PackData)

            if (adminSaved.dataValues) {
                const token = jwt.sign(adminSaved.dataValues, process.env.SECRET_TOKEN)

                return { 'code': 200, 'token': token, 'admin': adminSaved.dataValues }
            }

            return { code: 400, message: 'Internal error, please contact the support' }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async ClientLogin({ email, password }) {
        var client = await this.#findClientByEmail(email)
        if (!client) return { code: 404, message: 'email or password is invalid' }

        var samePassword = await this.#comparePassword(password, client.password)
        if (!samePassword) return { code: 404, message: 'email or password is invalid' }

        try {
            if (!client.dataValues.active) await ClientServices.SendOTPCode({ contact: client.dataValues.telephone })

            const token = jwt.sign(client.dataValues, process.env.SECRET_TOKEN)
            return { code: 200, 'token': token, 'client': client.dataValues }

        } catch (error) {
            return { code: 400, 'message': error }
        }
    }

    static async AdminLogin({ email, password }) {
        var admin = await this.#findAdminByEmail(email)
        if (!admin) return { code: 404, message: 'email or password is invalid' }

        var samePassword = await this.#comparePassword(password, admin.password)
        if (!samePassword) return { code: 404, message: 'email or password is invalid' }

        try {
            const token = jwt.sign(admin.dataValues, process.env.SECRET_TOKEN)

            return { code: 200, 'token': token, 'admin': admin.dataValues }
        } catch (error) {
            return { code: 400, 'token': token, 'message': error }
        }
    }

    static async LoginAsClient({ email }) {
        var client = await this.#findClientByEmail(email)
        if (!client) return { code: 404, message: 'email or password is invalid' }

        try {
            if (!client.dataValues.active) await ClientServices.SendOTPCode({ contact: client.dataValues.telephone })

            const token = jwt.sign(client.dataValues, process.env.SECRET_TOKEN)
            return { code: 200, 'token': token, 'client': client.dataValues }

        } catch (error) {
            return { code: 400, 'message': error }
        }
    }

    static async LoginAsTeam({ email }) {
        var client = await this.#findTeamUserByEmail(email)
        if (!client) return { code: 404, message: 'email or password is invalid' }

        try {
            const token = jwt.sign({ ...client.dataValues, authorisation: 'client-team', id_team: client.dataValues.id, id: client.dataValues.id_user }, process.env.SECRET_TOKEN)
            return { code: 200, 'token': token, 'team': { ...client.dataValues, authorisation: 'client-team', id_team: client.dataValues.id, id: client.dataValues.id_user } }

        } catch (error) {
            return { code: 400, 'message': error }
        }
    }

    static async TeamAdminLogin({ email, password }) {
        var teamAdmin = await this.#findTeamAdminByEmail(email)
        if (!teamAdmin) return { code: 404, message: 'email or password is invalid' }

        var samePassword = await this.#comparePassword(password, teamAdmin.password)
        if (!samePassword) return { code: 404, message: 'email or password is invalid' }

        try {
            const token = jwt.sign({ ...teamAdmin.dataValues, authorisation: 'admin-team', id_team: teamAdmin.dataValues.id, id: teamAdmin.dataValues.id_admin }, process.env.SECRET_TOKEN)

            return { code: 200, 'token': token, 'teamAdmin': { ...teamAdmin.dataValues, authorisation: 'admin-team', id_team: teamAdmin.dataValues.id, id: teamAdmin.dataValues.id_admin } }
        } catch (error) {
            return { code: 400, 'token': token, 'message': error }
        }
    }

    static async TeamUserLogin({ email, password }) {
        var teamUser = await this.#findTeamUserByEmail(email)
        if (!teamUser) return { code: 404, message: 'email or password is invalid' }

        var samePassword = await this.#comparePassword(password, teamUser.password)
        if (!samePassword) return { code: 404, message: 'email or password is invalid' }

        try {
            const token = jwt.sign({ ...teamUser.dataValues, authorisation: 'client-team', id_team: teamUser.dataValues.id, id: teamUser.dataValues.id_user }, process.env.SECRET_TOKEN)
            if (teamUser.dataValues.active == false) return { code: 404, message: 'Your account is disable' }

            return { code: 200, 'token': token, 'teamUser': { ...teamUser.dataValues, authorisation: 'client-team', id_team: teamUser.dataValues.id, id: teamUser.dataValues.id_user } }
        } catch (error) {
            return { code: 400, 'token': token, 'message': error }
        }
    }

    static async ResetClientPassword({ id, prevPassword, newPassword }) {

        var clientFound = await this.#findClientById(id)
        if (!clientFound) return { code: 404, message: 'email or password is invalid' }

        try {

            const client = await this.#findClientById(id);

            const isSame = await this.#comparePassword(prevPassword, client.password)
            if (!isSame) return { code: 404, message: 'Previous password does not match client password' }

            var password = await this.#hashPassword(newPassword)
            client.password = password;

            await client.save();

            return { code: 200, message: 'Client password reset successfully' }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async ForgotPassword({ email }) {
        var client = await this.#findClientByEmail(email)
        if (!client) return { code: 404, message: 'email or password is invalid' }

        try {
            const new_password = this.#generatePassword(8)

            var password = await this.#hashPassword(new_password)
            client.password = password;

            await ClientServices.SendNewPWD({ contact: client.dataValues.telephone, password: new_password })

            await client.save();

            return { code: 200, message: 'Votre nouveau mot de passe a été envoyé par mail' }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async sendCode({ telephone }) {
        var client = await this.#findClientByTelephone(telephone)
        if (!client) return { code: 404, message: 'email or password is invalid' }

        try {
            if (!client.dataValues.active) await ClientServices.SendOTPCode({ contact: telephone })

            return { code: 200, 'message': 'Le code a été renvoyé' }
        } catch (error) {
            return { code: 400, 'message': error }
        }
    }

    static async SaveResponse({ id, response }) {
        const transaction = await seqlz.transaction();

        var clientFound = await this.#findClientById(id)
        if (!clientFound) return { code: 400, message: 'Internal error, please contact the support' }

        try {
            const question = [
                {
                    label: 'Quelle est votre situation ?',
                    response: [
                        'Je viens de commencer le e-commerce',
                        'Je vends déjà sur internet'
                    ]
                },
                {
                    label: 'Quel site utilisez-vous ?',
                    response: [
                        'Shopify',
                        'Youcan',
                        'Woocommerce',
                        'Wordpress',
                        'Autre'
                    ]
                },
                {
                    label: 'Comment avez-vous entendu parler de nous ?',
                    response: [
                        'Youtube ads',
                        'Facebook ads',
                        'Instagram vidéo',
                        'Groupe facebook',
                        'Recommandé par un ami',
                        'De l\'un de nos agents'
                    ]
                },
                {
                    label: 'Quel est votre  but principal de l\'utilisation de notre système ?',
                    response: [
                        'Comparer les gains entre produits',
                        'Comparer entre les gens de confirmation',
                        'Automatiser l’exportation  des commandes dans la société de livraison',
                        'Savoir mon gain net en e-commerce',
                        'Maitriser le cout par commande des Ads'
                    ]
                }
            ]

            const getFormatAnswer = (response, question) => {
                var final = [
                    {
                        label: question[0].label,
                        reponse: question[0].response[response["1"] - 1]
                    },
                    {
                        label: question[1].label,
                        reponse: question[1].response[response["2"] - 1]
                    },
                    {
                        label: question[2].label,
                        reponse: question[2].response[response["3"] - 1]
                    },
                    {
                        label: question[3].label,
                        reponse: response["4"].map(id => question[3].response[id - 1] + ',')
                    }
                ]

                return final
            }

            const responseBuild = Client_Response.build({ response: getFormatAnswer(response, question), id_user: id })
            await responseBuild.save({ transaction })

            clientFound.step = 'pack'
            await clientFound.save({ transaction });

            await transaction.commit();

            return { code: 200, message: 'Your response have been saved' }
        } catch (error) {
            console.log(error)
            await transaction.rollback();
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async ChoosePack({ id, id_pack, contact }) {
        const transaction = await seqlz.transaction();

        var clientFound = await this.#findClientById(id)
        if (!clientFound) return { code: 400, message: 'Internal error, please contact the support' }

        var subscription = await this.#findSubscriptionByIdUser(id)
        if (!subscription) throw { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            const date = this.#GetDateFormat()
            subscription.id_pack = id_pack
            subscription.date_subscription = date[0]
            subscription.date_expiration = date[1]
            await subscription.save({ transaction });

            clientFound.step = 'completed'
            clientFound.telephone = contact
            await clientFound.save({ transaction });

            await transaction.commit();

            return { code: 200, message: 'Welcome to youscale' }
        } catch (error) {
            await transaction.rollback();
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

}

module.exports = AuthServices