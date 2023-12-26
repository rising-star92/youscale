const jwt = require('jsonwebtoken')

function verifyTOKEN(req,res,next) {
    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]

    try {
        jwt.verify(token, process.env.SECRET_TOKEN, (err, user)=>{
            if(err) return res.status(400).send('Access denied')

            if(user){
                req.token = token
                next()
            }
            else{
                return res.status(400).send('Access denied')
            }
        })   
    } catch (error) {
        return res.status(400).send('Access denied')
    }
}

function ExtractUserFromTOKEN(token){
    var client = null
    jwt.verify(token, process.env.SECRET_TOKEN, (err, data)=>{
        if(data) client = data
    })

    return client
}

module.exports = {
    verifyTOKEN, 
    ExtractUserFromTOKEN
}