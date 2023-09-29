const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../configuration/connection');


//GET ALL DATA
router.get('/', (req, res, next) => {

    var sql = "SELECT e.emp_id, e.fullname, e.gender, e.birthday, e.family, d.division_code, d.division_name, p.position_code, position_name, e.phone, e.email, e.address, e.status, e.created_date, e.created_by FROM employee e LEFT JOIN division d ON e.div_id = d.div_id LEFT JOIN position p ON e.pos_id = p.pos_id;";

    db.query(sql, (err, result) => {
        if (err) throw err;

        const dataResult = result.map(data => {
            const formattedBirthday = moment(data.birthday).format('DD-MM-YYYY');
            const formattedCreatedDate = moment(data.created_date).format('DD-MM-YYYY HH:mm:ss');
            return {
                empId: data.emp_id,
                fullName: data.fullname,
                gender: data.gender,
                birthday: formattedBirthday,
                family: data.family,
                divisionCode: data.division_code,
                divisionName: data.division_name,
                positionCode: data.position_code,
                positionName: data.position_name,
                phone: data.phone,
                email: data.email,
                address: data.address,
                status: data.status,
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
router.get('/:empId', (req, res, next) => {
    const empId = req.params.empId;
    
    var sql = "SELECT e.emp_id, e.fullname, e.gender, e.birthday, e.family, d.division_code, d.division_name, p.position_code, position_name, e.phone, e.email, e.address, e.status, e.created_date, e.created_by FROM employee e LEFT JOIN division d ON e.div_id = d.div_id LEFT JOIN position p ON e.pos_id = p.pos_id WHERE e.emp_id = "+empId;
    
    db.query(sql, (err, result) => {
        if (err) throw err;
        
        const dataResult = result.map(data => {
            const formattedBirthday = moment(data.birthday).format('DD-MM-YYYY');
            const formattedCreatedDate = moment(data.created_date).format('DD-MM-YYYY HH:mm:ss');
            return {
                empId: data.emp_id,
                fullName: data.fullname,
                gender: data.gender,
                birthday: formattedBirthday,
                family: data.family,
                divisionCode: data.division_code,
                divisionName: data.division_name,
                positionCode: data.position_code,
                positionName: data.position_name,
                phone: data.phone,
                email: data.email,
                address: data.address,
                status: data.status,
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
//    const empId = req.body.empId;
    const fullName = req.body.fullName;
    const gender = req.body.gender;
    const birthday = req.body.birthday;
    const family = req.body.family;
    const posId = req.body.posId;
    const divId = req.body.divId;
    const email = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;
    const status = req.body.status;
    const createdDate = req.body.createdDate;
    const createdBy = req.body.createdBy;   
    
    var sql = "INSERT INTO employee (fullname, gender, birthday, family, pos_id, div_id, email, phone, address, status, created_date, created_by) VALUES ('"+fullName+"', '"+gender+"', '"+birthday+"', '"+family+"', '"+posId+"', '"+divId+"', '"+email+"', '"+phone+"', '"+address+"', '"+status+"', '"+createdDate+"', '"+createdBy+"')";

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json({
            message: 'Success Insert Data!',

        })
    })
})

//UPDATE DATA
router.put('/', (req, res, next) => {
    const empId = req.body.empId;
    const fullName = req.body.fullName;
    const gender = req.body.gender;
    const birthday = req.body.birthday;
    const family = req.body.family;
    const posId = req.body.posId;
    const divId = req.body.divId;
    const email = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;
    const status = req.body.status;
    const createdDate = req.body.createdDate;
    const createdBy = req.body.createdBy;  

    var sql = "UPDATE employee SET emp_id = '"+empId+"', fullname = '"+fullName+"', gender = '"+gender+"', birthday = '"+birthday+"', family = '"+family+"', pos_id = '"+posId+"', div_id = '"+divId+"', email = '"+email+"', phone = '"+phone+"', address = '"+address+"', status = '"+status+"', created_date = '"+createdDate+"', created_by = '"+createdBy+"' WHERE emp_id = "+empId;

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json({
            message: 'Success Update Data!',
        })
    })
})

//DELETE DATA
router.delete('/:empId', (req, res, next) => {
    const empId = req.params.empId;

    var sql = "DELETE FROM employee WHERE emp_id = "+empId;

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json({
            message: 'Success Delete Data!',
        })
    })
})

module.exports = router;