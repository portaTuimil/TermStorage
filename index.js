const mongoose = require('mongoose')
const express = require("express")
const path = require('path')
const app = express()
require('dotenv').config()      //Dotenv

const PORT = process.env.PORT;
const URL = process.env.MONGODB_URL;

mongoose.set('strictQuery',false);
mongoose.connect(URL);
const termSchema = new mongoose.Schema({
  term: String,
  preference: Number,
});
const Term = mongoose.model('Term', termSchema)

app.use(express.json()); 
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get("/main", (req, res) =>{
    Term.find().then(result => {
        res.render('main.ejs', {list: result});
    })
});

app.post("/new", (req, res) =>{
    const newTerm = new Term({
        term: req.body.term,
        preference: 1,
      })
      
    newTerm.save().then(result => {
        console.log('Note saved :' + req.body.term)
    })
    
    Term.find().then(result => {
        res.render('main.ejs', {list: result});
    })
});

app.listen(PORT);
console.log('Server started at http://localhost:' + PORT + '.');