const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');
const call = document.getElementById('call');

call.hidden = true;

//stream : video, audio가 합쳐진 데이터
let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        //console.log(devices);
        
        const cameras = devices.filter(device => device.kind === 'videoinput');
        //console.log(cameras);

        const currentCamera = myStream.getVideoTracks()[0];

        cameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.innerText = camera.label;

            if (currentCamera.label === camera.label) {
                option.selected = true;
            }

            camerasSelect.appendChild(option);
        });
    } catch (e) {
        console.log(e);
    }
}

//데이터 정의
async function getMedia(deviceId) {
    const initailConstrains = {
        audio: true,
        video: {
            facingMode: 'user'
        }
    };
    
    const cameraConstraints = {
        audio: true,
        video: {
            deviceId: {
                exact: deviceId
            }
        }
    };

    try {
        //audio: true와 같이 반드시(강제로) 입력해야 하는것을 constraint(제약 조건) 이라 함
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initailConstrains
        );
        //console.log(myStream);

        //srcObject 사용가능 데이터 : MediaStream, MediaSource, Blob, or File
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras();
        }
    } catch (e) {
        console.log(e);
        alert('디바이스가 존재하지 않아 진행할 수 없습니다.');
    }
}



function handleMuteClick() {
    //console.log(myStream.getAudioTracks());
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);

    if (!muted) {
        muteBtn.innerText = 'Unmute';
        muted = true;
    } else {
        muteBtn.innerText = 'Mute';
        muted = false;
    }
}

function handleCameraClick() {
    //console.log(myStream.getVideoTracks());
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);

    if (cameraOff) {
        cameraBtn.innerText = 'Turn Camera Off';
        cameraOff = false;
    } else {
        cameraBtn.innerText = 'Turn Camera On';
        cameraOff = true;
    }
}

async function handleCameraChange() {
    //console.log(camerasSelect.value);
    await getMedia(camerasSelect.value);
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        //console.log(myPeerConnection.getSenders());
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind == 'video');
        console.log(videoSender);
        videoSender.replaceTrack(videoTrack);
    }
}

muteBtn.addEventListener('click', handleMuteClick);
cameraBtn.addEventListener('click', handleCameraClick);
camerasSelect.addEventListener('input', handleCameraChange);

const welcome = document.getElementById('welcome');
const welcomeForm = welcome.querySelector('form');

//화면 전환 및 데이터 불러오기
async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

//맨 처음 Enter room 버튼 클릭 시
async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector('input');

    await initCall();

    socket.emit('join_room', input.value);

    roomName = input.value;

    input.value = '';
}

welcomeForm.addEventListener('submit', handleWelcomeSubmit);

//맨 처음 접속 한 브라우저에서 실행
socket.on('welcome', async () => {
    myDataChannel = myPeerConnection.createDataChannel('chat');
    myDataChannel.addEventListener('message', (event) => {
        console.log(event.data);
    });
    //data channel 데이터 전송 시 : myDataChannel.send({문자열});
    console.log('made data channel');

    //console.log('someone joined');
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log('sent the offer');
    socket.emit('offer', offer, roomName);
    //console.log(offer);
});

//차후에 접속한 브라우저에서 실행
socket.on('offer', async (offer) => {
    myPeerConnection.addEventListener('datachannel', (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener('message', (event) => {
            console.log(event.data);;
    });
    //data channel 데이터 전송 시 : myDataChannel.send({문자열});
    
    console.log('received the offer');
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    //console.log(answer);
    myPeerConnection.setLocalDescription(answer);
    socket.emit('answer', answer, roomName);
    console.log('sent the answer');
});

socket.on('answer', (answer) => {
    console.log('received the answer');
    myPeerConnection.setRemoteDescription(answer);
});

socket.on('ice', ice => {
    console.log('received candidate');
    myPeerConnection.addIceCandidate(ice);
});

function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    'stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302',
                    'stun:stun3.l.google.com:19302',
                    'stun:stun4.l.google.com:19302'
                ]
            }
        ]
    });
    //console.log(myStream.getTracks());
    myPeerConnection.addEventListener('icecandidate', handleIce);
    myPeerConnection.addEventListener('addstream', handleAddStream);
    
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
    console.log('sent candidate');
    socket.emit('ice', data.candidate, roomName);
    console.log('got ice candidate');
    console.log(data);
}

function handleAddStream(data) {
    //console.log('got and event from my peer');
    //console.log('Peer`s Stream', data.stream);
    const peerFace = document.getElementById('peerFace');
    console.log('My stream', myStream);
    peerFace.srcObject = data.stream;
}