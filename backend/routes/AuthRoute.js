const server = require('express')
const app = server()
const passport = require('passport')
const bodyParser = require('body-parser')
const { body, validationResult } = require('express-validator');
const { verifyTOKEN, ExtractUserFromTOKEN } = require('../middleware/verifyToken')
const { AuthServices } = require('../services')

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))

app.post('/client/login',
    body('email').not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect"),
    body('password').isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.ClientLogin({
            email: req.body.email,
            password: req.body.password
        })

        return res.status(response.code).json(response)
    })

app.post('/client/loginas/team',
    body('email').not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.LoginAsTeam({ email: req.body.email })

        return res.status(response.code).json(response)
    })

app.post('/admin/loginas/client',
    body('email').not().isEmpty().withMessage("email ne doit pas être vide")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.LoginAsClient({ email: req.body.email })

        return res.status(response.code).json(response)
    })

app.post('/client/resend/code',
    body('telephone').not().isEmpty().withMessage("telephone ne doit pas être vide")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.sendCode({ telephone: req.body.telephone })

        return res.status(response.code).json(response)
    })

app.post('/client/password', verifyTOKEN,
    body('newPassword').isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères"),
    body('prevPassword').isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères")
    , async (req, res) => {
        const errors = validationResult(req.token);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.ResetClientPassword({
            newPassword: req.body.newPassword,
            prevPassword: req.body.prevPassword,
            id: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/password/forgot',
    body('email').not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.ForgotPassword({
            email: req.body.email,
        })

        return res.status(response.code).json(response)
    })

app.post('/client/register',
    body('fullname').not().isEmpty().withMessage("fullname doit être une chaine de caractère"),
    body('email').not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect"),
    body('telephone').not().isEmpty().withMessage("telephone ne doit pas être vide").isLength({ min: 10, max: 18 }).withMessage("La longeur du telephone est invalide"),
    body('password').isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.ClientRegister({
            fullname: req.body.fullname,
            email: req.body.email,
            telephone: req.body.telephone,
            plainPassword: req.body.password,
            role: 'client',
            id_admin: 1,
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/login',
    body('email').not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect"),
    body('password').isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.AdminLogin({
            email: req.body.email,
            password: req.body.password
        })

        return res.status(response.code).json(response)
    })

app.post('/admin/register',
    body('fullname').not().isEmpty().withMessage("fullname doit être une chaine de caractère"),
    body('password').isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères"),
    body('email').not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect"),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.AdminRegister({
            fullname: req.body.fullname,
            plainPassword: req.body.password,
            email: req.body.email,
        })

        return res.status(response.code).json(response)
    })

app.post('/team/admin/login',
    body('email').not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect"),
    body('password').isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.TeamAdminLogin({
            email: req.body.email,
            password: req.body.password
        })

        return res.status(response.code).json(response)
    })

app.post('/team/user/login',
    body('email').not().isEmpty().withMessage("email ne doit pas être vide").isEmail().withMessage("Le format de email est incorrect"),
    body('password').isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caracatères")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.TeamUserLogin({
            email: req.body.email,
            password: req.body.password
        })

        return res.status(response.code).json(response)
    })

app.post('/client/reponse', verifyTOKEN,
    body('response').isJSON().withMessage("La response doit être au format JSON")
    , async (req, res) => {
        const errors = validationResult(req.token);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.SaveResponse({
            response: req.body.response,
            id: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

app.post('/client/choose_pack', verifyTOKEN,
    body('id_pack').isNumeric().withMessage("id_pack doit être un nombre"),
    body('contact').isString().withMessage("contact doit être un nombre")
    , async (req, res) => {
        const errors = validationResult(req.token);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        var response = await AuthServices.ChoosePack({
            id_pack: req.body.id_pack,
            contact: req.body.contact,
            id: ExtractUserFromTOKEN(req.token).id
        })

        return res.status(response.code).json(response)
    })

module.exports = app;