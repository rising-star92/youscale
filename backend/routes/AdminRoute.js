const server = require('express')
const app = server()
const bodyParser = require('body-parser')
const { body, validationResult } = require('express-validator');
const { verifyTOKEN, ExtractUserFromTOKEN } = require('../middleware/verifyToken')
const { AdminServices, ClientServices } = require('../services')

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))

app.get('/admin', verifyTOKEN, async (req, res) => {

    var response = await AdminServices.getAdmin({
        id: ExtractUserFromTOKEN(req.token).id
    })

    return res.status(response.code).json(response)
})

app.get('/admin/shippingcompanie', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetShippingCompanie({ id: null })

        return res.status(response.code).json(response)
    })

app.get('/admin/shippingcompanie/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetShippingCompanie()

        return res.status(response.code).json(response)
    })

app.post('/admin/shippingcompanie', verifyTOKEN,
    body('name').isLength({ min: 3 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('image').isBase64().withMessage("L'image doit être au format base64"),
    body('mode_pricing').isLength({ min: 3 }).withMessage("Le mode_pricing doit contenir au moins 3 caracatères"),
    body('value').notEmpty().withMessage("value must be not empty").isNumeric().withMessage("value format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddShippingCompanie({
            name: req.body.name,
            image: req.body.image,
            mode_pricing: req.body.mode_pricing,
            value: req.body.value,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/shippingcompanie/:id', verifyTOKEN,
    body('image').optional().isBase64().withMessage("L'image doit être au format base64"),
    body('isShow').optional().isBoolean().withMessage("isShow should be boolean"),
    body('range').optional().isInt().withMessage("range should be integer"),
    body('mode_pricing').optional().isLength({ min: 3 }).withMessage("Le mode_pricing doit contenir au moins 3 caracatères"),
    body('value').optional().notEmpty().withMessage("value must be not empty").isNumeric().withMessage("value format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchShippingCompanie({
            id: req.params.id,
            image: req.body.image,
            isShow: req.body.isShow,
            range: req.body.range,
            mode_pricing: req.body.mode_pricing,
            value: req.body.value
        })

        return res.status(response.code).json(response)
    })

// app.delete('/admin/shippingcompanie/:id', verifyTOKEN,
//     async (req, res) => {
//         var response = await AdminServices.RemoveShippingCompanie({
//             id: req.params.id
//         })

//         return res.status(response.code).json(response)
//     })

app.get('/admin/columnofuser', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetColumnOfUser({ id: null })

        return res.status(response.code).json(response)
    })

app.get('/admin/columnofuser/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetColumnOfUser({
            id: req.params.id
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/columnofuser', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('active').not().isEmpty().withMessage("La validité ne doit pas être vide").isBoolean().withMessage("Le format est invalide")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddColumnOfUser({
            name: req.body.name,
            active: req.body.active,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/columnofuser/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().withMessage("name ne doit pas être vide").isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('active').optional().not().isEmpty().withMessage("active ne doit pas être vide").isBoolean().withMessage("Le format est invalide")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchColumnOfUser({
            id: req.params.id,
            active: req.body.active,
            name: req.body.name,
        })

        return res.status(response.code).json(response)
    })

