


let express = require("express");
let cors = require("cors");
let {MongoClient, ObjectId} = require("mongodb");
let multer = require("multer");
let path = require("path");
let fs = require("fs");
let app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); 
let cloudinary = require("cloudinary").v2;
let {CloudinaryStorage} = require("multer-storage-cloudinary");

const url = "mongodb://0.0.0.0:27017";



cloudinary.config({
    cloud_name: "",
    api_key: "",
    api_secret: ""
  });

let storage = new CloudinaryStorage({cloudinary});

let recep = multer({storage});

app.post('/upload', recep.single("file"),(req,res)=>{
    let client = new MongoClient(url);
    client.connect();
    let db = client.db("tinder");
    let collec = db.collection("photos");


let obj = {
    username : req.body.username,
    caption : req.body.caption,
    file_url : req.file.path,
    file_name : req.file.filename,
    upload_time : new Date()
}

collec.insertOne(obj)
.then((result)=>res.send(result))
.catch((error)=>res.send(error));
});


app.get('/files',(req,res)=>{
    let client = new MongoClient(url);
    client.connect();
    let db = client.db("tinder");
    let collec = db.collection("photos");
    let username = req.query.username;
    let obj = username ? {username} : {}

    collec.find(obj).toArray()
    .then((result)=>res.send(result))
    .catch((error)=>res.send(error));
});

app.delete('/delete/:id',(req,res)=>{
    let client = new MongoClient(url);
    client.connect();
    let db = client.db("tinder");
    let collec = db.collection("photos");
    let id = req.params.id;
    let _id = new ObjectId(id);
    collec.findOne({_id})
    .then((obj)=>{
        cloudinary.uploader.destroy(obj.file_name);
        return collec.deleteOne({_id})
    })
    .then((result)=>res.send(result))
    .catch((error)=>res.send(error));
})


app.listen(3000,()=>console.log("Express is Alive"));
