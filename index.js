const express= require("express"); //biblioteca - include
const path =  require("path");     
 
const fs =  require("fs");
const sharp = require("sharp");
// const sass = require("sass");
// const pg = require("pg");
 
const app= express(); 

console.log("Folderul proiectului: ",__dirname)
console.log("Calea fisierului index.js: ",__filename)
console.log("Folderul curent de lucru: ",process.cwd())
 
obGlobal={
    obErori:null,
    obImagini:null
}
 
vect_foldere=["temp","backup","temp1"]
for(let folder of vect_foldere){
    let caleFolder=path.join(__dirname,folder)
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }       
}

function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    
    obGlobal.obErori=JSON.parse(continut)//transforma din string in obiect
    
    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    console.log(obGlobal.obErori)

}   

initErori();

function initImagini(){  
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);//parse - il face obiect...
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier_imagine.split(".");//creaza un vector cu elementele
        let caleFisAbs=path.join(caleAbs,imag.fisier_imagine);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.fisier_imagine=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier_imagine )
        
    }
    console.log(obGlobal.obImagini) 
}
initImagini();




function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find(function(elem){ 
                        return elem.identificator==identificator
                    });
    if(eroare){
        if(eroare.status)
            res.status(identificator)//status 200- totul incarcat corect
        var titluCustom=titlu || eroare.titlu;
        var textCustom=text || eroare.text;
        var imagineCustom=imagine || eroare.imagine;


    }
    else{ 
        var err=obGlobal.obErori.eroare_default
        var titluCustom=titlu || err.titlu;
        var textCustom=text || err.text;
        var imagineCustom=imagine || err.imagine;


    }
    res.render("pagini/eroare", { //transmit obiectul locals
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
})

}

app.set("view engine", "ejs")

app.get(["/","/index","/home"],function(req,res){
    res.render("pagini/index",{ip: req.ip, imagini: obGlobal.obImagini.imagini})
})
 
// app.get("/despre",function(req,res){
//     res.render("pagini/despre")
// })

app.get("/index/a",function(req,res){   
    res.render("pagini/index") 
})  
     
  
app.use("/resurse",express.static(path.join(__dirname,"resurse")))
app.use("/node_modules",express.static(path.join(__dirname,"node_modules")))
        
 

app.get("/cerere",function(req,res){
    res.send("<p style='color:pink'>Buna ziua</p>")
})

app.get("/fisier",function(req,res,next){
    res.sendFile(path.join(__dirname,"package.json"));
})        
 
app.get("/abc",function(req,res,next){ 
    res.write("Data curenta: ")          
    next()
})   
  
app.get("/abc",function(req,res,next){
    res.write((new Date())+"")      
    res.end()
})

app.get("/favicon.ico",function(req,res){   
    res.sendFile(path.join(__dirname,"/resurse/imagini/favicon/favicon.ico"))
})

app.get("/galerie",function(req,res){
    res.render("pagini/galerie-pagina",{imagini: obGlobal.obImagini.imagini})
}) 

app.get(/.ejs$/,function(req,res,next){
    afisareEroare(res,400);  
})

app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/,function(req,res,next){
    afisareEroare(res,403);
})


 
// cerinta 9  

app.get(/^\/[a-zA-Z0-9]+$/,function(req,res,next){

    try{
        res.render("pagini"+req.url,function(err,rezultatRandare){

            if(err){
                console.log(err);
                if(err.message.startsWith("Failed to lookup view")){
                    afisareEroare(res,404);
                }
                else{
                    afisareEroare(res);
                }

            }
            else{ 
                console.log(rezultatRandare);
                res.send(rezultatRandare);
            }

        });
    }
    catch(errRandare){
        if(errRandare.message.startsWith("Cannot find module")){
                    afisareEroare(res,404);
                }
                else{
                    afisareEroare(res);
                }

    }

}) 

app.listen(8081);
console.log("Serverul a pornit")
console.log('Fișiere imagine disponibile:', obGlobal.obImagini.imagini.map(i => i.fisier_imagine));

