const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const restartButton = document.getElementById('restartButton');
const hangupButton = document.getElementById('hangupButton');
callButton.disabled = true;
hangupButton.disabled = true;
restartButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;
restartButton.onclick = restart;

let startTime;
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

function gotStream(stream) {
  console.log('Received local stream');
  localVideo.srcObject = stream;
  localStream = stream;
  callButton.disabled = false;
}

function start() {
  console.log('Requesting local stream');
  startButton.disabled = true;
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true
    })
    .then(gotStream)
    .catch(e => alert(`getUserMedia() error: ${e.name}`));
}

// Simulate an ice restart.
function restart() {
  restartButton.disabled = true;
  offerOptions.iceRestart = true;
  pc1.createOffer(offerOptions).then(onCreateOfferSuccess);
}

function call() {
  callButton.disabled = true;
  hangupButton.disabled = false;
  startTime = window.performance.now();

  pc1 = window.pc1 = new RTCPeerConnection();
  pc1.onicecandidate = e => onIceCandidate(pc1, e);
  pc2 = window.pc2 = new RTCPeerConnection();
  pc2.onicecandidate = e => onIceCandidate(pc2, e);
  pc1.oniceconnectionstatechange = e => {
    onIceStateChange(pc1, e);
    if (pc1 && pc1.iceConnectionState === 'connected') {
      restartButton.disabled = false;
    }
  };
  pc2.oniceconnectionstatechange = e => onIceStateChange(pc2, e);
  pc2.addEventListener('track', e => remoteVideo.srcObject = e.streams[0]);
  localStream.getTracks().forEach(track => pc1.addTrack(track, localStream)
  );
  pc1.createOffer(offerOptions).then(onCreateOfferSuccess);
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

function onIceStateChange(pc) {
  if (pc) {
    if (pc.iceConnectionState === 'connected' ||
      pc.iceConnectionState === 'completed') {
      checkStats(pc);
    }
  }
}

function checkStats(pc) {
  pc.getStats(null).then(results => {
    // figure out the peer's ip
    let activeCandidatePair = null;
    let remoteCandidate = null;

    // Search for the candidate pair, spec-way first.
    results.forEach(report => {
      if (report.type === 'transport') {
        activeCandidatePair = results.get(report.selectedCandidatePairId);
      }
    });
    if (activeCandidatePair && activeCandidatePair.remoteCandidateId) {
      results.forEach(report => {
        if (report.type === 'remote-candidate' && report.id === activeCandidatePair.remoteCandidateId) {
          remoteCandidate = report;
        }
      });
    }
    if (remoteCandidate && remoteCandidate.id) {
      document.getElementById(pc === pc1 ? 'localCandidateId' : 'remoteCandidateId').textContent = remoteCandidate.id;
    }
  });
}

function hangup() {
  console.log('Ending call');
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;
  hangupButton.disabled = true;
  restartButton.disabled = true;
  callButton.disabled = false;
}
