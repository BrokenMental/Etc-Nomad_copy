import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
//app.listen(3000, handleListen);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

/*
//연결 되었을 경우 실행 함수
function handleConnection(socket) {
    console.log(socket);
}

//연결 이벤트
wss.on('connection', handleConnection);
*/

const sockets = [];

wss.on('connection', (socket) => {
    sockets.push(socket);
    console.log('Connected to Browser');

    socket['nickname'] = 'Anon';

    //탭(페이지)이 닫혔을 때 실행
    socket.on('close', () => {
        console.log('Disconnected from the Browser');
    });

    //메시지를 받을 때
    socket.on('message', (message) => {
        //console.log(message.toString('utf8'));

        //stringify를 사용해서 string 형으로 변환했던 json 내용을 다시 json 형태로 변경
        const parsed = JSON.parse(message.toString('utf8'));
        console.log(parsed, message.toString('utf8'));

        //구분값 중 type이 new_message일 경우 실행
        if (parsed.type === 'new_message') {
            sockets.forEach(aSocket => {
                aSocket.send(`${socket.nickname}: ${parsed.payload}`);
            });
            
        } else if (parsed.type === 'nickname') {
            //console.log(parsed.payload);
            socket['nickname'] = parsed.payload;
        }

        /*
        switch (parsed.type) {
            case 'new_message':
                sockets.forEach(aSocket => {
                    aSocket.send(parsed.payload);
                });

                break;
            
            case 'nickname':
                console.log(parsed.payload);

                break;
        }
        */

        //socket.send(message.toString('utf8'));
    });

    //메시지 전송
    //socket.send('hello!!!');
});

server.listen(3000, handleListen);