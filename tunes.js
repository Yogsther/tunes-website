var socket = io.connect("213.66.254.63:3074");

var albums = new Array();
var songs = new Array();
var news = new Array();
socket.emit("getSongs");

var playedSongs = readCookie("playedSongs");
if(playedSongs == undefined) createCookie("playedSongs", 0, 100000);
updateColor();



socket.on("albums", pack => {
    albums = pack;
});

/* Basic listener */
socket.on("songs", function (package) {
    // Do something
    songs = package;
    fillTable();
    fillShelf();
});

socket.on("news", data => {
    news = data;
    displayNews();
})

function getSizeOfAlumbs() {
    songs.forEach(song => {
        for (let i = 0; i < albums.length; i++) {
            if (albums[i].fullAlbum == song.album) {
                if (albums[i].size == undefined) albums[i].size = 0;
                albums[i].size++;
            }
        }
    })
}

function checkPos() {
    var shelf = document.getElementById("shelf");
    var scroll = shelf.scrollTop;
    if (scroll + shelf.clientHeight == shelf.scrollHeight) {
        fillMore()
    }
}

function fillTable() {

    getSizeOfAlumbs();

    albums.sort(function (a, b) {
        var textA = a.shortAlbum.toUpperCase();
        var textB = b.shortAlbum.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });

    document.getElementById("category-table").innerHTML = '<option value="null" class="table-values">All songs ' + "(" + songs.length + ")" + '</option>'
    albums.forEach(album => {
        document.getElementById("category-table").innerHTML += '<option value="' + album.shortAlbum + '" class="table-values">' + album.shortAlbum + " (" + album.size + ")" + '</option>'
    })

}

function fillMore() {
    var tableValue = document.getElementById("category-table").value;
    var search = document.getElementById("search").value.split(" ");
    if (goneTo >= songs.length) return;
    var staffed = 0;
    var i = goneTo;
    while (staffed < 50 && i < songs.length) {
        var song = songs[i];
        var valid = true;
        for (let i = 0; i < search.length; i++) {
            if (search[i] != false && song.fullName.toLowerCase().indexOf(search[i].toLowerCase()) == -1) valid = false;
        }
        var album = getAlbum(song.album)
        if (tableValue != "null" && tableValue != album.shortAlbum) valid = false;
        if (valid) {
            songsShown++;
            displayedSongs[i] = song;
            var name = song.title;
            console.log(song)
            if (name.length > 44) name = name.substr(0, 44) + "...";
            document.getElementById("shelf").innerHTML += "<div class='slot'> <img draggable='false' src='" + album.art + "' alt='Cover art' title='" + song.fullName + "' class='cover-art'> <span class='title'>" + name + "</span> <button class='btn queue' onclick='queue(" + i + ")'>Queue</button> <button class='btn play' onclick='play(" + i + ")'>Play</button> </div>";
            staffed++;
        }
        i++;
    }
    window.goneTo = i;
}

var displayedSongs = new Array();
var songsShown = 0;

function fillShelf() {
    document.getElementById("shelf").innerHTML = "";
    var tableValue = document.getElementById("category-table").value;
    var search = document.getElementById("search").value.split(" ");
    var i = 0;
    var staffed = 0;
    displayedSongs = [];
    songsShown = 0;
    while (staffed < 50 && i < songs.length) {
        var song = songs[i];
        var valid = true;
        for (let i = 0; i < search.length; i++) {
            if (search[i] != false && song.fullName.toLowerCase().indexOf(search[i].toLowerCase()) == -1) valid = false;
        }
        var album = getAlbum(song.album)
        if (tableValue != "null" && tableValue != album.shortAlbum) valid = false;
        if (valid) {
            songsShown++;
            displayedSongs[i] = song;
            var name = song.title;
            if (name.length > 44) name = name.substr(0, 44) + "...";
            document.getElementById("shelf").innerHTML += "<div class='slot'> <img draggable='false' src='" + album.art + "' alt='Cover art' title='" + song.fullName + "' class='cover-art'> <span class='title'>" + name + "</span> <button class='btn queue' onclick='queue(" + i + ")'>Queue</button> <button class='btn play' onclick='play(" + i + ")'>Play</button> </div>";
            staffed++;
        }
        i++;
    }
    window.goneTo = i;
}

document.getElementById("search").focus();


function displayNews(displayAllNews) {
    if(displayAllNews == undefined) displayAllNews = false;

    var lastVisit = readCookie("lastVisit");
    if (lastVisit == undefined) lastVisit = 0;

    function dated(a, b) {
        if (a.date > b.date)
            return -1;
        if (a.date < b.date)
            return 1;
        return 0;
    }

    news.sort(dated);

    if (lastVisit > news[0].date && displayAllNews !== true) {
        return; // No new news for the user
    }

    var overlay = '<div id="overlay"><img id="news-banner" draggable="false" src="img/tunenews-banner.png"> <div id="news-room"> </div> <button id="close-button" onclick="clearOverlay()" class="btn" title="Hint: you can also close by hitting espace or clicking outside the overlay."> Close </button></div>';
    document.getElementById("insert-overlay").innerHTML = overlay;

    for(let i = 0; i < news.length; i++){
        if(displayAllNews || lastVisit < news[i].date){
            // Display story
            var date = new Date(news[i].date);
            document.getElementById("news-room").innerHTML += '<div class="story"> <img src="' + news[i].img + '" alt="Cover art" title="Cover art" class="cover-art-news" draggable="false"> <span class="story-title">' + news[i].title + '</span> <span class="story-description">' + news[i].description + '</span> <span class="date-sign">' + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + '</span> </div>';
        }
    }

    lastVisit = Date.now();
    createCookie("lastVisit", lastVisit, 1000000);
}

document.addEventListener("keydown", key => {
    if(key.key == "Escape"){
        clearOverlay();
    }
})

document.addEventListener("click", e => {
    var path = e.path;
    var outside = true;
    for(let i = 0; i < path.length; i++){
        if(path[i].id == "overlay") outside = false;
    }
    if(outside) clearOverlay();
})

function clearOverlay(){
    document.getElementById("insert-overlay").innerHTML = "";
}

function queue(id) {
    increasePlay();
    var song = displayedSongs[id].fullName;
    song = JSON.stringify(song);
    socket.emit("queue", song);
}

function play(id) {
    increasePlay();
    var song = displayedSongs[id].fullName;
    song = JSON.stringify(song);
    socket.emit("play", song);
}


function increasePlay(){
    playedSongs++;
    createCookie("playedSongs", playedSongs, 10000);
    updateColor();
}

function updateColor(){
    if(playedSongs >= 100){
        document.getElementById("wrap").style.background = "#68a9ff";
    }
}

function getAlbum(album) {
    for (let i = 0; i < albums.length; i++) {
        if (albums[i].fullAlbum == album) return albums[i];
    }
    return false;
}

function update() {
    fillShelf();
}

function createCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}