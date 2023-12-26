require('dotenv').config();
const bcrypt = require('bcrypt');
const { Admin, Shipping_Companie, Team_Admin, Team_Admin_Page_Acces, Team_Admin_Column_Acces,
    Column_Of_User, User, Admin_Page, Coupon, City_Admin,
    Setting_Admin, Annoucement, Ads, Pack, Status_Admin, Admin_Perte_Categorie, Admin_Gain_Categorie,
    Admin_Gain, Admin_Perte, Perte_Categorie, Setting_User, Payment_Method, Bank_Information,
    Subscription, Client_Payment, Client_Account, Column_Of_Order, Order, Status_User, Client_Response,
    MessageSupport, Support } = require('../models')

const sequelize = require('sequelize')
const jwt = require('jsonwebtoken')
const Op = sequelize.Op
const { col } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { sequelize: seqlz } = require('../models/index')

class AdminServices {

    static #saltRounds = 10;

    static async #hashPassword(password) {
        var pwd = await bcrypt.hash(password, this.#saltRounds);

        return pwd
    }

    static #GetDateFormat = () => {
        const today = new Date();
        const thisDate = today.toISOString()

        const next = today.setDate(today.getDate() + 31)
        const nextDate = new Date(next).toISOString()

        return [thisDate, nextDate]
    }

    static async #CountAvailableTeam({ current_id_team }) {
        var count = await Team_Admin.count({
            where: {
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

    static async #SearchAvailableTeam({ current_id_team }) {
        if (current_id_team) {
            var team_user = await Team_Admin.findAll({
                where: {
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
            var team_user = await Team_Admin.findAll({
                where: {
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

    static async #findAccountById(id_user) {
        var accountFound = await Client_Account.findOne({
            where: { id_user }
        })

        if (accountFound) return accountFound
        return false
    }

    static async #findClientByTelephone(telephone) {
        var clientFound = await User.findOne({
            where: { telephone }
        })

        if (clientFound) return clientFound
        return false
    }

    static async #getNewActiveClient({ useDate, dateFrom, dateTo }) {
        // Calculate the date range
        const currentDate = new Date();
        const startDate = new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000); // Subtract 15 days

        try {
            if (!useDate) {
                var client = await User.findAll({
                    where: {
                        createdAt: {
                            [Op.gte]: startDate
                        },
                    },
                })

                return client.length
            } else {
                var client = await User.findAll({
                    where: {
                        [Op.and]: [
                            {
                                [Op.or]: [
                                    { createdAt: { [Op.gte]: startDate } }
                                ]
                            },
                        ]
                    },
                })

                return client.length
            }
        } catch (error) {
            console.log(error)
            return false
        }

    }

    static async #getNewInnactiveClient({ useDate, dateFrom, dateTo }) {
        // Calculate the date range
        const currentDate = new Date();
        const startDate = new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000); // Subtract 15 days

        try {
            if (!useDate) {
                var client = await User.findAll({
                    where: {
                        createdAt: {
                            [Op.lte]: startDate
                        },
                    },
                })

                return client.length
            } else {
                var client = await User.findAll({
                    where: {
                        [Op.and]: [
                            {
                                [Op.or]: [
                                    { createdAt: { [Op.lte]: startDate } }
                                ]
                            },
                        ]
                    },
                })

                return client.length
            }
        } catch (error) {
            console.log(error)
            return false
        }

    }

    static async #getActiveClient({ useDate, dateFrom, dateTo }) {
        const currentDate = new Date();
        const twoWeeksAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000); // Subtract 14 days

        try {
            if (!useDate) {
                var client = await User.findAll({
                    include: [
                        {
                            model: Order,
                            where: {
                                createdAt: {
                                    [Op.lte]: twoWeeksAgo,
                                },
                            },
                            required: true,
                        },
                    ],
                })

                return client.length
            } else {
                var client = await User.findAll({
                    include: [
                        {
                            model: Order,
                            where: {
                                [Op.and]: [
                                    {
                                        [Op.or]: [
                                            { createdAt: { [Op.lte]: twoWeeksAgo } }
                                        ],
                                    },
                                ]
                            },
                            required: true,
                        },
                    ]
                })

                return client.length
            }
        } catch (error) {
            console.log(error)
            return false
        }

    }

    static async #getInnactiveClient({ useDate, dateFrom, dateTo }) {
        const currentDate = new Date();
        const twoWeeksAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000); // Subtract 14 days

        try {
            if (!useDate) {
                var client = await User.findAll({
                    include: [
                        {
                            model: Order,
                            where: {
                                createdAt: {
                                    [Op.gte]: twoWeeksAgo,
                                },
                            },
                            required: true,
                        },
                    ],
                })

                return client.length
            } else {
                var client = await User.findAll({
                    include: [
                        {
                            model: Order,
                            where: {
                                [Op.and]: [
                                    {
                                        [Op.or]: [
                                            { createdAt: { [Op.gte]: twoWeeksAgo } },
                                        ],
                                    }
                                ]
                            },
                            required: true,
                        },
                    ]
                })

                return client.length
            }
        } catch (error) {
            console.log(error)
            return false
        }

    }

    static async #getLoyalClient({ useDate, dateFrom, dateTo }) {
        const currentDate = new Date();
        const twoWeeksAgo = new Date(currentDate.getTime() - 91 * 24 * 60 * 60 * 1000); // Subtract 3 months

        try {
            if (!useDate) {
                var client = await User.findAll({
                    include: [
                        {
                            model: Order,
                            where: {
                                createdAt: {
                                    [Op.lte]: twoWeeksAgo,
                                },
                            },
                            required: true,
                        },
                    ],
                })

                return client.length
            } else {
                var client = await User.findAll({
                    include: [
                        {
                            model: Order,
                            where: {
                                [Op.and]: [
                                    {
                                        [Op.or]: [
                                            { createdAt: { [Op.lte]: twoWeeksAgo } }
                                        ],
                                    },
                                ]
                            },
                            required: true,
                        },
                    ],
                })

                return client.length
            }
        } catch (error) {
            console.log(error)
            return false
        }

    }

    static async #getUnverifiedClient({ useDate, dateFrom, dateTo }) {

        try {
            if (!useDate) {
                var client = await User.findAll({
                    where: {
                        active: false,
                    },
                })

                return client.length
            } else {
                var client = await User.findAll({
                    where: {
                        [Op.and]: [
                            {
                                [Op.or]: [
                                    { createdAt: { [Op.between]: [dateFrom, dateTo] } }, // Date range filter 2
                                ],
                            },
                            { active: false }, // Additional filter condition
                        ],
                    },
                })

                return client.length
            }
        } catch (error) {
            console.log(error)
            return false
        }

    }

    static async #getVerifiedClient({ useDate, dateFrom, dateTo }) {

        try {
            if (!useDate) {
                var client = await User.findAll({
                    where: {
                        active: true,
                    },
                })

                return client.length
            } else {
                var client = await User.findAll({
                    where: {
                        [Op.and]: [
                            {
                                [Op.or]: [
                                    { createdAt: { [Op.between]: [dateFrom, dateTo] } }, // Date range filter 2
                                ],
                            },
                            { active: true }, // Additional filter condition
                        ],
                    },
                })

                return client.length
            }
        } catch (error) {
            console.log(error)
            return false
        }

    }

    static async #getIncomes({ useDate, dateFrom, dateTo }) {
        // accepted
        if (!useDate) {
            var incomes = await Client_Payment.sum('amount', {
                where: { status: 'accepted' }
            })

            if (!incomes) return 0
            return incomes
        } else {
            var incomes = await Client_Payment.sum('amount', {
                where: {
                    status: 'accepted',
                    createdAt: {
                        [Op.between]: [dateFrom, dateTo]
                    }
                }
            })

            if (!incomes) return 0
            return incomes
        }
    }

    static async #findClientByEmail(email) {
        var clientFound = await User.findOne({
            where: { email }
        })

        if (clientFound) return clientFound
        return false
    }

    static async #findAdminById(id_admin) {
        var adminFound = await Admin.findOne({
            where: { id: id_admin }
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

    static async #findClientById(id) {
        var clientFound = await User.findOne({
            where: { id }
        })

        if (clientFound) return clientFound
        return false
    }

    static async #findPaymentMethodById(id) {
        var paymentMethodFound = await Payment_Method.findOne({
            where: { id }
        })

        if (paymentMethodFound) return paymentMethodFound
        return false
    }

    static async #findSettingByIdAdmin(id_admin) {
        var settingFound = await Setting_Admin.findOne({
            where: { id_admin },
            order: [['updatedAt', 'DESC']],
            limit: 1,
            include: [
                { model: Annoucement },
                { model: Ads }
            ]
        })

        if (settingFound) return settingFound
        return false
    }

    static async #findCouponByName(name) {
        var couponFound = await Coupon.findOne({
            where: { name }
        })

        if (couponFound) return couponFound
        return false
    }

    static async #findCouponById(id) {
        var couponFound = await Coupon.findOne({
            where: { id }
        })

        if (couponFound) return couponFound
        return false
    }

    static async #findTeamAdminById(id) {
        if (!id) return { id: 0 }
        var adminTeamFound = await Team_Admin.findOne({
            where: { id },
            include: [
                { model: Team_Admin_Page_Acces, include: Admin_Page },
                { model: Team_Admin_Column_Acces, include: Column_Of_User }
            ]
        })

        if (adminTeamFound) return adminTeamFound
        return false
    }

    static async #findAnnoucementById(id) {
        var annoucementFound = await Annoucement.findOne({
            where: { id }
        })

        if (annoucementFound) return annoucementFound
        return false
    }

    static async #findBankInformationById(id) {
        var BankInformationFound = await Bank_Information.findOne({
            where: { id }
        })

        if (BankInformationFound) return BankInformationFound
        return false
    }

    static async #findAdsById(id) {
        var adsFound = await Ads.findOne({
            where: { id }
        })

        if (adsFound) return adsFound
        return false
    }

    static async #findPackById(id) {
        var packFound = await Pack.findOne({
            where: { id }
        })

        if (packFound) return packFound
        return false
    }

    static async #findPaymentClientById(id) {
        var paymentFound = await Client_Payment.findOne({
            where: { id }
        })

        if (paymentFound) return paymentFound
        return false
    }

    static async #findPerteCategorieById(id, id_admin) {
        var perteCategorieFound = await Admin_Perte_Categorie.findOne({
            where: { id, id_admin }
        })

        if (perteCategorieFound) return perteCategorieFound
        return false
    }

    static async #findGainCategorieById(id, id_admin) {
        var gainCategorieFound = await Admin_Gain_Categorie.findOne({
            where: { id, id_admin }
        })

        if (gainCategorieFound) return gainCategorieFound
        return false
    }

    static async #findGainById(id, id_admin) {
        var gainFound = await Admin_Gain.findOne({
            where: { id, id_admin }
        })

        if (gainFound) return gainFound
        return false
    }

    static async #findPerteById(id, id_admin) {
        var perteFound = await Admin_Perte.findOne({
            where: { id, id_admin }
        })

        if (perteFound) return perteFound
        return false
    }

    static async #findCityById(id) {
        var cityFound = await City_Admin.findOne({
            where: { id }
        })

        if (cityFound) return cityFound
        return false
    }

    static async #findStatusAdminById(id) {
        var statusFound = await Status_Admin.findOne({
            where: { id }
        })

        if (statusFound) return statusFound
        return false
    }

    static async #findShippingCompanieById(id) {
        var adminFound = await Shipping_Companie.findOne({
            where: { id }
        })

        if (adminFound) return adminFound
        return false
    }

    static async #findColumnOfUser(id) {
        var columnFound = await Column_Of_User.findOne({
            where: { id }
        })

        if (columnFound) return columnFound
        return false
    }

    static async getAdmin({ id }) {
        const admin = await this.#findAdminById(id)
        if (!admin) return { code: 404, message: 'This ressource doesn\'t exist' }

        return { code: 200, data: admin }
    }

    static async GetShippingCompanie({ id }) {

        if (!id) {
            try {
                var companies = await Shipping_Companie.findAll({ order: [['range', 'ASC']] })
                return { 'code': 200, 'data': companies }
            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findShippingCompanieById(id)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }

    }

    static async AddShippingCompanie({ name, image, id_admin, mode_pricing, value }) {

        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var shippingCompanie = Shipping_Companie.build({ name, image, id_admin, mode_pricing, value })

        try {
            var shippingCompanieSaved = await shippingCompanie.save();
            return { 'code': 200, 'data': shippingCompanieSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async PatchShippingCompanie({ id, image, isShow, range, mode_pricing, value }) {

        var isExist = await this.#findShippingCompanieById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.image = image ?? isExist.image
        isExist.isShow = isShow ?? isExist.isShow
        isExist.range = range ?? isExist.range
        isExist.mode_pricing = mode_pricing ?? isExist.mode_pricing
        isExist.value = value ?? isExist.value

        try {
            var ShippingCompaniePatched = await isExist.save()
            return { 'code': 200, 'data': ShippingCompaniePatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveShippingCompanie({ id }) {

        var isExist = await this.#findShippingCompanieById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var ShippingCompaniePatched = await isExist.destroy()
            return { 'code': 200, 'data': ShippingCompaniePatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetTeamMember({ id }) {
        if (!id) {
            try {
                var team = await Team_Admin.findAll({
                    include: [
                        { model: Team_Admin_Page_Acces, include: Admin_Page },
                        { model: Team_Admin_Column_Acces, include: Column_Of_User },
                        { model: User, as: 'id_team_member_confirmationTeamAdmin' }
                    ]
                })
                return { 'code': 200, 'data': team }
            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findTeamAdminById(id)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {

                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }

    }

    static async AddTeamMember({ id_admin, name, email, plainPassword, salaire, day_payment, commission, upsell, crosssell, downsell, max_order, can_del_or_edit_order, column_access, page_access }) {

        var all_column_access = column_access.length > 0 ? false : true
        var all_page_access = page_access.length > 0 ? false : true

        var isExist = await this.#findAdminById(id_admin)

        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var password = await this.#hashPassword(plainPassword)
        var teamMember = Team_Admin.build({ id_admin, name, email, password, salaire, day_payment, commission, upsell, crosssell, downsell, max_order, can_del_or_edit_order, all_column_access, all_page_access, nb_order: 0 })

        try {
            var teamMemberSaved = await teamMember.save();
            var id_team = teamMemberSaved.id

            if (!all_column_access) {
                column_access.map(async id_column_of_user => {
                    try {
                        var columnAccess = await Team_Admin_Column_Acces.build({ id_team, id_column_of_user })
                        await columnAccess.save()
                        console.log('column access saved')
                    } catch (error) {
                        teamMemberSaved.destroy()
                            .then(res => console.log('team member destroyed'))
                            .catch(err => console.error(err))
                    }
                })
            }

            if (!all_page_access) {
                page_access.map(async id_admin_page => {
                    try {
                        var pageAccess = await Team_Admin_Page_Acces.build({ id_team, id_admin_page })
                        await pageAccess.save()
                        console.log('page access saved')
                    } catch (error) {
                        teamMemberSaved.destroy()
                            .then(res => console.log('team member destroyed'))
                            .catch(err => console.error(err))
                    }
                })
            }

            return { 'code': 200, 'data': teamMemberSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async PatchTeamMember({ id, name, active, email, salaire, plainPassword, day_payment, commission, upsell, crosssell, downsell, max_order, can_del_or_edit_order, all_column_access, all_page_access, column_access, page_access }) {
        const transaction = await seqlz.transaction();

        var isExist = await this.#findTeamAdminById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var password = plainPassword && await this.#hashPassword(plainPassword)

        isExist.active = active ?? isExist.active
        isExist.name = name ?? isExist.name
        isExist.email = email ?? isExist.email
        isExist.salaire = salaire ?? isExist.salaire
        isExist.day_payment = day_payment ?? isExist.day_payment
        isExist.commission = commission ?? isExist.commission
        isExist.upsell = upsell ?? isExist.upsell
        isExist.crosssell = crosssell ?? isExist.crosssell
        isExist.downsell = downsell ?? isExist.downsell
        isExist.max_order = max_order ?? isExist.max_order
        isExist.can_del_or_edit_order = can_del_or_edit_order ?? isExist.can_del_or_edit_order
        isExist.password = plainPassword ? password : isExist.password

        isExist.all_column_access = (active == undefined) ? all_column_access ?? isExist.all_column_access : isExist.all_column_access
        isExist.all_page_access = (active == undefined) ? all_page_access ?? isExist.all_page_access : isExist.all_page_access

        try {
            if (active == false) {
                var clients = await User.findAll({ where: { id_team_member_confirmation: id } })

                if (clients.length === 0) {
                    var teamClientPatched = await isExist.save({ transaction })

                    await transaction.commit();
                    return { code: 200, data: teamClientPatched }
                } else {
                    const countAvailableTeam = await this.#CountAvailableTeam({ current_id_team: isExist.id })
                    if (countAvailableTeam < clients.length) return { code: 400, message: 'Error, The number of orders for this member is greater than the number of available members' }

                    // loop on orders and assign team to order
                    clients.map(async client => {
                        var team_user = await this.#SearchAvailableTeam({ current_id_team: isExist.id, id_user })
                        if (!team_user) return { code: 404, message: 'Internal error contact the support, team_member(error)' }

                        var random = Math.floor(Math.random() * team_user.length)
                        var id_team = team_user[random].id

                        team_user[random].nb_order = team_user[random].nb_order + 1
                        await team_user[random].save({ transaction })

                        client.id_team_member_confirmation = id_team
                        await client.save({ transaction })
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
                    await Team_Admin_Column_Acces.destroy({ where: { id_team } })

                    column_access.map(async id_column_of_user => {
                        try {
                            var columnAccess = await Team_Admin_Column_Acces.build({ id_team, id_column_of_user })
                            await columnAccess.save({ transaction })
                        } catch (error) {
                            teamClientPatched.destroy()
                                .then(res => console.log('team member destroyed'))
                                .catch(err => console.error(err))
                        }
                    })
                }

                if (!all_page_access) {
                    await Team_Admin_Page_Acces.destroy({ where: { id_team } })

                    page_access.map(async id_admin_page => {
                        try {
                            var pageAccess = await Team_Admin_Page_Acces.build({ id_team, id_admin_page })
                            await pageAccess.save({ transaction })
                            console.log('page access saved')
                        } catch (error) {
                            teamClientPatched.destroy()
                                .then(res => console.log('team member destroyed'))
                                .catch(err => console.error(err))
                        }
                    })
                } else {
                    var teamClientPatched = await isExist.save({ transaction })

                    await transaction.commit();
                    return { 'code': 200, 'data': teamClientPatched }
                }
            }

            var teamAdminPatched = await isExist.save({ transaction })

            await transaction.commit();
            return { 'code': 200, 'data': teamAdminPatched }

        } catch (error) {
            await transaction.rollback();
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveTeamMember({ id }) {
        var isExist = await this.#findTeamAdminById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var teamAdminDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': teamAdminDestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AddColumnOfUser({ name, active, id_admin }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var columnOfUser = Column_Of_User.build({ name, active, id_admin })

        try {
            var columnOfUserSaved = await columnOfUser.save();
            return { 'code': 200, 'data': columnOfUserSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchColumnOfUser({ id, name, active }) {
        var isExist = await this.#findColumnOfUser(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name
        isExist.active = active ?? isExist.active

        try {
            var ColumnOfUserPatched = await isExist.save()
            return { 'code': 200, 'data': ColumnOfUserPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveColumnOfUser({ id }) {

        var isExist = await this.#findColumnOfUser(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var ColumnOfUserDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': ColumnOfUserDestroyed }

        } catch (error) {
            console.error(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetColumnOfUser({ id }) {
        if (!id) {
            try {
                var ColumnOfUser = await Column_Of_User.findAll()
                return { 'code': 200, 'data': ColumnOfUser }
            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findColumnOfUser(id)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }

    }

    static async GetCoupon({ id }) {
        if (!id) {
            try {
                var coupon = await Coupon.findAll()
                return { 'code': 200, 'data': coupon }
            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findCouponById(id)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }
    }

    static async AddCoupon({ id_admin, name, code, discount, time, limit, used }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var verifyName = await this.#findCouponByName(name)
        if (verifyName) return { code: 404, message: 'Désolé ce nom de coupon existe déja' }

        var client_used = []
        var coupon = Coupon.build({ id_admin, name, code, discount, time, limit, used, client_used })

        try {
            var couponSaved = await coupon.save();
            return { 'code': 200, 'data': couponSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchCoupon({ id, name, code, discount, time, limit }) {
        var isExist = await this.#findCouponById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name
        isExist.code = code ?? isExist.code
        isExist.discount = discount ?? isExist.discount
        isExist.time = time ?? isExist.time
        isExist.limit = limit ?? isExist.limit

        try {
            var couponPatched = await isExist.save()
            return { 'code': 200, 'data': couponPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveCoupon({ id }) {
        var isExist = await this.#findCouponById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var couponDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': couponDestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetCity({ id }) {
        if (!id) {
            try {
                var coupon = await City_Admin.findAll()
                return { 'code': 200, 'data': coupon }
            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findCityById(id)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }
    }

    static async GetPage() {
        try {
            var page = await Admin_Page.findAll()

            return { 'code': 200, 'data': page }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AddCity({ id_admin, name }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var city = City_Admin.build({ id_admin, name })

        try {
            var citySaved = await city.save();
            return { 'code': 200, 'data': citySaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchCity({ id, name }) {
        var isExist = await this.#findCityById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name

        try {
            var cityPatched = await isExist.save()
            return { 'code': 200, 'data': cityPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveCity({ id }) {
        var isExist = await this.#findCityById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var cityDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': cityDestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetSetting({ id_admin }) {
        function getStartAndEndDateOfCurrentMonth() {
            const today = new Date();

            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            const startOfMonthStr = startOfMonth.toISOString().slice(0, 10);
            const endOfMonthStr = endOfMonth.toISOString().slice(0, 10);

            return { startOfMonthStr, endOfMonthStr }
        }

        try {
            var isExist = await this.#findSettingByIdAdmin(id_admin)
            if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

            var { startOfMonthStr, endOfMonthStr } = getStartAndEndDateOfCurrentMonth()
            var earningNet = await this.getEarningNet({ id_admin, useDate: 1, dateFrom: startOfMonthStr, dateTo: endOfMonthStr })

            const getRes = () => {
                if (earningNet > isExist.goal) return { goalValue: isExist.goal, goalPercent: 100 }
                if (earningNet < 0) return { goalValue: isExist.goal, goalPercent: 0 }
                if (isExist.goal == 0) return { goalValue: isExist.goal, goalPercent: 0 }

                var goalPercent = (earningNet * 100) / isExist.goal
                return { goalValue: isExist.goal, goalPercent }
            }

            return {
                'code': 200, 'data': {
                    setting: isExist,
                    goal: getRes()
                }
            }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchSetting({ id_admin, default_conf_pricing, delfault_del_pricing, default_time, trial_period, automated_msg, max_solde_du, goal }) {
        var isExist = await this.#findSettingByIdAdmin(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var setting = await Setting_Admin.build({
            default_conf_pricing: default_conf_pricing ?? isExist.default_conf_pricing,
            delfault_del_pricing: delfault_del_pricing ?? isExist.delfault_del_pricing,
            goal: goal ?? isExist.goal,
            default_time: default_time ?? isExist.default_time,
            trial_period: trial_period ?? isExist.trial_period,
            automated_msg: automated_msg ?? isExist.automated_msg,
            max_solde_du: max_solde_du ?? isExist.max_solde_du,
            id_admin: id_admin
        })

        try {
            var settingPatched = await setting.save();

            return { 'code': 200, 'data': settingPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AddAnoucement({ id_admin, text, clt_categorie }) {
        var isExist = await this.#findSettingByIdAdmin(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        //await Annoucement.destroy({ where: {}, truncate: true })

        var id_setting = isExist.id
        var annoucement = await Annoucement.build({ id_setting, text, clt_categorie })

        try {
            var annoucementSaved = await annoucement.save();

            return { 'code': 200, 'data': annoucementSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchAnnoucement({ id, text }) {
        var isExist = await this.#findAnnoucementById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.text = text ?? isExist.text

        try {
            var annoucementPatched = await isExist.save()
            return { 'code': 200, 'data': annoucementPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchAds({ id, image }) {
        var isExist = await this.#findAdsById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.image = image ?? isExist.image

        try {
            var adsPatched = await isExist.save()
            return { 'code': 200, 'data': adsPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async DeleteAds({ id_admin }) {
        var isExist = await this.#findSettingByIdAdmin(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var adsDestroy = await Ads.destroy({ where: {}, truncate: true })

            return { 'code': 200, 'data': adsDestroy }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async GetAds({ id_admin }) {
        var isExist = await this.#findSettingByIdAdmin(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var ads = await Ads.findAll({ where: {}, truncate: true, limit: 1 })

            return { 'code': 200, 'data': ads[0] }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async GetAnnoucement({ id_admin }) {
        var isExist = await this.#findSettingByIdAdmin(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var annoucement = await Annoucement.findAll({ where: {}, truncate: true, limit: 1 })

            return { 'code': 200, 'data': annoucement[0] }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async DeleteAnnoucement({ id_admin }) {
        var isExist = await this.#findSettingByIdAdmin(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var annoucementDestroy = await Annoucement.destroy({ where: {}, truncate: true })

            return { 'code': 200, 'data': annoucementDestroy }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async AddAds({ id_admin, image, clt_categorie }) {
        var isExist = await this.#findSettingByIdAdmin(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        await Ads.destroy({ where: {}, truncate: true })

        var id_setting = isExist.id
        var ads = await Ads.build({ id_setting, image, clt_categorie })

        try {
            var adsSaved = await ads.save();

            return { 'code': 200, 'data': adsSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetPack() {
        try {

            return { 'code': 200, 'data': await Pack.findAll() }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AddPack({ name, id_admin, price_per_month, item_inclued }) {
        var isExist = await this.#findSettingByIdAdmin(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var pack = await Pack.build({ name, price_per_month, item_inclued })

        try {
            var packSaved = await pack.save();

            return { 'code': 200, 'data': packSaved }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchPack({ id, name, price_per_month, item_inclued, isShow, support }) {
        var isExist = await this.#findPackById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name
        isExist.price_per_month = price_per_month ?? isExist.price_per_month
        isExist.item_inclued = item_inclued ?? isExist.item_inclued
        isExist.support = support ?? isExist.support
        isExist.isShow = isShow ?? isExist.isShow

        try {
            var patchSaved = await isExist.save();

            return { 'code': 200, 'data': patchSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AddStatus({ id_admin, name, checked }) {
        var isExist = await this.#findSettingByIdAdmin(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var id_setting = isExist.id
        var statusAdmin = await Status_Admin.build({ id_setting, name, checked })

        try {
            var statusAdminaved = await statusAdmin.save();

            return { 'code': 200, 'data': statusAdminaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchStatus({ id, name, checked }) {
        var isExist = await this.#findStatusAdminById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name
        isExist.checked = checked ?? isExist.checked

        try {
            var statusPatched = await isExist.save();

            return { 'code': 200, 'data': statusPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetStatus() {
        try {

            return { 'code': 200, 'data': await Status_Admin.findAll() }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetGainCategorie({ id, id_admin }) {
        if (!id) {
            try {
                var gainCategorie = await Admin_Gain_Categorie.findAll({
                    where: { id_admin }
                })
                return { 'code': 200, 'data': gainCategorie }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findGainCategorieById(id, id_admin)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }
    }

    static async AddPerteCategorie({ id_admin, name }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var perteCategorie = Admin_Perte_Categorie.build({ name, id_admin })

        try {
            var perteCategorieSaved = await perteCategorie.save();
            return { 'code': 200, 'data': perteCategorieSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemovePerteCategorie({ id, id_admin }) {
        var isExist = await this.#findPerteCategorieById(id, id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var perteCategoriedestroyed = await isExist.destroy()
            return { 'code': 200, 'data': perteCategoriedestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchPerteCategorie({ id, id_admin, name }) {
        var isExist = await this.#findPerteCategorieById(id, id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name

        try {
            var perteCategoriePatched = await isExist.save();

            return { 'code': 200, 'data': perteCategoriePatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetPerteCategorie({ id, id_admin }) {
        if (!id) {
            try {
                var perteCategorie = await Admin_Perte_Categorie.findAll({
                    where: { id_admin }
                })
                return { 'code': 200, 'data': perteCategorie }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findPerteCategorieById(id, id_admin)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }
    }

    static async AddGainCategorie({ id_admin, name }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var gainCategorie = Admin_Gain_Categorie.build({ id_admin, name })

        try {
            var gainCategorieSaved = await gainCategorie.save();
            return { 'code': 200, 'data': gainCategorieSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveGainCategorie({ id, id_admin }) {
        var isExist = await this.#findGainCategorieById(id, id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var gainCategoriedestroyed = await isExist.destroy()
            return { 'code': 200, 'data': gainCategoriedestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchGainCategorie({ id, id_admin, name }) {
        var isExist = await this.#findGainCategorieById(id, id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name

        try {
            var gainCategoriePatched = await isExist.save();

            return { 'code': 200, 'data': gainCategoriePatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetGainCategorie({ id, id_admin }) {
        if (!id) {
            try {
                var gainCategorie = await Admin_Gain_Categorie.findAll({
                    where: { id_admin }
                })
                return { 'code': 200, 'data': gainCategorie }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        } else {
            try {
                var isExist = await this.#findGainCategorieById(id, id_admin)
                if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

                return { 'code': 200, 'data': isExist }

            } catch (error) {
                return { code: 400, message: 'Internal error, please contact the support' }
            }
        }
    }

    static async AddGain({ id_admin, id_user, id_gain_categorie, note, date, amount }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var gain = await Admin_Gain.build({ id_admin, id_user, id_gain_categorie, note, date, amount })

        try {
            var gainSaved = await gain.save();
            return { 'code': 200, 'data': gainSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemoveGain({ id, id_admin }) {
        var isExist = await this.#findGainById(id, id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var gainDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': gainDestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AddPerte({ id_admin, id_perte_categorie, note, dateFrom, dateTo, amount }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var perte = await Admin_Perte.build({ id_admin, id_perte_categorie, note, dateFrom, dateTo, amount })

        try {
            var perteSaved = await perte.save();
            return { 'code': 200, 'data': perteSaved }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemovePerte({ id, id_admin }) {
        var isExist = await this.#findPerteById(id, id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var perteDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': perteDestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetPaiementDashbord({ id_admin, useDate, dateFrom, dateTo }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {

            const params = { id_admin, useDate, dateFrom, dateTo }

            var transaction = await this.GetTransaction(params)
            var detailOfSpending = await this.GetDetailsOfSpending(params)

            if (transaction === null || detailOfSpending === null) return { code: 500, message: 'Internal server error' }

            const data = {
                transaction,
                detailOfSpending
            }

            return { code: 200, data }

        } catch (err) {
            console.log(err)
            return { code: 500, message: 'Internal server error' }
        }
    }

    static async GetTransaction({ id_admin, useDate, dateFrom, dateTo }) {

        try {
            if (!useDate) {

                var perte_params = {
                    where: {
                        id_admin
                    },
                    include: [Admin_Perte_Categorie]
                }

                var perte = await Admin_Perte.findAll(perte_params)
                if (!perte) return []

                var dates = [...perte]

                dates.sort((obj1, obj2) => obj1.dateFrom - obj2.dateFrom);

                return dates
            } else {
                var perte_params = {
                    where: {
                        id_admin,
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
                    include: [Admin_Perte_Categorie]
                }

                var perte = await Admin_Perte.findAll(perte_params)

                var dates = [...perte]

                dates.sort((obj1, obj2) => obj1.dateFrom - obj2.dateFrom);

                return dates
            }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async GetDetailsOfSpending({ id_admin, useDate, dateFrom, dateTo }) {

        try {
            if (!useDate) {

                var perte = await Admin_Perte.findAll({
                    where: { id_admin },
                    include: [Admin_Perte_Categorie, User],
                    attributes: [
                        'id_perte_categorie',
                        [sequelize.fn('sum', sequelize.col('amount')), 'total_amount'],
                    ],
                    group: 'id_perte_categorie'
                })
                if (!perte) return []

                return perte

            } else {
                var perte = await Admin_Perte.findAll({
                    where: {
                        id_admin,
                        dateFrom: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    include: [Admin_Perte_Categorie, User],
                    attributes: [
                        'id_perte_categorie',
                        [sequelize.fn('sum', sequelize.col('amount')), 'total_amount'],
                    ],
                    group: 'id_perte_categorie'
                })

                if (!perte) return []

                return perte
            }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async GetClient() {
        try {
            var user = await User.findAll()

            return { 'code': 200, 'data': user }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetAllClient({ id_admin, id_user, status_clt, search, usedate, datefrom, dateto, id_team_member_confirmation, _skip, _limit }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

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

        async function GetEarningClient(id_user) {
            var amount = await Client_Payment.sum('amount', {
                where: {
                    id_user: id_user,
                    status: 'accepted'
                }
            })

            return amount ?? 0
        }

        function computeDaysBetweenDates(startDate, endDate) {
            const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

            // Convert the date strings to Date objects
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Calculate the difference in days
            const diffInMilliseconds = Math.abs(end - start);
            const diffInDays = Math.round(diffInMilliseconds / oneDay);

            return diffInDays;
        }

        async function getClientByDefault(id, id_team_member_confirmation, _skip, _limit) {

            var query = {
                where: {
                    ...(id && { id }),
                    ...(id_team_member_confirmation && { id_team_member_confirmation })
                },
                include: [
                    { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                    {
                        model: Subscription, include: [{
                            model: Pack
                        }]
                    }
                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            try {
                var client = await User.findAll(query)
                return client
            } catch (error) {
                console.log('error: ', error)
            }
        }

        async function getClientByStatus(id, id_team_member_confirmation, status, _skip, _limit) {
            const currentDate = new Date();
            const startDate = new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000); // Subtract 15 days

            const twoWeeksAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000); // Subtract 14 days

            const threeMonthAgo = new Date(currentDate.getTime() - 91 * 24 * 60 * 60 * 1000); // Subtract 3 months

            var query_new_innactive = {
                where: {
                    ...(id && { id }),
                    ...(id_team_member_confirmation && { id_team_member_confirmation }),
                    createdAt: {
                        [Op.lte]: startDate
                    }
                },
                include: [
                    { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                    {
                        model: Subscription, include: [{
                            model: Pack
                        }]
                    }
                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var query_new_active = {
                where: {
                    ...(id && { id }),
                    ...(id_team_member_confirmation && { id_team_member_confirmation }),
                    createdAt: {
                        [Op.gte]: startDate
                    }
                },
                include: [
                    { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                    {
                        model: Subscription, include: [{
                            model: Pack
                        }]
                    }
                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var query_innactive = {
                where: {
                    ...(id && { id }),
                    ...(id_team_member_confirmation && { id_team_member_confirmation })
                },
                include: [
                    { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                    {
                        model: Subscription, include: [{
                            model: Pack
                        }]
                    },
                    {
                        model: Order,
                        where: {
                            updatedAt: {
                                [Op.gte]: twoWeeksAgo,
                            },
                        },
                        required: true,
                    },
                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var query_active = {
                where: {
                    ...(id && { id }),
                    ...(id_team_member_confirmation && { id_team_member_confirmation }),
                },
                include: [
                    { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                    {
                        model: Subscription, include: [{
                            model: Pack
                        }]
                    },
                    {
                        model: Order,
                        where: {
                            updatedAt: {
                                [Op.lte]: twoWeeksAgo,
                            },
                        },
                        required: true,
                    },
                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var query_loyal = {
                where: {
                    ...(id && { id }),
                    ...(id_team_member_confirmation && { id_team_member_confirmation })
                },
                include: [
                    { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                    {
                        model: Subscription, include: [{
                            model: Pack
                        }]
                    },
                    {
                        model: Order,
                        where: {
                            createdAt: {
                                [Op.lte]: threeMonthAgo,
                            },
                        },
                        required: true,
                    },
                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var query_unverified = {
                where: {
                    active: false,
                    ...(id && { id }),
                    ...(id_team_member_confirmation && { id_team_member_confirmation })
                },
                include: [
                    { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                    {
                        model: Subscription, include: [{
                            model: Pack
                        }]
                    }
                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var query_favorite = {
                where: {
                    favorite: true,
                    ...(id && { id }),
                    ...(id_team_member_confirmation && { id_team_member_confirmation })
                },
                include: [
                    { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                    {
                        model: Subscription, include: [{
                            model: Pack
                        }]
                    }
                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var query = {
                where: {
                    ...(id && { id }),
                    ...(id_team_member_confirmation && { id_team_member_confirmation })
                },
                include: [
                    { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                    {
                        model: Subscription, include: [{
                            model: Pack
                        }]
                    }
                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            const finalQuery = status === 'All client' ? query :
                status === 'New client active' ? query_new_active :
                    status === 'New client inactive' ? query_new_innactive :
                        status === 'Innactive client' ? query_innactive :
                            status === 'Active client' ? query_active :
                                status === 'Loyal client' ? query_loyal :
                                    status === 'Unverified client' ? query_unverified : query_favorite

            try {
                var client = await User.findAll(finalQuery)

                return client
            } catch (error) {
                console.log('error: ', error)
            }
        }

        async function getClientBySearch(id, id_team_member_confirmation, search, _skip, _limit) {

            var query = {
                where: [
                    {
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation })
                    },
                    sequelize.where(
                        sequelize.fn("concat",
                            sequelize.col("User.fullname"), sequelize.col("User.telephone"),
                            sequelize.col("User.email"),
                        ),
                        { [Op.like]: `%${search}%` }
                    )
                ],
                include: [
                    { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                    {
                        model: Subscription, include: [{
                            model: Pack
                        }]
                    }
                ],
                order: [['createdAt', 'DESC']],
                offset: Number(_skip),
                limit: Number(_limit)
            }

            var client = await User.findAll(query)

            return client
        }

        async function getClientByDate(id, id_team_member_confirmation, datefrom, dateto) {

            var query = {
                where: {
                    ...(id && { id }),
                    ...(id_team_member_confirmation && { id_team_member_confirmation }),
                    createdAt: {
                        [Op.between]: [datefrom, dateto]
                    }
                },
                include: [
                    { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                    {
                        model: Subscription, include: [{
                            model: Pack
                        }]
                    }
                ],
                order: [['createdAt', 'DESC']]
            }

            var order = await User.findAll(query)

            return order
        }

        async function formatStatusClient(id) {
            var new_client_active = await getClientByStatus(id, undefined, 'New client active', 0, 10)
            var new_client_innactive = await getClientByStatus(id, undefined, 'New client inactive', 0, 10)
            var client_innactive = await getClientByStatus(id, undefined, 'Innactive client', 0, 10)
            var client_active = await getClientByStatus(id, undefined, 'Active client', 0, 10)
            var client_loyal = await getClientByStatus(id, undefined, 'Loyal client', 0, 10)
            var client_unverified = await getClientByStatus(id, undefined, 'Unverified client', 0, 10)

            var str_status = new_client_active.length > 0 ? 'new_client_active/' : ''
            str_status += new_client_innactive.length > 0 ? 'new_client_innactive/' : ''
            str_status += client_innactive.length > 0 ? 'client_innactive/' : ''
            str_status += client_active.length > 0 ? 'client_active/' : ''
            str_status += client_loyal.length > 0 ? 'client_loyal/' : ''
            str_status += client_unverified.length > 0 ? 'client_unverified/' : ''

            return str_status
        }

        async function GetLasActivityByClient(id) {
            var order = await Order.findAll({
                where: { id_user: id },
                order: [['updatedAt', 'DESC']],
            })

            if (order.length === 0) return 'never use'

            return timeSince(order[0].createdAt)
        }

        async function getResponseByIdUder(id_user) {
            return await Client_Response.findOne({ where: { id_user } })
        }

        var data = []
        try {

            if (!usedate) {
                var client = (!status_clt && !search) ? await getClientByDefault(id_user, id_team_member_confirmation, _skip, _limit) :
                    status_clt ? await getClientByStatus(id_user, id_team_member_confirmation, status_clt, _skip, _limit) : await getClientBySearch(id_user, id_team_member_confirmation, search, _skip, _limit)

                for (let i = 0; i < client.length; i++) {
                    var confirmation = await this.#findTeamAdminById(client[i].id_team_member_confirmation)

                    data.push({ ...client[i].dataValues, confirmation })
                }

                var columnFound = await Column_Of_User.findAll({
                    where: { active: true }
                })

                var formatedDataArr = []
                for (let i = 0; i < data.length; i++) {
                    var formatedData = {}
                    for (let j = 0; j < columnFound.length; j++) {
                        var value = 'Auncune valeur'
                        switch (columnFound[j].name) {
                            case 'Client id':
                                value = data[i].id
                                break;
                            case 'Name':
                                value = data[i].fullname
                                break;
                            case 'Telephone':
                                value = data[i].telephone
                                break;
                            case 'Pack':
                                value = data[i].Subscriptions[0].Pack.name
                                break;
                            case 'Message':
                                value = data[i].message
                                break;
                            case 'Last activity':
                                value = await GetLasActivityByClient(data[i].id)
                                break;
                            case 'Active':
                                value = data[i].active
                                break;
                            case 'Subscription time':
                                value = timeSince(data[i].createdAt)
                                break;
                            case 'Register date':
                                value = data[i].createdAt.toISOString().slice(0, 10)
                                break;
                            case 'Status':
                                value = await formatStatusClient(data[i].id)
                                break;
                            case 'Total earning':
                                value = await GetEarningClient(data[i].id)
                                break;
                            case 'Team member confirmartion':
                                value = data[i].confirmation
                                break;
                            case 'Favorite':
                                value = data[i].favorite
                                break;
                        }

                        formatedData[columnFound[j].name.replaceAll(' ', '_')] = value

                        formatedData['dayReg'] = computeDaysBetweenDates(data[i].createdAt, new Date())
                        formatedData['Response'] = await getResponseByIdUder(data[i].id)
                        formatedData['Email'] = data[i].email
                    }
                    formatedDataArr.push(formatedData)
                }

                return { 'code': 200, 'data': formatedDataArr }
            } else {
                var client = await getClientByDate(id_user, id_team_member_confirmation, datefrom, dateto)

                for (let i = 0; i < client.length; i++) {
                    var confirmation = await this.#findTeamAdminById(client[i].id_team_member_confirmation)

                    data.push({ ...client[i].dataValues, confirmation })
                }

                var columnFound = await Column_Of_User.findAll({
                    where: { active: true }
                })

                var formatedDataArr = []
                for (let i = 0; i < data.length; i++) {
                    var formatedData = {}
                    for (let j = 0; j < columnFound.length; j++) {
                        var value = 'Auncune valeur'
                        switch (columnFound[j].name) {
                            case 'Client id':
                                value = data[i].id
                                break;
                            case 'Name':
                                value = data[i].fullname
                                break;
                            case 'Telephone':
                                value = data[i].telephone
                                break;
                            case 'Pack':
                                value = data[i].Subscriptions[0].Pack.name
                                break;
                            case 'Message':
                                value = data[i].message
                                break;
                            case 'Last activity':
                                value = await GetLasActivityByClient(data[i].id)
                                break;
                            case 'Active':
                                value = data[i].active
                                break;
                            case 'Subscription time':
                                value = timeSince(data[i].createdAt)
                                break;
                            case 'Register date':
                                value = data[i].createdAt.toISOString().slice(0, 10)
                                break;
                            case 'Status':
                                value = await formatStatusClient(data[i].id)
                                break;
                            case 'Total earning':
                                value = await GetEarningClient(data[i].id)
                                break;
                            case 'Team member confirmartion':
                                value = data[i].confirmation
                                break;
                            case 'Favorite':
                                value = data[i].favorite
                                break;
                        }

                        formatedData[columnFound[j].name.replaceAll(' ', '_')] = value

                        formatedData['dayReg'] = computeDaysBetweenDates(data[i].createdAt, new Date())
                        formatedData['Response'] = await getResponseByIdUder(data[i].id)
                        formatedData['Email'] = data[i].email
                    }
                    formatedDataArr.push(formatedData)
                }

                return { 'code': 200, 'data': formatedDataArr }
            }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetClientDashbord() {
        try {
            var user = await User.findAll({
                include: [Team_Admin]
            })

            return { 'code': 200, 'data': user }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetTeamMemberAsDashbord() {
        try {

            var team_confirmation = await Team_Admin.findAll()

            return { 'code': 200, 'data': { team_confirmation } }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetDashboard({ id_user, id_admin, id_team, status_clt, dateFrom, dateTo, useDate }) {

        var dateFrom = new Date(dateFrom);
        dateFrom.setDate(dateFrom.getDate() + 1);

        var dateTo = new Date(dateTo);
        dateTo.setDate(dateTo.getDate() + 1);

        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        const params = { id_user, id_admin, id_team, status_clt, dateFrom, dateTo, useDate }

        try {
            var costPerLead = await this.getCostPerLead(params)

            var costPerActive = await this.getCostPerActive(params)

            var costPerVerifiedClient = await this.getCostPerVerifiedClient(params)

            var rateLeadPayed = await this.getRateLeadPayed(params)

            var loyalClient = await this.getLoyalClient(params)

            var earningNet = await this.getEarningNet(params)

            var spending = await this.getSpending(params)

            var chffAffaire = await this.getChiffreAffaire(params)

            var orderStatistic = await this.getOrderStatistics(params)

            var clientStatistic = await this.getClientStatistics(params)

            var clientStatisticRate = await this.getClientStatisticsRate(params)

            var orderReport = await this.getOrderReport(params)

            var earningReport = await this.getEarningReport(params)

            var costReport = await this.getCostReport(params)

            if (costPerLead === null || costPerActive === null ||
                costPerVerifiedClient === null || rateLeadPayed === null ||
                loyalClient === null || earningNet === null ||
                spending === null || chffAffaire === null ||
                orderStatistic === null || clientStatistic === null
                || clientStatisticRate === null || orderReport === null
                || earningReport === null || costReport === null)
                return { code: 500, message: 'Internal error, please contact the support' }

            return {
                'code': 200,
                'data': {
                    costPerLead, costPerActive, costPerVerifiedClient, rateLeadPayed,
                    loyalClient, earningNet, spending, chffAffaire, orderStatistic,
                    clientStatistic, clientStatisticRate, orderReport, earningReport,
                    costReport
                }
            }

        } catch (error) {
            console.log(error)
            return { code: 500, message: 'Internal error, please contact the support' }
        }
    }

    // statistic method begin
    static async getCostPerLead({ id_admin, dateFrom, dateTo, useDate }) {

        var tomorrowDate = new Date(dateTo);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        try {
            if (!useDate) {
                var pertes = await Admin_Perte_Categorie.findAll({
                    where: {
                        name: ['Ads', 'Marketing', 'Commercial'],
                        id_admin: id_admin
                    },
                    include: {
                        model: Admin_Perte
                    }
                })

                if (pertes.length == 0) return 0

                // sum of all price of pertes
                var cost = 0
                for (let i = 0; i < pertes.length; i++) {
                    const element = pertes[i].Admin_Pertes

                    var price = element[0] ? element[0].amount : 0

                    cost += price
                }

                var nb_client = await User.count()

                if (nb_client == 0) return 0

                const cost_per_lead = cost / nb_client

                return cost_per_lead.toFixed(2)
            } else {
                // find all pertes categories where name include 'ads'
                var pertes = await Admin_Perte_Categorie.findAll({
                    where: {
                        name: ['Ads', 'Marketing', 'Commercial'],
                        id_admin: id_admin
                    },
                    include: {
                        model: Admin_Perte,
                        createdAt: {
                            [Op.between]: [dateFrom, tomorrowDate]
                        }
                    }
                })

                if (pertes.length == 0) return 0

                // sum of all price of pertes
                var cost = 0
                for (let i = 0; i < pertes.length; i++) {
                    const element = pertes[i].Admin_Pertes

                    var price = element[0] ? element[0].amount : 0

                    cost += price
                }

                var search_params_basic = {
                    where: {
                        createdAt: {
                            [Op.between]: [dateFrom, tomorrowDate]
                        }
                    }
                }

                var nb_client = await User.count(search_params_basic)

                if (!nb_client) return 0

                const cost_per_lead = cost / nb_client

                return cost_per_lead.toFixed(2)
            }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async getCostPerActive({ id_admin, dateFrom, dateTo, useDate }) {

        var tomorrowDate = new Date(dateTo);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        try {
            if (!useDate) {
                var pertes = await Admin_Perte_Categorie.findAll({
                    where: {
                        name: ['Ads', 'Marketing', 'Commercial'],
                        id_admin: id_admin
                    },
                    include: {
                        model: Admin_Perte
                    }
                })

                if (pertes.length == 0) return 0

                // sum of all price of pertes
                var cost = 0
                for (let i = 0; i < pertes.length; i++) {
                    const element = pertes[i].Admin_Pertes

                    var price = element[0] ? element[0].amount : 0

                    cost += price
                }

                var Activeclient = await this.#getActiveClient({ useDate: false, dateFrom: null, dateTo: null })

                if (Activeclient == 0) return 0

                const cost_per_lead = cost / Activeclient

                return cost_per_lead.toFixed(2)
            } else {
                // find all pertes categories where name include 'ads'
                var pertes = await Admin_Perte_Categorie.findAll({
                    where: {
                        name: ['Ads', 'Marketing', 'Commercial'],
                        id_admin: id_admin
                    },
                    include: {
                        model: Admin_Perte,
                        createdAt: {
                            [Op.between]: [dateFrom, tomorrowDate]
                        }
                    }
                })

                if (pertes.length == 0) return 0

                // sum of all price of pertes
                var cost = 0
                for (let i = 0; i < pertes.length; i++) {
                    const element = pertes[i].Admin_Pertes

                    var price = element[0] ? element[0].amount : 0

                    cost += price
                }

                var Activeclient = await this.#getActiveClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                if (Activeclient == 0) return 0

                const cost_per_lead = cost / Activeclient

                return cost_per_lead.toFixed(2)
            }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async getCostPerVerifiedClient({ id_admin, dateFrom, dateTo, useDate }) {

        var tomorrowDate = new Date(dateTo);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        try {
            if (!useDate) {
                var pertes = await Admin_Perte_Categorie.findAll({
                    where: {
                        name: ['Ads', 'Marketing', 'Commercial'],
                        id_admin: id_admin
                    },
                    include: {
                        model: Admin_Perte
                    }
                })

                if (pertes.length == 0) return 0

                // sum of all price of pertes
                var cost = 0
                for (let i = 0; i < pertes.length; i++) {
                    const element = pertes[i].Admin_Pertes

                    var price = element[0] ? element[0].amount : 0

                    cost += price
                }

                var Activeclient = await this.#getInnactiveClient({ useDate: false, dateFrom: null, dateTo: null })

                if (Activeclient == 0) return 0

                const cost_per_lead = cost / Activeclient

                return cost_per_lead.toFixed(2)
            } else {
                // find all pertes categories where name include 'ads'
                var pertes = await Admin_Perte_Categorie.findAll({
                    where: {
                        name: ['Ads', 'Marketing', 'Commercial'],
                        id_admin: id_admin
                    },
                    include: {
                        model: Admin_Perte,
                        createdAt: {
                            [Op.between]: [dateFrom, tomorrowDate]
                        }
                    }
                })

                if (pertes.length == 0) return 0

                // sum of all price of pertes
                var cost = 0
                for (let i = 0; i < pertes.length; i++) {
                    const element = pertes[i].Admin_Pertes

                    var price = element[0] ? element[0].amount : 0

                    cost += price
                }

                var Activeclient = await this.#getInnactiveClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                if (Activeclient == 0) return 0

                const cost_per_lead = cost / Activeclient

                return cost_per_lead.toFixed(2)
            }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async getRateLeadPayed({ id_admin, dateFrom, dateTo, useDate }) {

        var tomorrowDate = new Date(dateTo);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        try {
            if (!useDate) {

                var allClient = await User.count()

                var Activeclient = await this.#getInnactiveClient({ useDate: false, dateFrom: null, dateTo: null })

                if (Activeclient == 0) return 0

                const rateLeadPayed = allClient / (Activeclient * 100)

                return rateLeadPayed.toFixed(2)

            } else {

                var allClient = await User.count({
                    where: {
                        createdAt: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    }
                })

                var Activeclient = await this.#getInnactiveClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                if (Activeclient == 0) return 0

                const rateLeadPayed = allClient / (Activeclient * 100)

                return rateLeadPayed.toFixed(2)

            }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async getLoyalClient({ id_admin, dateFrom, dateTo, useDate }) {

        var tomorrowDate = new Date(dateTo);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        try {
            if (!useDate) {

                var Loyalclient = await this.#getLoyalClient({ useDate: false, dateFrom: null, dateTo: null })

                return Loyalclient

            } else {

                var Loyalclient = await this.#getLoyalClient({ useDate: true, dateFrom: dateFrom, dateTo: tomorrowDate })

                return Loyalclient
            }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async getEarningNet({ id_admin, dateFrom, dateTo, useDate }) {

        var tomorrowDate = new Date(dateTo);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        try {
            if (!useDate) {

                var incomes = await this.#getIncomes({ useDate: false, dateFrom: null, dateTo: null })

                var pertes = await Admin_Perte_Categorie.sum('amount', {
                    where: {
                        id_admin: id_admin
                    },
                    include: {
                        model: Admin_Perte
                    }
                })

                return incomes - pertes

            } else {

                var incomes = await this.#getIncomes({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                var pertes = await Admin_Perte_Categorie.sum('amount', {
                    where: {
                        id_admin: id_admin
                    },
                    include: {
                        model: Admin_Perte,
                        createdAt: {
                            [Op.between]: [dateFrom, tomorrowDate]
                        }
                    }
                })

                return incomes - pertes
            }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async getSpending({ id_admin, dateFrom, dateTo, useDate }) {

        var tomorrowDate = new Date(dateTo);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        try {
            if (!useDate) {

                var pertes = await Admin_Perte_Categorie.sum('amount', {
                    where: {
                        id_admin: id_admin
                    },
                    include: {
                        model: Admin_Perte
                    }
                })

                return pertes ?? 0

            } else {

                var pertes = await Admin_Perte_Categorie.sum('amount', {
                    where: {
                        id_admin: id_admin
                    },
                    include: {
                        model: Admin_Perte,
                        where: {
                            createdAt: {
                                [Op.between]: [dateFrom, tomorrowDate]
                            }
                        }
                    }
                })

                return pertes ?? 0
            }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async getChiffreAffaire({ id_admin, dateFrom, dateTo, useDate }) {

        var tomorrowDate = new Date(dateTo);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        try {
            if (!useDate) {

                var incomes = await this.#getIncomes({ useDate: false, dateFrom: null, dateTo: null })

                return incomes

            } else {

                var incomes = await this.#getIncomes({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                return incomes
            }

        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async getOrderStatistics({ id_admin, dateFrom, dateTo, useDate }) {

        const DELIVRED = ['Livre', 'Paye']
        const CANCELED = ['Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon']
        const PENDING_1 = ['Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison']
        const PENDING_2 = ['Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

        const PENDING = [...PENDING_1, ...PENDING_2]

        try {

            if (!useDate) {

                var search_params = {
                    where: {
                        status: DELIVRED
                    },
                }

                const delivred = await Order.count(search_params)

                search_params = {
                    where: {
                        status: CANCELED
                    },
                }

                const canceled = await Order.count(search_params)

                search_params = {
                    where: {
                        status: PENDING_1
                    },
                }

                const pending = await Order.count(search_params)

                search_params = {
                    where: {
                        status: PENDING_2
                    },
                }

                const pending_injoignable = await Order.count(search_params)

                // sum of all orders
                const total = delivred + canceled + pending + pending_injoignable

                const data = {
                    labels: [
                        "Delivred",
                        "Pending",
                        "Pending(2)",
                        "Cancelled"
                    ],
                    datasets: [
                        {
                            label: "Local",
                            data: [delivred, pending, pending_injoignable, canceled],
                            fill: true,
                            backgroundColor: ["#43A047", "#F68407", "#b4936f", "#E53935"],
                        }
                    ],
                };

                return { data, total }
            } else {

                var search_params = {
                    where: {
                        status: DELIVRED,
                        createdAt: { [Op.between]: [dateFrom, dateTo] }
                    },
                }

                const delivred = await Order.count(search_params)

                search_params = {
                    where: {
                        status: CANCELED,
                        createdAt: { [Op.between]: [dateFrom, dateTo] }
                    },
                }

                const canceled = await Order.count(search_params)

                search_params = {
                    where: {
                        status: PENDING,
                        createdAt: { [Op.between]: [dateFrom, dateTo] }
                    },
                }

                const pending = await Order.count(search_params)

                search_params = {
                    where: {
                        status: PENDING_2,
                        createdAt: { [Op.between]: [dateFrom, dateTo] }
                    },
                }

                const pending_injoignable = await Order.count(search_params)

                // sum of all orders
                const total = delivred + canceled + pending + pending_injoignable

                const data = {
                    labels: [
                        "Delivred",
                        "Pending",
                        "Pending(2)",
                        "Cancelled"
                    ],
                    datasets: [
                        {
                            label: "Local",
                            data: [delivred, pending, pending_injoignable, canceled],
                            fill: true,
                            backgroundColor: ["#43A047", "#F68407", "#b4936f", "#E53935"],
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

    static async getClientStatistics({ id_admin, dateFrom, dateTo, useDate }) {

        try {

            if (!useDate) {

                const newActive = await this.#getNewActiveClient({ useDate: false, dateFrom: null, dateTo: null })

                const newInnactive = await this.#getNewInnactiveClient({ useDate: false, dateFrom: null, dateTo: null })

                const innactive = await this.#getInnactiveClient({ useDate: false, dateFrom: null, dateTo: null })

                const active = await this.#getActiveClient({ useDate: false, dateFrom: null, dateTo: null })

                const loyal = await this.#getLoyalClient({ useDate: false, dateFrom: null, dateTo: null })

                const unverified = await this.#getUnverifiedClient({ useDate: false, dateFrom: null, dateTo: null })

                // sum of all orders
                const total = newActive + newInnactive + innactive + active + loyal + unverified

                const data = {
                    labels: [
                        "New active",
                        "New innactive",
                        "Innactive",
                        "Active",
                        "Loyal",
                        "Unverified"
                    ],
                    datasets: [
                        {
                            label: "Local",
                            data: [newActive, newInnactive, innactive, active, loyal, unverified],
                            fill: true,
                            backgroundColor: ["#43A047", "#F68407", "#b4936f", "#E53935", "#43A047", "#F68407"],
                        }
                    ],
                };

                return { data, total }
            } else {

                const newActive = await this.#getNewActiveClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                const newInnactive = await this.#getNewInnactiveClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                const innactive = await this.#getInnactiveClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                const active = await this.#getActiveClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                const loyal = await this.#getLoyalClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                const unverified = await this.#getUnverifiedClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                // sum of all orders
                const total = newActive + newInnactive + innactive + active + loyal + unverified

                const data = {
                    labels: [
                        "New active",
                        "New innactive",
                        "Innactive",
                        "Active",
                        "Loyal",
                        "Unverified"
                    ],
                    datasets: [
                        {
                            label: "Local",
                            data: [newActive, newInnactive, innactive, active, loyal, unverified],
                            fill: true,
                            backgroundColor: ["#43A047", "#F68407", "#b4936f", "#E53935", "#43A047", "#F68407"],
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

    static async getClientStatisticsRate({ id_admin, dateFrom, dateTo, useDate }) {

        try {

            if (!useDate) {

                var newActive = await this.#getNewActiveClient({ useDate: false, dateFrom: null, dateTo: null })

                var newInnactive = await this.#getNewInnactiveClient({ useDate: false, dateFrom: null, dateTo: null })

                var innactive = await this.#getInnactiveClient({ useDate: false, dateFrom: null, dateTo: null })

                var active = await this.#getActiveClient({ useDate: false, dateFrom: null, dateTo: null })

                var loyal = await this.#getLoyalClient({ useDate: false, dateFrom: null, dateTo: null })

                var unverified = await this.#getUnverifiedClient({ useDate: false, dateFrom: null, dateTo: null })

                // sum of all orders
                var total = newActive + newInnactive + innactive + active + loyal + unverified

                newActive = (newActive * 100) / total
                newInnactive = (newInnactive * 100) / total
                innactive = (innactive * 100) / total
                active = (active * 100) / total
                loyal = (loyal * 100) / total
                unverified = (unverified * 100) / total

                const data = {
                    labels: [
                        "New active",
                        "New innactive",
                        "Innactive",
                        "Active",
                        "Loyal",
                        "Unverified"
                    ],
                    datasets: [
                        {
                            label: "Local",
                            data: [newActive, newInnactive, innactive, active, loyal, unverified],
                            fill: true,
                            backgroundColor: ["#43A047", "#F68407", "#b4936f", "#E53935", "#43A047", "#F68407"],
                        }
                    ],
                };

                return { data, total }
            } else {

                var newActive = await this.#getNewActiveClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                var newInnactive = await this.#getNewInnactiveClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                var innactive = await this.#getInnactiveClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                var active = await this.#getActiveClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                var loyal = await this.#getLoyalClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                var unverified = await this.#getUnverifiedClient({ useDate: true, dateFrom: dateFrom, dateTo: dateTo })

                // sum of all orders
                const total = newActive + newInnactive + innactive + active + loyal + unverified

                newActive = (newActive * 100) / total
                newInnactive = (newInnactive * 100) / total
                innactive = (innactive * 100) / total
                active = (active * 100) / total
                loyal = (loyal * 100) / total
                unverified = (unverified * 100) / total

                const data = {
                    labels: [
                        "New active",
                        "New innactive",
                        "Innactive",
                        "Active",
                        "Loyal",
                        "Unverified"
                    ],
                    datasets: [
                        {
                            label: "Local",
                            data: [newActive, newInnactive, innactive, active, loyal, unverified],
                            fill: true,
                            backgroundColor: ["#43A047", "#F68407", "#b4936f", "#E53935", "#43A047", "#F68407"],
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

    static async getOrderReport({ id_admin, id_user, id_team, dateFrom, dateTo, useDate }) {

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

        async function getReportByDays(days, endDate, status, id_team) {

            var search_params_basic = {
                where: {
                    ...(id_user && { id_user }),
                    ...(id_team && { id_team }),
                    status: status
                },
                group: ['date'],
                attributes: ['date', [sequelize.fn('COUNT', sequelize.col('date')), 'count']]
            }

            var orders = await Order.findAll(search_params_basic)

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

        async function getReportByWeek(startDate, endDate, status, id_team) {

            startDate = new Date(startDate)
            endDate = new Date(endDate)

            var query = `
                        SELECT
                            CONCAT(YEAR(date), '/', WEEK(date)) AS week_name, 
                            YEAR(date) as year , WEEK(date) as week_num, COUNT(*) as count
                        FROM
                            Orders
                        WHERE
                            date BETWEEN :startDate AND :endDate
                        AND
                            (:id_user IS NULL OR id_user = :id_user)
                        AND
                            (:id_team IS NULL OR id_team = :id_team)
                        AND
                            status IN (:status)
                        GROUP BY
                            week_name
                        ORDER BY YEAR(DATE) ASC, WEEK(date) ASC
                    `

            try {
                const result = await seqlz.query(query, {
                    replacements: { startDate, endDate, id_user: id_user ?? null, status, id_team: id_team ?? null },
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

        async function getReportByMonth(startDate, endDate, status, id_team) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)

            var query = `
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
                            (:id_user IS NULL OR id_user = :id_user)
                        AND
                            status IN (:status)
                        GROUP BY
                            month_name
                        ORDER BY YEAR(DATE) ASC, MONTH(date) ASC
                    `

            try {
                const result = await seqlz.query(query, {
                    replacements: { startDate, endDate, id_user: id_user ?? null, status, id_team: id_team ?? null },
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

                const delivred = await getReportByDays(7, new Date(), DELIVRED, id_team)
                const canceled = await getReportByDays(7, new Date(), CANCELED, id_team)
                const pending = await getReportByDays(7, new Date(), PENDING, id_team)

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
                    const delivred = await getReportByDays(differenceInDays, new Date(dateTo), DELIVRED, id_team)
                    const canceled = await getReportByDays(differenceInDays, new Date(dateTo), CANCELED, id_team)
                    const pending = await getReportByDays(differenceInDays, new Date(dateTo), PENDING, id_team)

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

                    const delivred = await getReportByWeek(dateFrom, dateTo, DELIVRED, id_team)
                    const canceled = await getReportByWeek(dateFrom, dateTo, CANCELED, id_team)
                    const pending = await getReportByWeek(dateFrom, dateTo, PENDING, id_team)

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

                    const delivred = await getReportByMonth(dateFrom, dateTo, DELIVRED, id_team)
                    const canceled = await getReportByMonth(dateFrom, dateTo, CANCELED, id_team)
                    const pending = await getReportByMonth(dateFrom, dateTo, PENDING, id_team)

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

    static async getEarningReport({ id_user, id_team, dateFrom, dateTo, useDate }) {

        function getWeekStart(dateStr) {
            const date = new Date(dateStr);
            const dayOfWeek = date.getDay();
            const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const weekStart = new Date(date.setDate(diff));
            return weekStart.toISOString().split('T')[0];
        }

        function groupByWeek(data) {
            const result = [];

            let currentWeekStart = '';
            let currentWeekSum = 0;

            for (let i = 0; i < data.length; i++) {
                const { date, sum } = data[i];
                const weekStart = getWeekStart(date);

                if (weekStart !== currentWeekStart) {
                    if (currentWeekStart !== '') {
                        result.push({ date: currentWeekStart, sum: currentWeekSum });
                    }

                    currentWeekStart = weekStart;
                    currentWeekSum = sum;
                } else {
                    currentWeekSum += sum;
                }
            }

            // Add the last week's sum to the result
            if (currentWeekStart !== '') {
                result.push({ date: currentWeekStart, sum: currentWeekSum });
            }

            return result;
        }

        function getMonthStart(dateStr) {
            const [year, month] = dateStr.split('-');
            return `${year}-${month}-01`;
        }

        function groupByMonth(data) {
            const result = [];

            let currentMonthStart = '';
            let currentMonthSum = 0;

            for (let i = 0; i < data.length; i++) {
                const { date, sum } = data[i];
                const monthStart = getMonthStart(date);

                if (monthStart !== currentMonthStart) {
                    if (currentMonthStart !== '') {
                        result.push({ date: currentMonthStart, sum: currentMonthSum });
                    }

                    currentMonthStart = monthStart;
                    currentMonthSum = sum;
                } else {
                    currentMonthSum += sum;
                }
            }

            // Add the last month's sum to the result
            if (currentMonthStart !== '') {
                result.push({ date: currentMonthStart, sum: currentMonthSum });
            }

            return result;
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

        async function getIncomesReport(days, endDate) {

            var search_params_basic = {
                where: { status: 'pending' },
                group: [sequelize.literal('DATE(createdAt)')],
                attributes: [
                    [sequelize.literal('DATE(createdAt)'), 'date'],
                    [sequelize.fn('SUM', sequelize.col('amount')), 'sum']
                ]
            };

            var payment = await Client_Payment.findAll(search_params_basic)

            if (payment.length == 0) return 0

            // format array to {date: 0}
            var orders_date = []
            for (let i = 0; i < payment.length; i++) {
                const element = payment[i]

                var date = element.dataValues.date

                orders_date.push({ date: date, sum: element.dataValues.sum })
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

            // return last7Days_date
            return last7Days_date
        }

        async function getExpensesReport(days, endDate) {

            var search_params_basic = {
                group: [sequelize.literal('DATE(createdAt)')],
                attributes: [
                    [sequelize.literal('DATE(createdAt)'), 'date'],
                    [sequelize.fn('SUM', sequelize.col('amount')), 'sum']
                ]
            };

            var payment = await Admin_Perte.findAll(search_params_basic)

            if (payment.length == 0) return 0

            // format array to {date: 0}
            var orders_date = []
            for (let i = 0; i < payment.length; i++) {
                const element = payment[i]

                var date = element.dataValues.date

                orders_date.push({ date: date, sum: element.dataValues.sum })
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

            // return last7Days_date
            return last7Days_date
        }

        async function getIncomesReportByDays(days, endDate) {
            return await getIncomesReport(days, endDate)
        }

        async function getIncomesReportByWeek(days, endDate) {
            return groupByWeek(await getIncomesReport(days, endDate))
        }

        async function getIncomesReportByMonth(days, endDate) {
            return groupByMonth(await getIncomesReport(days, endDate))
        }

        async function getExpensesReportByDays(days, endDate) {
            return await getExpensesReport(days, endDate)
        }

        async function getExpensesReportByWeek(days, endDate) {
            return groupByWeek(await getExpensesReport(days, endDate))
        }

        async function getExpensesReportByMonth(days, endDate) {
            return groupByMonth(await getExpensesReport(days, endDate))
        }

        try {
            if (!useDate) {
                var dates = getLastDays(7, new Date())
                var formatedDate = dates.map(date => date.toISOString().slice(0, 10))

                const incomes = await getIncomesReportByDays(7, new Date(), id_team)
                const expenses = await getExpensesReportByDays(7, new Date(), id_team)

                var data = {
                    labels: formatedDate.reverse(),
                    datasets: [
                        {
                            label: 'Incomes',
                            data: incomes ? incomes.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        },
                        {
                            label: 'Expenses',
                            data: expenses ? expenses.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
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
                    const incomes = await getIncomesReportByDays(differenceInDays, new Date(dateTo), id_team)
                    const expenses = await getExpensesReportByDays(differenceInDays, new Date(dateTo), id_team)

                    var data = {
                        labels: formatedDate.reverse(),
                        datasets: [
                            {
                                label: 'Incomes',
                                data: incomes ? incomes.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Expenses',
                                data: expenses ? expenses.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                } else if (differenceInDays < 90) {

                    const incomes = await getIncomesReportByWeek(differenceInDays, dateTo)
                    const expenses = await getExpensesReportByWeek(differenceInDays, dateTo)

                    var data = {
                        labels: incomes ? incomes.map(item => item.date).reverse() : [],
                        datasets: [
                            {
                                label: 'Incomes',
                                data: incomes ? incomes.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Expenses',
                                data: expenses ? expenses.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                } else {
                    const incomes = await getIncomesReportByMonth(differenceInDays, dateTo)
                    const expenses = await getExpensesReportByMonth(differenceInDays, dateTo)

                    var data = {
                        labels: incomes ? incomes.map(item => item.date).reverse() : [],
                        datasets: [
                            {
                                label: 'Incomes',
                                data: incomes ? incomes.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Expenses',
                                data: expenses ? expenses.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
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

    static async getCostReport({ id_user, id_team, dateFrom, dateTo, useDate }) {

        function getWeekStart(dateStr) {
            const date = new Date(dateStr);
            const dayOfWeek = date.getDay();
            const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const weekStart = new Date(date.setDate(diff));
            return weekStart.toISOString().split('T')[0];
        }

        function groupByWeek(data) {
            const result = [];

            let currentWeekStart = '';
            let currentWeekSum = 0;

            for (let i = 0; i < data.length; i++) {
                const { date, sum } = data[i];
                const weekStart = getWeekStart(date);

                if (weekStart !== currentWeekStart) {
                    if (currentWeekStart !== '') {
                        result.push({ date: currentWeekStart, sum: currentWeekSum });
                    }

                    currentWeekStart = weekStart;
                    currentWeekSum = sum;
                } else {
                    currentWeekSum += sum;
                }
            }

            // Add the last week's sum to the result
            if (currentWeekStart !== '') {
                result.push({ date: currentWeekStart, sum: currentWeekSum });
            }

            return result;
        }

        function getMonthStart(dateStr) {
            const [year, month] = dateStr.split('-');
            return `${year}-${month}-01`;
        }

        function groupByMonth(data) {
            const result = [];

            let currentMonthStart = '';
            let currentMonthSum = 0;

            for (let i = 0; i < data.length; i++) {
                const { date, sum } = data[i];
                const monthStart = getMonthStart(date);

                if (monthStart !== currentMonthStart) {
                    if (currentMonthStart !== '') {
                        result.push({ date: currentMonthStart, sum: currentMonthSum });
                    }

                    currentMonthStart = monthStart;
                    currentMonthSum = sum;
                } else {
                    currentMonthSum += sum;
                }
            }

            // Add the last month's sum to the result
            if (currentMonthStart !== '') {
                result.push({ date: currentMonthStart, sum: currentMonthSum });
            }

            return result;
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

        function expensesByClient(expenses, clients) {
            var result = []
            for (let i = 0; i < expenses.length; i++) {

                const expense = expenses[i];
                const client = clients[i];

                if (client.sum == 0)
                    result.push({
                        date: expense.date,
                        sum: 0
                    })
                else
                    result.push({
                        date: expense.date,
                        sum: (expense.sum / client.sum)
                    })
            }

            return result
        }


        async function getExpensesReport(days, endDate) {

            var query = {
                include: [{
                    model: Admin_Perte_Categorie,
                    where: {
                        name: ['Ads', 'Marketing', 'Commercial']
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
            }

            var pertes = await Admin_Perte.findAll(query)

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

            // return last7Days_date
            return last7Days_date
        }


        async function getClientReport(days, endDate) {

            var query = {
                group: [sequelize.literal('DATE(createdAt)')],
                attributes: [
                    [sequelize.literal('DATE(createdAt)'), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('createdAt')), 'count']
                ]
            };

            var clients = await User.findAll(query)

            if (clients.length == 0) return 0

            // format array to {date: 0}
            var orders_date = []
            for (let i = 0; i < clients.length; i++) {
                const element = clients[i]

                var date = element.dataValues.date

                orders_date.push({ date: date, count: element.dataValues.count })
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
                        element.count = order.count
                    }
                }
            }

            // return last7Days_date
            return last7Days_date
        }

        async function getVerifiedClientReport(days, endDate) {

            var query = {
                where: {
                    active: true,
                },
                group: [sequelize.literal('DATE(createdAt)')],
                attributes: [
                    [sequelize.literal('DATE(createdAt)'), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('createdAt')), 'count']
                ]
            };

            var clients = await User.findAll(query)

            if (clients.length == 0) return 0

            // format array to {date: 0}
            var orders_date = []
            for (let i = 0; i < clients.length; i++) {
                const element = clients[i]

                var date = element.dataValues.date

                orders_date.push({ date: date, count: element.dataValues.count })
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
                        element.count = order.count
                    }
                }
            }

            // return last7Days_date
            return last7Days_date
        }

        async function getActiveClientReport(days, endDate) {

            const currentDate = new Date();
            const twoWeeksAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000); // Subtract 14 days

            var query = {
                include: [
                    {
                        model: Order,
                        where: {
                            createdAt: {
                                [Op.gte]: twoWeeksAgo,
                            },
                        },
                        required: true,
                        attributes: []
                    },
                ],
                where: {
                    active: true,
                },
                group: [sequelize.literal('DATE(User.createdAt)')],
                attributes: [
                    [sequelize.literal('DATE(User.createdAt)'), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('User.createdAt')), 'count']
                ]
            };

            var clients = await User.findAll(query)

            if (clients.length == 0) return []

            // format array to {date: 0}
            var orders_date = []
            for (let i = 0; i < clients.length; i++) {
                const element = clients[i]

                var date = element.dataValues.date

                orders_date.push({ date: date, count: element.dataValues.count })
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
                        element.count = order.count
                    }
                }
            }

            // return last7Days_date
            return last7Days_date
        }


        async function getCostPerLeadReport(days, endDate) {
            var expenses = await getExpensesReport(days, endDate)
            var clients = await getClientReport(days, endDate)

            if (expenses.length !== clients.length) return null

            var result = expensesByClient(expenses, clients)

            return result
        }

        async function getCostPerVerifiedClientReport(days, endDate) {
            var expenses = await getExpensesReport(days, endDate)
            var clients = await getVerifiedClientReport(days, endDate)

            if (expenses.length !== clients.length) return null

            var result = expensesByClient(expenses, clients)

            return result
        }

        async function getCostPerActiveClientReport(days, endDate) {
            var expenses = await getExpensesReport(days, endDate)
            var clients = await getActiveClientReport(days, endDate)

            if (expenses.length !== clients.length) return null

            var result = expensesByClient(expenses, clients)

            return result
        }


        async function getCostperLeadReportByDays(days, endDate) {
            return await getCostPerLeadReport(days, endDate)
        }

        async function getCostperLeadReportByWeek(days, endDate) {
            return groupByWeek(await getCostPerLeadReport(days, endDate))
        }

        async function getCostperLeadReportByMonth(days, endDate) {
            return groupByMonth(await getCostPerLeadReport(days, endDate))
        }


        async function getCostperActiveClientReportByDays(days, endDate) {
            return await getCostPerActiveClientReport(days, endDate)
        }

        async function getCostperActiveClientReportByWeek(days, endDate) {
            var q = await getCostPerActiveClientReport(days, endDate)
            if (!q) return null

            return groupByWeek(q)
        }

        async function getCostperActiveClientReportByMonth(days, endDate) {
            var q = await getCostPerActiveClientReport(days, endDate)
            if (!q) return null

            return groupByMonth(q)
        }


        async function getCostPerVerifiedClientReportByDays(days, endDate) {
            return await getCostPerVerifiedClientReport(days, endDate)
        }

        async function getCostPerVerifiedClientReportByWeek(days, endDate) {
            return groupByWeek(await getCostPerVerifiedClientReport(days, endDate))
        }

        async function getCostPerVerifiedClientReportByMonth(days, endDate) {
            return groupByMonth(await getCostPerVerifiedClientReport(days, endDate))
        }

        try {
            if (!useDate) {
                var dates = getLastDays(7, new Date())
                var formatedDate = dates.map(date => date.toISOString().slice(0, 10))

                const costPerLead = await getCostperLeadReportByDays(7, new Date(), id_team)
                const costPerVerifiedClient = await getCostPerVerifiedClientReportByDays(7, new Date(), id_team)
                const costPerActiveClient = await getCostperActiveClientReportByDays(7, new Date(), id_team)

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
                            label: 'Cost per verified client',
                            data: costPerVerifiedClient ? costPerVerifiedClient.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        },
                        {
                            label: 'Cost per active client',
                            data: costPerActiveClient ? costPerActiveClient.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
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
                    const costPerLead = await getCostperLeadReportByDays(differenceInDays, new Date(dateTo), id_team)
                    const costPerVerifiedClient = await getCostPerVerifiedClientReportByDays(differenceInDays, new Date(dateTo), id_team)
                    const costPerActiveClient = await getCostperActiveClientReportByDays(differenceInDays, new Date(dateTo), id_team)

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
                                label: 'Cost per verified client',
                                data: costPerVerifiedClient ? costPerVerifiedClient.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Cost per active client',
                                data: costPerActiveClient ? costPerActiveClient.map(item => item.sum).reverse() : Array(formatedDate.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                } else if (differenceInDays < 90) {

                    const costPerLead = await getCostperLeadReportByWeek(differenceInDays, dateTo)
                    const costPerVerifiedClient = await getCostPerVerifiedClientReportByWeek(differenceInDays, dateTo)
                    const costPerActiveClient = await getCostperActiveClientReportByWeek(differenceInDays, dateTo)

                    var data = {
                        labels: costPerLead ? costPerLead.map(item => item.date).reverse() : [],
                        datasets: [
                            {
                                label: 'Cost per lead',
                                data: costPerLead ? costPerLead.map(item => item.sum).reverse() : Array(costPerLead.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Cost per verified client',
                                data: costPerVerifiedClient ? costPerVerifiedClient.map(item => item.sum).reverse() : Array(costPerLead.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Cost per active client',
                                data: costPerActiveClient ? costPerActiveClient.map(item => item.sum).reverse() : Array(costPerLead.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            }
                        ]
                    }

                    return data
                } else {
                    const costPerLead = await getCostperLeadReportByMonth(differenceInDays, dateTo)
                    const costPerVerifiedClient = await getCostPerVerifiedClientReportByMonth(differenceInDays, dateTo)
                    const costPerActiveClient = await getCostperActiveClientReportByMonth(differenceInDays, dateTo)

                    var data = {
                        labels: costPerLead ? costPerLead.map(item => item.date).reverse() : [],
                        datasets: [
                            {
                                label: 'Cost per lead',
                                data: costPerLead ? costPerLead.map(item => item.sum).reverse() : Array(costPerLead.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Cost per verified client',
                                data: costPerVerifiedClient ? costPerVerifiedClient.map(item => item.sum).reverse() : Array(costPerLead.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'Cost per active client',
                                data: costPerActiveClient ? costPerActiveClient.map(item => item.sum).reverse() : Array(costPerLead.length).fill(0),
                                fill: false,
                                borderColor: 'rgb(75, 192, 192)',
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
    // statistic method end

    static async PatchClient({ id, prev_id_team, id_team_member_confirmation, message, active, favorite }) {
        const transaction = await seqlz.transaction(); // Assuming you're using Sequelize as your ORM
        var isExist = await this.#findClientById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.id_team_member_confirmation = id_team_member_confirmation ?? isExist.id_team_member_confirmation
        isExist.message = message ?? isExist.message
        isExist.active = active ?? isExist.active
        isExist.favorite = favorite ?? isExist.favorite

        if (prev_id_team) {
            if (prev_id_team != id_team_member_confirmation) {

                var prev_team = await Team_Admin.findOne({
                    where: {
                        id: prev_id_team
                    }
                })
                prev_team.nb_order = prev_team.nb_order - 1

                var new_team = await Team_Admin.findOne({
                    where: {
                        id: id_team_member_confirmation
                    }
                })

                if (new_team.nb_order >= new_team.max_order) throw { code: 400, message: 'This team member has reached its maximum number of orders' }
                if (!new_team.active) throw { code: 400, message: 'This team member is not active' }

                new_team.nb_order = new_team.nb_order + 1

                await new_team.save({ transaction })
                await prev_team.save({ transaction })
            }
        }

        try {
            var ClientPatched = await isExist.save({ transaction })

            await transaction.commit();
            return { 'code': 200, 'data': ClientPatched }

        } catch (error) {
            await transaction.rollback();
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AddClient({ fullname, plainPassword, email, telephone, role, id_admin, message }) {
        const transaction = await seqlz.transaction(); // Assuming you're using Sequelize as your ORM

        var password = await this.#hashPassword(plainPassword)
        var reference = uuidv4()

        var active = false

        var isExitstContact = await this.#findClientByTelephone(telephone)
        if (isExitstContact) return { code: 400, message: 'This contact is already used' }

        var isExitstEmail = await this.#findClientByEmail(email)
        if (isExitstEmail) return { code: 400, message: 'This email is already used' }

        var settingAdmin = this.#findSettingAdminById(1)

        try {
            var team_user = await this.#SearchAvailableTeam({ current_id_team: null })

            var id_team = null
            if (team_user) {
                var random = Math.floor(Math.random() * team_user.length)
                id_team = team_user[random].id
                team_user[random].nb_order = team_user[random].nb_order + 1

                await team_user[random].save({ transaction })
            }

            var client = User.build({ reference, fullname, password, email, telephone, role, id_admin, active, message, id_team_member_confirmation: id_team, step: 'question' })

            var clientSaved = await client.save({ transaction });

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

            await Column_Of_Order.bulkCreate(columnOfOrderData, { transaction })

            var setting = Setting_User.build({
                default_cof_ricing: settingAdmin.default_conf_pricing, delfaulnpt_del_pricing: settingAdmin.delfault_del_pricing,
                default_time: settingAdmin.default_time, automated_msg: settingAdmin.automated_msg, id_user: clientSaved.id
            })

            setting.save({ transaction });

            const PerteData = [
                { 'name': 'Facebook ads', 'id_user': clientSaved.id },
                { 'name': 'Tiktok ads', 'id_user': clientSaved.id },
                { 'name': 'Google ads', 'id_user': clientSaved.id },
                { 'name': 'Design', 'id_user': clientSaved.id },
                { 'name': 'Landing page', 'id_user': clientSaved.id },
                { 'name': 'Autre', 'id_user': clientSaved.id }
            ]

            await Perte_Categorie.bulkCreate(PerteData, { transaction })

            const STATUS = ['Livre', 'Paye', 'Annule confirmation', 'Annule livraison', 'Annule', 'Refuse', 'Hors zone', 'Double', 'Errone', 'Retourne', 'Brouillon', 'Nouveau', 'Reporte', 'A revoir', 'Reclame', 'Confirme', 'Expedie livraison', 'Injoignable 1', 'Injoignable 2', 'Injoignable 3', 'Injoignable 3, SMS', 'Injoignable 4', 'Injoignable 4, SMS', 'Boite vocal 1', 'Boite vocal 2', 'Occupe 1', 'Occupe 2', 'Injoignable livraison']

            const StatusData = STATUS.map(statusName => ({ 'name': statusName, 'checked': true, 'id_user': clientSaved.id }));

            await Status_User.bulkCreate(StatusData)

            const date = this.#GetDateFormat()
            var subscription = await Subscription.build({ date_subscription: date[0], date_expiration: date[1], id_pack: 1, id_user: clientSaved.id })
            await subscription.save({ transaction });

            await Client_Account.build({ id_user: clientSaved.id, solde: 0, montant_du: 0 }).save({ transaction })


            if (clientSaved.dataValues) {
                await transaction.commit();
                const token = jwt.sign(clientSaved.dataValues, process.env.SECRET_TOKEN)
                return { 'code': 200, 'token': token, 'user': clientSaved.dataValues }
            }

        } catch (error) {
            await transaction.rollback();
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async ChangePasswordClient({ id_admin, id_user, plainPassword }) {

        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {

            var client = await User.findOne({
                where: { id: id_user }
            })
            if (!client) throw { code: 404, message: 'User not found' }

            var password = await this.#hashPassword(plainPassword)

            client.password = password

            await client.save()

            return { 'code': 200, message: 'Password is edited' }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async AddPaymentMethod({ id_admin, name, image }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        const bank = await this.#AddBankInformation({ name: 'xxxx', rib: 'xxxx-xxxx-xxxx-xxxx', bank: 'xxxx', id_admin })

        var paymentMethod = await Payment_Method.build({ id_admin, name, image, id_bank_informations: bank.data.id })

        try {
            var paymentMethodSaved = await paymentMethod.save();
            return { 'code': 200, 'data': paymentMethodSaved }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RemovePaymentMethod({ id }) {
        var isExist = await this.#findPaymentMethodById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var paymentMethodDestroyed = await isExist.destroy()
            return { 'code': 200, 'data': paymentMethodDestroyed }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetPaymentMethod({ id_admin }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var paymentMethod = await Payment_Method.findAll({
                include: [Bank_Information]
            })

            return { 'code': 200, 'data': paymentMethod }

        } catch (error) {
            console.log('error: ', error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetBankInformation() {
        try {
            var page = await Bank_Information.findOne({
                where: { id: 2 }
            })

            return { 'code': 200, 'data': page }
        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async #AddBankInformation({ name, bank, rib, id_admin }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var bankInformation = await Bank_Information.build({ name, bank, rib })

        try {
            var bankInformationSaved = await bankInformation.save();
            return { 'code': 200, 'data': bankInformationSaved }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async PatchBankInformation({ name, bank, rib, id }) {
        var isExist = await this.#findBankInformationById(id)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExist.name = name ?? isExist.name
        isExist.bank = bank ?? isExist.bank
        isExist.rib = rib ?? isExist.rib

        try {
            var cityPatched = await isExist.save()
            return { 'code': 200, 'data': cityPatched }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetPaymentClient({ id_admin, status }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        try {
            var paymentClient = await Client_Payment.findAll({
                where: {
                    ...(status && { status })
                },
                include: [
                    {
                        model: User, include: [
                            {
                                model: Subscription, include: [
                                    { model: Pack }
                                ]
                            }
                        ]
                    },
                ]
            })

            return { 'code': 200, 'data': paymentClient }

        } catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async AcceptPaymentClient({ id, id_admin }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var isExistPayment = await this.#findPaymentClientById(id)
        if (!isExistPayment) return { code: 404, message: 'This ressource doesn\'t exist' }

        var account = await this.#findAccountById(isExistPayment.id_user)

        if (!account) return { code: 404, message: 'This ressource doesn\'t exist' }

        account.solde += isExistPayment.amount
        var montant_du = account.montant_du

        if (account.solde >= montant_du) {
            account.montant_du = 0
            account.solde -= montant_du
            await account.save()
        } else {
            await account.save()
        }

        isExistPayment.status = 'accepted'

        try {

            var paymentClientPatched = await isExistPayment.save()
            return { 'code': 200, 'data': paymentClientPatched }

        }
        catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async RefusePaymentClient({ id, id_admin }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var isExistPayment = await this.#findPaymentClientById(id)
        if (!isExistPayment) return { code: 404, message: 'This ressource doesn\'t exist' }

        isExistPayment.status = 'refused'

        try {
            var paymentClientPatched = await isExistPayment.save()
            return { 'code': 200, 'data': paymentClientPatched }

        }
        catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async ReloadClientAccount({ id_user, amount, id_admin }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        var account = await this.#findAccountById(id_user)

        if (!account) return { code: 404, message: 'This ressource doesn\'t exist' }

        account.solde += amount
        var montant_du = account.montant_du

        if (account.solde >= montant_du) {
            account.montant_du = 0
            account.solde -= montant_du
            await account.save()
        } else {
            await account.save()
        }

        try {
            var accountReloaded = await account.save()
            return { 'code': 200, 'data': accountReloaded }

        }
        catch (error) {
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetTeamDashboard({ id_admin, id, id_team_member_confirmation, useDate, dateFrom, dateTo, id_shipping }) {
        var isExist = await this.#findAdminById(id_admin)
        if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

        if (!Number(id_team_member_confirmation)) {
            try {

                var performance = await this.GetTeamPerformance({ id, id_team_member_confirmation: null, useDate, dateFrom, dateTo })
                var earning_table = await this.GetAllTeamEarningTable({ id, id_team_member_confirmation, useDate, dateFrom, dateTo })
                var shipping_earning_table = await this.GetShippingEarningTable({ id: id_shipping, useDate, dateFrom, dateTo })
                

                if (!performance || !earning_table || !shipping_earning_table) return { code: 500, message: 'Internal server error' }

                const data = {
                    performance,
                    earning_table,
                    shipping_earning_table
                }

                return { code: 200, data }

            } catch (err) {
                console.log(err)
                return { code: 500, message: 'Internal server error' }
            }
        }

        try {

            var performance = await this.GetTeamPerformance({ id, id_team_member_confirmation, useDate, dateFrom, dateTo })
            var earning_table = await this.GetTeamEarningTable({ id, id_team_member_confirmation, useDate, dateFrom, dateTo })

            if (!performance || !earning_table) return { code: 500, message: 'Internal server error' }

            const data = {
                performance,
                earning_table
            }

            return { code: 200, data }

        } catch (err) {
            console.log(err)
            return { code: 500, message: 'Internal server error' }
        }
    }

    static async GetTeamPerformance({ id, id_team_member_confirmation, useDate, dateFrom, dateTo }) {
        const clientStatus = [
            'New client active',
            'New client inactive',
            'Innactive client',
            'Active client',
            'Loyal client',
            'Unverified client',
            'Favorite client',
        ]

        try {
            if (!useDate) {

                const currentDate = new Date();
                const startDate = new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000); // Subtract 15 days

                const twoWeeksAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000); // Subtract 14 days

                const threeMonthAgo = new Date(currentDate.getTime() - 91 * 24 * 60 * 60 * 1000); // Subtract 3 months

                var query_new_innactive = {
                    where: {
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation }),
                        createdAt: {
                            [Op.lte]: startDate
                        }
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var query_new_active = {
                    where: {
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation }),
                        createdAt: {
                            [Op.gte]: startDate
                        }
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var query_innactive = {
                    where: {
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation })
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        },
                        {
                            model: Order,
                            where: {
                                createdAt: {
                                    [Op.gte]: twoWeeksAgo,
                                },
                            },
                            required: true,
                        },
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var query_active = {
                    where: {
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation }),
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        },
                        {
                            model: Order,
                            where: {
                                createdAt: {
                                    [Op.lte]: twoWeeksAgo,
                                },
                            },
                            required: true,
                        },
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var query_loyal = {
                    where: {
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation })
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        },
                        {
                            model: Order,
                            where: {
                                createdAt: {
                                    [Op.lte]: threeMonthAgo,
                                },
                            },
                            required: true,
                        },
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var query_unverified = {
                    where: {
                        active: false,
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation })
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var query_favorite = {
                    where: {
                        favorite: true,
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation })
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var countNewActive = await User.count(query_new_innactive)
                var countNewInnactive = await User.count(query_new_active)
                var countInnactive = await User.findAll(query_innactive)
                var countActive = await User.count(query_active)
                var countLoyal = await User.findAll(query_loyal)
                var countUnverified = await User.count(query_unverified)
                var countFavorite = await User.count(query_favorite)

                const data = {
                    labels: clientStatus.map(item => item),
                    datasets: [
                        {
                            label: "Earning",
                            data: [countNewActive, countNewInnactive, countInnactive.length, countActive.length, countLoyal.length, countUnverified, countFavorite],
                            fill: true,
                            backgroundColor: ["rgb(91,155,213)"],
                        }
                    ],
                };

                return data
            } else {

                const currentDate = new Date();
                const startDate = new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000); // Subtract 15 days

                const twoWeeksAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000); // Subtract 14 days

                const threeMonthAgo = new Date(currentDate.getTime() - 91 * 24 * 60 * 60 * 1000); // Subtract 3 months

                var query_new_innactive = {
                    where: {
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation }),
                        createdAt: {
                            [Op.lte]: startDate
                        }
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var query_new_active = {
                    where: {
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation }),
                        createdAt: {
                            [Op.gte]: startDate
                        }
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var query_innactive = {
                    where: {
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation })
                    },
                    include: [
                        {
                            model: Order,
                            where: {
                                createdAt: {
                                    [Op.gte]: twoWeeksAgo,
                                },
                            },
                            required: true,
                        },
                    ]
                }

                var query_active = {
                    where: {
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation }),
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        },
                        {
                            model: Order,
                            where: {
                                createdAt: {
                                    [Op.lte]: twoWeeksAgo,
                                },
                            },
                            required: true,
                        },
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var query_loyal = {
                    where: {
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation })
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        },
                        {
                            model: Order,
                            where: {
                                createdAt: {
                                    [Op.lte]: threeMonthAgo,
                                },
                            },
                            required: true,
                        },
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var query_unverified = {
                    where: {
                        active: false,
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation })
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var query_favorite = {
                    where: {
                        favorite: true,
                        ...(id && { id }),
                        ...(id_team_member_confirmation && { id_team_member_confirmation })
                    },
                    include: [
                        { model: Team_Admin, as: 'id_team_member_confirmationTeamAdmin' },
                        {
                            model: Subscription, include: [{
                                model: Pack
                            }]
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                }

                var countNewActive = await User.count(query_new_innactive)
                var countNewInnactive = await User.count(query_new_active)
                var countInnactive = await User.findAll(query_innactive)
                var countActive = await User.count(query_active)
                var countLoyal = await User.findAll(query_loyal)
                var countUnverified = await User.count(query_unverified)
                var countFavorite = await User.count(query_favorite)

                const data = {
                    labels: clientStatus.map(item => item),
                    datasets: [
                        {
                            label: "Earning",
                            data: [countNewActive, countNewInnactive, countInnactive.length, countActive.length, countLoyal.length, countUnverified, countFavorite],
                            fill: true,
                            backgroundColor: ["rgb(91,155,213)"],
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

    static async GetTeamEarningTable({ id, id_team_member_confirmation, useDate, dateFrom, dateTo }) {
        function getDifferenceInDays(startDate, endDate) {
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);

            const diffInMs = Math.abs(date2 - date1);
            return diffInMs / (1000 * 60 * 60 * 24);
        }

        try {
            var differenceInDays = getDifferenceInDays(dateFrom, dateTo) + 1

            // search team
            var team = await Team_Admin.findOne({ where: { id: id_team_member_confirmation } })

            if (!useDate) {

                const data = { commission: await this.#getActiveClient({ useDate: false }), salaire: team.salaire }

                return data
            } else {

                const data = { commission: await this.#getActiveClient({ useDate: false }), salaire: ((differenceInDays * team.salaire) / 30) }

                return data
            }

        } catch (err) {
            console.log(err)
            return 0
        }
    }

    static async GetAllTeamEarningTable({ id, useDate, dateFrom, dateTo }) {

        function getDifferenceInDays(startDate, endDate) {
            const date1 = new Date(startDate);
            const date2 = new Date(endDate);

            const diffInMs = Math.abs(date2 - date1);
            return diffInMs / (1000 * 60 * 60 * 24);
        }

        try {
            var differenceInDays = getDifferenceInDays(dateFrom, dateTo) + 1

            if (!useDate) {

                var sum_salary = await Team_Admin.sum('salaire')

                const data = { commission: await this.#getActiveClient({ useDate: false }), salaire: sum_salary }

                return data
            } else {

                var sum_salary = await Team_Admin.sum('salaire')

                const data = { commission: await this.#getActiveClient({ useDate: false }), salaire: ((differenceInDays * sum_salary) / 30) }

                return data
            }

        } catch (err) {
            console.log(err)
            return 0
        }
    }

    static async GetShippingEarningTable({ id, useDate, dateFrom, dateTo }) {

        try {
            var shipping_total = await Shipping_Companie.sum('value', { where: { mode_pricing: 'cmd_total', ...(id && { id }) } })
            var shipping_livre = await Shipping_Companie.sum('value', { where: { mode_pricing: 'cmd_livre', ...(id && { id }) } })
            var shipping_fixe = await Shipping_Companie.sum('value', { where: { mode_pricing: 'prix_fixe', ...(id && { id }) } })

            if (!useDate) {

                var cmd_total = await Order.count({ where: { isSendLivo: 'send' } })
                var cmd_livre = await Order.count({ where: { isSendLivo: 'send', status: 'Livre' } })

                const data = {
                    commission_total: shipping_total * cmd_total,
                    commission_livre: shipping_livre * cmd_livre,
                    commission_fixe: shipping_fixe
                }

                return data
            } else {

                var cmd_total = await Order.count({ where: { isSendLivo: 'send', createdAt: { [Op.between]: [dateFrom, dateTo] } } })
                var cmd_livre = await Order.count({ where: { isSendLivo: 'send', status: 'Livre', createdAt: { [Op.between]: [dateFrom, dateTo] } } })

                const data = {
                    commission_total: shipping_total * cmd_total,
                    commission_livre: shipping_livre * cmd_livre,
                    commission_fixe: shipping_fixe
                }

                return data
            }

        } catch (err) {
            console.log(err)
            return 0
        }
    }

    static async MigrateAllPack({ prev_pack, new_pack }) {
        try {
            await Subscription.update({ id_pack: new_pack }, {
                where: { id_pack: prev_pack }
            })

            return { code: 200, message: 'You change pack' }
        } catch (error) {
            console.log(error)
            return { code: 500, message: 'Internal server error' }
        }
    }

    static async GetIssues({ id_admin, status }) {

        try {
            const response = await Support.findAll({
                where: {
                    ...(status && { status })
                }
            })

            return { 'code': 200, 'data': response }
        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }

    static async GetMessagesBySupport({ id_admin, id_support }) {

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

    static async ChangeIssueStatus({ id_admin, id_support, status }) {

        try {
            const response = await Support.findOne({ where: { id: id_support } })
            response.status = status
            const save = await response.save()

            return { 'code': 200, 'data': save }
        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }
    }
}

module.exports = AdminServices