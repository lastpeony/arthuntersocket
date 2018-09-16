
var socket; // global bir socket değişkeni.
var player;
                              
//Oyunun ekrana oturması için boyutları ayarlıyoruz.Browserla ilgili.
var canvas_width = window.innerWidth * window.devicePixelRatio ;
var canvas_height = window.innerHeight * window.devicePixelRatio;

//Oyunumuzu belirlediğimiz divin içinde yaratıyoruz.
 var  game = new Phaser.Game(canvas_width,canvas_height,Phaser.AUTO,'gameDiv',{ preload: preload, create: create, update: update });

 var gameProperties = { 
     
	gameWidth: 4000,
	gameHeight: 4000,
	game_elemnt: "gameDiv",
	in_game: false,
};



function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.world.setBounds(0, 0, gameProperties.gameWidth, 
    gameProperties.gameHeight);
    //Fizik için P2JS kullanıcaz.
    game.physics.startSystem(Phaser.Physics.P2JS);
    //fizik dünyasının sınırlarını yaratır.(duvarlar)
    game.physics.p2.setBoundsToWorld(false, false, false, false, false)//son parametre collisiongroupla ilgili.
    //Y nin yerçekimini 0 a eşitle böylece yere düşmeyecek.
    game.physics.p2.gravity.y = 0;
    // Yerçekimini tamamen kapat.
    game.physics.p2.applyGravity = false; 
    game.physics.p2.enableBody(game.physics.p2.walls, false); 
    // Collision(çarpma) detectionu aç.
    game.physics.p2.setImpactEvents(true);


}

function create() {
    game.stage.backgroundColor = 0xB1A195;;

// oyun yaratıldığında çağrılır.
    console.log("Client yaratıldı.")
    socket = io.connect();// server a bağlantı isteği gönderir.
                       //Server bağlantı isteğini dinler ve clientlara başarılı olursa geri "connect" mesajını gönderir.
                       socket.on("connect",onSocketConnected);//serverdan connect mesajı gelince onSocketConnected fonksiyonunu çalıştır.
}

function update() {

	if (gameProperties.in_game) {
		
		//Kullanıcının mouse pozisyonunu tutmak için.
        var pointer = game.input.mousePointer;


        //disntaceToPointer sayesinde player objesi ve mouse arasındaki uzaklığı ölçüyoruz.
        if (distanceToPointer(player, pointer) <= 50) {



			//movetoPointer parametreleri: displayObject, speed, pointer, maxTime
             
            //Player mouse pointerına belli bir hızda ilerleyebilir.
            movetoPointer(player, 0, pointer, 1000);
        } else {
            movetoPointer(player, 500, pointer);
        }	
        socket.emit('move_player', {x: player.x, y: player.y, angle: player.angle});

    }
    
}

function createPlayer () {
	//phaser ı kullanarak ekrana daire çiz.
	  player = game.add.graphics(0, 0);//grafik objesini kullanarak ilkel şekiller çizebiliriz.(diktörtgen daire gibi)
	player.radius = 50;

	// Şeklin özelliklerini belirleyelim.
	player.beginFill(0xffd900);
	player.lineStyle(2, 0xffd900, 1); //draw circle methodu için.
	player.drawCircle(0, 0, player.radius * 2);
	player.endFill();
	player.anchor.setTo(0.5,0.5);
	player.body_size = player.radius; 

	// şeklimizi oyuna ekleyelim.fizikleri açalım
	game.physics.p2.enableBody(player, true); 

	player.body.addCircle(player.body_size, 0 , 0); 
}



function onSocketConnected(){
console.log("Sunucuya bağlanıldı.")
gameProperties.in_game = true;
//Playerı yarat.
createPlayer();
//Server a new_player mesajını gönder ki server yeni bir oyuncu yaratıldığını bilsin.
socket.emit('new_player', {x: 0, y: 0, angle: 0});



};

