const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../configuration/connection');

//GET ALL DATA
router.get('/', (req, res, next) => {
    
    var sql = "SELECT * FROM division";
    
    db.query(sql, (err, result) => {
        if (err) throw err;

        const dataResult = result.map(data => {
            const formattedCreatedDate = moment(data.created_date).format('DD-MM-YYYY HH:mm:ss');
            return {
                divId: data.div_id,
                divisionCode: data.division_code,
                divisionName: data.division_name,
                createdDate: formattedCreatedDate,
                createdBy: data.created_by
            };
        });

        res.status(200).json({
            message: 'Success Get Data!',
            data: dataResult
        })
    })
})

//GET DATA BY ID
router.get('/:divId', (req, res, next) => {
    const divId = req.params.divId;
    
    var sql = "SELECT * FROM division WHERE div_id="+divId;
    
    db.query(sql, (err, result) => {
        if (err) throw err;

        const dataResult = result.map(data => {
            const formattedCreatedDate = moment(data.created_date).format('DD-MM-YYYY HH:mm:ss');
            return {
                divId: data.div_id,
                divisionCode: data.division_code,
                divisionName: data.division_name,
                createdDate: formattedCreatedDate,
                createdBy: data.created_by
            };
        });

        if (result.length > 0) {
            res.status(200).json({
                message: 'Success Get Data!',
                data: dataResult
            })
        } else {
            res.status(200).json({
                message: 'Data Not Found!',
                data: dataResult
            })
        }
    })
})

//INSERT DATA
router.post('/', (req, res, next) => {
//    const divId = req.body.divId;
    const divisionCode = req.body.divisionCode;
    const divisionName = req.body.divisionName;
    const createdDate = req.body.createdDate;
    const createdBy = req.body.createdBy;

    var sql = "INSERT INTO division (division_code, division_name, created_date, created_by) VALUES ('"+divisionCode+"', '"+divisionName+"', '"+createdDate+"', '"+createdBy+"')";

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json({
            message: 'Success Insert Data!',

        })
    })
})

//UPDATE DATA
router.put('/', (req, res, next) => {
    const divId = req.body.divId;
    const divisionCode = req.body.divisionCode;
    const divisionName = req.body.divisionName;
    const createdDate = req.body.createdDate;
    const createdBy = req.body.createdBy;

    var sql = "UPDATE division SET division_code = '"+divisionCode+"', division_name = '"+divisionName+"', created_date = '"+createdDate+"', created_by = '"+createdBy+"' WHERE div_id = "+divId;

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json({
            message: 'Success Update Data!',
        })
    })
})

//DELETE DATA
router.delete('/:divId', (req, res, next) => {
    const divId = req.params.divId;

    var sql = "DELETE FROM division WHERE div_id = "+divId;

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json({
            message: 'Success Delete Data!',
        })
    })
})

module.exports = router;