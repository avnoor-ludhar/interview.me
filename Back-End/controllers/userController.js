import db from '../dbConnection.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const saltRounds = 10;

const createToken = (id)=>{
    return jwt.sign({id: id}, process.env.SECRET, { expiresIn: '3d'});
}

//email and password_hash
const signUpQuery = async (email, password, passwordConfirm) =>{
    if(!email || !password || !passwordConfirm){
        throw Error('All fields must be filled');
    }

    if(!validator.isEmail(email)){
        throw Error('Email is not valid');
    }

    if(password !== passwordConfirm){
        throw Error('Passwords do not match');
    }
    
    if(!validator.isStrongPassword(password)){
        throw Error('Password is not strong enough');
    }

    try{
        const data = await db.query("SELECT email FROM users WHERE email = $1", [email]);

        if(data.rows.length != 0){
            throw Error('User with email ', email, ' already exists');
        }
        
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);

        try{
            const response = await db.query('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *', [email, hash]);
            return response.rows[0];
        }catch(error){
            console.log("Error creating user.")
        }
    } catch(error){
        if(error instanceof Error){
            throw Error('User with email ' + email + ' already exists');
        } else{
            console.log(error.message);
            //make this into a custom error later
            throw Error('Internal Server Error');
        }
    }
}

const loginUser = async (req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        throw Error('All fields must be filled.');
    }
    
    try{
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if(user.rows.length === 0){
            throw Error('Incorrect email');
        }

        const match = await bcrypt.compare(password, user.rows[0].password_hash);
    
        if(!match){
            throw Error('Incorrect password');
        }

        const token = createToken(user.rows[0].id);

        //secure forces the cookie is only sent via HTTPS. Secure attribute ensures that the cookie
        //is only sent to the server when a request is made using HTTPS.
        //sameSite just allows the cookie only to be sent from one site
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.status(200).json({ email: email});

    } catch(error){
        if(error instanceof Error){
            res.status(401).json({error: error.message});
        } else{
            console.log(error.message);
            //make this into a custom error later
            res.status(401).json({error: 'Internal Server error'});
        }
    }
}

const registerUser = async (req, res)=>{
    try{
        const {email, password, passwordConfirm} = req.body;

        const user = await signUpQuery(email, password, passwordConfirm);
        const token = createToken(user.id);
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.status(200).json({email: email});
    } catch(error){
        res.status(401).json({ error: error.message });
    }
    
}

const logoutUser = async (req, res) =>{
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/',
    });

    res.status(200).json({message: 'Logged out successfully'})
}

const sessionCheck = (req, res) =>{
    const token = req.cookies.accessToken;

    if(!token){
        res.status(401).json({ error: 'No token found'});
    }

    try{
        const user = jwt.verify(token, process.env.SECRET);
        res.status(200).json({ email: user.email });
    } catch(err){
        res.status(401).json({ error: 'Invalid token' });
    }
}

export {loginUser, registerUser, logoutUser, sessionCheck};