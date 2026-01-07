import admin from "firebase-admin";
import fs from "fs";

//this below line reads the firebase-admin.json file, parses it, verifies that we have the correct credentials, export this thing from this file and hence allow the whole backend to have the access to the admin of this faayabase project
const serviceAccount= JSON.parse(fs.readFileSync("./firebase-admin.json", "utf-8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

export default admin;


console.log(amaan);



console.log(amaan);



const name= "Amaan";
const surname= "Siddiqui";
console.log(name, surname);
