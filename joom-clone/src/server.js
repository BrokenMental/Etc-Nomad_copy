import http from 'http';
import express from 'express';
import SocketIO from 'socket.io';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
//app.listen(3000, handleListen);

const server = http.createServer(app);
const io = SocketIO(server);

io.on('connection', socket => {
    //console.log(socket);
    /*
    emit에서 설정 한 명칭과 동일한 이벤트를 실행
    1. 데이터(여기선 msg)
    2. 함수(여기선 done, done()과 같이 사용)
    3. emit의 파라미터 개수와 같아야 함
    */
    socket.on('enter_room', (msg, done) => {
        console.log(msg);
        setTimeout(() => {
            done('hello from the backend');
        }, 5000);
    });
});

server.listen(3000, handleListen);