const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('#enter');
const nicName = welcome.querySelector('#name');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

function addMessage(message) {
    const ul = room.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector('#msg input');
    const value = input.value;
    socket.emit('new_message', value, roomName, () => {
        addMessage(`You : ${value}`);
    });

    input.value = '';
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = nicName.querySelector('input');

    socket.emit('nickname', input.value);
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName}`;

    const msgForm = room.querySelector('#msg');
    msgForm.addEventListener('submit', handleMessageSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector('input');
    /*
    emit event
    1. 원하는 이름으로 데이터 포함 전송 가능(on으로 활용 시 이름이 같아야 함)
    2. 데이터 전송, string 뿐 아니라 object도 가능
    3. 콜백함수 전송 가능
    4. 데이터는 무제한으로 입력 가능, 콜백함수는 맨 마지막에만 입력 가능
    */
    socket.emit('enter_room', input.value, showRoom);
    roomName = input.value;
    input.value = '';
}

nicName.addEventListener('submit', handleNicknameSubmit);

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (user, newCount) => {
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
});

socket.on('bye', (left, newCount) => {
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} left T T`);
});

socket.on('new_message', addMessage);

//다음과 동일 : socket.on('room_change', (msg) => console.log(msg));
socket.on('room_change', console.log);


socket.on('room_change', (rooms) => {
    const roomList = welcome.querySelector('ul');
    roomList.innerHTML = '';
    
    if (rooms.length === 0) {
        return;
    }

    rooms.forEach(room => {
        const li = document.createElement('li');
        li.innerText = room;
        roomList.append(li);
    })
});