app.delete('/admin/columnofuser/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.RemoveColumnOfUser({
            id: req.params.id
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/team_member', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('email').not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect"),
    body('password').isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères"),
    body('salaire').notEmpty().withMessage("salaire must be not empty").isNumeric().withMessage("salaire format is invalid"),
    body('day_payment').notEmpty().withMessage("day_payment must be not empty").isNumeric().withMessage("day_payment format is invalid"),
    body('commission').notEmpty().withMessage("commission must be not empty").isNumeric().withMessage("commission format is invalid"),
    body('upsell').notEmpty().withMessage("upsell must be not empty").isNumeric().withMessage("upsell format is invalid"),
    body('crosssell').notEmpty().withMessage("crosssell must be not empty").isNumeric().withMessage("crosssell format is invalid"),
    body('downsell').notEmpty().withMessage("downsell must be not empty").isNumeric().withMessage("downsell format is invalid"),
    body('max_order').notEmpty().withMessage("max_order must be not empty").isNumeric().withMessage("max_order format is invalid"),
    body('can_del_or_edit_order').not().isEmpty().withMessage("can_del_or_edit_order ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('column_access').isArray().withMessage("column_access must be array"),
    body('page_access').isArray().withMessage("page_access must be array")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddTeamMember({
            name: req.body.name,
            email: req.body.email,
            plainPassword: req.body.password,
            salaire: req.body.salaire,
            day_payment: req.body.day_payment,
            max_order: req.body.max_order,
            commission: req.body.commission,
            upsell: req.body.upsell,
            crosssell: req.body.crosssell,
            downsell: req.body.downsell,
            can_del_or_edit_order: req.body.can_del_or_edit_order,
            column_access: req.body.column_access,
            page_access: req.body.page_access,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/team_member', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetTeamMember({ id: null })

        return res.status(response.code).json(response)
    })

app.get('/admin/team_member/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetTeamMember({
            id: req.params.id
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/team_member/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().withMessage("name ne doit pas être vide").isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('active').optional().not().isEmpty().withMessage("active ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('email').optional().not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect"),
    body('password').optional().not().isEmpty().withMessage("password ne doit pas être vide").isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères"),
    body('salaire').optional().not().isEmpty().withMessage("salaire ne doit pas être vide").isNumeric().withMessage("salaire format is invalid"),
    body('day_payment').optional().not().isEmpty().withMessage("day_payment ne doit pas être vide").isNumeric().withMessage("day_payment format is invalid"),
    body('commission').optional().not().isEmpty().withMessage("commission ne doit pas être vide").isNumeric().withMessage("commission format is invalid"),
    body('upsell').optional().not().isEmpty().withMessage("upsell ne doit pas être vide").isNumeric().withMessage("upsell format is invalid"),
    body('crosssell').optional().not().isEmpty().withMessage("crosssell ne doit pas être vide").isNumeric().withMessage("crosssell format is invalid"),
    body('downsell').optional().not().isEmpty().withMessage("downsell ne doit pas être vide").isNumeric().withMessage("downsell format is invalid"),
    body('max_order').optional().not().isEmpty().withMessage("max_order ne doit pas être vide").isNumeric().withMessage("max_order format is invalid"),
    body('can_del_or_edit_order').optional().not().isEmpty().withMessage("can_del_or_edit_order ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('all_column_access').optional().not().isEmpty().withMessage("all_column_access ne doit pas être vide").isBoolean().withMessage("Le format est invalide"),
    body('all_page_access').optional().not().isEmpty().withMessage("all_page_access ne doit pas être vide").withMessage("Le format est invalide"),
    body('column_access').optional().isArray().withMessage("column_access must be array"),
    body('page_access').optional().isArray().withMessage("page_access must be array")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchTeamMember({
            id: req.params.id,
            name: req.body.name,
            active: req.body.active,
            crosssell: req.body.crosssell,
            downsell: req.body.downsell,
            email: req.body.email,
            plainPassword: req.body.password === 'yourpassword' ? null : req.body.password,
            max_order: req.body.max_order,
            salaire: req.body.salaire,
            day_payment: req.body.day_payment,
            commission: req.body.commission,
            upsell: req.body.upsell,
            can_del_or_edit_order: req.body.can_del_or_edit_order,
            all_column_access: req.body.all_column_access,
            all_page_access: req.body.all_page_access,
            column_access: req.body.column_access ?? [],
            page_access: req.body.page_access ?? []
        })

        return res.status(response.code).json(response)
    })

app.delete('/admin/team_member/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.RemoveTeamMember({
            id: req.params.id
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/coupon', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 1 caracatères"),
    body('code').isLength({ min: 5 }).withMessage("Le code doit contenir au moins 5 caracatères"),
    body('discount').notEmpty().withMessage("discount must be not empty").isNumeric().withMessage("discount format is invalid"),
    body('time').isLength({ min: 1 }).withMessage("Time doit contenir au moins 1 caracatères"),
    body('limit').notEmpty().withMessage("limit must be not empty").isNumeric().withMessage("limit format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddCoupon({
            name: req.body.name,
            code: req.body.code,
            discount: req.body.discount,
            time: req.body.time,
            limit: req.body.limit,
            used: 0,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/coupon', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetCoupon({ id: null })

        return res.status(response.code).json(response)
    })

app.get('/admin/coupon/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetCoupon({
            id: req.params.id
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/coupon/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().withMessage("name ne doit pas être vide").isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 1 caracatères"),
    body('code').optional().not().isEmpty().withMessage("code ne doit pas être vide").isLength({ min: 5 }).withMessage("Le code doit contenir au moins 5 caracatères"),
    body('discount').optional().not().isEmpty().withMessage("discount ne doit pas être vide").notEmpty().withMessage("discount must be not empty").isNumeric().withMessage("discount format is invalid"),
    body('time').optional().not().isEmpty().withMessage("time ne doit pas être vide").isLength({ min: 1 }).withMessage("Time doit contenir au moins 1 caracatères"),
    body('limit').optional().not().isEmpty().withMessage("limit ne doit pas être vide").notEmpty().withMessage("limit must be not empty").isNumeric().withMessage("limit format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchCoupon({
            id: req.params.id,
            name: req.body.name,
            code: req.body.code,
            discount: req.body.discount,
            time: req.body.time,
            limit: req.body.limit
        })

        return res.status(response.code).json(response)
    })

