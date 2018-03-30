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

 function getSizeOfAlumbs(){
     songs.forEach(song => {
         for(let i = 0; i < albums.length; i++){
             if(albums[i].fullAlbum == song.album){
                 if(albums[i].size == undefined) albums[i].size = 0;
                 albums[i].size++;
             }
         }
     })
 }

 function checkPos(){
     var shelf = document.getElementById("shelf");
     var scroll = shelf.scrollTop;
     if(scroll + shelf.clientHeight == shelf.scrollHeight){
        fillMore()
     }
 }

 function fillTable(){

    getSizeOfAlumbs();

    albums.sort(function(a, b) {
        var textA = a.shortAlbum.toUpperCase();
        var textB = b.shortAlbum.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    
    document.getElementById("category-table").innerHTML = '<option value="null" class="table-values">All songs ' + "(" + songs.length + ")" + '</option>'   
     albums.forEach(album => {
        document.getElementById("category-table").innerHTML += '<option value="' + album.shortAlbum + '" class="table-values">' + album.shortAlbum + " (" + album.size + ")" + '</option>'   
     })
     
 }

 function fillMore(){
    var tableValue = document.getElementById("category-table").value;
    var search = document.getElementById("search").value.split(" ");
    if(goneTo >= songs.length) return;
    var staffed = 0;
    var i = goneTo;
    while(staffed < 50 && i < songs.length){
        var song = songs[i];
        var valid = true;
        for(let i = 0; i < search.length; i++){
            if(search[i] != false && song.fullName.toLowerCase().indexOf(search[i].toLowerCase()) == -1) valid = false;
        }
        var album = getAlbum(song.album)
        if(tableValue != "null" && tableValue != album.shortAlbum) valid = false;
        if(valid){
        songsShown++;
        displayedSongs[i] = song;
        var name = song.title;
        if(name.length > 44) name = name.substr(0, 44) + "...";
        document.getElementById("shelf").innerHTML+= "<div class='slot'> <img draggable='false' src='" + album.art + "' alt='Cover art' title='" + song.fullName + "' class='cover-art'> <span class='title'>" + name + "</span> <button class='btn queue' onclick='queue(" + i + ")'>Queue</button> <button class='btn play' onclick='play(" + i + ")'>Play</button> </div>";
        staffed++;
       }
       i++;
   }
   window.goneTo = i;
 }

 var displayedSongs = new Array();
 var songsShown = 0;
 function fillShelf(){
     document.getElementById("shelf").innerHTML = "";
     var tableValue = document.getElementById("category-table").value;
     var search = document.getElementById("search").value.split(" ");
     var i = 0; 
     var staffed = 0;
     displayedSongs = [];
     songsShown = 0;
     while(staffed < 50 && i < songs.length){
         var song = songs[i];
         var valid = true;
         for(let i = 0; i < search.length; i++){
             if(search[i] != false && song.fullName.toLowerCase().indexOf(search[i].toLowerCase()) == -1) valid = false;
         }
         var album = getAlbum(song.album)
         if(tableValue != "null" && tableValue != album.shortAlbum) valid = false;
         if(valid){
         songsShown++;
         displayedSongs[i] = song;
         var name = song.title;
         if(name.length > 44) name = name.substr(0, 44) + "...";
         document.getElementById("shelf").innerHTML+= "<div class='slot'> <img draggable='false' src='" + album.art + "' alt='Cover art' title='" + song.fullName + "' class='cover-art'> <span class='title'>" + name + "</span> <button class='btn queue' onclick='queue(" + i + ")'>Queue</button> <button class='btn play' onclick='play(" + i + ")'>Play</button> </div>";
         staffed++;
        }
        i++;
    }
    window.goneTo = i;
 }

 document.getElementById("search").focus();

 function queue(id){
    var song = displayedSongs[id].fullName;
    song = JSON.stringify(song); 
    socket.emit("queue", song);
 }

 function play(id){
    var song = displayedSongs[id].fullName;
    song = JSON.stringify(song);
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
