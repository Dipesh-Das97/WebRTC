const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
callButton.disabled = true;
startButton.addEventListener('click', start);
callButton.addEventListener('click', call);
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;
let pc1;
let pc2;
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};

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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        console.log('Received local stream');
        localVideo.srcObject = stream;
        localStream = stream;
        callButton.disabled = false;
    } catch (e) {
        alert(`getUserMedia() error: ${e.name}`);
    }
}

async function call() {
    callButton.disabled = true;
    const configuration = {};
    pc1 = new RTCPeerConnection(configuration);
    pc1.addEventListener('icecandidate', e => onIceCandidate(pc1, e));
    pc2 = new RTCPeerConnection(configuration);
    pc2.addEventListener('icecandidate', e => onIceCandidate(pc2, e));
    pc2.addEventListener('track', e => remoteVideo.srcObject = e.streams[0]);
    localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
    const offer = await pc1.createOffer(offerOptions);
    await onCreateOfferSuccess(offer);
}
async function onCreateOfferSuccess(desc) {
    await pc1.setLocalDescription(desc);
    await pc2.setRemoteDescription(desc);
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
function restart(){
    alert(`Ice State : ${pc1.iceConnectionState}`)
    if(pc1.iceConnectionState == "failed"){
        pc1.createOffer(offerOptions).then(onCreateOfferSuccess);
        pc1.restartIce();
    }
}
function restart() {
    restartButton.disabled = true;
    //offerOptions.iceRestart = true;
    console.log('pc1 createOffer restart');
    pc1.createOffer(offerOptions).then(onCreateOfferSuccess);
    pc1.restartIce();
  }