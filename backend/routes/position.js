const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../configuration/connection');

//GET ALL DATA
router.get('/', (req, res, next) => {
    
    var sql = "SELECT * FROM position";
    
    db.query(sql, (err, result) => {
        if (err) throw err;

        const dataResult = result.map(data => {
            const formattedCreatedDate = moment(data.created_date).format('DD-MM-YYYY HH:mm:ss');
            return {
                posId: data.pos_id,
                positionCode: data.position_code,
                positionName: data.position_name,
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
router.get('/:posId', (req, res, next) => {
    const posId = req.params.posId;
    
    var sql = "SELECT * FROM position WHERE pos_id="+posId;
    
    db.query(sql, (err, result) => {
        if (err) throw err;

        const dataResult = result.map(data => {
            const formattedCreatedDate = moment(data.created_date).format('DD-MM-YYYY HH:mm:ss');
            return {
                posId: data.pos_id,
                positionCode: data.position_code,
                positionName: data.position_name,
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
    //    const posId = req.body.posId;
        const positionCode = req.body.positionCode;
        const positionName = req.body.positionName;
        const createdDate = req.body.createdDate;
        const createdBy = req.body.createdBy;
    
        var sql = "INSERT INTO position (position_code, position_name, created_date, created_by) VALUES ('"+positionCode+"', '"+positionName+"', '"+createdDate+"', '"+createdBy+"')";
    
        db.query(sql, (err, result) => {
            if (err) throw err;
            res.status(200).json({
                message: 'Success Insert Data!',
            })
        })
    })

//UPDATE DATA
router.put('/', (req, res, next) => {
    // const posId = req.body.posId;
    const positionCode = req.body.positionCode;
    const positionName = req.body.positionName;
    const createdDate = req.body.createdDate;
    const createdBy = req.body.createdBy;

    var sql = "UPDATE position SET pos_id = '"+posId+"', position_code = '"+positionCode+"', position_name = '"+positionName+"', created_date = '"+createdDate+"', created_by = '"+createdBy+"' WHERE pos_id = "+posId;

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json({
            message: 'Success Update Data!',
        })
    })
})

//DELETE DATA
router.delete('/:posId', (req, res, next) => {
    const posId = req.params.posId;

    var sql = "DELETE FROM position WHERE pos_id = "+posId;

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json({
            message: 'Success Delete Data!',
        })
    })
})

module.exports = router;