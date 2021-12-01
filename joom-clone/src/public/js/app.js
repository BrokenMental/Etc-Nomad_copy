const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');

function backendDone(msg) {
    console.log('server is done!', msg);
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
    socket.emit('enter_room', { payload: input.value }, backendDone);

    input.value = '';
}

form.addEventListener('submit', handleRoomSubmit);