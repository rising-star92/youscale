const server = require('express')
const app = server()
const bodyParser = require('body-parser')
const { body, validationResult } = require('express-validator');
const { verifyTOKEN, ExtractUserFromTOKEN } = require('../middleware/verifyToken')
const { ClientTeamServices } = require('../services')

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))


app.get('/client-team/pageacces', verifyTOKEN,
    async (req, res) => {
        var response = await ClientTeamServices.GetPageAccess({
            id_team: ExtractUserFromTOKEN(req.token).id_team ?? null
        })

        return res.status(response.code).json(response)
    })

app.get('/client-team/columnacces', verifyTOKEN,
    async (req, res) => {
        var response = await ClientTeamServices.GetColumnAccess({
            id_team: ExtractUserFromTOKEN(req.token).id_team
        })

        return res.status(response.code).json(response)
    })

app.get('/client-team/productacces', verifyTOKEN,
    async (req, res) => {
        var response = await ClientTeamServices.GetProductAccess({
            id_team: ExtractUserFromTOKEN(req.token).id_team
        })

        return res.status(response.code).json(response)
    })

app.get('/client-team/cityacces', verifyTOKEN,
    async (req, res) => {
        var response = await ClientTeamServices.GetCityAccess({
            id_team: ExtractUserFromTOKEN(req.token).id_team
        })

        return res.status(response.code).json(response)
    })

app.post('/client-team/order', verifyTOKEN,
    body('date').isDate().withMessage("Le format de la date est incorrect"),
    body('nom').isLength({ min: 3 }).withMessage("La note doit contenir au moins 3 caracatères"),
    body('telephone').isLength({ min: 8 }).withMessage("Le telephone doit contenir au moins 8 caracatères"),
    body('id_city').notEmpty().withMessage("id_city must be not empty").isNumeric().withMessage("id_product format is invalid"),
    body('prix').notEmpty().withMessage("prix must be not empty").isNumeric().withMessage("prix format is invalid"),
    body('status').isLength({ min: 3 }).withMessage("Le status doit contenir au moins 3 caracatères"),
    body('adresse').isLength({ min: 3 }).withMessage("L'adresse doit contenir au moins 3 caracatères"),
    body('shipping').isLength({ min: 3 }).withMessage("Le shipping doit contenir au moins 3 caracatères"),
    body('source').isLength({ min: 3 }).withMessage("La source doit contenir au moins 3 caracatères"),
    body('quantity').notEmpty().withMessage("quantity must be not empty").isNumeric().withMessage("quantity format is invalid"),
    body('variant').isLength({ min: 3 }).withMessage("variant doit contenir au moins 3 caracatères"),
    body('updownsell').isLength({ min: 3 }).withMessage("updownsell doit contenir au moins 3 caracatères"),
    body('last_action').isLength({ min: 3 }).withMessage("last_action doit contenir au moins 3 caracatères"),
    body('id_product_array').isArray().withMessage("id_product_array must be array")
    , async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.ClientTeamServices({
            date: req.body.date,
            nom: req.body.nom,
            telephone: req.body.telephone,
            id_city: req.body.id_city,
            prix: req.body.prix,
            status: req.body.status,
            adresse: req.body.adresse,
            shipping: req.body.shipping,
            source: req.body.source,
            quantity: req.body.quantity,
            variant: req.body.variant,
            updownsell: req.body.updownsell,
            last_action: req.body.last_action,
            id_product_array: req.body.id_product_array,
            id_user: ExtractUserFromTOKEN(req.token).id,
            id_team: ExtractUserFromTOKEN(req.token).id_team
        })

        return res.status(response.code).json(response)
    })

app.get('/client-team/order', verifyTOKEN
    , async (req, res) => {

        var response = await ClientTeamServices.GetOrder({
            id_user: ExtractUserFromTOKEN(req.token).id,
            id_team: ExtractUserFromTOKEN(req.token).id_team
        })

        return res.status(response.code).json(response)
    })


module.exports = app;