app.delete('/admin/coupon/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.RemoveCoupon({
            id: req.params.id
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/city', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 1 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddCity({
            name: req.body.name,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/city', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetCity({ id: null })

        return res.status(response.code).json(response)
    })

app.get('/admin/city/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetCity({
            id: req.params.id
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/city/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().withMessage("name ne doit pas être vide").isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 1 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchCity({
            id: req.params.id,
            name: req.body.name
        })

        return res.status(response.code).json(response)
    })

app.delete('/admin/city/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.RemoveCity({
            id: req.params.id
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/setting', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetSetting({
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/setting', verifyTOKEN,
    body('default_conf_pricing').optional().not().isEmpty().withMessage("default_conf_pricing ne doit pas être vide").notEmpty().withMessage("default_conf_pricing must be not empty").isNumeric().withMessage("default_conf_pricing format is invalid"),
    body('delfault_del_pricing').optional().not().isEmpty().withMessage("delfault_del_pricing ne doit pas être vide").notEmpty().withMessage("delfault_del_pricing must be not empty").isNumeric().withMessage("delfault_del_pricing format is invalid"),
    body('default_time').optional().not().isEmpty().withMessage("default_time ne doit pas être vide").notEmpty().withMessage("default_time must be not empty").isNumeric().withMessage("default_time format is invalid"),
    body('trial_period').optional().not().isEmpty().withMessage("trial_period ne doit pas être vide").notEmpty().withMessage("trial_period must be not empty").isNumeric().withMessage("trial_period format is invalid"),
    body('max_solde_du').optional().not().isEmpty().withMessage("max_solde_du ne doit pas être vide").notEmpty().withMessage("max_solde_du must be not empty").isNumeric().withMessage("max_solde_du format is invalid"),
    body('goal').optional().not().isEmpty().withMessage("goal ne doit pas être vide").notEmpty().withMessage("goal must be not empty").isNumeric().withMessage("goal format is invalid"),
    body('automated_msg').optional().not().isEmpty().withMessage("automated_msg ne doit pas être vide").isLength({ min: 1 }).withMessage("Le automated_msg doit contenir au moins 1 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchSetting({
            id_admin: ExtractUserFromTOKEN(req.token).id,
            default_conf_pricing: req.body.default_conf_pricing,
            delfault_del_pricing: req.body.delfault_del_pricing,
            default_time: req.body.default_time,
            trial_period: req.body.trial_period,
            goal: req.body.goal,
            max_solde_du: req.body.max_solde_du,
            automated_msg: req.body.automated_msg
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/annoucement', verifyTOKEN, async (req, res) => {

    var response = await AdminServices.GetAnnoucement({
        id_admin: ExtractUserFromTOKEN(req.token).id
    })

    return res.status(response.code).json(response)
})

