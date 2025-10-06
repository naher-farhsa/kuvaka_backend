require('dotenv').config();
const app=require('./src/app');
const connectDB=require('./src/database/db');

// database connection
connectDB();

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
});

