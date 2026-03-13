import admin from "../firebase.js";


export async function verifyAuth(req, res, next){
    const token= req.headers.authorization?.split("Bearer ")[1];

    if(!token){return res.status(401).send({msg :"sorry no token provided"})}
    //else if token is received:    
    try {
        
    //get token access:
    const decoded=await admin.auth().verifyIdToken(token);
    req.user=decoded;
    next();
    
    } catch (err) {
        console.error("sorry token verification failed and here is the error", err);
        res.status(403).send({msg:"invalid or expired token"})        
    }
    
}