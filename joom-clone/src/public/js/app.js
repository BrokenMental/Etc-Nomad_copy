const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');

//stream : video, audio가 합쳐진 데이터
let myStream;
let muted = false;
let cameraOff = false;

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log(devices);
        
        const cameras = devices.filter(device => device.kind === 'videoinput');
        console.log(cameras);

        cameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.innerText = camera.label;
            camerasSelect.appendChild(option);
        })
    } catch (e) {
        console.log(e);
    }
}

async function getEmedia() {
    try {
        //audio: true와 같이 반드시(강제로) 입력해야 하는것을 constraint(제약 조건) 이라 함
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        });

        //console.log(myStream);

        //srcObject 사용가능 데이터 : MediaStream, MediaSource, Blob, or File
        myFace.srcObject = myStream;
        getCameras();
    } catch (e) {
        console.log(e);
    }
}

getEmedia();

function handleMuteClick() {
    //console.log(myStream.getAudioTracks());
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);

    if (!muted) {
        muteBtn.innerText = 'Unmute';
        muted = true;
    } else {
        muteBtn.innerText = 'Mute';
        muted = true;
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

function handleCameraChange() {
    console.log(camerasSelect.value);
}

muteBtn.addEventListener('click', handleMuteClick);
cameraBtn.addEventListener('click', handleCameraClick);
camerasSelect.addEventListener('input', handleCameraChange);