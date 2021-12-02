import http from 'http';
import express from 'express';
import socketIO from 'socket.io';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
//const io = SocketIO(server);
const io = new Server(server, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    }
});

instrument(io, {
    auth: false
});

function publicRooms() {
    const {
        sockets: {
            adapter: {
                sids, rooms
            }
        }
    } = io;

    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName) {
    /*
        물음표(?)는 아래와 동일한 의미(Optional chaining)
        if(wsServer.sockets.adapter.rooms.get(roomName)){
            return wsServer.sockets.adapter.rooms.get(roomName).size
        } else {
            return undefined;
        }
    */
    return io.sockets.adapter.rooms.get(roomName)?.size;
}

//socket.io 연결
io.on('connection', socket => {
    //모든 소캣을 room(room명)으로 강제로 연결
    //io.socketsJoin('room');

    //console.log(socket);

    socket['nickname'] = 'Anon';

    //불특정다수의 이벤트를 실행 할 경우 함께 실행되는 이벤트
    socket.onAny((event) => {
        console.log(`Socket Event:${event}`);
        //console.log(io.sockets.adapter);
    });

    /*
    emit에서 설정 한 명칭과 동일한 이벤트를 실행
    1. 데이터(여기선 msg)
    2. 함수(여기선 done, done()과 같이 사용)
    3. emit의 파라미터 개수와 같아야 함
    */
    socket.on('enter_room', (roomName, done) => {
        //join({room명}) : 해당 room에 입장
        socket.join(roomName);
        done();

        //socket.to({room명}).emit({문자열}) : 문자열을 해당 room에 접속한 모든 사용자에게 전달
        socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
        io.sockets.emit('room_change', publicRooms());
    });

    //소켓이 방을 떠나기 직전에 실행
    socket.on('disconnecting', () => {
        socket.rooms.forEach((room) => {
            socket.to(room).emit('bye', socket.nickname, countRoom(room) -1);
        });
    });

    socket.on('disconnect', () => {
        io.sockets.emit('room_change', publicRooms());
    })

    socket.on('new_message', (msg, room, done) => {
        socket.to(room).emit('new_message', `${socket.nickname} : ${ msg }`);
        done();
    });

    socket.on('nickname', nickname => {
        socket['nickname'] = nickname;
    });
});

server.listen(3000, handleListen);