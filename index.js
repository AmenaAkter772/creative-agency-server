const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()
const fs = require('fs-extra')
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');

const port = 5000;

const app = express()
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('service'));
app.use(fileUpload());
console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e2egq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.get('/', (req,res) => {
    res.send("hello from db it's working")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("creative-agency").collection("service");
  const Collection = client.db("creative-agency").collection("selectService");
  const serviceListCollection = client.db("creative-agency").collection("serviceList");
  const AdminCollection = client.db("creative-agency").collection("admin");

  app.post('/selectService', (req, res) => {
    const service = req.body;
    Collection.insertOne(service)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
})

app.post('/serviceList', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };
    serviceListCollection.insertOne({title,description,image})
    .then(result => {
        res.send(result.insertedCount > 0);
    })
 })

  app.post('/addService', (req,res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const design = req.body.design;
    const project = req.body.project;
    const price = req.body.price;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };
    serviceCollection.insertOne({name,email,design,project,price,image})
    .then(result => {
        res.send(result.insertedCount > 0);
    })
});

app.post('/add-admin',(req,res)=>{
    const admin = req.body
    AdminCollection.insertOne(admin)
    .then(result=>{
      res.send(result.insertedCount>0)
    })
    .catch(err=>console.log(err))
  })

app.get('/service', (req, res) => {
    serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })

});


app.get('/showServiceList', (req, res) => {
    serviceListCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
});


app.get('/getServiceListByEmail', (req, res) => {
    const email = req.query.email
    serviceListCollection.find(email)
        .toArray((err, documents) => {
            res.send(documents);
        })
});

app.get('/checkByAdmin',(req,res)=>{
    const email = req.query.email
    AdminCollection.find(email)
    .toArray((error, documents)=>{
      res.send(documents.length>0)
    })
  })



});



app.listen(process.env.PORT || port)