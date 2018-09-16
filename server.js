//import express.js 
var express = require('express');
//assign it to variable app 
var app = express();



//server yarat, istek ve cevapları kontrol etmek için express i(app variablı ) geçir.
var serv = require('http').Server(app); //Server a herhangi bir istek gönderdiğimizde server otomatik olarak bu requesti dinleyecek bir listener oluşturur.
                                        //node.js de kod böyle require('http').Server(function(requestListener) requestlistenerı elle yazmayıp expressi geçiriyoruz. 




//__dirname ana dizini içinde tutar/gösterir.


//client directorysine get request yapıltığında statik dosyaları client folderının içine koy.
//node.js e index.html de include ettiğimiz scriptlerin yerini gösteriyoruz.
//Statik dosyaları node.js localhost:2000/client directorysine koyuyor.
//localhost:2000/client/main.js şeklinde bu dosyaya erişimimiz oluyor.

//port 2000 i dinle
serv.listen(process.env.PORT || 8080);
console.log("Server baslatildi.");


///////////////////////////////////////////////////////////////////////////////




var  playerList =[]

var Player = function (socketId,meteorId,lat,long,userData) {
	var userData = userData
	var socketId = socketId
	var meteorId = meteorId
	var lat = lat;
	var long = long

}


function onClientdisconnect (){
	console.log('someone disconnect'); 

	var removePlayer = findPlayerBySocketId(this.id); 

	if (removePlayer) {
		playerList.splice(playerList.indexOf(removePlayer), 1);

	}


	
	
	console.log("removing socket id player " + this.id);
	
	//send message to every connected client except the sender
	this.broadcast.emit('removePlayer', {socketId: this.id});


}
function updateStatusText (data,type){
console.log("emiting update status text to all players.")
io.emit('updateStatusText',data,type)


}
function onNewplayer (data) {
	var userData = data.userData;
	//Player objesi yarat.
	console.log(data)
	var newPlayer = new Player(this.id,userData.ownerId,data.lat, data.long,userData);

	newPlayer.userData = userData;
	newPlayer.socketId = this.id;
	newPlayer.meteorId = userData.ownerId; 	
	newPlayer.lat = data.lat;
	newPlayer.long = data.long;

	
	console.log(playerList)
	if(playerList.includes(newPlayer)){
return;	
	}


	console.log( newPlayer.meteorId+" Meteor id si ile yeni oyuncu yaratıldı.");

	//Yeni oyuncunun bilgileri.
	var currentInfo = {
		userData : newPlayer.userData,
		socketId : newPlayer.socketId,
		meteorId: newPlayer.meteorId,
		lat: newPlayer.lat,
		long: newPlayer.long,
	}; 

	//Yeni giriş yapan oyuncuya kimlerin oyunda oldugu bilgisini gönder.	
	for (i = 0; i < playerList.length; i++) {
		var existingPlayer = playerList[i];
		var playerInfo = {
			userData : existingPlayer.userData,
			socketId: existingPlayer.socketId,
			meteorId:existingPlayer.meteorId,
			lat: existingPlayer.lat,
			long: existingPlayer.long, 
		};
		//send message to the sender-client only
		console.log("sending message to client.")
		this.emit("newRemotePlayer", playerInfo);
	}

//Yeni oyuncunun bilgilerini bağlanan yeni oyuncu dışında herkese gönderelim.

if(!playerList.includes(newPlayer)){
	playerList.push(newPlayer);//yaratılan player objesini tüm playerları tuttuğumuz array e ekle. 

}
this.broadcast.emit('newRemotePlayer', currentInfo);
io.emit('updateStatusText',currentInfo.userData,1)



}

function onPlayerMove(data,meteorId){

	console.log("Locationu degisen gonderen meteorId "+meteorId)
	var movePlayer = findPlayerByMeteorId(meteorId); 

	if (!movePlayer) {
		return;
		console.log('Oyuncu yok.'); 
	}
	var movePlayerData = {
		socketId :movePlayer.socketId,
		meteorId: movePlayer.meteorId, 
		lat: data.coords.latitude,
		long: data.coords.longitude,
	}

	this.emit('playerMoved', movePlayerData);

	this.broadcast.emit('remotePlayerMoved', movePlayerData);


}

function findPlayerByMeteorId(meteorId) {

	for (var i = 0; i < playerList.length; i++) {

		if (playerList[i].meteorId == meteorId) {
			return playerList[i]; 
		}
	}
	
	return false; 
}
function findPlayerBySocketId(socketId) {

	for (var i = 0; i < playerList.length; i++) {

		if (playerList[i].socketId == socketId) {
			return playerList[i]; 
		}
	}
	
	return false; 
}
//Yarattığımız server objesini socket.io ile bağlar.
var io = require('socket.io')(serv,{'pingTimeout': 6000000});

//herhangi bir clienttan gelecek bağlantı isteklerini dinle.
io.sockets.on('connection', function(socket){
	
	console.log("socket connected"); 
	//Soketin unique(eşsiz) idsini yazdır.(server a bağlanan client socket idlerini yazdırır)
	console.log(socket.id); 
	
	  socket.on('newPlayer', onNewplayer)
	  socket.on('movement', onPlayerMove)

	  socket.on('disconnect', onClientdisconnect); 
	  socket.on('updateStatusText', updateStatusText); 


});