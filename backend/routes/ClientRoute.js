const server = require('express')
const app = server()
const bodyParser = require('body-parser')
const { body, validationResult } = require('express-validator');
const { verifyTOKEN, ExtractUserFromTOKEN } = require('../middleware/verifyToken')
const { ClientServices, IntegrateServices } = require('../services')

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))
app.get('/client', verifyTOKEN, async (req, res) => {

    var response = await ClientServices.getClient({
        id: ExtractUserFromTOKEN(req.token).id
    })

    return res.status(response.code).json(response)
})

app.patch('/client',
    body('fullname').optional().not().isEmpty().withMessage("fullname doit être une chaine de caractère"),
    body('livoToken').optional().not().isEmpty().withMessage("livoToken doit être une chaine de caractère"),
    body('isBeginner').optional().not().isEmpty().withMessage("isBeginner doit être une chaine de caractère"),
    verifyTOKEN, async (req, res) => {

        var response = await ClientServices.PatchClient({
            id_user: ExtractUserFromTOKEN(req.token).id,
            fullname: req.body.fullname,
            livoToken: req.body.livoToken,
            isBeginner: req.body.isBeginner
        })

        return res.status(response.code).json(response)
    })

app.get('/client/dashbord/team_member', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetTeamDashboard({
            id_team: req.query.id_team,
            useDate: Number(req.query.usedate),
            dateFrom: req.query.datefrom,
            dateTo: req.query.dateto,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/columnoforder', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetColumnOfOrder({ id: null, id_user: ExtractUserFromTOKEN(req.token).id })

        return res.status(response.code).json(response)
    })

app.get('/client/columnoforder/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetColumnOfOrder({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/columnoforder', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('active').not().isEmpty().withMessage("La validité ne doit pas être vide").isBoolean().withMessage("Le format est invalide")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddColumnOfOrder({
            name: req.body.name,
            active: req.body.active,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/client/columnoforder/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().withMessage("name ne doit pas être vide").isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('alias').optional().not().isEmpty().withMessage("alias ne doit pas être vide").isLength({ min: 1 }).withMessage("L'alias doit contenir au moins 3 caracatères"),
    body('isExported').optional().not().isEmpty().withMessage("isExported ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('active').optional().not().isEmpty().withMessage("active ne doit pas être vide").isBoolean().withMessage("Le format est invalide")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.PatchColumnOfOrder({
            id: req.params.id,
            active: req.body.active,
            alias: req.body.alias,
            isExported: req.body.isExported,
            name: req.body.name,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/columnoforder/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.RemoveColumnOfOrder({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/city', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 1 caracatères"),
    body('price').notEmpty().withMessage("price must be not empty").isFloat().withMessage("price format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddCity({
            name: req.body.name,
            price: req.body.price,
            id_shipping: req.body.id_shipping,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/city', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetCity({
            id: null,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/city/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetCity({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/client/city/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().withMessage("name ne doit pas être vide").isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 1 caracatères"),
    body('price').optional().notEmpty().withMessage("price must be not empty").isFloat().withMessage("price format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.PatchCity({
            id: req.params.id,
            name: req.body.name,
            price: req.body.price,
            id_shipping: req.body.id_shipping,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/city/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.RemoveCity({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/team_member', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('email').not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect"),
    body('password').isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères"),
    body('salaire').notEmpty().withMessage("salaire must be not empty").isNumeric().withMessage("salaire format is invalid"),
    body('day_payment').notEmpty().withMessage("day_payment must be not empty").isNumeric().withMessage("day_payment format is invalid"),
    body('commission').notEmpty().withMessage("commission must be not empty").isNumeric().withMessage("commission format is invalid"),
    body('upsell').optional().notEmpty().withMessage("upsell must be not empty").isNumeric().withMessage("upsell format is invalid"),
    body('downsell').optional().notEmpty().withMessage("downsell must be not empty").isNumeric().withMessage("downsell format is invalid"),
    body('crosssell').optional().notEmpty().withMessage("crosssell must be not empty").isNumeric().withMessage("crosssell format is invalid"),
    body('max_order').notEmpty().withMessage("max_order must be not empty").isNumeric().withMessage("max_order format is invalid"),
    body('can_delete_order').not().isEmpty().withMessage("can_delete_order ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('can_edit_order').not().isEmpty().withMessage("can_edit_order ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('column_access').isArray().withMessage("column_access must be array"),
    body('cities_access').isArray().withMessage("cities_access must be array"),
    body('product_access').isArray().withMessage("product_access must be array"),
    body('page_access').isArray().withMessage("page_access must be array")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddTeamMember({
            name: req.body.name,
            email: req.body.email,
            livoToken: req.body.livoToken === "" ? null : req.body.livoToken,
            plainPassword: req.body.password,
            salaire: req.body.salaire,
            day_payment: req.body.day_payment,
            max_order: req.body.max_order,
            commission: req.body.commission ?? 0,
            upsell: req.body.upsell ?? 0,
            downsell: req.body.downsell ?? 0,
            crosssell: req.body.crosssell ?? 0,
            can_delete_order: req.body.can_delete_order,
            can_edit_order: req.body.can_edit_order,
            column_access: req.body.column_access,
            cities_access: req.body.cities_access,
            product_access: req.body.product_access,
            page_access: req.body.page_access,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/team_member', verifyTOKEN,
    async (req, res) => {

        var booleanValue = req.query.isHidden === 'false' ? false : Boolean(req.query.isHidden);
        var response = await ClientServices.GetTeamMember({
            id: null,
            id_user: ExtractUserFromTOKEN(req.token).id,
            isHidden: booleanValue
        })

        return res.status(response.code).json(response)
    })

app.get('/client/team_member/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetTeamMember({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/client/team_member/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('email').optional().not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect"),
    body('salaire').optional().not().isEmpty().withMessage("salaire must be not empty").isNumeric().withMessage("salaire format is invalid"),
    body('password').optional().isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères"),
    body('day_payment').optional().not().isEmpty().withMessage("day_payment must be not empty").isNumeric().withMessage("day_payment format is invalid"),
    body('commission').optional().not().isEmpty().withMessage("commission must be not empty").isNumeric().withMessage("commission format is invalid"),
    body('isHidden').optional().not().isEmpty().withMessage("isHidden must be not empty").isBoolean().withMessage("isHidden format is invalid"),
    body('upsell').optional().not().isEmpty().withMessage("upsell must be not empty").isNumeric().withMessage("upsell format is invalid"),
    body('downsell').optional().notEmpty().withMessage("downsell must be not empty").isNumeric().withMessage("downsell format is invalid"),
    body('crosssell').optional().notEmpty().withMessage("crosssell must be not empty").isNumeric().withMessage("crosssell format is invalid"),
    body('max_order').optional().not().isEmpty().withMessage("max_order must be not empty").isNumeric().withMessage("max_order format is invalid"),
    body('can_delete_order').optional().not().isEmpty().withMessage("can_delete_order ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('can_edit_order').optional().not().isEmpty().withMessage("can_edit_order ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('all_column_access').optional().not().isEmpty().withMessage("all_column_access ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('all_cities_access').optional().not().isEmpty().withMessage("all_cities_access ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('all_product_access').optional().not().isEmpty().withMessage("all_page_access ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('all_page_access').optional().not().isEmpty().withMessage("all_page_access ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('active').optional().not().isEmpty().withMessage("active ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('column_access').optional().isArray().withMessage("column_access must be array"),
    body('cities_access').optional().isArray().withMessage("cities_access must be array"),
    body('product_access').optional().isArray().withMessage("product_access must be array"),
    body('page_access').optional().isArray().withMessage("page_access must be array")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.PatchTeamMember({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id,
            name: req.body.name,
            email: req.body.email,
            livoToken: req.body.livoToken,
            max_order: req.body.max_order,
            plainPassword: req.body.password === 'yourpassword' ? null : req.body.password,
            salaire: req.body.salaire,
            day_payment: req.body.day_payment,
            commission: req.body.commission,
            isHidden: req.body.isHidden,
            upsell: req.body.upsell,
            downsell: req.body.downsell,
            crosssell: req.body.crosssell,
            can_delete_order: req.body.can_delete_order,
            can_edit_order: req.body.can_edit_order,
            all_column_access: req.body.all_column_access,
            all_cities_access: req.body.all_cities_access,
            all_product_access: req.body.all_product_access,
            all_page_access: req.body.all_page_access,
            active: req.body.active,
            column_access: req.body.column_access ?? [],
            cities_access: req.body.cities_access ?? [],
            product_access: req.body.product_access ?? [],
            page_access: req.body.page_access ?? []
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/team_member/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.RemoveTeamMember({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/product', verifyTOKEN,
    async (req, res) => {

        var booleanValue = req.query.isHidden === 'false' ? false : Boolean(req.query.isHidden);
        var response = await ClientServices.GetProduct({
            id: null,
            id_team: ExtractUserFromTOKEN(req.token).id_team ?? req.query.id_team,
            id_user: ExtractUserFromTOKEN(req.token).id,
            isHidden: booleanValue
        })

        return res.status(response.code).json(response)
    })

app.get('/client/product/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetProduct({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/product', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('variant').optional().isArray().withMessage("variant must be array"),
    body('price_selling').notEmpty().withMessage("price_selling must be not empty").isNumeric().withMessage("price_selling format is invalid"),
    body('price_buying').optional().notEmpty().withMessage("price_buying must be not empty").isNumeric().withMessage("price_buying format is invalid"),
    body('price_best_selling').optional().notEmpty().withMessage("price_best_selling must be not empty").isNumeric().withMessage("price_best_selling format is invalid"),
    body('other_charges_array').optional().notEmpty().withMessage("other_charges_array is required").isArray().withMessage("other_charges_array must be array")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddProduct({
            name: req.body.name,
            variant: req.body.variant ?? [],
            price_selling: req.body.price_selling,
            price_buying: req.body.price_buying ?? 0,
            price_best_selling: req.body.price_best_selling ?? 0,
            other_charges_array: req.body.other_charges_array ?? [],
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/client/product/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('isHidden').optional().not().isEmpty().withMessage("isHidden must be not empty").isBoolean().withMessage("isHidden format is invalid"),
    body('price_selling').optional().not().isEmpty().withMessage("price_selling must be not empty").isNumeric().withMessage("price_selling format is invalid"),
    body('price_buying').optional().not().isEmpty().withMessage("price_buying must be not empty").isNumeric().withMessage("price_buying format is invalid"),
    body('price_best_selling').optional().not().isEmpty().withMessage("price_best_selling must be not empty").isNumeric().withMessage("price_best_selling format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.PatchProduct({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id,
            name: req.body.name,
            isHidden: req.body.isHidden,
            variant: req.body.variant,
            price_selling: req.body.price_selling,
            price_buying: req.body.price_buying,
            price_best_selling: req.body.price_best_selling,
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/product/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.RemoveProduct({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/page', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetPage()

        return res.status(response.code).json(response)
    })

app.get('/client/stock', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetStock({ id: null, id_user: ExtractUserFromTOKEN(req.token).id })

        return res.status(response.code).json(response)
    })

app.get('/client/stock/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetStock({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/stock', verifyTOKEN,
    body('quantity').notEmpty().withMessage("quantity must be not empty").isNumeric().withMessage("quantity format is invalid"),
    body('id_product').notEmpty().withMessage("id_product must be not empty").isNumeric().withMessage("id_product format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddStock({
            quantity: req.body.quantity,
            id_product: req.body.id_product,
            id_city: null,
            id_user: ExtractUserFromTOKEN(req.token).id,
        })

        return res.status(response.code).json(response)
    })

app.patch('/client/stock/:id', verifyTOKEN,
    body('quantity').optional().not().isEmpty().withMessage("quantity must be not empty").isNumeric().withMessage("quantity format is invalid"),
    body('id_product').optional().not().isEmpty().withMessage("id_product must be not empty").isNumeric().withMessage("id_product format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.PatchStock({
            id: req.params.id,
            quantity: req.body.quantity,
            id_product: req.body.id_product,
            id_city: null,
            id_user: ExtractUserFromTOKEN(req.token).id,
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/stock/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.RemoveStock({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/setting', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetSetting({
            id_user: ExtractUserFromTOKEN(req.token).id,
            id_admin: ExtractUserFromTOKEN(req.token).id_admin
        })

        return res.status(response.code).json(response)
    })

app.patch('/client/setting', verifyTOKEN,
    body('default_conf_pricing').optional().not().isEmpty().withMessage("default_conf_pricing ne doit pas être vide").notEmpty().withMessage("default_conf_pricing must be not empty").isNumeric().withMessage("default_conf_pricing format is invalid"),
    body('delfault_del_pricing').optional().not().isEmpty().withMessage("delfault_del_pricing ne doit pas être vide").notEmpty().withMessage("delfault_del_pricing must be not empty").isNumeric().withMessage("delfault_del_pricing format is invalid"),
    body('default_time').optional().not().isEmpty().withMessage("default_time ne doit pas être vide").notEmpty().withMessage("default_time must be not empty").isNumeric().withMessage("default_time format is invalid"),
    body('automated_msg').optional().not().isEmpty().withMessage("automated_msg ne doit pas être vide").isLength({ min: 1 }).withMessage("Le automated_msg doit contenir au moins 1 caracatères"),
    body('startWrldOrder').optional().not().isEmpty().withMessage("startWrldOrder ne doit pas être vide").isLength({ max: 14 }).withMessage("Le startWrldOrder doit contenir au maximum 14 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.PatchSetting({
            id_user: ExtractUserFromTOKEN(req.token).id,
            default_cof_ricing: req.body.default_conf_pricing,
            delfaulnpt_del_pricing: req.body.delfault_del_pricing,
            default_time: req.body.default_time,
            startWrldOrder: req.body.startWrldOrder,
            automated_msg: req.body.automated_msg
        })

        return res.status(response.code).json(response)
    })

app.post('/client/status', verifyTOKEN,
    body('name').isLength({ min: 3 }).withMessage("Le text doit contenir au moins 3 caracatères"),
    body('checked').not().isEmpty().withMessage("checked ne doit pas être vide").isBoolean().withMessage("Le format est invalide")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddStatus({
            name: req.body.name,
            checked: req.body.checked,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/client/status/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().withMessage("Le text doit contenir au moins 3 caracatères"),
    body('color').optional().not().isEmpty().withMessage("Le text doit contenir au moins 3 caracatères"),
    body('checked').optional().not().isEmpty().withMessage("checked ne doit pas être vide").isBoolean().withMessage("Le format est invalide")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.PatchStatus({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id,
            name: req.body.name,
            color: req.body.color,
            checked: req.body.checked
        })

        return res.status(response.code).json(response)
    })

app.get('/client/status', verifyTOKEN
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.GetStatus({
            id_user: ExtractUserFromTOKEN(req.token).id,
            id_team: ExtractUserFromTOKEN(req.token).id_team ?? req.query.id_team,
            search: req.query.search,
            usedate: Number(req.query.usedate),
            datefrom: req.query.datefrom,
            dateto: req.query.dateto,
            id_product_array: req.query.id_product_array ? [req.query.id_product_array] : []
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/status/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.RemoveStatus({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/pertecategorie', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetPerteCategorie({ id: null, id_user: ExtractUserFromTOKEN(req.token).id })

        return res.status(response.code).json(response)
    })

app.get('/client/pertecategorie/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetPerteCategorie({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/pertecategorie', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddPerteCategorie({
            name: req.body.name,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/client/pertecategorie/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.PatchPerteCategorie({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id,
            name: req.body.name
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/pertecategorie/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.RemovePerteCategorie({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/gaincategorie', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetGainCategorie({ id: null, id_user: ExtractUserFromTOKEN(req.token).id })

        return res.status(response.code).json(response)
    })

app.get('/client/gaincategorie/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetGainCategorie({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/gaincategorie', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddGainCategorie({
            name: req.body.name,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/client/gaincategorie/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.PatchGainCategorie({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id,
            name: req.body.name
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/gaincategorie/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.RemoveGainCategorie({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/gain', verifyTOKEN,
    body('id_product').notEmpty().withMessage("id_product must be not empty").isNumeric().withMessage("id_product format is invalid"),
    body('id_gain_categorie').notEmpty().withMessage("id_gain_categorie must be not empty").isNumeric().withMessage("id_gain_categorie format is invalid"),
    body('note').isLength({ min: 3 }).withMessage("La note doit contenir au moins 3 caracatères"),
    body('dateFrom').isDate().withMessage("Le format de la date est incorrect"),
    body('dateTo').isDate().withMessage("Le format de la date est incorrect"),
    body('amount').notEmpty().withMessage("amount must be not empty").isFloat().withMessage("amount format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddGain({
            id_product: req.body.id_product,
            id_gain_categorie: req.body.id_gain_categorie,
            note: req.body.note,
            dateFrom: req.body.dateFrom,
            dateTo: req.body.dateTo,
            amount: req.body.amount,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/gain/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.RemoveGain({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/perte', verifyTOKEN,
    body('id_product').notEmpty().withMessage("id_product must be not empty").isNumeric().withMessage("id_product format is invalid"),
    body('id_perte_categorie').notEmpty().withMessage("id_perte_categorie must be not empty").isNumeric().withMessage("id_perte_categorie format is invalid"),
    body('note').optional(),
    body('dateFrom').isDate().withMessage("Le format de la date est incorrect"),
    body('dateTo').isDate().withMessage("Le format de la date est incorrect"),
    body('amount').notEmpty().withMessage("amount must be not empty").isFloat().withMessage("amount format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddPerte({
            id_product: req.body.id_product,
            id_perte_categorie: req.body.id_perte_categorie,
            note: req.body.note ?? 'none',
            dateFrom: req.body.dateFrom,
            dateTo: req.body.dateTo,
            amount: req.body.amount,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/perte/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.RemovePerte({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/transaction', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetTransaction({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/detailsofspending', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetDetailsOfSpending({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/integratesheet', verifyTOKEN,
    body('spreadsheetId').isLength({ min: 3 }).withMessage("spreadsheetId doit contenir au moins 3 caracatères"),
    body('name').isLength({ min: 3 }).withMessage("name doit contenir au moins 3 caracatères"),
    body('range').isLength({ min: 3 }).withMessage("range doit contenir au moins 3 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await IntegrateServices.LinkSheet({
            spreadsheetId: req.body.spreadsheetId,
            range: req.body.range,
            name: req.body.name,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/client/integratesheet/:id', verifyTOKEN,
    body('spreadsheetId').isLength({ min: 3 }).withMessage("spreadsheetId doit contenir au moins 3 caracatères"),
    body('name').isLength({ min: 3 }).withMessage("name doit contenir au moins 3 caracatères"),
    body('range').isLength({ min: 3 }).withMessage("range doit contenir au moins 3 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await IntegrateServices.PatchSheet({
            id: req.params.id,
            spreadsheetId: req.body.spreadsheetId,
            name: req.body.name,
            range: req.body.range
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/integratesheet/:id', verifyTOKEN, async (req, res) => {

    var response = await IntegrateServices.DeleteSheet({ id: req.params.id })

    return res.status(response.code).json(response)
})

app.get('/client/integratesheet', verifyTOKEN
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await IntegrateServices.GetLinkSheet({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/subscription', verifyTOKEN,
    body('id_pack').isNumeric().withMessage("id_pack doit être un nombre")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.MakeSubscription({
            id_pack: req.body.id_pack,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/client/subscription/:id', verifyTOKEN,
    body('id_pack').isNumeric().withMessage("id_pack doit être un nombre")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.ChangeSubscription({
            id: req.params.id,
            id_pack: req.body.id_pack,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/pack', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetPack({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/pack/all', async (req, res) => {

    var response = await ClientServices.GetAllPack()

    return res.status(response.code).json(response)
})

app.get('/client/ads', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetAds({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/annoucement', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetAnnoucement({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/order', verifyTOKEN,
    body('nom').isLength({ min: 3 }).withMessage("La note doit contenir au moins 3 caracatères"),
    body('telephone').isLength({ min: 8 }).withMessage("Le telephone doit contenir au moins 8 caracatères"),
    body('id_city').notEmpty().withMessage("id_city must be not empty").isNumeric().withMessage("id_city format is invalid"),
    body('prix').notEmpty().withMessage("prix must be not empty").isNumeric().withMessage("prix format is invalid"),
    body('status').isLength({ min: 3 }).withMessage("Le status doit contenir au moins 3 caracatères"),
    body('adresse').optional(),
    body('message').optional(),
    body('changer').optional().isLength({ min: 3 }).withMessage("changer doit contenir au moins 3 caracatères"),
    body('ouvrir').optional().isLength({ min: 3 }).withMessage("ouvrir doit contenir au moins 3 caracatères"),
    body('source').isLength({ min: 3 }).withMessage("La source doit contenir au moins 3 caracatères"),
    body('updownsell').isLength({ min: 3 }).withMessage("updownsell doit contenir au moins 3 caracatères"),
    body('id_product_array').isArray().withMessage("id_product_array must be array")
    , async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddOrder({
            date: new Date(), //req.body.date, //
            nom: req.body.nom,
            telephone: req.body.telephone,
            reportedDate: Number(req.body.reportedDate) ? req.body.reportedDate : null,
            id_city: req.body.id_city,
            prix: req.body.prix,
            status: req.body.status,
            adresse: req.body.adresse == '' ? 'xxxx' : req.body.adresse,
            message: req.body.message == '' ? 'none' : req.body.message,
            source: req.body.source == '' ? 'none' : req.body.source,
            changer: req.body.changer == '' ? 'Non' : req.body.changer,
            ouvrir: req.body.ouvrir == '' ? 'Non' : req.body.ouvrir,
            updownsell: req.body.updownsell,
            id_product_array: req.body.id_product_array,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/order', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetOrder({
            id_team: ExtractUserFromTOKEN(req.token).id_team ?? req.query.id_team,
            id_user: ExtractUserFromTOKEN(req.token).id,
            search: req.query.search,
            status: req.query.status,
            _skip: req.query._skip,
            _limit: req.query._limit,
            usedate: Number(req.query.usedate),
            datefrom: req.query.datefrom,
            dateto: req.query.dateto,
            id_product_array: req.query.id_product_array ? [req.query.id_product_array] : [],
        })

        return res.status(response.code).json(response)
    })

app.get('/client/order/history', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetOrderHistory({
            id_order: req.query.id_order
        })

        return res.status(response.code).json(response)
    })

app.get('/client/order/sheet', verifyTOKEN
    , async (req, res) => {
        const response = await IntegrateServices.GetSheet({ id_user: ExtractUserFromTOKEN(req.token).id })

        console.log(response)
    })

app.patch('/client/order/:id', verifyTOKEN,
    body('date').optional().isDate().withMessage("Le format de la date est incorrect"),
    body('reportedDate').optional().isDate().withMessage("Le format de la date est incorrect"),
    body('nom').optional().isLength({ min: 0 }).withMessage("La nom doit contenir au moins 3 caracatères"),
    body('telephone').optional().isLength({ min: 8 }).withMessage("Le telephone doit contenir au moins 8 caracatères"),
    body('prix').optional().notEmpty().withMessage("prix must be not empty").isNumeric().withMessage("prix format is invalid"),
    body('adresse').optional().isLength({ min: 0 }).withMessage("L'adresse doit contenir au moins 3 caracatères"),
    body('shipping').optional().isLength({ min: 3 }).withMessage("Le shipping doit contenir au moins 3 caracatères"),
    body('message').optional().isLength({ min: 0 }).withMessage("Le message doit contenir au moins 3 caracatères"),
    body('source').optional().isLength({ min: 0 }).withMessage("La source doit contenir au moins 3 caracatères"),
    body('quantity').optional().notEmpty().withMessage("quantity must be not empty").isNumeric().withMessage("quantity format is invalid"),
    body('variant').optional().isLength({ min: 3 }).withMessage("variant doit contenir au moins 3 caracatères"),
    body('updownsell').optional().isLength({ min: 3 }).withMessage("updownsell doit contenir au moins 3 caracatères"),
    body('last_action').optional().isLength({ min: 3 }).withMessage("last_action doit contenir au moins 3 caracatères"),
    body('changer').optional().isLength({ min: 3 }).withMessage("changer doit contenir au moins 3 caracatères"),
    body('ouvrir').optional().isLength({ min: 3 }).withMessage("ouvrir doit contenir au moins 3 caracatères"),
    body('status').optional().notEmpty().withMessage("status must be not empty"),
    body('prev_id_team').optional().notEmpty().withMessage("prev_id_team must be not empty").isNumeric().withMessage("prev_id_team format is invalid"),
    body('id_team').optional().notEmpty().withMessage("id_team must be not empty").isNumeric().withMessage("id_team format is invalid"),
    body('id_city').optional().notEmpty().withMessage("id_city must be not empty").isNumeric().withMessage("id_city format is invalid"),
    body('id_product_array').optional().isArray().withMessage("column_access must be array")
    , async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.PatchOrder({
            id: req.params.id,
            date: req.body.date,
            reportedDate: req.body.reportedDate,
            nom: req.body.nom,
            telephone: req.body.telephone,
            prix: req.body.prix,
            adresse: req.body.adresse == '' ? 'xxxx' : req.body.adresse,
            message: req.body.message == '' ? 'none' : req.body.message,
            source: req.body.source ?? null,
            shipping: req.body.shipping,
            quantity: req.body.quantity,
            variant: req.body.variant,
            updownsell: req.body.updownsell,
            last_action: req.body.last_action,
            changer: req.body.changer,
            ouvrir: req.body.ouvrir,
            status: req.body.status,
            prev_id_team: req.body.prev_id_team,
            id_team: req.body.id_team,
            id_city: req.body.id_city,
            id_product_array: req.body.id_product_array,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/order/:id', verifyTOKEN, async (req, res) => {
    var response = await ClientServices.DeleteOrder({
        id: req.params.id,
        id_user: ExtractUserFromTOKEN(req.token).id
    })

    return res.status(response.code).json(response)
})

app.delete('/client/bulk/order', verifyTOKEN,
    body('id_orders').isArray().withMessage("id_orders must be array"),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.DeleteBulkOrder({
            id_orders: req.body.id_orders,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })


app.post('/client/bulk/edit', verifyTOKEN,
    body('id_orders').isArray().withMessage("id_orders must be array"),
    body('new_id_team').notEmpty().withMessage("new_id_team must be not empty").isNumeric().withMessage("new_id_team format is invalid"),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.EditBulkOrderTeam({
            id_orders: req.body.id_orders,
            new_id_team: req.body.new_id_team,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/paymentmethod', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetPaymentMethod({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/adminbankinformation', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetAdminBankInformation()

        return res.status(response.code).json(response)
    })

app.post('/client/coupon', verifyTOKEN,
    body('code').isLength({ min: 3 }).withMessage("Le code doit contenir au moins 3 caracatères")
    , async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.UseCoupon({
            code: req.body.code,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/account', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetAccount({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/makerefound', verifyTOKEN,
    body('amount').notEmpty().withMessage("amount must be not empty").isNumeric().withMessage("amount format is invalid"),
    body('image').isBase64().withMessage("L'image doit être au format base64")
    , async (req, res) => {

        var response = await ClientServices.MakeRefund({
            amount: req.body.amount,
            id_user: ExtractUserFromTOKEN(req.token).id,
            image: req.body.image
        })

        return res.status(response.code).json(response)
    })

app.get('/client/lasypayment', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetLastPayment({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/dashboard', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetDashboard({
            id_team: ExtractUserFromTOKEN(req.token).id_team ?? req.query.id_team,
            id_user: ExtractUserFromTOKEN(req.token).id,
            dateFrom: req.query.datefrom,
            dateTo: req.query.dateto,
            useDate: Number(req.query.usedate),
            id_product_array: req.query.id_product_array ? [req.query.id_product_array] : []
        })

        return res.status(response.code).json(response)
    })

app.get('/client/order/count', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.countNewOrder({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/variant', verifyTOKEN,
    body('name').notEmpty().withMessage("name must be not empty"), async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddVariant({
            name: req.body.name,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/variant/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.DeleteVariant({
            id: req.params.id,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/variant', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetVariant({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/client/variant/:id', verifyTOKEN,
    body('name').notEmpty().withMessage("name must be not empty"), async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.PatchVariant({
            id: req.params.id,
            name: req.body.name,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/paiement_dashbord', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetPaiementDashbord({
            id_user: ExtractUserFromTOKEN(req.token).id,
            dateFrom: req.query.datefrom,
            dateTo: req.query.dateto,
            useDate: Number(req.query.usedate),
            id_product_array: req.query.id_product_array ? [req.query.id_product_array] : []
        })

        return res.status(response.code).json(response)
    })

app.post('/client/goal', verifyTOKEN,
    body('value').notEmpty().withMessage("value must be not empty").isNumeric().withMessage("value format is invalid"),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.AddGoal({
            value: req.body.value,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.delete('/client/goal', verifyTOKEN,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.ResetGoal({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/goal', verifyTOKEN,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.GetGoal({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/order/export', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetOrderExportModel({
            id_user: ExtractUserFromTOKEN(req.token).id,
            id_orders: (req.query.id_orders != '[]' && req.query.id_orders) ? JSON.parse(req.query.id_orders) : null
        })

        return res.status(response.code).json(response)
    })

app.post('/client/verifyOTP', body('code').notEmpty().withMessage("code must be not empty"), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    var response = await ClientServices.VerifyOTPcode({
        code: req.body.code,
        contact: req.body.telephone
    })

    setTimeout(async () => {
        return res.status(response.code).json(response)
    }, 5000)
})

app.get('/client/shippingcompanie', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetShippingCompanie({
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/getallid', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetAllIdOrder({
            id_user: ExtractUserFromTOKEN(req.token).id,
            id_team: ExtractUserFromTOKEN(req.token).id_team ?? req.query.id_team,
            status: req.query.status
        })

        return res.status(response.code).json(response)
    })

app.get('/client/order/byid', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetOrderById({
            id_user: ExtractUserFromTOKEN(req.token).id,
            id_team: ExtractUserFromTOKEN(req.token).id_team ?? req.query.id_team,
            id_order: req.query.id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/order/comment', verifyTOKEN
    , async (req, res) => {

        var response = await ClientServices.GetComment({
            id_user: ExtractUserFromTOKEN(req.token).id,
            id_order: req.query.id_order
        })

        return res.status(response.code).json(response)
    })

app.post('/client/order/comment',
    body('id_order').notEmpty().withMessage("id_order must be not empty"),
    body('message').notEmpty().withMessage("message must be not empty"),
    verifyTOKEN
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.MakeComment({
            id_user: ExtractUserFromTOKEN(req.token).id,
            id_order: req.body.id_order,
            message: req.body.message
        })

        return res.status(response.code).json(response)
    })

app.post('/client/support', verifyTOKEN,
    body('subject').isLength({ min: 3 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('description').isLength({ min: 3 }).withMessage("La description doit contenir au moins 3 caracatères"),
    body('attachment').optional().notEmpty()
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.CreateIssue({
            subject: req.body.subject,
            description: req.body.description,
            attachment: req.body.attachment,
            id_user: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/client/support', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetIssues({
            id_user: ExtractUserFromTOKEN(req.token).id,
            status: req.query.status
        })

        return res.status(response.code).json(response)
    })

app.get('/client/support/msg/:id', verifyTOKEN,
    async (req, res) => {
        var response = await ClientServices.GetMessagesBySupport({
            id_user: ExtractUserFromTOKEN(req.token).id,
            id_support: req.params.id
        })

        return res.status(response.code).json(response)
    })

module.exports = app;