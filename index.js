const mongoose = require('mongoose')
const express = require("express")
const path = require('path')
const { read } = require('fs')
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

function serveRender(res){
    Term.find().sort({term: 1}).then(retrievedDocuments => {
        res.render('main.ejs', {list: retrievedDocuments});
    }); 
}



//Routes
app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get("/main", (req, res) =>{
    serveRender(res);
});

app.post("/main", (req, res) =>{
    if (Object.values(req.body)[0].slice(0,2) == "--"){
        (async ()=>{
            x = Object.values(req.body)[0].slice(2)
            x = String(x).charAt(0).toUpperCase() + String(x).slice(1)

            await Term.deleteOne({term: x}).then((result) =>{
                serveRender(res);
            })
        })();
    } else{
        let reqList = Object.keys(req.body);
        console.log(req.body)
        let termName = String(reqList.slice(-1)).charAt(0).toUpperCase() + String(reqList.slice(-1)).slice(1);
        let defList =[];
        let definitions = [];
        (async () => {
            defList = await retriveDefinition(termName);
            listIndexes = reqList.slice(0, -1);
            listIndexes.forEach((e) => {
                definitions.push(defList[parseInt(e)-1])
            })
            definitions =  definitions.join("mmmm"); //MongoDB erases especial characters to prevent query injections.

            Term.find().sort({term: 1}).then(retrievedDocuments => {
                let termList = retrievedDocuments.map(element => element.term)
                resultBool = !(termList.includes(termName))

                if (resultBool){
                    const newTerm = new Term({
                        term: termName,
                        definition: String(definitions),
                    });
                
                    newTerm.save().then(result => {
                        console.log('Note saved: ' + reqList.slice(-1))
                        serveRender(res);
                    });
                }  else{
                    serveRender(res);
                }  
            });      
        })();    
    }
});

app.listen(PORT);
console.log('Server started at http://localhost:' + PORT + '/main.');