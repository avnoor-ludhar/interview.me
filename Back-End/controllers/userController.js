import db from '../dbConnection.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const saltRounds = 10;

const createTokens = (id) => {
    const accessToken = jwt.sign({ id: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
    const refreshToken = jwt.sign({ id: id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
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

        const {accessToken, refreshToken} = createTokens(user.rows[0].id);

        await db.query('INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)', [user.rows[0].id, refreshToken]);

        //secure forces the cookie is only sent via HTTPS. Secure attribute ensures that the cookie
        //is only sent to the server when a request is made using HTTPS.
        //sameSite just allows the cookie only to be sent from one site
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        return res.status(200).json({ email: email});

    } catch(error){
        if(error instanceof Error){
            return res.status(401).json({error: error.message});
        } else{
            console.log(error.message);
            //make this into a custom error later
            return res.status(401).json({error: 'Internal Server error'});
        }
    }
}

const registerUser = async (req, res)=>{
    try{
        const {email, password, passwordConfirm} = req.body;

        const user = await signUpQuery(email, password, passwordConfirm);

        const { accessToken, refreshToken } = createTokens(user.id);

        await db.query('INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)', [user.id, refreshToken]);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        return res.status(200).json({email: email});
    } catch(error){
        return res.status(401).json({ error: error.message });
    }
    
}

const sessionCheck = async (req, res) =>{
    const token = req.cookies.accessToken;

    if(!token){
        return res.status(401).json({ error: 'No token found'});
    }

    try{
        const {id} = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const {rows} = await db.query('SELECT email FROM users WHERE id = $1', [id])
        return res.status(200).json({ email: rows[0].email});
    } catch(err){
        return res.status(401).json({ error: 'Invalid token' });
    }
}

const refreshToken = async (req, res) =>{
    const { refreshToken } = req.cookies;
    
    if(!refreshToken){
        return res.status(401).json({error: 'User is not signed in'});
    }

    try{
        const {id} = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const result = await db.query("SELECT * FROM refresh_tokens WHERE user_id = $1 AND token = $2", [id, refreshToken]);

        if(result.rows.length === 0) return res.sendStatus(403);

        const newAccessToken = jwt.sign({ id: id }, process.env.ACCESS_TOKEN_SECRET);
        const newRefreshToken = jwt.sign({ id: id }, process.env.REFRESH_TOKEN_SECRET);

        await db.query('UPDATE refresh_tokens SET token = $2 WHERE user_id = $1', [id, newRefreshToken]);

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        return res.status(200).json({accessToken: newAccessToken});
        
    } catch(error){
        console.log(error);
    }
}

const logoutUser = async (req, res) => {
    const { refreshToken } = req.cookies;
    try{
        await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/',
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/',
        });

        return res.status(200).json({ message: 'Logged out successfully' });
    }catch(e){
        return res.status(500).json({message: 'Error deleting data from database'});
    }

}

export {loginUser, registerUser, logoutUser, sessionCheck, refreshToken};