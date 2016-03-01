var express = require( "express");
var drills = require( './routes/drills');
var app = express();

app.configure( function(){
    app.use( express.logger('dev'));
    app.use( express.bodyParser());
});

app.get( '/', drills.findAll);

app.listen( 8080);
console.log( "server started");