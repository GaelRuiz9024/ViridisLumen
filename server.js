

const express= require('express')
require('dotenv').config()



const app=express();
const port=process.env.PORT;
const resumen=require('./src/routes/exampleRoutes')

// Middleware para servir archivos estáticos
app.use(express.static('public')); // Crea una carpeta 'public' para tu HTML
app.use(express.json())
app.use('/',resumen)


app.listen(port, ()=>{
    console.log("servidor corriendo en el puerto"+port)
})