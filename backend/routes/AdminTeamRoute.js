const server = require('express')
const app = server()
const bodyParser = require('body-parser')
const { verifyTOKEN, ExtractUserFromTOKEN } = require('../middleware/verifyToken')
const { AdminTeamServices } = require('../services')

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))


app.get('/admin-team/pageacces', verifyTOKEN,
    async (req, res) => {
        var response = await AdminTeamServices.GetPageAccess({
            id_team: ExtractUserFromTOKEN(req.token).id_team
        })

        return res.status(response.code).json(response)
    })

app.get('/admin-team/columnacces', verifyTOKEN,
    async (req, res) => {
        var response = await AdminTeamServices.GetColumnAccess({
            id_team: ExtractUserFromTOKEN(req.token).id_team
        })

        return res.status(response.code).json(response)
    })



module.exports = app;