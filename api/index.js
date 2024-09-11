const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const User = require('./models/User')
const Message = require('./models/Message')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const ws = require('ws')
const fs = require('fs')

dotenv.config();

app.use(cors({
    origin: process.env.CLIENT_URL, 
    credentials: true 
}));
app.use(express.json())
app.use(cookieParser())
app.use('/uploads',express.static(__dirname+"/uploads"))
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

const jwtSecret = process.env.JWT_SECRET
const bcryptSalt = bcrypt.genSaltSync(10)

function getUserData(req){
    return new Promise((resolve,reject)=>{
        const token = req.cookies?.token;
        if (token) {
        jwt.verify(token, jwtSecret, (err, data) => {
            if (err) {
                throw err
            }
            resolve(data);
        });
    } else {
        reject('No token provided');
    }
    })  
}

app.get('/test', (req,res) => {
    res.json('test ok')
});

app.get("/profile", (req, res) => {
    const token = req.cookies?.token;

    if (token) {
        jwt.verify(token, jwtSecret, (err, data) => {
            if (err) {
                return res.status(403).json('Invalid token');
            }
            res.json(data);
        });
    } else {
        res.status(401).json('No token provided');
    }
});

app.get("/people",async(req,res)=>{
    const people = await User.find({},{'_id':1, username:1})
    res.json(people)

})

app.get("/messages/:userId", async(req,res)=>{
    const {userId} = req.params
    const userData = await getUserData(req)
    const ourId = userData.userId
    const messages = await Message.find({
        sender:{$in:[userId,ourId]},
        recipient:{$in:[userId,ourId]}
    }
    ).sort({createdAt: 1});
    res.json(messages)   
})

app.post("/register", async(req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password,bcryptSalt)
    try {
        const createdUser = await User.create({ username:username, password:hashedPassword });
        jwt.sign({ userId: createdUser._id, username: createdUser.username }, jwtSecret, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'None',
                secure: true,
            }).status(201).json({
                id: createdUser._id,
            });
        });
    } catch (err) {
        res.status(500).json('Error creating user');
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const foundUser = await User.findOne({ username: username });
        if (foundUser) {
            const passOk = bcrypt.compareSync(password, foundUser.password);
            if (passOk) {
                jwt.sign(
                    { userId: foundUser._id, username: foundUser.username },
                    jwtSecret,
                    {},
                    (err, token) => {
                        if (err) throw err;
                        res.cookie("token", token, {
                            httpOnly: true,
                            sameSite: "None",
                            secure: true,
                        }).json({
                            id: foundUser._id,
                        });
                    }
                );
            } else {
                res.status(401).json("Invalid password"); // Password is incorrect
            }
        } else {
            res.status(401).json("User not found"); // User not found
        }
    } catch (err) {
        res.status(500).json("Error logging in");
    }
});

app.post('/logout', (req,res)=>{
    res.cookie('token','',{sameSite:'none', secure:true}).json('ok')
})
const port = process.env.PORT
const server = app.listen(port)
const wss = new ws.WebSocketServer({server})

wss.on('connection', (connection, req) => {

    function notifyPeopleOnline(){
        const onlineUsers = [...wss.clients].map(c => ({ userId: c.userId, username: c.username }));
                    [...wss.clients].forEach(client => {
                        client.send(JSON.stringify({ onlineUser: onlineUsers }));
                    });
        
    }

    connection.isAlive = true;

    connection.timer = setInterval(() => {
        connection.ping()
        connection.deathTimer = setTimeout(()=> {
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            notifyPeopleOnline();

        },1000)
    },5000)

    connection.on('pong', ()=>{
        clearTimeout(connection.deathTimer)
    })
    
    const cookie = req.headers.cookie;
    if (cookie) {
        const tokenCookieString = cookie.split(';').find(str => str.startsWith('token='));
        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1];
            if (token) {
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if (err) throw err;
                    const { username, userId } = userData;
                    connection.userId = userId;
                    connection.username = username;

                    
                    notifyPeopleOnline()
                });
            }
        }
    } else {
        connection.userId = null;
        connection.username = null;
    }

    connection.on('message',async(message)=>{
    const messageData = JSON.parse(message.toString())
    console.log("MessageData from indexJS ",messageData)
    const {recipient, text,file} = messageData
    let fileName = null
    if (file) {
    const parts = file.name.split('.');
    const ext = parts[parts.length - 1];  
    fileName = Date.now() + '.' + ext;  
    const path = __dirname + "/uploads/" + fileName;  
     
    const bufferData = Buffer.from(file.data.split(",")[1], 'base64'); 
    
    fs.writeFile(path, bufferData, () => {
        console.log('File saved:', path);
    });
}

    if (recipient && (text || file)){
        const messageDoc = await Message.create({
            sender: connection.userId,
            recipient,
            text:text || '',
            file: file ? fileName : null
    });
    console.log("created");

    [...wss.clients]
  .filter(c => c.userId === recipient)
  .forEach(client => {
    // Log the details of the message being sent
    console.log(`Sending message to recipient: ${recipient}, file: ${fileName}, sender: ${connection.userId}`);

    // Send the message to the WebSocket client
    client.send(JSON.stringify({
      text,
      
      sender: connection.userId,
      recipient,
      file: file ? fileName : null,
      _id: messageDoc._id
    }));
  });


    
    }
})
});






//mongo-password: nINoHyW9Mle0tFgY