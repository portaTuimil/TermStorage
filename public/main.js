const wordForm = document.querySelector(".wordForm");
let term = document.querySelector("#term");
let content = document.querySelector(".content");
let defForm = document.querySelector(".defForm");

async function retriveDefinition(name){
    let definition = await (await fetch("https://rae-api.com/api/words/" + name)).json()
    let defList = [];
    if (definition.error){
        location.reload();
    } else{
        definition.data.meanings[0].senses.forEach((element)=>{
            defList.push(element.raw)
        });
        return defList
    }
};

wordForm.addEventListener("submit", (e)=>{
    if (term.value.slice(0,2)!=="--"){
        e.preventDefault()
        let defList = [];
        (async () => {
            defList = await retriveDefinition(term.value);
            let hidden = document.createElement("input");
            let submit = document.createElement("input");
            submit.setAttribute("type", "submit")
            hidden.setAttribute("type", "hidden");
            hidden.setAttribute("name", term.value);
            defList.forEach((element) => {
                let input = document.createElement("input");
                let label = document.createElement("label");
                input.setAttribute("type", "checkbox");
                input.setAttribute("name", element[0]);
                label.setAttribute("for", element[0]);
                label.innerHTML = element + "<br>";
                
                defForm.appendChild(input);
                defForm.appendChild(label);            
            });
            defForm.appendChild(submit);
            defForm.prepend(hidden); 
        })();    
    }
});