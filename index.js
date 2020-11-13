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
                "letter": "",
                "listNombres": [],
                "listColores":[],
                "listFlores":[]
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
                    clients[c.client.clientId].connection.send(JSON.stringify(payLoad))
                })
            } 


            
        }

        if(result.method === "basta"){
            const gameId = result.gameId;
            const game = games[gameId];

            const payLoad = {
                "method": "basta",
                "game": games[gameId]
            }

            game.clients.forEach(c => {
                clients[c.client.clientId].connection.send(JSON.stringify(payLoad))
            })

            console.log("poteto");

        }

        if(result.method === "finishGame"){
            const gameId = result.gameId;
            const game = games[gameId];
            const client = result.client;

            console.log("finiiiish")

            game.clients.forEach(c => {

                if(c.client.clientId == client.clientId){
                    c.client.words.nombre = client.words.nombre
                    game.listNombres.push(client.words.nombre.toUpperCase())
                    c.client.words.color = client.words.color
                    game.listColores.push(client.words.color.toUpperCase())
                    c.client.words.flor = client.words.flor
                    game.listFlores.push(client.words.flor.toUpperCase())
                }

                
            })


        }

        if(result.method === "result"){
            const gameId = result.gameId;
            const game = games[gameId];
            const client = result.client;
            var winnerIds = []

            

            game.clients.forEach(c=>{
                

                //check if word starts with the letter
                //check if word is more than once in the list

                console.log(c.client.words.nombre)
                console.log(game.listNombres)

                if(c.client.words.nombre.charAt(0).toUpperCase() === game.letter){
                    const ocurrence = getOccurrence(game.listNombres, c.client.words.nombre.toUpperCase)
                    if(ocurrence >1){
                        c.client.score += 100
                    }
                    else{
                        c.client.score +=50
                    }
                }
                

                //check if word starts with the letter
                //check if word is more than once in the list
                if(c.client.words.color.charAt(0).toUpperCase() === game.letter){
                    const ocurrence = getOccurrence(game.listColores, c.client.words.color.toUpperCase)
                    if(ocurrence >1){
                        c.client.score += 100
                    }
                    else{
                        c.client.score +=50
                    }
                }
                //check if word starts with the letter
                //check if word is more than once in the list
                if(c.client.words.flor.charAt(0).toUpperCase() === game.letter){
                    const ocurrence = getOccurrence(game.listFlores, c.client.words.flor.toUpperCase)
                    if(ocurrence >1){
                        c.client.score += 100
                    }
                    else{
                        c.client.score +=50
                    }
                }
                //look for the highest score 

                if(winnerIds.length== 0 || winnerIds[0].score< c.client.score){
                    winnerIds = [c.client]
                }
                else if(winnerIds[0].score == c.client.score){
                    winnerIds.push(c.client)
                }
            })

            const payLoad = {
                "method": "result",
                "game": games[gameId],
                "winners": winnerIds
            }

            game.clients.forEach(c => {
                clients[c.client.clientId].connection.send(JSON.stringify(payLoad))
            })

            
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

function getOccurrence(array, value) {
    var count = 0;
    array.forEach((v) => (v === value && count++));
    return count;
}




function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
 


