const http = require('http');
const express = require('express');

const app = express();

app.use('/static', express.static('public'));
app.get('/', function(req,res){
    res.sendFile('BStest.html', {root:'public/views'});
});




const port = 3000;
server = http.Server(app);
server.listen(port, function(){
    console.log('server listening on port ' + port);
});