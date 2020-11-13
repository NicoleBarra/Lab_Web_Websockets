const http = require("http");
const app = require("express")();
app.get("/", (req,res)=> res.sendFile(__dirname + "/index.html"))

app.listen(9091, ()=>console.log("Listening on http port 9091"))

const webSocketServer = require("websocket").server
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("listening on 9090"));

//hashmap
const clients = {};
const games = {};


const wsServer = new webSocketServer({
    "httpServer":httpServer
})

wsServer.on("request", request => {
    //connect
    const connection = request.accept(null,request.origin);

    connection.on("open", () => console.log("opened"))
    connection.on("close", () => console.log("closed"))
    connection.on("message", message => {

        const result = JSON.parse(message.utf8Data)
        //I have received a message from the client
        
        //user wants to create a new game
        if(result.method === "create"){
            const clientId = result.client.clientId;
            const gameId = guid();
            games[gameId] = {
                "id":gameId,
                "clients": [],
                "status": false,
                "letter": ""
            }

            const payLoad = {
                "method": "create",
                "game": games[gameId]
            }

            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad));

        }

        //a client want to join
        if (result.method === "join") {

            const client = result.client;
            const gameId = result.gameId;
            const game = games[gameId];

            game.clients.push({
                "client": client
            })



            const payLoad = {
                "method": "join",
                "game": game
            }

            //loop through all clients and tell them that people has joined
            game.clients.forEach(c => {
                clients[c.client.clientId].connection.send(JSON.stringify(payLoad))
            })

            //if game hasn't started and there are more than two players start game.
            if (game.clients.length >= 2 && game.status === false){
                game.status = true;
                var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                var charactersLength = characters.length;
                game.letter = characters.charAt(Math.floor(Math.random() * charactersLength));
                
                const payLoad = {
                    "method": "start",
                    "game": game
                }

                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                })
            } 


            
        }


    })

    //generate new client id
    const clientId = guid();
    clients[clientId] = {
        "connection":connection
    }

    const payLoad = {
        "method":"connect",
        "clientId": clientId
    }

    connection.send(JSON.stringify(payLoad))

}) 

function startGame(){

}



function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
 


