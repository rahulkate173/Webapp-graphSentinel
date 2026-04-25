import mongoose from "mongoose";
import CONFIG from "./config.js";
async function ConnectToDB() {
    mongoose.connect(CONFIG.MONGO_URI)
    .then(()=>{
        console.log('Connected to DB')
    })
}
export default ConnectToDB