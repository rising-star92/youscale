require('dotenv').config();
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport')
const { User, Setting_Admin, Setting_User, Perte_Categorie, Subscription, Column_Of_Order, Client_Account, Team_Admin, Client_Goal, Status_User } = require('../models')
const jwt = require('jsonwebtoken')
const sequelize = require('sequelize')
const Op = sequelize.Op
const { col } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const GetDateFormat = () => {
    const today = new Date();
    const thisDate = today.toISOString()

    const next = today.setDate(today.getDate() + 31)
    const nextDate = new Date(next).toISOString()

    return [thisDate, nextDate]
}

async function findClientByEmail(email) {
    var clientFound = await User.findOne({
        where: { email }
    })

    if (clientFound) return clientFound
    return false
}

async function findSettingAdminById(id_admin) {
    var adminFound = await Setting_Admin.findOne({
        where: { id_admin },
        order: [['updatedAt', 'DESC']],
        limit: 1
    })

    if (adminFound) return adminFound
    return false
}

async function SearchAvailableTeam() {
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

async function ClientRegister({ fullname, email, picture, role, id_admin }) {

    var settingAdmin = await findSettingAdminById(1)
    if (!settingAdmin) throw { code: 400, message: 'System will need to be initialized' }

    var password = null
    var reference = uuidv4()

    var active = true

    var id_admin_setting = settingAdmin.id

    var id_team = await SearchAvailableTeam()

    var client = User.build({ reference, fullname, password, email, isTrial: 1, picture, role, id_admin, id_admin_setting, active, id_team_member_confirmation: id_team, step: 'question' })

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

        const date = GetDateFormat()
        var subscription = await Subscription.build({ date_subscription: date[0], date_expiration: date[1], id_pack: 1, id_user: clientSaved.id })
        await subscription.save();

        await Client_Account.build({ id_user: clientSaved.id, solde: 0, montant_du: 0 }).save()

        await Client_Goal.build({ id_user: clientSaved.id, value: 0 }).save()

        if (clientSaved.dataValues) {
            const token = jwt.sign(clientSaved.dataValues, process.env.SECRET_TOKEN)
            return { 'token': token, 'client': clientSaved.dataValues }
        }

        throw { code: 400, message: 'Internal error, please contact the support' }
    } catch (error) {
        console.log({ code: error.code || 400, message: error.message || 'Internal error, please contact support' })
    }

}

async function ClientLogin({ email }) {
    var client = await findClientByEmail(email)
    if (!client) throw { code: 404, message: 'email or password is invalid' }

    try {
        const token = jwt.sign(client.dataValues, process.env.SECRET_TOKEN)

        return { code: 200, 'token': token, 'client': client.dataValues }
    } catch (error) {
        console.log({ code: error.code || 400, message: error.message || 'Internal error, please contact support' })
    }
}

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    scope: ['profile', 'email']
},
    async function (accessToken, refreshToken, profile, cb) {
        // auth process
        const { email, name, picture } = profile._json
        var client = await findClientByEmail(email)

        if (client) {
            // if user is already authenticate
            const response = await ClientLogin({ email })
            cb(null, response)
        } else {
            // if user not authenticate
            const response = await ClientRegister({ fullname: name, email, picture, role: 'client', id_admin: 1 })
            cb(null, response)
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})