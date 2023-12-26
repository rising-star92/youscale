require('dotenv').config();
const { google } = require('googleapis')
const { Sheet, Column_Of_Order, Product, City_User, Order } = require('../models')
const ClientServices = require('./ClientServices')
const { sequelize: seqlz } = require('../models/index')

class IntegrateServices {

    static #Obligatirycolumn = ['Telephone', 'Ville', 'Prix', 'Produit']

    static async #findColumnOfOrder(id_user) {
        var column = ['Order id', 'Produit', 'Destinataire', 'Telephone', 'Ville', 'Prix', 'Commentaire', 'Adresse']
        var columnFound = await Column_Of_Order.findAll({
            where: {
                id_user,
                name: column
            }
        })

        if (columnFound) return [...columnFound, {
            name: 'Quantite',
            alias: null,
        }, {
            name: 'Variante',
            alias: null,
        }]

        return false
    }

    static async #findCityByName(name, id_user) {
        var city = await City_User.findOne({ where: { name, id_user } })

        if (city) return city

        return null
    }

    static async #findOrderByIdSheet(id_sheet) {
        var order = await Order.findOne({ where: { SheetId: id_sheet } })

        if (order) return order

        return null
    }

    static async #CreateCity({ name, id_user }) {

        try {
            var city = await City_User.build({ name, id_user, price: 0, isFromSheet: true })

            await city.save()

            if (city) return city.id

            return null
        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async #findProductByName(name, quantite, variante, id_user) {
        var splitName = name !== null ? name.split(',') : 0
        var splitQuantite = quantite !== null ? quantite.split(',') : 1
        var splitVariante = variante !== null ? variante.split(',') : []

        var product = await Product.findAll({ where: { name: splitName, id_user } })

        var id_product = []
        for (let i = 0; i < product.length; i++) {
            id_product.push({
                id: product[i].id,
                quantity: splitQuantite[i] ? splitQuantite[i] !== 'null' ? splitQuantite[i] : 1 : 1,
                variant: splitVariante[i] ? splitVariante[i] !== 'null' ? splitVariante[i] : [] : []
            })
        }

        if (id_product) return id_product

        return false
    }

    static async #findSheetByuserId(id_user) {
        var sheet = await Sheet.findAll({ where: { id_user } })

        if (sheet) return sheet

        return false
    }

    static async #getAllColumnAlias(id_user) {
        var columnFound = await this.#findColumnOfOrder(id_user)
        if (!columnFound) return false

        var columnAlias = {}
        for (let i = 0; i < columnFound.length; i++)
            Object.assign(columnAlias, { [columnFound[i].name]: columnFound[i].alias ?? columnFound[i].name })

        Object.assign(columnAlias, { 'Quantite': 'Quantite' })
        Object.assign(columnAlias, { 'Variante': 'Variante' })

        return columnAlias
    }

    static #MergeDataByIdOrder({ data, id_order, product }) {

        const merged = data.reduce((acc, cur) => {
            const existing = acc.find((item) => item[id_order] === cur[id_order]);

            if (existing) {
                existing[product] = existing[product] + ',' + cur[product];
                existing['Quantite'] = existing['Quantite'] + ',' + cur['Quantite'];
                existing['Variante'] = existing['Variante'] + ',' + cur['Variante'];
            } else {
                acc.push(cur);
            }
            return acc;
        }, []);

        return merged
    }
    
    static getObjectWithActiveColumn = ({ data, ActiveColumn }) => {
        var newArr = []
        for (let i = 0; i < data.length; i++) {
            var objTemp = {}
            for (let j = 0; j < ActiveColumn.length; j++) {
                var tp = { [ActiveColumn[j]]: data[i][`${ActiveColumn[j]}`] ?? null }
                Object.assign(objTemp, tp)
            }
            newArr.push(objTemp)
        }

        return { code: 200, data: newArr }
    }

    static async #ParseSheetToArrayObject({ sheetArray, id_user }) {
        var newArr = []
        for (let i = 1; i < sheetArray.length; i++) {

            var objTemp = {}
            for (let j = 0; j < sheetArray[0].length; j++) {
                var tp = { [sheetArray[0][j]]: sheetArray[i][j] ?? null }
                Object.assign(objTemp, tp)
            }
            newArr.push(objTemp)
        }

        var ActiveColumn = []
        var Obligatirycolumn = []
        const col = await this.#findColumnOfOrder(id_user)

        for (let i = 0; i < col.length; i++)
            if (this.#Obligatirycolumn.includes(col[i].name)) Obligatirycolumn.push(col[i].alias ?? col[i].name)

        var allRequiredColumnsPresent = Obligatirycolumn.every(col => sheetArray[0].includes(col));
        if (!allRequiredColumnsPresent) return { code: 404, data: "Veuillez vérifier les colonnes obligatoires" }

        for (let i = 0; i < col.length; i++) {
            ActiveColumn.push(col[i].alias ?? col[i].name)
        }

        return this.getObjectWithActiveColumn({ data: newArr, ActiveColumn })
    }

    static async PatchSheet({ id, spreadsheetId, range, name }) {
        try {
            var sheet = await Sheet.findOne({ where: { id } })
            if (!sheet) return { code: 400, data: "Internal error, contact the support" }

            sheet.SheetID = spreadsheetId ?? sheet.SheetID
            sheet.range_ = range ?? sheet.range_
            sheet.name = name ?? sheet.name

            const sheetPatched = await sheet.save()

            return { code: 200, data: sheetPatched }

        } catch (error) {
            return { code: 404, message: "Impossible de modifier veuillez vous assurer que les champs sont correct" }
        }
    }

    static async DeleteSheet({ id }) {
        try {
            var sheet = await Sheet.findOne({ where: { id } })
            if (!sheet) return { code: 400, data: "Internal error, contact the support" }

            const sheetDelete = await sheet.destroy()

            return { code: 200, data: sheetDelete }

        } catch (error) {
            return { code: 404, message: "Impossible de modifier veuillez vous assurer que les champs sont correct" }
        }
    }

    static async LinkSheet({ id_user, spreadsheetId, range, name }) {
        try {
            var sheetExist = await Sheet.findOne({ where: { SheetID: spreadsheetId } })
            if (sheetExist) return { code: 400, message: "Cette feuille est déja utilisé, essayez une autre" }

            var nameExist = await Sheet.findOne({ where: { name } })
            if (nameExist) return { code: 400, message: "Ce nom est déja utilisé, essayez un autre" }

            const sheetBuild = await Sheet.build({ SheetID: spreadsheetId, id_user: id_user, range_: range, name: name })
            const sheetSaved = await sheetBuild.save()

            return { code: 200, data: sheetSaved }
        } catch (error) {
            return { code: 404, message: "Internal error, contact the support" }
        }
    }

    static async GetLinkSheet({ id_user }) {
        try {
            var sheet = await this.#findSheetByuserId(id_user)

            if (!sheet) return { code: 404, data: "Veuillez lier une feuille de calcul" }

            return { code: 200, data: sheet }
        } catch (error) {
            return { code: 404, data: "Problème d'authorisation de la feuille sheet" }
        }
    }

    static async GetSheet({ id_user }) {

        function startsWithZero(number) {
            const numberString = number.toString();
            return numberString.startsWith('0');
        }

        try {
            const shts = await Sheet.findAll({
                where: { id_user }
            })

            if (!shts) return { code: 404, data: "Veuillez lier une feuille de calcul" }

            const auth = new google.auth.GoogleAuth({
                keyFile: "credentials.json",
                scopes: "https://www.googleapis.com/auth/spreadsheets"
            });

            // Create client instance for auth
            const client = await auth.getClient()

            // Instance of Google Sheets API
            const googleSheets = google.sheets({ version: "v4", auth: client })

            // here start loop
            shts.map(async sht => {

                try {
                    // Read rows from spredsheet
                    const getRows = await googleSheets.spreadsheets.values.get({
                        auth,
                        spreadsheetId: sht.SheetID,
                        range: sht.range_
                    })

                    var result = await this.#ParseSheetToArrayObject({ sheetArray: getRows.data.values, id_user })
                    const data = result.data

                    if (result.code === 404) return { code: 404, data: "Veuillez vérifier les colonnes obligatoires" }

                    const ColumnAlias = await this.#getAllColumnAlias(id_user)

                    this.#MergeDataByIdOrder({ data, id_order: ColumnAlias['Order id'], product: ColumnAlias['Produit'] })

                    for (let i = 0; i < data.length; i++) {
                        try {
                            var id_sheet = sht.name + '' + data[i][ColumnAlias['Order id']]

                            var sheetExist = await this.#findOrderByIdSheet(id_sheet)

                            if (sheetExist === null) {
                                var id_product_array = await this.#findProductByName(data[i][ColumnAlias['Produit']], data[i]['Quantite'], data[i]['Variante'], id_user)

                                if (id_product_array.length > 0) {
                                    var city = await this.#findCityByName(data[i][ColumnAlias['Ville']], id_user)
                                    var id_city = city ? city.id : await this.#CreateCity({ name: data[i][ColumnAlias['Ville']], id_user: id_user })

                                    if (id_city === null || !data[i][ColumnAlias['Prix']] || !data[i][ColumnAlias['Telephone']] || !data[i][ColumnAlias['Order id']]) {
                                    
                                        console.log('response ', data[i] )
                                    
                                       // return { code: 404, data: "Column couldn't be empty" }
                                    }else{
                                        var obj_send = {
                                            id_user: id_user,
                                            SheetId: sht.name + '' + data[i][ColumnAlias['Order id']],
                                            date: data[i][ColumnAlias['Date']] ? new Date(data[i][ColumnAlias['Date']]) : new Date(),
                                            nom: data[i][ColumnAlias['Destinataire']],
                                            prix: data[i][ColumnAlias['Prix']],
                                            telephone: startsWithZero(data[i][ColumnAlias['Telephone']]) ? data[i][ColumnAlias['Telephone']] : '0' + data[i][ColumnAlias['Telephone']],
                                            id_city: id_city,
                                            status: 'Nouveau',
                                            adresse: data[i][ColumnAlias['Adresse']],
                                            source: 'Aucun',
                                            updownsell: 'Aucun',
                                            id_product_array: id_product_array,
                                            message: '0',
                                            changer: 'Au',
                                            ouvrir: 'Au',
                                            reportedDate: null
                                        }
                                        
                                        var rs = await ClientServices.AddOrder(obj_send)
    
                                       
                                    }
                                }
                            }


                        } catch (error) {
                            console.log(error)
                        }
                    }
                } catch (error) {
                    console.log(error)
                }

            })

        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = IntegrateServices