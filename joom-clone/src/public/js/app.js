const socket = new WebSocket(`ws://${window.location.host}`);
const messageList = document.querySelector('ul');
const nickForm = document.querySelector('#nick');
const messageForm = document.querySelector('#message');

//메시지 만들기
function makeMessage(type, payload) {
    //json 형식을 string으로 변환
    return JSON.stringify({ type, payload });
}

//서버 시작 시
socket.addEventListener('open', () => {
    console.log('Connected to Server');
});

//메시지 받을 때
socket.addEventListener('message', (message) => {
    //console.log('New Message: ', message.data);
    const li = document.createElement('li');
    li.innerText = message.data;

    messageList.append(li);
});

//서버 종료 시
socket.addEventListener('close', () => {
    console.log('Disconnected from Server');
});

/*
setTimeout(() => {
    //메시지 전송
    socket.send('hello from the browser!');
}, 10000);
*/

//메시지폼에서 전송 시
function handleSubmit(event) {
    event.preventDefault();

    const input = messageForm.querySelector('input');
    socket.send(makeMessage('new_message', input.value));
    //socket.send(input.value);
    input.value = '';
}

//닉네임폼에서 전송 시
function handleNickSubmit(event) {
    event.preventDefault();

    const input = nickForm.querySelector('input');
    socket.send(makeMessage('nickname', input.value));

    input.value = '';
}

messageForm.addEventListener('submit', handleSubmit);
nickForm.addEventListener('submit', handleNickSubmit);