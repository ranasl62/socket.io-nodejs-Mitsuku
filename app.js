// server.js
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const port = process.env.PORT || '3000';
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('/', (req, res, next) => {
    res.send(JSON.stringify(req.query));
    return res.end();
});

app.set('port', port);
const server = http.createServer(app);
const io = require('socket.io')(server);
let messages = [];
let messages_g = [];
io.on('connection', (socket) => {
    socket.emit('message_input', {
        messages
    });
    socket.broadcast.emit('message_input', {
        messages
    });

    socket.on('message_output', (data) => {
        messages.push(data);


        const unirest = require("unirest");

        let req = unirest("POST", "https://miapi.pandorabots.com/talk");
        req.headers({
            "cache-control": "no-cache",
            "Cookie": "sessionid=403748992",
            "Content-Length": "151",
            "Accept-Encoding": "gzip, deflate",
            "Host": "miapi.pandorabots.com",
            "Cache-Control": "no-cache",
            "Accept": "*/*",
            "User-Agent": "PostmanRuntime/7.19.0",
            "Referer": "https://www.pandorabots.com/mitsuku/",
            "Content-Type": "application/x-www-form-urlencoded"
        });

        req.form({
            "input": data.message,
            "sessionid": "403748992",
            "channel": "6",
            "botkey": "n0M6dW2XZacnOgCWTp0FRYUuMjSfCkJGgobNpgPv9060_72eKnu3Yl-o1v2nFGtSXqfwJBG2Ros~",
            "client_name": "cw16ed50a91ca"
        });

        req.end((res) => {
            if (res.error) {

            }

            if (res && res.body && res.body.status === 'ok') {
                console.log(res.body);
                messages.push({
                    end: 'server', message: res.body.responses.reduce((a, b) => {
                        return a + b;
                    }, ''), time: new Date()
                });
                socket.emit('message_input', {
                    messages
                });
                socket.broadcast.emit('message_input', {
                    messages
                });
            }
        });
    });


    socket.emit('message_input_g', {
        messages_g
    });
    socket.broadcast.emit('message_input_g', {
        messages_g
    });

    socket.on('message_output_g', (data) => {
        messages_g.push(data);
        setTimeout(() => {
            socket.emit('message_input_g', {
                messages_g
            });
            socket.broadcast.emit('message_input_g', {
                messages_g
            });
        }, 1000);
    });
});

server.listen(port,
    () => console.log(`Running on port ${port}`)
);
