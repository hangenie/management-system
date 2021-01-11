const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
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
    database: conf.database
});
connection.connect();

app.get('/api/customers/', (req, res) => {
    connection.query(
        'SELECT * FROM CUSTOMER WHERE isDeleted = 0',
        (err, rows, fields) => {
            res.send(rows);
        }
    )
});

app.post('/api/customers/', (req, res) => {
    let sql = 'INSERT INTO CUSTOMER VALUES (NULL, ?, ?, ?, ?, now(), 0)';
    let name = req.body.name;
    let id = req.body.id;
    let gender = req.body.gender;
    let address = req.body.address;
    let params = [name, id, gender, address];
    //console.log(params);
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
            //console.log(err);
        }
    )
});

app.delete('/api/customers/:order', (req, res) => {
    let sql = 'UPDATE CUSTOMER SET isDeleted = 1 WHERE `order` = ?';
    let params = [req.params.order];
    connection.query(sql, params,
        (err, rows, field) => {
            res.send(rows);
        }
    )
});

app.listen(port, () => console.log('Listenig on port %d', port));