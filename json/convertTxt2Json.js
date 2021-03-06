// usage: node convertTxt2Json.js filename [save]
// prints data generated
// if save is specified data written to db (not printed)

var fs = require('fs');
var readline = require('readline');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var current_drill_type = "";
var current_drill_phase = "";
var current_drill_name = "";
var current_drill_description = "";
var current_special = "";
var data = [];

function push2mongo(){
    var url = 'mongodb://localhost:27017/shoot180';
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server.");
        
        db.collection( 'drills').insert( data);
        
        console.log( "complete");
        db.close();
    });
}

function printDrills(){
    for( var i =0; i<data.length; i++){
        var drill = data[i];
        
        // console.log( "type:[%s] phase:[%s] special:[%s] name:[%s] ref:[%s] desc:", 
        //     drill.type, drill.phase, drill.special,
        //     drill.name, drill.ref);
        console.log( "type:[%s] phase:[%s] name:[%s]", 
            drill.type, drill.phase, drill.name);
        // console.log( drill.desc);
    }
}

function drillComplete(){
    var ndx = current_drill_description.lastIndexOf( ".");
    var ref = current_drill_description.substr( ndx+1).trim();
    current_drill_description = current_drill_description.substr( 0, ndx+1);
    if( ref === "") ref = "noref";
    if( current_special === "") current_special = "none"
    
    data.push( {
        "type":current_drill_type,
        "phase":current_drill_phase,
        "special":current_special,
        "name":current_drill_name,
        "ref":ref,
        "desc":current_drill_description
    });
}
    
readline.createInterface({
    input: fs.createReadStream( process.argv[2]),
    terminal: false
}).on('line', function(line) {
    if( line.indexOf( "Drills") > -1){
        if( current_drill_type !== ""){
            drillComplete()
        }
        // don't drill complete when we hit the next phase
        current_drill_phase = "";
        current_drill_name = "";
        current_drill_type = line.substr( 0, line.indexOf( " "));
    } else if( line.indexOf( 'Phase') === 0 ){
        if( current_drill_phase !== ""){
            drillComplete();
        }
        current_drill_phase = line
        current_drill_name = "";
    } else if( line.indexOf("<ol>") === 0){ // specials
        if( current_drill_name !== ""){
            drillComplete();
        }
        current_special = line.substr( line.indexOf("<ol>")+4);
        current_drill_name = "";
    } else if( line.indexOf( "•") > -1){ // specials
        if( current_drill_name !== ""){
            drillComplete()
        }
        current_drill_name = line.substr( line.indexOf( "•")+1, line.indexOf( ":")).trim();
        current_drill_description = line.substr( line.indexOf(":")+1).trim();
    } else if( line.indexOf( ":") > -1 ){
        // console.log( "new drill:[%s]", line.substr( 0, line.indexOf(":")));
        if( current_drill_name !== ""){
            drillComplete();
        }
        current_special = "";
        current_drill_name = line.substr( 0, line.indexOf( ":"));
        current_drill_description = line.substr( line.indexOf(":") + 1).trim();
    } else {
        current_drill_description += " "+line.trim();
    }
}).on( 'close', function(){
    drillComplete();
    if( process.argv[3] === "save"){
        push2mongo();
    } else {
        printDrills();
    }
});