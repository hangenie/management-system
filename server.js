const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
const Promise = require('bluebird')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database: conf.database,
    multipleStatements: true
});
connection.connect();

var queryAsync = Promise.promisify(connection.query.bind(connection));

app.get('/api/customers/', (req, res) => {    
    var numRows;
    var pageSize = parseInt(req.query.npp, 10) || 1;
    var page = parseInt(req.query.page, 10) || 0;
    var numPages;
    var skip = page * pageSize;
    var limit = skip + ',' + pageSize;

    queryAsync('SELECT count(*) as numRows FROM CUSTOMER WHERE isDeleted = 0')
    .then(function(results) {
        numRows = results[0].numRows;
        numPages = Math.ceil(numRows / pageSize);
        console.log('number of pages: ', numPages);
    })
    .then(() => queryAsync('SELECT * FROM CUSTOMER WHERE isDeleted = 0 LIMIT ' + limit))
    .then(function(results) {
        var responsePayload = {
            results: results
        };
        if (page < numPages) {
            responsePayload.pagination = {
                currentPage: page,
                pageSize: pageSize,
                numPages: numPages
            }
        }
        else responsePayload.pagination = {
            err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
        }
        res.json({ responsePayload });
        console.log(responsePayload);
    })
    .catch(function(err) {
        console.error(err);
        res.json({ err: err });
    });
});

app.post('/api/customers/', (req, res) => {
    let sql = 'INSERT INTO CUSTOMER VALUES (NULL, ?, ?, ?, ?, now(), 0)';
    let name = req.body.name;
    let id = req.body.id;
    let gender = req.body.gender;
    let address = req.body.address;
    let params = [name, id, gender, address];
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
});

app.delete('/api/customers/:order', (req, res) => {
    let sql = 'UPDATE CUSTOMER SET isDeleted = 1 WHERE `order` = ?';
    let params = [req.params.order];
    connection.query(sql, params,
        (err, rows, field) => {
            res.send(rows);
            console.log(rows);
        }
    )
});

app.listen(port, () => console.log('Listenig on port %d', port));