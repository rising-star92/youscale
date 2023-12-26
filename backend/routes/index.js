require('dotenv').config();
const cors = require('cors');
const server = require('express')
const passport = require('passport')
const session = require('express-session')
const passportSetup = require('../passport/passport')

const app = server()
const AuthRoute = require('./AuthRoute')
const AdminRoute = require('./AdminRoute')
const ClientRoute = require('./ClientRoute')
const AdminTeamRoute = require('./AdminTeamRoute')
const ClientTeamRoute = require('./ClientTeamRoute')
const FilesUploadRoute = require('./FilesUploadRoute')

app.use(session({
    secret: 'somethingsecretgoeshere',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));
app.use(cors())
app.use(passport.initialize())
app.use(passport.session())

app.get('/login/success'
    , async (req, res) => {
        console.log(req.user)
        if (req.user) {
            res.status(200).json({
                error: false,
                message: 'Successfully Loged In',
                user: req.user
            })
        } else {
            res.status(403).json({ error: true, message: 'Not Authorized' })
        }
    })

app.get('/login/failed'
    , async (req, res) => {
        res.redirect(`${process.env.CLIENT_URL}/failed`);
    })

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login/failed',
    }),
    (req, res) => {
        const { token, client } = req.user
        res.redirect(`${process.env.CLIENT_URL}/success?token=${token}&client=${JSON.stringify(client)}`);
    }
)

app.get('/google', passport.authenticate('google', ['profile', 'email']))

app.use(`${process.env.API_URL}/${process.env.API_VERSION}`, AuthRoute)
app.use(`${process.env.API_URL}/${process.env.API_VERSION}`, AdminRoute)
app.use(`${process.env.API_URL}/${process.env.API_VERSION}`, ClientRoute)
app.use(`${process.env.API_URL}/${process.env.API_VERSION}`, AdminTeamRoute)
app.use(`${process.env.API_URL}/${process.env.API_VERSION}`, ClientTeamRoute)
app.use(`${process.env.API_URL}/${process.env.API_VERSION}`, FilesUploadRoute)

module.exports = app