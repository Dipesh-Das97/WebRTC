const webSocket = new WebSocket("ws://127.0.0.1:3000"); //websocket object for a server at the url

webSocket.onmessage = (event) => {//listening at the url for messages from server
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer)
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}

function sendData(data) {
    webSocket.send(JSON.stringify(data))//send data through web socket
}


let localStream
let peerConn
function startCall() {
    document.getElementById("video-call-div")
    .style.display = "inline"

    navigator.getUserMedia({
        video: true,
        audio: true
    }, (stream) => {
        localStream = stream
        document.getElementById("local-video").srcObject = localStream

        let configuration = {
            /*iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302", 
                    "stun:stun1.l.google.com:19302", 
                    "stun:stun2.l.google.com:19302"]
                }
            ]*/
        }

        peerConn = new RTCPeerConnection(configuration)
        peerConn.addStream(localStream)//add local Stream to the local-video element

        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video").srcObject = e.stream
        }//add remote Stream to the remote-video element after ICE candidate exchange

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            })
        })

        createAndSendOffer()
    }, (error) => {
        console.log(error)
    })
}

function createAndSendOffer() {
    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        })

        peerConn.setLocalDescription(offer)
    }, (error) => {
        console.log(error)
    })
}
