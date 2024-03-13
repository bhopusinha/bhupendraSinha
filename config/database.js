const mongoose =require('mongoose');

const connectdatabase=()=>{
    mongoose.connect(process.env.DB)
.then((v)=>{
    console.log(`databse is connected successfully : ${v.connection.host}`);
})
}

module.exports=connectdatabase;