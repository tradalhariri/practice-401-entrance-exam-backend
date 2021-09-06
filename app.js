'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = new express();

const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(`${process.env.MONGO_URL}`);
}

const drinkSchema = new mongoose.Schema({
    strDrink: String,
    strDrinkThumb: String,
    idDrink: String,
    email: String
});

const drinkModel = mongoose.model('drink', drinkSchema);

const PORT = process.env.PORT;

app.use(express.json());

app.use(cors());


app.get('/', (req, res) => res.send('Hello'));

app.get('/drinks', (req, res) => {

    axios.get(`${process.env.THIRD_API}`).then((results) => {
        res.send(results.data.drinks);
    }).catch((err) => res.send(err));
});

app.get('/favdrinks', async(req, res) => {
    const email = req.query.email;

   await drinkModel.find({ email: email},(err,favdrinks)=>{
     if(err) res.send(err);
     else res.send(favdrinks)
    })

});

app.delete('/favdrinks/:id/:email', async(req, res) => {
    const id = req.params.id;
    const email = req.params.email;
    console.log(id);
    console.log(req.params);
   const deleted = await drinkModel.findByIdAndDelete(id);
   if(!deleted) {
       res.send('error in deleting')
   }
   else{
    await drinkModel.find({ email: email},(err,favdrinks)=>{
        if(err) res.send(err);
        else res.send(favdrinks)
       })
   }

});


app.put('/favdrinks', async(req, res) => {
   console.log(req.body)
   const {id,strDrink,strDrinkThumb,email} = req.body
   

   await drinkModel.findByIdAndUpdate(id,{
    strDrink:strDrink,
    strDrinkThumb:strDrinkThumb,
},(error,data)=>{
    if (error) {
        res.send(error)
    }else{
        drinkModel.find({email:email},(err,results)=>{
            console.log(results);
            err?res.send(err):res.send(results);
        })
    }
})

  
   
 


});



app.post('/drinks', async (req, res) => {
    const newDrink = req.body;
    console.log(newDrink);
    try {
        
     const drink = new drinkModel({
        strDrink: newDrink.strDrink, strDrinkThumb: newDrink.strDrinkThumb,
        email: newDrink.email, idDrink: newDrink.idDrink
    });
    await drink.save();
    res.send('success')
}
    catch (error) {
        res.send('failed')
    }


})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));


