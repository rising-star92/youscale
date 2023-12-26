require('dotenv').config();
const { Team_Admin, Team_Admin_Page_Acces, Team_Admin_Column_Acces, Column_Of_User, Admin_Page } = require('../models')

class AdminTeamServices {
    static async #findTeamAdminById(id) {
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

    static async GetPageAccess({ id_team }) {
        try {
            var isExist = await this.#findTeamAdminById(id_team)
            if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

            var pageAccess = isExist.Team_Admin_Page_Acces.map(page => page.Admin_Page.name)

            return { 'code': 200, 'data': pageAccess }

        } catch (error) {
            console.log(error)
            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }

    static async GetColumnAccess({ id_team }) {
        try {
            var isExist = await this.#findTeamAdminById(id_team)
            if (!isExist) return { code: 404, message: 'This ressource doesn\'t exist' }

            var columnAccess = isExist.Team_Admin_Column_Acces.map(column => column.Column_Of_User.name.replaceAll(' ', '_'))

            return { 'code': 200, 'data': columnAccess }

        } catch (error) {

            return { code: 400, message: 'Internal error, please contact the support' }
        }

    }
}

module.exports = AdminTeamServices