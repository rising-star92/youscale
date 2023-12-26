const server = require('express')
const multer = require('multer');
const app = server()
const bodyParser = require('body-parser')
const csv = require('csv-parser');
const fs = require('fs');
const { verifyTOKEN, ExtractUserFromTOKEN } = require('../middleware/verifyToken')
const { ClientServices } = require('../services')

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    onFileUploadStart: (file, req, res) => {
        console.log(`${file.originalname} is starting to upload`);
    },

    onFileUploadComplete: (file, req, res) => {
        console.log(`${file.originalname} has finished uploading`);
    },

    onFileUploadProgress: (file, buffer, bytesLoaded) => {
        const percent = (bytesLoaded / file.size) * 100;
        console.log(`${percent}% uploaded`);
    }
})

// app.post('/files/city', verifyTOKEN,
//     async (req, res) => {
//         var response = await ClientTeamServices.GetPageAccess({
//             id_team: ExtractUserFromTOKEN(req.token).id_team
//         })

//         return res.status(response.code).json(response)
//     })

const results = [];

app.post('/client/city/upload', verifyTOKEN, upload.single('file'), async (req, res) => {

    fs.createReadStream(`uploads/${req.file.filename}`)
        .pipe(csv())
        .on('data', (data) => {
            var value = {};
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var splitValues = data[key].split(';');
                    value['Nom'] = splitValues[0];
                    value['Prix'] = splitValues[1];
                    value['Companies'] = splitValues[2];
                }
            }
            results.push(value)
        })
        .on('end', async () => {
            console.log('results: ',results)
            var response = await ClientServices.AddCityByUploadFile({
                id_user: ExtractUserFromTOKEN(req.token).id,
                cities: results
            })

            return res.status(response.code).json(response)
        });
});

module.exports = app;