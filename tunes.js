var socket = io.connect("213.66.254.63:3074");

var albums = new Array();
var songs = new Array();
socket.emit("getSongs");

socket.on("albums", pack => {
    albums = pack;
 });
 

 /* Basic listener */
 socket.on("songs", function(package){
     // Do something
     songs = package;
     fillTable();
     fillShelf();
 });


 function fillTable(){

    albums.sort(function(a, b) {
        var textA = a.shortAlbum.toUpperCase();
        var textB = b.shortAlbum.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    
    document.getElementById("category-table").innerHTML = '<option value="null" class="table-values">All albums</option>'   
     albums.forEach(album => {
        document.getElementById("category-table").innerHTML += '<option value="' + album.shortAlbum + '" class="table-values">' + album.shortAlbum + '</option>'   
     })
     
 }

 function fillShelf(){
     document.getElementById("shelf").innerHTML = "";
     var tableValue = document.getElementById("category-table").value;
     var search = document.getElementById("search").value.split(" ");
     var i = 0; 
     var staffed = 0;
     while(staffed < 50 && i < songs.length){
         var song = songs[i];
         var valid = true;
         for(let i = 0; i < search.length; i++){
             if(search[i] != false && song.fullName.toLowerCase().indexOf(search[i].toLowerCase()) == -1) valid = false;
         }
         var album = getAlbum(song.album)
         if(tableValue != "null" && tableValue != album.shortAlbum) valid = false;
         if(valid){
         document.getElementById("shelf").innerHTML+= '<div class="slot"> <img draggable="false" src="' + album.art + '" alt="Cover art" title="Cover art" class="cover-art"> <span class="title">' + song.title + '</span> <button class="btn queue" onclick="queue(' + "'" + song.fullName + "'" + ')">Queue</button> <button class="btn play" onclick="play(' + "'" + song.fullName + "'" + ')">Play</button> </div>'
            staffed++;
        }
        i++;
    }
 }

 function queue(song){
    socket.emit("queue", song);
 }

 function play(song){
    socket.emit("play", song);
 }

 function getAlbum(album){
     for(let i = 0; i < albums.length; i++){
         if(albums[i].fullAlbum == album) return albums[i];
     }
     return false;
 }

 function update(){
    fillShelf();
 }
