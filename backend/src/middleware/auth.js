import admin from "../firebase.js";


export async function verifyAuth(req, res, next){
    //logic
    //get token access:
    const token= req.headers.authorization?.split("Bearer ")[1];
    if(!token){res.status(404).send({msg: "sorry you are not authorised"}); return;}
    const decoded=await admin.auth().verifyIdToken(token);
    //attach it onto req 
    req.user=decoded;
    next();

}