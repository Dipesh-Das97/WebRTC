const Socket = require("websocket").server
const http = require("http")
const server = http.createServer((req, res) => {})

server.listen(3000, () => {
    console.log("Listening on port 3000...")
})

const webSocket = new Socket({ httpServer: server })

let users = []

webSocket.on('request', (req) => {
    const connection = req.accept()

    connection.on('message', (message) => {
        const data = JSON.parse(message.utf8Data)
        users.push({
            conn : connection
        });
        const user = users[0];

        switch(data.type) {
            case "store_offer":
                user.offer = data.offer
                break
            
            case "store_candidate":
                if (user.candidates == null)
                    user.candidates = []
                
                user.candidates.push(data.candidate)
                break
            case "send_answer":
                sendData({
                    type: "answer",
                    answer: data.answer
                }, user.conn)
                break
            case "send_candidate":
                sendData({
                    type: "candidate",
                    candidate: data.candidate
                }, user.conn)
                break
            case "join_call":

                sendData({
                    type: "offer",
                    offer: user.offer
                }, connection)
                
                user.candidates.forEach(candidate => {
                    sendData({
                        type: "candidate",
                        candidate: candidate
                    }, connection)
                })
                break
        }
    })
})

function sendData(data, conn) {
    conn.send(JSON.stringify(data))
}