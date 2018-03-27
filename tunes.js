 /* Javascript code: Connect to server*/
 var socket = io.connect("213.66.254.63:3074");

var albums = [{
    fullAlbum: "Super Mario Odyssey Original Soundtrack",
    shortAlbum: "Odyssey",
    art: "odyssey.png"
}, {
    fullAlbum: "Sonic Mania: Original Soundtrack",
    shortAlbum: "Mania",
    art: "mania.jpg"
}, {
    fullAlbum: "Yoshi's Island Original Soundtrack",
    shortAlbum: "Yoshi's Island",
    art: "yoshisisland.jpg"
}, {
    fullAlbum: "Super Mario Galaxy 2 Original Soundtrack",
    shortAlbum: "Galaxy 2",
    art: "galaxy2.jpg"
}, {
    fullAlbum: "Super Mario 3D World Original Soundtrack",
    shortAlbum: "3D World",
    art: "mario3dworld.jpg"
}, {
    fullAlbum: "Super Smash Bros. for 3DS & Wii U - Soundtrack (Game Rip)",
    shortAlbum: "Smash 4",
    art: "smash4.jpg"
}, {
    fullAlbum: "Super Smash Bros. (64) Original Sountrack (Game Rip)",
    shortAlbum: "Smash 64",
    art: "smash64.jpg"
}, {
    fullAlbum: "Super Mario Galaxy Original Soundtrack (Platinum Version)",
    shortAlbum: "Galaxy",
    art: "galaxy.jpg"
}, {
    fullAlbum: "Super Smash Bros. Melee Soundtrack (Game Rip)",
    shortAlbum: "Melee",
    art: "melee.jpg"
}]

var songs = new Array();
socket.emit("getSongs");

 /* Basic listener */
 socket.on("songs", function(package){
     // Do something
     songs = package;
     fillShelf();
 });

 function fillShelf(){
     document.getElementById("shelf").innerHTML = "";
     var search = document.getElementById("search").value.split(" ");
     var i = 0; 
     var staffed = 0;
     while(staffed < 50 && i < songs.length){
         var song = songs[i];
         var valid = true;
         for(let i = 0; i < search.length; i++){
             if(search[i] != false && song.fullName.toLowerCase().indexOf(search[i].toLowerCase()) == -1) valid = false;
         }
         if(valid){
         var album = getAlbum(song.album)
         document.getElementById("shelf").innerHTML+= '<div class="slot"> <img draggable="false" src="img/' + album.art + '" alt="Cover art" title="Cover art" class="cover-art"> <span class="title">' + song.title + '</span> <button class="btn queue" onclick="queue(' + "'" + song.fullName + "'" + ')">Queue</button> <button class="btn play" onclick="play(' + "'" + song.fullName + "'" + ')">Play</button> </div>'
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
