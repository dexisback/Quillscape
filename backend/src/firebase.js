import admin from "firebase-admin";
import fs from "fs";

const serviceAccount= JSON.parse(fs.readFileSync("/firebase-admin.json", "utf-8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

export default admin;