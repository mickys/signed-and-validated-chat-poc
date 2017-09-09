var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
    console.log('index.html requested');
    res.sendFile(__dirname + '/index.html');
});

app.get('/app.js', function(req, res){
    console.log('app.js requested');
    res.sendFile(__dirname + '/bundle.js');
});

io.on('connection', function(socket){

    console.log('a user connected');

    socket.on('chat', function (data) {
        io.emit('chat', {
            data: data,
            sender : socket.id
        });
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});