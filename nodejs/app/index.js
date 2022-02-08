const express = require('express')
const https = require('https')

const app = express()
const port = 3000
const config = {
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'db'
}

const mysql = require('mysql');
const connection = mysql.createConnection(config);

const sqlCreateTable = `create table IF NOT EXISTS people(id int not null auto_increment, name varchar(255), primary key(id));`
connection.query(sqlCreateTable)
const sqlDeleteData = `delete from people;`
connection.query(sqlDeleteData)

const url = 'https://gerador-nomes.herokuapp.com/nome/aleatorio';
var tags;
var response;

app.get('/',(req,res) =>{
    response = res;
    insertName();
})

app.listen(port, () => {
    console.log('Running at port ' + port)
})


function insertName() {
    console.log('Inserting name...')
    tags = ['<h1>Full Cycle NodeJS</h1>'];

    https.get(url,(resp) => {
        let data = '';
        resp.on('data',(chunk) =>{
            data += chunk;
        })
        resp.on('end', () => {
            let obj = JSON.parse(data);
            let name = obj.join(' ');

            executeInsertSQL(name);
            
        })
    })
    .on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function executeInsertSQL(name)
{
    const sql = `INSERT INTO people(name) values('${name}')`;
    connection.query(sql)
    //connection.end()
    let msg = `Inserted name on db: ${name} `;
    console.log(msg)
    tags.push(`<h2>${msg}</h2>`);

    executeSelectSQL();
}

function executeSelectSQL()
{
    let data = [];
    const sql = `SELECT name FROM people`;
    connection.query(sql, (err, result, fields) =>{

        if(!err)
        {
            data = result.map(r => `<li>${r.name}</li>`);
            let items = data.join('');
            let ol = `<ol>${items}</ol>`;

            tags.push(`<h2>Names on db:</h2>`);        
            tags.push(ol);
            tags.push('<h1 style="color:red">Refresh this page (F5) to insert a new name on db!!!</h1>');
            let html = tags.join('');
            response.send(html);
        }
    })
    //connection.end()
}