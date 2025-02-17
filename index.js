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
  definition: String,
});
const Term = mongoose.model('Term', termSchema);



//Middleware
app.use(express.json()); 
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
async function retriveDefinition(name){
    let definition = await (await fetch("https://rae-api.com/api/words/" + name)).json()
    let defList = [];
    if (definition.error){
        return []
    } else{
        definition.data.meanings[0].senses.forEach((element)=>{
            defList.push(element.raw)
        });
        return defList
    }
};



//Routes
app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get("/main", (req, res) =>{
    Term.find().then(retrievedDocuments => {
        res.render('main.ejs', {list: retrievedDocuments});
    });
});

app.post("/main", (req, res) =>{
    let reqList = Object.keys(req.body);
    let defList =[];
    let definitions = [];
    (async () => {
        defList = await retriveDefinition(reqList.slice(-1));
        listIndexes = reqList.slice(0, -1);
        listIndexes.forEach((e) => {
            definitions.push(defList[parseInt(e)-1])
        })
        definitions =  definitions.join("mmmm");

        const newTerm = new Term({
            term: String(reqList.slice(-1)).charAt(0).toUpperCase() + String(reqList.slice(-1)).slice(1),
            definition: String(definitions),
        });
        
        newTerm.save().then(result => {
            console.log('Note saved: ' + reqList.slice(-1))
        });
        
        setTimeout(()=>{
            Term.find().then(retrievedDocuments => {
                res.render('main.ejs', {list: retrievedDocuments});
            }); 
        }, 200);
    })();
});

app.listen(PORT);
console.log('Server started at http://localhost:' + PORT + '/main.');