import jwt from 'jsonwebtoken';
import db from '../dbConnection.js';

const requireAuth = async (req, res, next)=>{
    //verify authentication
    const { authorization } = req.headers;

    if(!authorization){
        return res.status(401).json({error: 'Authorization token required'})
    }
    //comes back as Bearer token
    const token = authorization.split(' ')[1];

    try{
        //signed with our secret key so we can unravel same way
        const { id } = jwt.verify(token, process.env.SECRET)
        try{
            req.user = await db.query('SELECT id FROM users WHERE id = $1', [id]);
            next();
        } catch(error){
            console.log(error);
            res.status(500).json({error: 'Error fetching data'});
        }
        
    } catch(error) {
        console.log(error);
        res.status(401).json({error: 'Request is not authorized'});
    }

}

export default requireAuth;