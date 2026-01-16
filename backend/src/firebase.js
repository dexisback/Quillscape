import admin from "firebase-admin";
// import fs from "fs";
console.log("amaan")
console.log(process.env.FIREBASE_SERVICE_ACCOUNT)
//this below line reads the firebase-admin.json file, parses it, verifies that we have the correct credentials, export this thing from this file and hence allow the whole backend to have the access to the admin of this faayabase project
const serviceAccount= JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

export default admin;


