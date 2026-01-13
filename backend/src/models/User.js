//user has a bio, pfp, name, email(for finding username with email)
//implement pfp later
import mongoose from "mongoose";



const userschema = new mongoose.Schema({
    firebaseUid: {type: String, required: true, unique: true},
    username: {type: String, default: ""},
    email: {type: String, required: true},
    bio: {type: String, default: "" },
    profilePicture: {type: String, default: "" },//url encoding 
    createdAt : {type: Date, default: Date.now}
})

const User= mongoose.model("User", userschema);
export default User;