app.delete('/admin/annoucement', verifyTOKEN, async (req, res) => {

    var response = await AdminServices.DeleteAnnoucement({
        id_admin: ExtractUserFromTOKEN(req.token).id
    })

    return res.status(response.code).json(response)
})

app.post('/admin/annoucement', verifyTOKEN,
    body('text').isLength({ min: 2 }).withMessage("Le text doit contenir au moins 2 caracatères"),
    body('clt_categorie').notEmpty().withMessage("clt_categorie is required").isArray().withMessage("clt_categorie must be array")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddAnoucement({
            text: req.body.text,
            clt_categorie: req.body.clt_categorie,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/annoucement/:id', verifyTOKEN,
    body('text').optional().not().isEmpty().withMessage("text ne doit pas être vide").isLength({ min: 7 }).withMessage("Le text doit contenir au moins 7 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchAnnoucement({
            id: req.params.id,
            text: req.body.text
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/ads', verifyTOKEN,
    body('image').isBase64().withMessage("L'image doit être au format base64"),
    body('clt_categorie').notEmpty().withMessage("clt_categorie is required").isArray().withMessage("clt_categorie must be array")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddAds({
            image: req.body.image,
            clt_categorie: req.body.clt_categorie,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.delete('/admin/ads', verifyTOKEN, async (req, res) => {

    var response = await AdminServices.DeleteAds({
        id_admin: ExtractUserFromTOKEN(req.token).id
    })

    return res.status(response.code).json(response)
})

app.get('/admin/ads', verifyTOKEN, async (req, res) => {

    var response = await AdminServices.GetAds({
        id_admin: ExtractUserFromTOKEN(req.token).id
    })

    return res.status(response.code).json(response)
})

app.patch('/admin/ads/:id', verifyTOKEN,
    body('image').optional().not().isEmpty().withMessage("image ne doit pas être vide").isLength({ min: 1 }).withMessage("L'image doit contenir au moins 1 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchAds({
            id: req.params.id,
            image: req.body.image
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/pack', verifyTOKEN
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.GetPack()

        return res.status(response.code).json(response)
    })

app.post('/admin/pack', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le name doit contenir au moins 1 caracatères"),
    body('price_per_month').notEmpty().withMessage("price_per_month must be not empty").isNumeric().withMessage("price_per_month format is invalid"),
    body('item_inclued').notEmpty().withMessage("item_inclued is required").isArray().withMessage("item_inclued must be array")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddPack({
            name: req.body.name,
            price_per_month: req.body.price_per_month,
            item_inclued: req.body.item_inclued,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/pack/:id', verifyTOKEN,
    body('name').optional().isLength({ min: 3 }).withMessage("Le text doit contenir au moins 3 caracatères"),
    body('support').optional().isLength({ min: 3 }).withMessage("Le text doit contenir au moins 3 caracatères"),
    body('price_per_month').optional().notEmpty().withMessage("price_per_month must be not empty").isNumeric().withMessage("price_per_month format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchPack({
            id: req.params.id,
            name: req.body.name,
            support: req.body.support,
            price_per_month: req.body.price_per_month,
            isShow: req.body.isShow,
            item_inclued: req.body.item_inclued,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/status', verifyTOKEN,
    body('name').isLength({ min: 3 }).withMessage("Le text doit contenir au moins 3 caracatères"),
    body('checked').not().isEmpty().withMessage("checked ne doit pas être vide").isBoolean().withMessage("Le format est invalide")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddStatus({
            name: req.body.name,
            checked: req.body.checked,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/status/:id', verifyTOKEN,
    body('name').optional().isLength({ min: 3 }).withMessage("Le text doit contenir au moins 3 caracatères"),
    body('checked').optional().not().isEmpty().withMessage("checked ne doit pas être vide").isBoolean().withMessage("Le format est invalide")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchStatus({
            id: req.params.id,
            name: req.body.name,
            checked: req.body.checked
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/status', verifyTOKEN
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.GetStatus()

        return res.status(response.code).json(response)
    })

app.get('/admin/page', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetPage()

        return res.status(response.code).json(response)
    })

app.get('/admin/pertecategorie', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetPerteCategorie({ id: null, id_admin: ExtractUserFromTOKEN(req.token).id })

        return res.status(response.code).json(response)
    })

app.get('/admin/pertecategorie/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetPerteCategorie({
            id: req.params.id,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/pertecategorie', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddPerteCategorie({
            name: req.body.name,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/pertecategorie/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchPerteCategorie({
            id: req.params.id,
            id_admin: ExtractUserFromTOKEN(req.token).id,
            name: req.body.name
        })

        return res.status(response.code).json(response)
    })

app.delete('/admin/pertecategorie/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.RemovePerteCategorie({
            id: req.params.id,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/gaincategorie', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetGainCategorie({ id: null, id_admin: ExtractUserFromTOKEN(req.token).id })

        return res.status(response.code).json(response)
    })

app.get('/admin/gaincategorie/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetGainCategorie({
            id: req.params.id,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/gaincategorie', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddGainCategorie({
            name: req.body.name,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/gaincategorie/:id', verifyTOKEN,
    body('name').optional().not().isEmpty().isLength({ min: 1 }).withMessage("Le nom doit contenir au moins 3 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchGainCategorie({
            id: req.params.id,
            id_admin: ExtractUserFromTOKEN(req.token).id,
            name: req.body.name
        })

        return res.status(response.code).json(response)
    })

app.delete('/admin/gaincategorie/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.RemoveGainCategorie({
            id: req.params.id,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/gain', verifyTOKEN,
    body('id_user').notEmpty().withMessage("id_user must be not empty").isNumeric().withMessage("id_user format is invalid"),
    body('id_gain_categorie').notEmpty().withMessage("id_gain_categorie must be not empty").isNumeric().withMessage("id_gain_categorie format is invalid"),
    body('note').isLength({ min: 3 }).withMessage("La note doit contenir au moins 3 caracatères"),
    body('date').isDate().withMessage("Le format de la date est incorrect"),
    body('amount').notEmpty().withMessage("amount must be not empty").isFloat().withMessage("amount format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddGain({
            id_user: req.body.id_user,
            id_gain_categorie: req.body.id_gain_categorie,
            note: req.body.note,
            date: req.body.date,
            amount: req.body.amount,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.delete('/admin/gain/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.RemoveGain({
            id: req.params.id,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/perte', verifyTOKEN,
    body('id_perte_categorie').notEmpty().withMessage("id_perte_categorie must be not empty").isNumeric().withMessage("id_perte_categorie format is invalid"),
    body('note').optional(),
    body('dateFrom').isDate().withMessage("Le format de la dateFrom est incorrect"),
    body('dateTo').isDate().withMessage("Le format de la dateTo est incorrect"),
    body('amount').notEmpty().withMessage("amount must be not empty").isFloat().withMessage("amount format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddPerte({
            id_perte_categorie: req.body.id_perte_categorie,
            note: req.body.note,
            dateTo: req.body.dateTo,
            dateFrom: req.body.dateFrom,
            amount: req.body.amount,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.delete('/admin/perte/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.RemovePerte({
            id: req.params.id,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/transaction', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetTransaction({
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/detailsofspending', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetDetailsOfSpending({
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/client', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetAllClient({
            id_admin: ExtractUserFromTOKEN(req.token).id,
            id_team_member_confirmation: ExtractUserFromTOKEN(req.token).id_team ?? req.query.id_team,
            datefrom: req.query.datefrom,
            dateto: req.query.dateto,
            search: req.query.search,
            usedate: Number(req.query.usedate),
            status_clt: req.query.status_clt,
            id_user: req.query.id_user,
            _skip: req.query._skip,
            _limit: req.query._limit
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/client/all', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetClient()

        return res.status(response.code).json(response)
    })

app.post('/admin/client', verifyTOKEN,
    body('fullname').not().isAlpha().withMessage("fullname doit être une chaine de caractère").isLength({ min: 3, max: 30 }).withMessage("La longeur de fullname est invalide"),
    body('email').not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect"),
    body('message').optional().not().isEmpty().withMessage("message ne doit pas être vide").isLength({ min: 1 }).withMessage("Le message doit contenir au moins 3 caracatères"),
    body('telephone').not().isEmpty().withMessage("telephone ne doit pas être vide").isLength({ min: 10, max: 15 }).withMessage("La longeur du telephone est invalide"),
    body('password').isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddClient({
            fullname: req.body.fullname,
            email: req.body.email,
            message: req.body.message,
            telephone: req.body.telephone,
            plainPassword: req.body.password,
            role: 'client',
            id_admin: 1,
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/teammemberasdashbord', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetTeamMemberAsDashbord()

        return res.status(response.code).json(response)
    })

app.patch('/admin/user_as_dashbord/:id', verifyTOKEN,
    body('id_team_member_confirmation').optional().not().isEmpty().withMessage("id_team_member_confirmation ne doit pas être vide").isNumeric().withMessage("id_team_member_confirmation format is invalid"),
    body('prev_id_team').optional().not().isEmpty().withMessage("prev_id_team ne doit pas être vide").isNumeric().withMessage("prev_id_team format is invalid"),
    body('message').optional().not().isEmpty().withMessage("message ne doit pas être vide").isString().withMessage("message format is invalid"),
    body('active').optional().not().isEmpty().withMessage("active ne doit pas être vide").isBoolean().withMessage("active format is invalid"),
    body('favorite').optional().not().isEmpty().withMessage("favorite ne doit pas être vide").isBoolean().withMessage("favorite format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchClient({
            id: req.params.id,
            id_team_member_confirmation: req.body.id_team_member_confirmation,
            prev_id_team: req.body.prev_id_team,
            message: req.body.message,
            active: req.body.active,
            favorite: req.body.favorite
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/paymentmethod', verifyTOKEN,
    body('name').isLength({ min: 3 }).withMessage("Le nom doit contenir au moins 3 caracatères"),
    body('image').isBase64().withMessage("L'image doit être au format base64")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddPaymentMethod({
            name: req.body.name,
            image: req.body.image,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/paymentmethod', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetPaymentMethod({
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.delete('/admin/paymentmethod/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.RemovePaymentMethod({
            id: req.params.id
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/bankinformation', verifyTOKEN,
    body('name').isLength({ min: 1 }).withMessage("Le name doit contenir au moins 1 caracatères"),
    body('bank').isLength({ min: 1 }).withMessage("Le bank doit contenir au moins 1 caracatères"),
    body('rib').isLength({ min: 1 }).withMessage("Le rib doit contenir au moins 1 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.AddBankInformation({
            name: req.body.name,
            bank: req.body.bank,
            rib: req.body.rib,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/bankinformation', verifyTOKEN,
    body('id').not().isEmpty().withMessage("id ne doit pas être vide"),
    body('name').isLength({ min: 1 }).withMessage("Le name doit contenir au moins 1 caracatères"),
    body('bank').isLength({ min: 1 }).withMessage("Le bank doit contenir au moins 1 caracatères"),
    body('rib').isLength({ min: 1 }).withMessage("Le rib doit contenir au moins 1 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.PatchBankInformation({
            id: req.body.id,
            name: req.body.name,
            bank: req.body.bank,
            rib: req.body.rib
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/bankinformation', verifyTOKEN
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.GetBankInformation()

        return res.status(response.code).json(response)
    })

app.get('/admin/paymentclient', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetPaymentClient({
            id_admin: ExtractUserFromTOKEN(req.token).id,
            status: req.query.status,
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/paymentclient/:id', verifyTOKEN, async (req, res) => {

    var response = await AdminServices.AcceptPaymentClient({
        id: req.params.id,
        id_admin: ExtractUserFromTOKEN(req.token).id
    })

    return res.status(response.code).json(response)
})

app.delete('/admin/paymentclient/:id', verifyTOKEN, async (req, res) => {
    var response = await AdminServices.RefusePaymentClient({
        id: req.params.id,
        id_admin: ExtractUserFromTOKEN(req.token).id
    })

    return res.status(response.code).json(response)
})

app.post('/admin/reloadclientaccount', verifyTOKEN,
    body('id_user').isNumeric().withMessage("id_user format is invalid"),
    body('amount').isNumeric().withMessage("amount format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.ReloadClientAccount({
            id_user: req.body.id_user,
            amount: req.body.amount,
            id_admin: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/paiement_dashbord', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetPaiementDashbord({
            id_admin: ExtractUserFromTOKEN(req.token).id,
            dateFrom: req.query.datefrom,
            dateTo: req.query.dateto,
            useDate: Number(req.query.usedate)
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/dashboard', verifyTOKEN
    , async (req, res) => {

        var response = await AdminServices.GetDashboard({
            id_team: ExtractUserFromTOKEN(req.token).id_team ?? req.query.id_team,
            id_admin: ExtractUserFromTOKEN(req.token).id,
            dateFrom: req.query.datefrom,
            dateTo: req.query.dateto,
            useDate: Number(req.query.usedate),
            status_clt: req.query.status_clt,
            id_user: req.query.id_user
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/dashboard/team_member', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetTeamDashboard({
            id_admin: ExtractUserFromTOKEN(req.token).id,
            id_team_member_confirmation: ExtractUserFromTOKEN(req.token).id_team ?? req.query.id_team,
            useDate: Number(req.query.usedate),
            dateFrom: req.query.datefrom,
            dateTo: req.query.dateto,
            id: req.query.id_user,
            id_shipping: req.query.id_shipping
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/client/password', verifyTOKEN,
    body('id_user').isNumeric().withMessage("id_user format is invalid"),
    body('password').not().isEmpty().withMessage("password ne doit pas être vide").isLength({ min: 8 }).withMessage("Le password doit contenir au moins 8 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.ChangePasswordClient({
            id_admin: ExtractUserFromTOKEN(req.token).id,
            id_user: req.body.id_user,
            plainPassword: req.body.password
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/setting/freetrialtoclient', verifyTOKEN,
    body('id_user').notEmpty().withMessage("id_user must be not empty").isNumeric().withMessage("id_user format is invalid"),
    body('period').notEmpty().withMessage("period must be not empty").isFloat().withMessage("period format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await ClientServices.GiveFreeTrial({
            id_user: req.body.id_user,
            period: req.body.period
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/setting/migratepack', verifyTOKEN,
    body('prev_pack').notEmpty().withMessage("prev_pack must be not empty").isNumeric().withMessage("prev_pack format is invalid"),
    body('new_pack').notEmpty().withMessage("new_pack must be not empty").isFloat().withMessage("new_pack format is invalid")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.MigrateAllPack({
            prev_pack: req.body.prev_pack,
            new_pack: req.body.new_pack
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/support', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetIssues({
            id_admin: ExtractUserFromTOKEN(req.token).id,
            status: req.query.status
        })

        return res.status(response.code).json(response)
    })

app.patch('/admin/support/:id',
    body('status').isLength({ min: 3 }).withMessage("Le status doit contenir au moins 1 caracatères"),
    verifyTOKEN,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AdminServices.ChangeIssueStatus({
            id_admin: ExtractUserFromTOKEN(req.token).id,
            id_support: req.params.id,
            status: req.body.status
        })

        return res.status(response.code).json(response)
    })

app.get('/admin/support/msg/:id', verifyTOKEN,
    async (req, res) => {
        var response = await AdminServices.GetMessagesBySupport({
            id_admin: ExtractUserFromTOKEN(req.token).id,
            id_support: req.params.id
        })

        return res.status(response.code).json(response)
    })

module.exports = app;