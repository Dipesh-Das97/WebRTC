const constraints = {
    audio : true,
    video : {
        width : {
            exact : 640
        },
        height : {
            exact : 480
        },
        frameRate : {
            exact : 30
        }
    }
}

const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
callButton.disabled = true;
hangupButton.disabled = true;
startButton.addEventListener('click', start);
callButton.addEventListener('click', call);
hangupButton.addEventListener('click', hangup);
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;
let pc1;
let pc2;
/*const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};*/

function getName(pc) {
    return (pc === pc1) ? 'pc1' : 'pc2';
}
function getOtherPc(pc) {
    return (pc === pc1) ? pc2 : pc1;
}

async function start() {
    console.log('Requesting local stream');
    startButton.disabled = true;
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Received local stream');
        localVideo.srcObject = stream;
        localStream = stream;
        window.localStream = localStream
        callButton.disabled = false;
    } catch (e) {
        alert(`getUserMedia() error: ${e.name}`);
    }
}

async function call() {
    callButton.disabled = true;
    hangupButton.disabled = false;

    const configuration = {};
    pc1 = new RTCPeerConnection(configuration);
    window.pc1 = pc1;
    pc1.addEventListener('icecandidate', e => onIceCandidate(pc1, e));
    pc2 = new RTCPeerConnection(configuration);
    pc2.addEventListener('icecandidate', e => onIceCandidate(pc2, e));
    pc2.addEventListener('track', e => remoteVideo.srcObject = e.streams[0]);
    localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
    const offer = await pc1.createOffer();
    await onCreateOfferSuccess(offer);
}

async function onCreateOfferSuccess(desc) {
    await pc1.setLocalDescription(desc);
    await pc2.setRemoteDescription(desc);
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    const answer = await pc2.createAnswer();
    await onCreateAnswerSuccess(answer);
}

async function onCreateAnswerSuccess(desc) {
    await pc2.setLocalDescription(desc);
    await pc1.setRemoteDescription(desc);
}

async function onIceCandidate(pc, event) {
    await (getOtherPc(pc).addIceCandidate(event.candidate));

}
function hangup() {
    pc1.close();
    pc2.close();
    pc1 = null;
    pc2 = null;
    hangupButton.disabled = true;
    callButton.disabled = false;
}