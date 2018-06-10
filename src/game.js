var game = function() {

  var Q = (window.Q = Quintus({ development: true, audioSupported: [ 'mp3','ogg' ] })
    .include("Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D, Audio")
    .setup({
      width: 320,
      height: 320 // 480
    })
    .controls() 
    .touch()
    .enableSound());

 

  
  
  Q.Sprite.extend("Simon", {
    init: function(p) { 
      this._super(p, {
      	sprite: "simon",
        sheet: "simon",
        frame: 4,
        x: 650,
        y: 380,
        vx:0,
        vy:0, 
		puntos:0,
        direction: 'rigth',
        jumpSpeed: -350,
        dead: false,
		golpeado:false,
		timeHit:0,
		inmortalidad:0.5,
        win: false,
		lat:"right",
		damage:3,
		latigo:false,
		hp:10,
		inte:3,
		//gravity:0.2,
		timer: 10,
		limit:0,
		cooldown: 0.75,
		bossTime:false
		
	  });
		
		
		
		this.p.hp=Q.state.get("lives");
		this.p.inte=Q.state.get("intentos");
		Q.input.on("fire",this,"shoot");
		this.add("2d, platformerControls, animation, tween");
	
		this.on('simon.win',this,'win');
		//this.on('simon.die',this,'die');
		//this.on('simon.hit',this,'hit');
		this.on('simon.jump',this,'jump');
		this.on('simon.destroy',this,'destroy');
		this.on("latigo.left",this,'latigoGolpeo');
		this.on("latigo.right",this,'latigoGolpeo');
		this.on("latigo.fin",this,'latigoFin');

    },
    step: function(dt) {
		this.p.limit+=dt;
		if(this.p.limit>=1){
			this.p.limit=0;
			Q.state.inc("time",-1);
		}
		
		
		this.p.timer += dt;
		this.p.timeHit+=dt;
		if(this.p.timeHit>= this.p.inmortalidad){
			this.p.golpeado=false;
			this.animate({ opacity: 1});
		}
		
    	if(this.p.y>600){
    		
			this.die();
    		
			
    	}
    	if(this.p.vx>0){    		
    		this.p.direction = 'right';
    	}else if(this.p.vx<0){
    		this.p.direction = 'left';
    	}

    	if(!this.p.dead && !this.p.win && !this.p.latigo){
    		if(this.p.vx==0 && this.p.vy==0 && !this.p.ignoreControls){
    			this.play('stay_'+this.p.direction);
    		} else if(this.p.landed > 0 && !this.p.ignoreControls) {
    			
					this.p.speed = 100;
					this.play("walk_" + this.p.direction);
				
			} else if((this.p.landed < 0 && !this.p.ignoreControls) || this.p.jump) {
				
				//Q.audio.play('jump_small', {loop:false});
				this.play("jump_" + this.p.direction);
				this.p.jump=false;				
			}
			if(Q.inputs['action'] && !this.p.latigo) {
					
					this.p.sheet = "Latigo";
					this.p.latigo=true;
					this.del('2d');
					this.p.lat=this.p.direction;
					this.play("latigo_" + this.p.direction);
					
			}


    	}
		
		if(!this.p.bossTime && Q.state.get("nivel")=="level1D" && this.p.x>= 620){ // si estamos en la sala del jefe y cruzamos cierto punto la camara se deja de seguirnos y nos limita la huida
			this.p.bossTime=true;
			Q.stage(0).add("viewport").follow(this,{ x: false, y: false });
			Q.stage(0).insert(new Q.Daga({ x:460, y: 340,dir:"left",vx:0,vy:0})); // si algun enemigo se intenta colar en la zona del jefe morira con la daga
			Q.state.set("boss",true);
			Q.audio.stop();
			Q.audio.play('boss', { loop: true });
		}else if(!this.p.bossTime && Q.state.get("nivel")=="level2E" && this.p.x<= 150){
			this.p.bossTime=true;
			Q.stage(0).add("viewport").follow(this,{ x: false, y: false });
			Q.state.set("boss",true);
			Q.audio.stop();
			Q.audio.play('boss', { loop: true });
		}else if(this.p.bossTime){
			this.limitesBoss(); // pone los mities para no huir de la sala del boss
		}
		
	    
    },
	
	limitesBoss: function(){ // si estamos en la estancia del boss limitamos que el personaje pueda moverse a partir de cierta posicion para que no huya del boss
		if(Q.state.get("nivel")=="level1D" && this.p.x<=480){
			
			this.p.vx=0;
			this.p.x=481;
		}else if(Q.state.get("nivel")=="level2E" && this.p.x>=216){
			
			this.p.vx=0;
			this.p.x=215;
		}
		
	},
	
	latigoGolpeo: function(){ // hace aparecer el latigo
		Q.audio.play('latigo');
		if(this.p.lat=="left"){
			Q.stage(0).insert(new Q.Latigazo({ x: (this.p.x - this.p.w - 12), y: (this.p.y-5),dir:"left"}));
		}else if(this.p.lat=="right"){
			Q.stage(0).insert(new Q.Latigazo({ x: (this.p.x + this.p.w + 12), y: (this.p.y-5),dir:"right"}));
			
		}
		
		
		this.latigoFin();
		
	},
	latigoFin: function(){
		
		this.add('2d');
		this.p.sheet='simon';
		this.p.latigo=false;
		this.p.vy=0;
	},
	
	hit: function(damage){
		
		if(!this.p.golpeado && !this.p.latigo){
			Q.audio.play('golpe');
			this.p.timeHit=0;
			this.p.golpeado=true;
			this.p.hp = this.p.hp-damage;
			
			if(this.p.hp<=0){
				
				 // si con ese golpe ya ha muerto pongo la barra de vida como acabada
				for(i=0;i<Q.state.get("lives");i++){
					
					
				    	Q.state.get("hearts")[i].p.sheet = "coraçao2"
				    		
				    
					
				}
				Q.state.set("lives",0);
				
				this.die();
				
			}else{
				var i;
				for(i=Q.state.get("lives")-1;i>=this.p.hp;i--){
					
					if(Q.state.get("hearts")[i].p.sheet == "coraçao1"){
				    	Q.state.get("hearts")[i].p.sheet = "coraçao2"
				    		
				    }
					
				}

				Q.state.set("lives",this.p.hp);
				this.animate({ opacity: 0.5},this.p.inmortalidad);
			}
				
				
			
		}
	
	},
    win: function(){
		Q.stageScene("endGame",1, { label: "You Win!" });
    },
    die: function(){
    	this.p.dead=true;
    	
		Q.stage(0).insert(new Q.Fuego({ x: (this.p.x), y: (this.p.y-10)}));
		this.destroy();
		
    	if(this.p.inte>1){
			
			this.p.inte=this.p.inte-1;
			Q.state.set("intentos",this.p.inte);
			Q.audio.play('muerte');
			Q.state.set("lives",16);
			var i;
			for(i=0;i<Q.state.get("lives");i++){
					
					if(Q.state.get("hearts")[i].p.sheet == "coraçao2"){
				    	Q.state.get("hearts")[i].p.sheet = "coraçao1"
				    		
				    }
					
			}
			Q.audio.stop();
			
			if(Q.state.get('fase')==1){
				Q.audio.play("castlevania");
			}else{
				Q.audio.play("castlevania2");
			}
			Q.state.set("boss",false);
			Q.state.set("puntos",0);
			Q.state.set("livesBoss",16);
			Q.state.set("time",300);
			Q.stageScene(Q.state.get("nivel"));
		}else{
			Q.clearStages();
			
			Q.stageScene("initialMenu");
		}
		
		
    },
	
    shoot: function(){
		
		if (this.p.timer > this.p.cooldown) {
	    		
				Q.audio.play('disparo');
		    	if(this.p.direction == "right") {
		    		
					
		    		//Q.stage(0).insert(new Q.Hacha({ x: (this.p.x + this.p.w + 1), y: (this.p.y), vx : 100}));
					Q.stage(0).insert(new Q.HachaParabola({ x: (this.p.x + this.p.w + 1), y: (this.p.y), vx : 100}));
					//Q.stage(0).insert(new Q.Boomerang({ x: (this.p.x + this.p.w + 1), y: (this.p.y), vx : 100}));
					//Q.stage(0).insert(new Q.Daga({ x: (this.p.x + this.p.w + 1), y: (this.p.y), vx : 200}));
					//Q.stage(0).insert(new Q.Medusita({ x: (this.p.x + this.p.w + 1), y: (this.p.y-20), vx : 100}));
		    		
		    	}
		    	else if(this.p.direction == "left") {
					
		    	 	
		    	 	//Q.stage(0).insert(new Q.Hacha({ x: (this.p.x - this.p.w - 1), y: (this.p.y), vx : -100}));
					Q.stage(0).insert(new Q.HachaParabola({ x: (this.p.x - this.p.w - 1), y: (this.p.y), vx : -100}));
					//Q.stage(0).insert(new Q.Boomerang({ x: (this.p.x - this.p.w - 1), y: (this.p.y), vx : -100}));
					//Q.stage(0).insert(new Q.Daga({ x: (this.p.x - this.p.w - 1), y: (this.p.y), vx : -200}));
					 //Q.stage(0).insert(new Q.Medusita({ x: (this.p.x - this.p.w - 1), y: (this.p.y-20), vx : -100}));
		    	 	
		    	}
				this.p.timer=0;
		}
    },
    jump: function(){
    	
		this.p.jump = true;
    }
  });
  
  
  
  
  
Q.MovingSprite.extend('Enemy',{
	init: function(p, defaults){
		this._super(p, defaults);
		this.add('2d, animation, aiBounce');
		
		
		
		this.on("hit",function(collision) {  

				if(collision.obj.isA("Simon")){ // si da al jugador o llega al maximo de golpes que puede dar se elimina
					collision.obj.hit(this.p.damage);
					
				}	
		});
		

		this.on('destroy',this,'destroy');
		
	},
	step: function(dt){
		
		this.p.timeHit+=dt;
		if(this.p.timeHit>= this.p.inmortalidad){
			this.p.golpeado=false;
		}

		this._super(dt);
	},
	hit: function(damage){
		
		if(!this.p.golpeado){
			
			Q.audio.play('hitEnemy');
			this.p.timeHit=0;
			this.p.golpeado=true;
			this.p.hp = this.p.hp-damage;
			if(this.p.hp<=0){
				this.die();
			}
		}
	
	},
	die: function(){
		if(this.p.hp<=0){
			// aqui hace aparecer un objeto aleatorio y la llama de muerte
			Q.state.inc("puntos",this.p.puntos);
			Q.stage(0).insert(new Q.Fuego({ x: (this.p.x), y: (this.p.y-10)}));
			this.dejarObjeto();
			
			this.destroy();
		}
		
	},
	dejarObjeto: function(){ // suelta vida , totem,trofeo,saco o baul respectivamente: 50%,25%,20%,5%
		var num=Math.floor(Math.random() * 100);

			if(num>=0 && num<=19){
				Q.stage(0).insert(new Q.Totem({ x: (this.p.x), y: (this.p.y+1)})); 
			}else if(num>=20 && num <=49){
				Q.stage(0).insert(new Q.Totem({ x: (this.p.x), y: (this.p.y+1)}));
			}else if(num>=50 && num <=74){
				Q.stage(0).insert(new Q.Trofeo({ x: (this.p.x), y: (this.p.y+1)}));
			}else if(num>=75 && num <=94){
				Q.stage(0).insert(new Q.Saco({ x: (this.p.x), y: (this.p.y+1)}));
			}else{
				Q.stage(0).insert(new Q.Baul({ x: (this.p.x), y: (this.p.y+1)}));
			}
			
				
		
	}
		
	
});

	//////////////////////// ENEMIGOS //////////////////////////7//////////////////////////////////////////////////////
	
	///////////////// ZOMBIE /////////////////////
	Q.Enemy.extend("Zombie", {
    init: function(p) {
		this._super(p, {
			sheet:"zombie", 
			sprite: "zombie", 
			frame: 0,
			x: 650,
        	y: 380,
        	type: Q.SPRITE_ENEMY,
			dead: false,
			golpeado:false,
			timeHit:0,
			inmortalidad:0.5,
			hp:1,
			puntos:100,
			damage:2
		});
		this.p.vx=-20;
    },
    step: function(dt) { 
    	this._super(dt);
	  	//Animations
	  	if(this.p.vx < 0) {
	  		this.play("walk_left");
	  	} else if(this.p.vx > 0){
	  		this.play("walk_right");
	  	}
    }
	
});
	///////////////// MURCIELAGO /////////////////////
	Q.Enemy.extend("Bat", {
    init: function(p) {
		this._super(p, {
			sheet:"bat", 
			sprite: "bat", 
			frame: 0,
			x: 650,
        	y: 380,
        	type: Q.SPRITE_ENEMY,
			dead: false,
			golpeado:false,
			timeHit:0,
			gravity:0,
			puntos:200,
			inmortalidad:0.5,
			hp:1,
			damage:2
		});
		this.p.vx=-40;
    },
    step: function(dt) { 
    	this._super(dt);
	  	//Animations
	  	if(this.p.vx < 0) {
	  		this.play("fly_left");
	  	} else if(this.p.vx > 0){
	  		this.play("fly_right");
	  	}
    }
	});
	///////////////// PERRO /////////////////////
	Q.Enemy.extend("Dog", {
    init: function(p) {
		this._super(p, {
			sheet:"dog", 
			sprite: "dog", 
			frame: 3,
			x: 650,
        	y: 380,
        	type: Q.SPRITE_ENEMY,
			dead: false,
			golpeado:false,
			gravity:0.2,
			timer:0,
			direction:0,
			timeHit:0,
			puntos:200,
			inmortalidad:0.5,
			hp:1,
			damage:2
		});
		this.p.vx=-40;
    },
    step: function(dt) { 
    	this._super(dt);
	  	
		this.p.timer = this.p.timer + dt;
		if(this.p.timer>2){
			if(this.p.direction==0){
				this.play("jump_left", 1);
				this.jump();
			}else if(this.p.direction==1){
				this.play("jump_right", 1);
				this.jump();
			}
			this.p.timer = 0;
		}else if(this.p.vy==0){
			if(this.p.vx < 0) {
				this.p.direction=0;
				this.play("run_left");
			} else if(this.p.vx > 0){
				this.p.direction=1;
				this.play("run_right");
			}
		}	
		
			
		
    },
	jump: function(){
		this.p.vy=-100;
			
	}
	
	});
	////////////////////// ENANO ////////////////////
	Q.Enemy.extend("Enano", {
    init: function(p) {
		this._super(p, {
			sheet: "enano",
			sprite: 'enano',
			x: 600,
    		y: 200,
			ax: 0,
			ay:0.2,
			timer:0,
			direction:0,
			type: Q.SPRITE_ENEMY,
			gravity:0.2,
			golpeado:false,
			timeHit:0,
			puntos:500,
			inmortalidad:0.5,
			hp:1,
			damage:3
		});
		

		this.on("enano.jump", this, "jump");
	},

	step: function(dt) {
		this._super(dt);
		//when step into the floor, stop the X movement
		this.p.timer = this.p.timer + dt;
		if (this.p.timer > 3) {
			
			if(this.p.direction==0){
				this.play("jump_left", 1);
				this.jump();
			}else if(this.p.direction==1){
				this.play("jump_right", 1);
				this.jump();
			}
			this.p.timer = 0;
	  	}else if(this.p.vy == 0 && this.p.timer <=5){
			if(this.p.vx<0){
				this.p.direction=0;
				this.play("stay_left");
			}else if( this.p.vx>0){
				this.p.direction=1;
				this.play("stay_right");
			}	
			this.p.vx = 0;
			
		}
	},

	jump: function() {
		this.p.vy = -(Math.floor(Math.random() * (150)) + 50);
		this.p.vx = (Math.random()*100) -50;
		if(this.p.vx<0){
			this.play("stay_left");
		}else if( this.p.vx>0){
			this.play("stay_right");
		}	
	}

});
	////////////////// LANCERO //////////////////////
	Q.Enemy.extend("Lancero", {
    init: function(p) {
		this._super(p, {
			sheet:"lancero", 
			sprite: "lancero", 
			frame: 0,
			x: 650,
        	y: 380,
        	type: Q.SPRITE_ENEMY,
			dead: false,
			golpeado:false,
			timeHit:0,
			inmortalidad:0.5,
			puntos:400,
			hp:2,
			damage:2
		});
		this.p.vx=-20;
    },
    step: function(dt) { 
    	this._super(dt);
	  	//Animations
	  	if(this.p.vx < 0) {
	  		this.play("walk_left");
	  	} else if(this.p.vx > 0){
	  		this.play("walk_right");
	  	}
    }
	});
	////////////////////////////// Enemigo que dispara ////////////////////
	Q.component("shooterEnemy", {
		added:function(){
			
		},

		extend: {
			step: function(dt) { 
				
				//Animations
				this.p.timer += dt;
				if (this.p.timer > this.p.cooldown ) {
					this.shoot();
					this.p.timer = 0;	
					
				}
				this.p.timerDirection+=dt;
				if(this.p.timerDirection>this.p.change){
					this.p.vx=this.p.vx*(-1);
					this.p.timerDirection=0;
				}
				
				if(this.p.vx < 0 ) {
					this.play("walk_left");
				} else if(this.p.vx > 0){
					this.play("walk_right");
				}
			}
		}
	});
	
	//////////////// HACHERO/////////////////////
	
	Q.Enemy.extend("Hachero", {
    init: function(p) {
		this._super(p, {
			sheet:"hachero", 
			sprite: "hachero", 
			frame: 0,
			x: 650,
        	y: 380,
        	type: Q.SPRITE_ENEMY,
			dead: false,
			golpeado:false,
			timeHit:0,
			inmortalidad:0.5,
			timer:0,
			timerDirection:0,
			change:4,
			puntos:500,
			cooldown:2,
			disparo:false,
			hp:3,
			damage:4
		});
		this.add('shooterEnemy');
		this.p.vx=-7;
    },
    step: function(dt) { 
    	this._super(dt);
	  	
	  	
    },
	
	shoot: function(){
		if(this.p.vx<0){
			Q.stage(0).insert(new Q.HachaEnemiga({ x: (this.p.x - this.p.w - 1), y: (this.p.y-2), vx : -50}));
		}else{
			Q.stage(0).insert(new Q.HachaEnemiga({ x: (this.p.x + this.p.w + 1), y: (this.p.y-2), vx : 50}));
		}	
		
	}
	});
	
	
	////////////// PEZ /////////////////
	
	Q.Enemy.extend("Pez", {
    init: function(p) {
		this._super(p, {
			sheet:"pez", 
			sprite: "pez", 
			frame: 0,
			x: 650,
        	y: 380,
        	type: Q.SPRITE_ENEMY,
			dead: false,
			golpeado:false,
			timeHit:0,
			inmortalidad:0.5,
			timer:0,
			cooldown:2,
			timerDirection:0,
			change:4,
			puntos:300,
			hp:1,
			damage:2
		});
		this.p.vx=-10;
		this.add('shooterEnemy');
    },
   step: function(dt) { 
    	this._super(dt);
	  	
	  	
    },
	
	shoot: function(){
		if(this.p.vx<0){
			Q.stage(0).insert(new Q.Bola({ x: (this.p.x - this.p.w - 1), y: (this.p.y), vx : -100}));
		}else{
			
			Q.stage(0).insert(new Q.Bola({ x: (this.p.x + this.p.w + 1), y: (this.p.y), vx : 100}));
		}	
		
	}
	
	
	
	
	});

	//////////// SNAKE MEDUSA //////////////
	
	Q.Enemy.extend("SnakeMedusa", {
    init: function(p) {
		this._super(p, {
			sheet:"snakeMedusa", 
			sprite: "snakeMedusa", 
			frame: 0,
			x: 650,
        	y: 380,
        	type: Q.SPRITE_ENEMY,
			dead: false,
			golpeado:false,
			timeHit:0,
			timer:0,
			timeDead:4,
			inmortalidad:0.5,
			puntos:50,
			hp:1,
			damage:2
		});
		this.p.vx=-20;
    },
    step: function(dt) { 
    	this._super(dt);
	  	//Animations
		this.p.timer+=dt;
		if(this.p.timer>=this.p.timeDead){
			this.destroy();
		}else{
			
			if(this.p.vx < 0) {
				this.play("walk_left");
			} else if(this.p.vx > 0){
				this.play("walk_right");
			}
			
		}
    }
	
});
	
	
	//////////// SNAKE MOMIA ///////////////
	
	Q.Enemy.extend("SnakeMomia", {
    init: function(p) {
		this._super(p, {
			sheet:"snakeMomia", 
			sprite: "snakeMomia", 
			frame: 0,
			x: 650,
        	y: 380,
        	type: Q.SPRITE_ENEMY,
			dead: false,
			golpeado:false,
			timeHit:0,
			timer:0,
			timeDead:4,
			inmortalidad:0.5,
			puntos:50,
			hp:1,
			damage:2
		});
		this.p.vx=-20;
    },
    step: function(dt) { 
    	this._super(dt);
	  	
		this.p.timer+=dt;
		if(this.p.timer>=this.p.timeDead){
			this.destroy();
		}else{
			
			if(this.p.vx < 0) {
				this.play("walk_left");
			} else if(this.p.vx > 0){
				this.play("walk_right");
			}
			
		}
    }
	
});
	
	
	///////////// MEDUSITA ///////////////////
	Q.Sprite.extend("Medusita", {
		init: function(p) {
			this._super(p, {
				sheet: "medusita",
				sprite: "medusita",
				damage: 1,
				gravity : 0,	
				periodo: 30,
				boss:true,
				amplitud:50,
				espaciado:100,
				counter:0,
				damage:2,
				timerLife:0,
				maxLife:7,
				puntos:300,
				dx:0
			});	
			
			
			
			this.p.dx=Math.PI * 2 / 100;
			this.add('animation');
			
			this.on("hit",function(collision){
				
				if(collision.obj.isA("Simon")){
					
				 	collision.obj.hit(this.p.damage);
					this.destroy();	
				}
				
			});
			
		},

		step: function(dt) {
			this.p.x = this.p.x + this.p.vx * dt;

			this.p.y= this.p.y+Math.sin(this.p.counter)*2.5;
			this.p.counter+=this.p.dx;
			
			
			if (this.p.vx > 0) {
				this.play("fly_right");
			}
			else {
				this.play("fly_left");
			}
			
			this.p.timerLife+=dt;
			if(this.p.timerLife>this.p.maxLife){
				this.destroy();
			}
			
			
	    },
		hit: function(){
			Q.state.inc("puntos",this.p.puntos);
			this.destroy();
		}
	});
	
	///////////////////////////////////////////////////////// BOSSES /////////////////////////////////////////////////////
	
	Q.Sprite.extend("Boss1", {
    init: function(p) {
		this._super(p, {
			sheet:"superBat", 
			sprite: "superBat", 
			frame: 2,
			x: 650,
        	y: 380,
			boss:true,
			dead: false,
			golpeado:false,
			timeHit:0,
			inmortalidad:0.4,
			timer:0,
			cooldown:2,
			timerDirection:0,
			change:5,
			gravity:0,
			puntos:3000,
			hp:16,
			activo:false,
			damage:2,
			dx:0,
			counter:0
		});
		this.add('animation');
		this.p.dx=Math.PI * 2 / 100;
		
		this.ini();
		this.on("hit",function(collision) {  
				
				if(collision.obj.isA("Simon")){ // si da al jugador o llega al maximo de golpes que puede dar se elimina
					collision.obj.hit(this.p.damage);
					
				}	
		});
		
    },
	ini: function(){
		var i;
		for(i=0;i<Q.state.get("livesBoss");i++){
			Q.state.get("heartsBoss")[i].p.sheet = "coraçao1"
		}
	},
   step: function(dt) { 
		
		if(this.p.activo){
				
				this.p.timeHit+=dt;
				if(this.p.timeHit>= this.p.inmortalidad){
					this.p.golpeado=false;
				}
				
				this.p.x = this.p.x + this.p.vx * dt;
				this.p.timer += dt;
				if (this.p.timer > this.p.cooldown ) {
					
					this.shoot();
					this.p.timer = 0;	
					
				}
				this.p.timerDirection+=dt;
				if(this.p.timerDirection>this.p.change){
					this.p.vx=this.p.vx*(-1);
					if(this.p.vx==0){this.p.vx=-20;}
					this.p.timerDirection=0;
				}
				
				this.p.y= this.p.y+Math.sin(this.p.counter)*3.5;
				this.p.counter+=this.p.dx;
		}else{
			if(Q.state.get('boss')){
				this.activa();
			}
		}		
    },
	activa: function(){
		
			this.p.activo=true;	
			this.p.vx=20;
			this.play("fly");
	},
	
	hit: function(damage){
		
		if(!this.p.golpeado){
			
			this.p.timeHit=0;
			this.p.golpeado=true;
			this.p.hp = this.p.hp-damage;
			
			if(this.p.hp<=0){
				
				 // si con ese golpe ya ha muerto pongo la barra de vida como acabada
				for(i=0;i<Q.state.get("livesBoss");i++){
				    	Q.state.get("heartsBoss")[i].p.sheet = "coraçao2"
				}
				Q.state.set("livesBoss",0);
				this.die();
				
			}else{
				var i;
				for(i=Q.state.get("livesBoss")-1;i>=this.p.hp;i--){
					
					if(Q.state.get("heartsBoss")[i].p.sheet == "coraçao1"){
				    	Q.state.get("heartsBoss")[i].p.sheet = "coraçao2"
				    		
				    }
					
				}

				Q.state.set("livesBoss",this.p.hp);
				
			}
			
				
			
		}
	
	},
	die: function(){
		Q.stage(0).insert(new Q.Fuego({x:this.p.x,y:this.p.y}));
		Q.stage(0).insert(new Q.Fuego({x:this.p.x+5,y:this.p.y}));
		Q.stage(0).insert(new Q.Orbe({x:this.p.x,xPuerta:750 ,y:this.p.y, yPuerta:270 ,dir:"level2"}));
		Q.audio.stop();
		Q.audio.play('victory');
		Q.state.inc("puntos",this.p.puntos);
		this.destroy();
	},
	
	shoot: function(){ // dispara bolas de fuego
			Q.stage(0).insert(new Q.Bola({ x: (this.p.x-1 ), y: (this.p.y+5),vy:200,vx:-40}));
			Q.stage(0).insert(new Q.Bola({ x: (this.p.x-1 ), y: (this.p.y+5),vy:200,vx:0}));
			Q.stage(0).insert(new Q.Bola({ x: (this.p.x+1 ), y: (this.p.y+5),vy:200,vx:40}));
	}
	
	});
	
	////////////////////////////// BOSS MEDUSA/////////////
	Q.Sprite.extend("Boss2", {
    init: function(p) {
		this._super(p, {
			sheet:"superMedusa", 
			sprite: "superMedusa", 
			frame: 0,
			x: 650,
        	y: 380,
			boss:true,
        	//type: Q.SPRITE_ENEMY,
			dead: false,
			golpeado:false,
			timeHit:0,
			inmortalidad:0.4,
			timer:0,
			cooldown:3,
			gravity:0,
			puntos:6000,
			hp:16,
			activo:false,
			damage:2,
			dx:0,
			counter:0
		});
		this.add('2d,animation,aiBounce');
		this.p.dx=Math.PI * 2 / 100;
		this.ini();
		
		this.on("hit",function(collision) {  
				
				if(collision.obj.isA("Simon")){ // si da al jugador o llega al maximo de golpes que puede dar se elimina
					collision.obj.hit(this.p.damage);
					
				}	
		});
		
    },
	ini: function(){
		var i;
		for(i=0;i<Q.state.get("livesBoss");i++){
			Q.state.get("heartsBoss")[i].p.sheet = "coraçao1"
		}
	},
   step: function(dt) { 
		
		if(this.p.activo){
				
				
				this.p.timeHit+=dt;
				if(this.p.timeHit>= this.p.inmortalidad){
					this.p.golpeado=false;
				}
				
				this.p.x = this.p.x + this.p.vx * dt;
				this.p.timer += dt;
				if (this.p.timer > this.p.cooldown ) {
					
					this.shoot();
					this.p.timer = 0;	
					
				}

				this.p.y= this.p.y+Math.sin(this.p.counter)*3.5;
				this.p.counter+=this.p.dx;
		}else{
			if(Q.state.get('boss')){
				this.activa();
			}
		}		
    },
	activa: function(){
		
			this.p.activo=true;	
			this.p.vx=20;
			this.play("fly");
	},
	
	hit: function(damage){
		
		if(!this.p.golpeado){
			
			this.p.timeHit=0;
			this.p.golpeado=true;
			this.p.hp = this.p.hp-damage;
			
			if(this.p.hp<=0){
				
				 // si con ese golpe ya ha muerto pongo la barra de vida como acabada
				for(i=0;i<Q.state.get("livesBoss");i++){
				    	Q.state.get("heartsBoss")[i].p.sheet = "coraçao2"
				}
				Q.state.set("livesBoss",0);
				this.die();
				
			}else{
				var i;
				for(i=Q.state.get("livesBoss")-1;i>=this.p.hp;i--){
					
					if(Q.state.get("heartsBoss")[i].p.sheet == "coraçao1"){
				    	Q.state.get("heartsBoss")[i].p.sheet = "coraçao2"
				    		
				    }
					
				}

				Q.state.set("livesBoss",this.p.hp);
				
			}
			
				
			
		}
	
	},
	die: function(){
		Q.stage(0).insert(new Q.Fuego({x:this.p.x,y:this.p.y}));
		Q.stage(0).insert(new Q.Fuego({x:this.p.x+5,y:this.p.y}));
		Q.stage(0).insert(new Q.Orbe({x:this.p.x,xPuerta:20 ,y:this.p.y, yPuerta:290 ,dir:"creditos"}));
		Q.audio.stop();
		Q.audio.play('victory');
		Q.state.inc("puntos",this.p.puntos);
		this.destroy();
	},
	
	shoot: function(){ // dispara bolas de fuego
			Q.stage(0).insert(new Q.SnakeMedusa({ x: (this.p.x ), y: (this.p.y+1)}));
			
	}
	
	});
	
	
	
	/////////////////////////////////////////////////////// ATAQUES /////////////////////////////////////////////////////////
	////////// LATIGO //////////////////
	Q.Sprite.extend("Latigazo", {
		init: function(p) {
			this._super(p, {
				sheet: "vampirekiller",
				sprite: "vampirekiller",
				tipo: "arma",
				frame:0,
				dir:"right",
				type: Q.SPRITE_ALL, // chocan pero no los mata?
				timer:0,
				dead:0.1,
				damage: 10
			});	
			
			this.add('animation');
			if(this.p.dir=="left"){
				this.play("left");
			}else{
				this.play("right");
			}
			
			this.on("hit",function(collision) {
				
				if(collision.obj.tipo=="objeto") {
					
				}else if(collision.obj.p.boss || collision.obj.p.type == Q.SPRITE_ENEMY ){
					
				 	collision.obj.hit(this.p.damage);	
				}
				
				
			});
			
		},
		step: function(dt){
			this.p.timer+=dt;
			if(this.p.timer>=this.p.dead){
				this.destroy();
			}
			
		}
		

	});
	
	Q.Sprite.extend("WhipIcono", {
		init: function(p) {
			this._super(p, {
				sheet: "vampirekiller",
				sprite: "vampirekiller",
				frame:0	
			});	
		}
	});

	
	//////////  DAGA ///////////////
	Q.Sprite.extend("Daga", {
		init: function(p) {
			this._super(p, {
				sheet: "daga",
				sprite: "daga",
				tipo: "arma",
				damage: 1,
				gravity : 0		
			});	

			this.add('animation');
			
			this.on("hit",function(collision) {
				
				if(collision.obj.tipo=="objeto") {
					this.destroy();
				}else if(collision.obj.p.boss || collision.obj.p.type == Q.SPRITE_ENEMY ){
					
				 	collision.obj.hit(this.p.damage);
					this.destroy();
						
				}
				this.destroy();
				
			});
		},

		step: function(dt) {
			this.p.x = this.p.x + this.p.vx * dt;
			if (this.p.vx > 0) {
				this.play("right");
			}
			else {
				this.play("left");
			}
	    }
	});
	
	Q.Sprite.extend("DagaIcono", {
		init: function(p) {
			this._super(p, {
				sheet: "daga",
				sprite: "daga",
				frame:0	
			});	
		}
	});
	
	//////////// BOOMERANG ////////////////////////////////
	Q.Sprite.extend("Boomerang", {
		init: function(p) {
			this._super(p, {
				sheet: "hacha",
				sprite: "hacha",
				damage: 2,
				gravity : 0,
				tipo: "arma",
				inicio: 0,
				fin:0,
				distancia:100,
				volver:false,
				choques:0 // la cantidad de veces que puede golpear a enemigos 
			});	
			this.p.inicio= this.p.x;
			this.add('animation');
			
			this.on("hit",function(collision) {
				if(!collision.obj.p.golpeado){
					this.p.choques++;   
				}
				
				if(collision.obj.tipo=="objeto") {
					this.destroy();
				}else if(collision.obj.p.boss || collision.obj.p.type == Q.SPRITE_ENEMY ){
					
				 	collision.obj.hit(this.p.damage);
						
				}
				
				if(collision.obj.isA("Simon") || this.p.choques>=2 ){ // si da al jugador o llega al maximo de golpes que puede dar se elimina
					this.destroy();
				}	
			});
		},

		step: function(dt) {
			
			if(this.p.x-this.p.inicio > this.p.distancia || this.p.inicio-this.p.x > this.p.distancia){ // cuando recorre la distancia maxima da la vuelta
			    this.p.volver=true;
				//this.p.vx=0;
				this.p.fin=this.p.x;
				this.p.vx= -this.p.vx;
			}
			this.p.x = this.p.x + this.p.vx * dt;
			
			if( this.p.volver==true && ((this.p.x >=this.p.inicio && this.p.fin<this.p.inicio) || (this.p.inicio >=this.p.x && this.p.fin>this.p.inicio))){
				this.destroy(); // si llega de nuevo al punto del que fue lanzada se destruye
			}
			
			if (this.p.vx > 0) {
				this.play("right");
			}
			else {
				this.play("left");
			}
	    }
	});
	///////////// HACHA ENEMIGA ////////////////////////
	Q.Sprite.extend("HachaEnemiga", {
		init: function(p) {
			this._super(p, {
				sheet: "hacha",
				sprite: "hacha",
				damage: 4,
				gravity : 0,
				tipo: "arma",
				inicio: 0,
				fin:0,
				distancia:75,
				volver:false
			});	
			this.p.inicio= this.p.x;
			this.add('animation');
			
			this.on("hit",function(collision) {
	
				if(collision.obj.isA("Simon")){ // si da al jugador o llega al maximo de golpes que puede dar se elimina
					collision.obj.hit(this.p.damage);
					
				}
				this.destroy();				
			});
		},

		step: function(dt) {
			
			if(this.p.x-this.p.inicio > this.p.distancia || this.p.inicio-this.p.x > this.p.distancia){ // cuando recorre la distancia maxima da la vuelta
			    this.p.volver=true;
				//this.p.vx=0;
				this.p.fin=this.p.x;
				this.p.vx= -this.p.vx;
			}
			this.p.x = this.p.x + this.p.vx * dt;
			
			if( this.p.volver==true && ((this.p.x >=this.p.inicio && this.p.fin<this.p.inicio) || (this.p.inicio >=this.p.x && this.p.fin>this.p.inicio))){
				this.destroy(); // si llega de nuevo al punto del que fue lanzada se destruye
			}
			
			if (this.p.vx > 0) {
				this.play("right");
			}
			else {
				this.play("left");
			}
	    },
		hit: function(){
			this.destroy();
		}
	});
	//////////// Hacha Parabolico ////////////////////////////////
	Q.Sprite.extend("HachaParabola", {
		 init: function(p) {
		this._super(p, {
			sheet: "hacha",
			sprite: 'hacha',
			tipo: "arma",
			gravity:0.5,
			damage:3,
		});
		this.add('2d,animation');
		
		this.on("hit",function(collision) {
				
				if(collision.obj.tipo=="objeto") {
					this.destroy();
				}else if(collision.obj.p.boss || collision.obj.p.type == Q.SPRITE_ENEMY ){
					
				 	collision.obj.hit(this.p.damage);
					this.destroy();
						
				}
				this.destroy();
				
		});
			
		this.jump();
		
	},

	step: function(dt) {
		//when step into the floor, stop the X movement
	},

	jump: function() {
		this.p.vy = -(Math.floor(1 * (150)) + 50);
		
		if (this.p.vx > 0) {
			this.play("right");
		}
		else {
			this.play("left");
		}
		
	}

	});
	
	Q.Sprite.extend("HachaIcono", {
		init: function(p) {
			this._super(p, {
				sheet: "hacha",
				sprite: "hacha",
				frame:0	
			});	
		}
	});
	
	
	//////////////// bola fuego ////
	Q.Sprite.extend("Bola",{
		init: function(p) {
			this._super(p, {
				sheet: 'bola',
				sprite: 'bola',
				type: Q.SPRITE_ENEMY,
				tipo:"objeto",
				gravity:0,
				damage:2
			});	
			this.add('2d,animation');
			this.play("bola");
			this.on("hit",function(collision) {
	
				if(collision.obj.isA("Simon")){ // si da al jugador o llega al maximo de golpes que puede dar se elimina
					collision.obj.hit(this.p.damage);
					
				}
				if(!collision.obj.p.boss)this.destroy();				
			});
		
		},
		hit: function(){
			this.destroy();
		}
	});
	
	//////////////////////////////////////////  OBJETOS ////////////////////////////////////////////
	
	//////////////// generico item //////////////
	Q.Sprite.extend("Item",{
		init: function(p) {
			this._super(p, {
		    	tipo: "item",
				puntos:0
			});	
			this.add('2d,animation');
			this.on("hit",function(collision) {
				if(collision.obj.isA("Simon")) {
					collision.obj.p.puntuacion+=this.p.puntos;
					Q.audio.play('premio');
					this.destroy();
				 }
				
		    });
		
		}
	});
	//////////////// baul
	Q.Sprite.extend("Baul",{
		init: function(p) {
			this._super(p, {
				sheet: 'baul',
				sprite: 'baul',
				type: Q.SPRITE_ENEMY,
				tipo:"objeto",
				puntos:300
			});	
			this.add('2d,animation');
			this.play("brillo");
			this.on("hit",function(collision) {
				if(collision.obj.isA("Simon")) {
					
					Q.state.inc("puntos",this.p.puntos);
					Q.audio.play('premio');
					this.destroy();
				 }
				
		    });
		
		}
	});
	////////////// trofeo //////////
	Q.Sprite.extend("Trofeo",{
		init: function(p) {
			this._super(p, {
				sheet: 'trofeo',
				sprite: 'trofeo',
				type: Q.SPRITE_ENEMY,
				tipo:"objeto",
				puntos:100
			});	
			this.add('2d,animation');
			this.play("brillo");
			this.on("hit",function(collision) {
				if(collision.obj.isA("Simon")) {
					Q.state.inc("puntos",this.p.puntos);
					Q.audio.play('premio');
					this.destroy();
				 }
				
		    });
		
		}
	});
	//////////////// saco ////
	Q.Sprite.extend("Saco",{
		init: function(p) {
			this._super(p, {
				sheet: 'saco',
				sprite: 'saco',
				type: Q.SPRITE_ENEMY,
				tipo:"objeto",
				puntos:150
			});	
			this.add('2d,animation');
			this.play("brillo");
			this.on("hit",function(collision) {
				if(collision.obj.isA("Simon")) {
					Q.state.inc("puntos",this.p.puntos);
					Q.audio.play('premio');
					this.destroy();
				 }
				
		    });
		
		}
	});
	////////////////// totem ///////////
	Q.Sprite.extend("Totem",{
		init: function(p) {
			this._super(p, {
				sheet: 'totem',
				sprite: 'totem',
				type: Q.SPRITE_ENEMY,
				tipo:"objeto",
				puntos:150,
				
			});	
			this.add('2d,animation');
			this.play("brillo");
			this.on("hit",function(collision) {
				if(collision.obj.isA("Simon")) {
					Q.state.inc("puntos",this.p.puntos);
					Q.audio.play('premio');
					this.destroy();
				 }
				
		    });
		
		}
	});
	////////////////// orbe de boss ///////////
	Q.Sprite.extend("Orbe",{
		init: function(p) {
			this._super(p, {
				sheet: 'orbe',
				sprite: 'orbe',
				type: Q.SPRITE_ENEMY,
				tipo:"objeto",
				xPuerta:0,
				yPuerta:0,
				dir:"initialMenu",
				puntos:3000,
				
			});	
			this.add('2d,animation');
			this.play("brillo");
			this.on("hit",function(collision) {
				if(collision.obj.isA("Simon")) {
					Q.state.inc("puntos",this.p.puntos);
					if(Q.state.get('nivel')=='level1D'){
						Q.stage(0).insert(new Q.Puerta({x:this.p.xPuerta,y:this.p.yPuerta,direccion:this.p.dir,end:false}));
					}else{
						Q.stage(0).insert(new Q.Puerta({x:this.p.xPuerta,y:this.p.yPuerta,direccion:this.p.dir,end:true}));
					}
					this.destroy();
				 }
				
		    });
		
		}
	});
	
	
	
	
	///////////////////////////////////// EFECTOS / PARTICULAS y utilidades /////////////////////
	Q.Sprite.extend("Fuego",{
		init: function(p) {
			this._super(p, {
				sheet: "fuego",
				sprite: 'fuego',
		    	tipo: "efecto"
			});	
			this.add("animation");
			this.play("fuego");
			this.on('fuego.fin',this,'destroy');   
		
		},
		hit:function(){
			
		}
	});
	
	Q.Sprite.extend("Generador",{
		init: function(p) {
			this._super(p, {
				sprite: 'baul',
				sheet:"baul",
				timer:0,
				vxA:-1,
				intervalo:3,
				generado:"zombie"
			});	
			this.hide();
			
		},
		
		step: function(dt){
			this.p.timer+=dt;
			if(this.p.timer>=this.p.intervalo){
				this.inserta(this.p.generado);
				
				this.p.timer=0;
			}
	
		},
		inserta: function(generado){
			
			switch(generado){
				
				case "zombie": Q.stage(0).insert(new Q.Zombie({x:this.p.x,y:this.p.y,vx:(this.p.vxA*20)}));
					break;
				case "bat": Q.stage(0).insert(new Q.Bat({x:this.p.x,y:this.p.y,vx:(this.p.vxA*40)}));
					break;
				case "medusita": Q.stage(0).insert(new Q.Medusita({x:this.p.x,y:this.p.y,vx:80}));
					break;
				case "perro": Q.stage(0).insert(new Q.Dog({x:this.p.x,y:this.p.y,vx:(this.p.vxA*20)}));
					break;	
	
			}
	
		}
		 
		
	});
	
	
	
	
	Q.Sprite.extend("Puerta",{
		init: function(p) {
			this._super(p, {
				sprite: 'totem',
				sheet:"totem",
				direccion:"level1",
				i:0,
				end:false,
				waiting:1,
				activa:false
			});	
			this.hide();
			this.on("hit",function(collision) {
				if(collision.obj.isA("Simon")) {
						collision.obj.destroy();
						this.p.activa=true;		
				}
				
				
			});
		},
		step: function(dt){
			if(this.p.activa){
				this.p.i+=dt
				if(this.p.i>=this.p.waiting){
					this.travel();
				}	
			}
	
		},
		travel: function(){
				Q.clearStages();	
				Q.stageScene(this.p.direccion);
				if(!this.p.end){Q.stageScene("HUD", 2);	}
				this.destroy();
		}
		
	});
	
	
	Q.Sprite.extend("Castillo", {
		init: function(p) {
			this._super(p, {
				sheet: "castillo",
				sprite: "castillo",
				frame:14	
			});	
			this.add("animation");
			this.play("castillo");
		}
	});
	
	Q.Sprite.extend("Creditos", {
		init: function(p) {
			this._super(p, {
				sheet: "cred",
				sprite: "cred",
				frame:0	
			});	
			this.add("animation");
			this.play("cred");
		}
	});
	
	
	Q.Sprite.extend("Heart", {
		init: function(p) {
			this._super(p, {
				sheet: "coraçao1",
				sprite:"coraçao1",
				scale:1.5	
			});	
			
		}
	});
	
	Q.Sprite.extend("Balda", {
		init: function(p) {
			this._super(p, {
				sheet: "balda",
				sprite:"balda",
				gravity:0
				//scale:1.5	
			});	
			this.p.vx=-20;
			this.add('2d,aiBounce');
		}
	});
	
	
	
	
	
	// https://gamedev.stackexchange.com/questions/66129/how-to-move-an-object-up-and-down-like-a-wave

	
	//////////////////////////////////////////////////////////  NIVELES ///////////////////////////////////
  ////////// level Intro //////////
Q.scene("levelIntro", function(stage) {
	Q.audio.stop();
	Q.stageTMX("level.tmx", stage);
	
	Q.state.get('fase',1);
	Q.state.set("lives",16);
	Q.state.set("livesBoss",16);
	Q.state.set("puntos",0);
	
	Q.state.set("nivel","levelIntro");
	
	Q.state.set("xStart",175);
	Q.state.set("yStart",100);
	
	var simon = stage.insert(new Q.Simon({x:175, y: 100}));

	stage.add("viewport").follow(simon,{ x: true, y: false });
	stage.add("viewport").centerOn(175, 100);

	
	
	stage.insert(new Q.Zombie({x:600,y:170}));
	
	stage.insert(new Q.Puerta({x:720,y:170,direccion:'level1'}));
	
	Q.audio.play('castlevania', { loop: true });


});
 ////////////// NIVEL 1 A //////////////////
Q.scene("level1", function(stage) {
	
	Q.stageTMX("1level.tmx", stage);
	
	Q.state.set("nivel","level1");
	
	Q.state.set("xStart",50);
	Q.state.set("yStart",100);
	
	
	
	var simon = stage.insert(new Q.Simon({x:50, y: 100}));

	stage.add("viewport").follow(simon,{ x: true, y: false });
	stage.add("viewport").centerOn(50, 100);

	stage.insert(new Q.Zombie({x:300,y:100}));
	stage.insert(new Q.Zombie({x:320,y:100}));
	stage.insert(new Q.Zombie({x:340,y:100}));
	
	
	stage.insert(new Q.Generador({x:600,y:100,intervalo:6,generado:"zombie"}));
	
	stage.insert(new Q.Baul({x:800,y:80}));
	stage.insert(new Q.Enano({x:820,y:80}));
	stage.insert(new Q.Generador({x:1400,y:170,intervalo:9,generado:"perro"}));
	stage.insert(new Q.Puerta({x:1520,y:80,direccion:'level1B'}));
	


});
 //////////// NIVEL 1 B ////////////////////
 Q.scene("level1B", function(stage) {
	
	Q.stageTMX("1levelB.tmx", stage);
	Q.state.set("nivel","level1B");
	
	Q.state.set("xStart",40);
	Q.state.set("yStart",170);
	
	var simon = stage.insert(new Q.Simon({x:40, y: 170}));
	stage.insert(new Q.Bat({x:400,y:220}));
	stage.insert(new Q.Bat({x:50,y:330}));
	stage.add("viewport").follow(simon,{ x: true, y: false });
	stage.add("viewport").centerOn(40, 220);
	
	stage.insert(new Q.Puerta({x:55,y:355,direccion:'level1C'}));
});
 
 //////////// NIVEL 1 C ////////////////////
 Q.scene("level1C", function(stage) {
	
	Q.stageTMX("1levelC.tmx", stage);
	Q.state.set("nivel","level1C");
	
	Q.state.set("xStart",100);
	Q.state.set("yStart",170);
	
	var simon = stage.insert(new Q.Simon({x:100, y: 170}));
    stage.insert(new Q.Pez({x:100, y: 240}));
	stage.insert(new Q.Pez({x:170, y: 240}));
	stage.insert(new Q.Pez({x:400, y: 240}));
	stage.insert(new Q.Pez({x:470, y: 240}));
	stage.add("viewport").follow(simon,{ x: true, y: false });
	stage.add("viewport").centerOn(40, 220);
	
	stage.insert(new Q.Puerta({x:390,y:180,direccion:'level1D'}));
});

//////////// NIVEL 1 D ////////////////////
 Q.scene("level1D", function(stage) {
	
	Q.stageTMX("1levelD.tmx", stage);
	Q.state.set("nivel","level1D");

	Q.state.set("livesBoss",16);
	
	
	
	
	Q.state.set("xStart",60);
	Q.state.set("yStart",240);
	
	var simon = stage.insert(new Q.Simon({x:60, y: 240}));
	 
	  stage.insert(new Q.Zombie({x:230, y: 280}));
	  stage.insert(new Q.Zombie({x:230, y: 300}));
	  stage.insert(new Q.Zombie({x:270, y: 300}));
	  stage.insert(new Q.Zombie({x:500, y: 300}));
		
	 stage.insert(new Q.Boss1({x:580,y:220}));
	stage.add("viewport").follow(simon,{ x: true, y: false });
	stage.add("viewport").centerOn(100, 220);
	
	
});
////////////// NIVEL 2 /////////////////
Q.scene("level2", function(stage) {
	Q.audio.stop();
	Q.audio.play('castlevania2');
	Q.stageTMX("2level.tmx", stage);
	Q.state.set("nivel","level2");
	Q.state.get('fase',2);
	Q.state.set("lives",16);
	Q.state.set("livesBoss",16);
	Q.state.set("puntos",0);
	Q.state.set("time",300);
	Q.state.set("intentos",3);
	
	Q.state.set("xStart",50);
	Q.state.set("yStart",320);
	
	var simon = stage.insert(new Q.Simon({x:50, y: 320}));
	 
	 
	
	stage.insert(new Q.Bat({x:170,y:330}));
	stage.insert(new Q.Lancero({x:60,y:240}));
	stage.insert(new Q.Bat({x:60,y:220}));
	stage.add("viewport").centerOn(120, 240);
	
	stage.insert(new Q.Puerta({x:130,y:200,direccion:'level2B'}));
	
});
 ////////////// NIVEL 2B /////////////////
 Q.scene("level2B", function(stage) {
	
	Q.stageTMX("2levelB.tmx", stage);
	Q.state.set("nivel","level2B");
	
	Q.state.set("xStart",420);
	Q.state.set("yStart",300);
	
	var simon = stage.insert(new Q.Simon({x:420, y: 300}));
	
	stage.insert(new Q.Lancero({x:345,y:240}));
	stage.insert(new Q.Hachero({x:440,y:240,cooldown:4}));
	stage.insert(new Q.Balda({x:120,y:270}));
	
	stage.add("viewport").follow(simon,{ x: true, y: false });
	stage.add("viewport").centerOn(350, 220);
	
	stage.insert(new Q.Puerta({x:20,y:240,direccion:'level2C'}));
});

////////////// NIVEL 2C /////////////////
 Q.scene("level2C", function(stage) {
	
	Q.stageTMX("2levelC.tmx", stage);
	Q.state.set("nivel","level2C");
	
	Q.state.set("xStart",730);
	Q.state.set("yStart",240);
	
	var simon = stage.insert(new Q.Simon({x:730, y: 240,frame:3}));
	
	stage.insert(new Q.Generador({x:310,y:240,intervalo:2,generado:"medusita",vxA:1}));
	
	stage.add("viewport").follow(simon,{ x: true, y: false });
	stage.add("viewport").centerOn(350, 220);
	
	stage.insert(new Q.Puerta({x:80,y:210,direccion:'level2D'}));
});
 
 ////////////// NIVEL 2D /////////////////
 Q.scene("level2D", function(stage) {
	
	Q.stageTMX("2levelD.tmx", stage);
	Q.state.set("nivel","level2D");
	
	Q.state.set("xStart",30);
	Q.state.set("yStart",270);
	
	var simon = stage.insert(new Q.Simon({x:60, y: 320}));
	
	stage.insert(new Q.Balda({x:300,y:260}));
	stage.insert(new Q.Balda({x:400,y:260}));
	
	stage.insert(new Q.Hachero({x:200,y:230}));
	
	stage.insert(new Q.Lancero({x:700,y:230}));
	stage.insert(new Q.Baul({x:720,y:230}));
	
	stage.insert(new Q.Medusita({x:500,y:300,vx:-85}));
	stage.insert(new Q.Medusita({x:600,y:300,vx:-80}));
	
	stage.add("viewport").follow(simon,{ x: true, y: false });
	stage.add("viewport").centerOn(250, 240);
	
	stage.insert(new Q.Puerta({x:20,y:260,direccion:'level2E'}));
});
 
 ////////////// NIVEL 2E /////////////////
 Q.scene("level2E", function(stage) {
	
	Q.stageTMX("2levelF.tmx", stage);
	Q.state.set("nivel","level2E");
	
	Q.state.set("livesBoss",16);
	Q.state.set("boss",false);
	Q.state.set("xStart",750);
	Q.state.set("yStart",240);
	
	var simon = stage.insert(new Q.Simon({x:750, y: 240}));
	
	stage.insert(new Q.Medusita({x:100,y:260,vx:85}));
	stage.insert(new Q.Medusita({x:250,y:260,vx:80}));
	stage.insert(new Q.Medusita({x:350,y:260,vx:85}));
	stage.insert(new Q.Medusita({x:450,y:260,vx:85}));
	
	stage.insert(new Q.Boss2({x:110,y:230}));
	
	
	stage.add("viewport").follow(simon,{ x: true, y: false });
	stage.add("viewport").centerOn(250, 240);

});
 
 
 
 


///////////////////////////////////   HUD /////////////////////////////////////////
Q.scene("HUD",function(stage) {
	
	var container = stage.insert(new Q.UI.Container({
        x: 0, y: 0, fill: "black",w: 700, h: 120
		
    }));
	
	Q.UI.Text.extend("Puntos",{ 
        init: function(p) {
            this._super({
                label: "SCORE-000000",
                color: "white",
                x: Q.width * 0.20 ,
                y: 0,
				family: "ARCADECLASSIC",
				size:"18"
            });
			this.puntos(Q.state.get("puntos"));
            Q.state.on("change.puntos",this,"puntos");
        },

        puntos: function(puntos) {
            this.p.label = "SCORE-000" + puntos;
        }
	});
	
	//  Vidas
	Q.UI.Text.extend("Vidas",{ 
        init: function(p) {
            this._super({
                label: "PLAYER",
                color: "white",
                x: Q.width * 0.115,
                y: 15,
				family: "ARCADECLASSIC",
				size:"18"
            });
        }
	});
	
	var corazones = [];
	
	for(i=0;i<16;i++){
		if(Q.state.get("lives")>i){
			corazones[i] = container.insert(new Q.Heart({x: (Q.width * 0.24+6*i),y:27}));
		}else{
			corazones[i] = container.insert(new Q.Heart({x: (Q.width * 0.24+6*i),y:27,sheet:"coraçao2"}));
		}	
	}
		
	
	Q.state.set({hearts :corazones});
	
	
	
	
	
	// contador tiempo restante
	Q.UI.Text.extend("Tiempo",{ 
        init: function(p) {
            this._super({
                label: "TIME ",
                color: "white",
                x: Q.width * 0.6,
                y: 0,
				family: "ARCADECLASSIC",
				size:"18"
            });
			this.time(Q.state.get("time"));
            Q.state.on("change.time",this,"time");
			
        },

        time: function(time) {
            this.p.label = "TIME  " + time;
        }
	});
	
		Q.UI.Text.extend("Intentos",{ 
        init: function(p) {
            this._super({
                label: "P - 3",
                color: "white",
                x: Q.width * 0.8,
                y: 0,
				family: "ARCADECLASSIC",
				size:"18"
            });
			this.intentos(Q.state.get("intentos"));
            Q.state.on("change.intentos",this,"intentos");
        },

        intentos: function(intentos) {
            this.p.label = "P - " + intentos;
        }
	});
	// vida del jefe del nivel
	Q.UI.Text.extend("Boss",{ 
        init: function(p) {
            this._super({
                label: "ENEMY",
                color: "white",
                x: Q.width * 0.10,
                y: 30,
				family: "ARCADECLASSIC",
				size:"18"
            });
        }
	});
	
	var corazonesBoss = [];
	
	for(i=0;i<16;i++){
		if(Q.state.get("livesBoss")>i){
			corazonesBoss[i] = container.insert(new Q.Heart({x: (Q.width * 0.24+6*i),y:43}));
		}else{
			corazonesBoss[i] = container.insert(new Q.Heart({x: (Q.width * 0.24+6*i),y:43,sheet:"coraçao2"}));
		}	
	}
		
	
	Q.state.set({heartsBoss :corazonesBoss});
	
	
	
	
	
	
	 

	 var containerArma1 = container.insert(new Q.UI.Container({
		 x: Q.width * 0.62 , y: 40, fill: "black",w: 44, h: 28,border:3,stroke:"red",radius:0
	 }));
	 containerArma1.insert(new Q.HachaIcono({x:1,y:1}));
	
	container.insert(new Q.Puntos());
	container.insert(new Q.Tiempo());
	container.insert(new Q.Intentos());
	 container.insert(new Q.Vidas());
	 container.insert(new Q.Boss());
		
	
	
});





////////////////////////////////// GAME OVER ///////////////////////////
Q.scene('endGame',function(stage) {
	var box = stage.insert(new Q.UI.Container({
		x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
	}));
  
	var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
	                                       label: "Play Again" }));      
	var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
	                                    label: stage.options.label }));

	button.on("click",function() {
		Q.audio.stop();
		Q.clearStages();
		Q.stageScene('initialMenu');
	});
	box.fit(20);
});


///////////////////////// INICIO //////////////////////////////////

Q.scene("initialMenu", function(stage) { 
	    // Background
		Q.audio.stop();
	    stage.insert(new Q.Repeater( { asset: "intro.png" } ));

	    // Botón CONTROLS
	    var contControles = stage.insert(new Q.UI.Container({ x: 80 , y: 104 }));
	    var btControles = contControles.insert(new Q.UI.Button({ x: 80, y: 104, asset: "controles.png"})); 
		
		// animacion castillo
			stage.insert(new Q.Castillo({x:260,y:190}));
      
	    Q.input.on('confirm',this,function(){ // si da a intro entra al juego
			Q.clearStages();
			
			Q.state.set("lives",16);
			Q.state.set("livesBoss",16);
			Q.state.set("puntos",0);
			Q.state.set("time",300);
			Q.state.set("intentos",3);
			Q.state.set("boss",false);
			Q.stageScene('levelIntro');
			Q.stageScene("HUD", 2);
		});
		
	    btControles.on("click",function() { // si da al boton va a ver los controles
	        Q.clearStages();
	        Q.stageScene('controls');
	    });

	});
////////////////////////// CREDITOS FINAL /////////////////////
Q.scene("creditos", function(stage) { 
		
	    // Background
		Q.audio.stop();
		Q.audio.play('creditos', { loop: true });
	    stage.insert(new Q.Repeater( { asset: "creditos.png" } ));

	    // Botón CONTROLS
	    
		
		// animacion castillo
		stage.insert(new Q.Creditos({x:110,y:125}));
      
	    Q.input.on('confirm',this,function(){ // si da a intro entra al juego
			Q.clearStages();
			Q.stageScene('initialMenu');
			
		});
		

	});	
	
///////////////PANTALLA CONTROLES///////////////////


	Q.scene("controls", function(stage) { 
	    // Background
	    stage.insert(new Q.Repeater({ asset: "controls.png"}));

		
	    Q.input.on('confirm',this,function(){ // si da a intro vuelve al menu de inicio
			Q.clearStages();
			Q.stageScene('initialMenu');
		});
		
	});






/////////////////////////////////////// CARGA //////////////////////////////////


  Q.loadTMX("level.tmx, 1level.tmx, 1levelB.tmx, 1levelC.tmx, 1levelD.tmx, 2level.tmx, 2levelB.tmx,2levelC.tmx, 2levelD.tmx, superMedusa.png, superMedusa.json, 2levelF.tmx, balda.png, balda.json, cred.png, cred.json, creditos.png, orbe.png, orbe.json, bola.png, bola.json, superBat.png, superBat.json, controles.png, castillo.png, castillo.json, vampirekiller.png, vampirekiller.json, limite.png, controls.png, intro.png, coraçao.png, coraçao.json, huesoRed.png, huesoRed.json, huesoBlue.png, huesoBlue.json, trofeo.png, trofeo.json, totem.png, totem.json, saco.png, saco.json, baul.png, baul.json, fuego.png, fuego.json, hacha.png, hacha.json,daga.png, daga.json, snakeMedusa.png, snakeMedusa.json, snakeMomia.png, snakeMomia.json, ghost.png, ghost.json, torreDragon.png, torreDragon.json, medusita.png, medusita.json, skeletonBlue.png, skeletonBlue.json, skeletonRed.png, skeletonRed.json,  pez.png, pez.json, lancero.png, lancero.json, hachero.png, hachero.json, zombie.png, zombie.json, enano.png, enano.json, dog.png, dog.json, bat.png, bat.json, simonNormal.png, simonNormal.json", function() {
	
	///// SIMON///////////////////////////////
	 Q.compileSheets("simonNormal.png", "simonNormal.json");
	Q.compileSheets("vampirekiller.png","vampirekiller.json");
	 //// ENEMIGOS ////////////////////////////
	 Q.compileSheets("zombie.png", "zombie.json");
	 Q.compileSheets("bat.png", "bat.json");
	 Q.compileSheets("dog.png", "dog.json");
	 Q.compileSheets("enano.png", "enano.json");
	 Q.compileSheets("pez.png", "pez.json");
	 Q.compileSheets("lancero.png", "lancero.json");
	 Q.compileSheets("hachero.png", "hachero.json");
	 Q.compileSheets("skeletonBlue.png", "skeletonBlue.json");
	 Q.compileSheets("skeletonRed.png", "skeletonRed.json");
	 Q.compileSheets("snakeMedusa.png", "snakeMedusa.json");
	 Q.compileSheets("snakeMomia.png", "snakeMomia.json");
	 Q.compileSheets("ghost.png", "ghost.json");
	 Q.compileSheets("torreDragon.png", "torreDragon.json");
	 Q.compileSheets("medusita.png", "medusita.json");
	 ///////// BOSSES ///////////////
	  Q.compileSheets("superBat.png", "superBat.json");
	  Q.compileSheets("superMedusa.png", "superMedusa.json");
	 ///// ATAQUES ////////////////////////////
	 Q.compileSheets("daga.png", "daga.json");
	 Q.compileSheets("hacha.png", "hacha.json");
	Q.compileSheets("huesoRed.png", "huesoRed.json");
	 Q.compileSheets("huesoBlue.png", "huesoBlue.json");
	 Q.compileSheets("bola.png", "bola.json");
	//Q.compileSheets("boomerang.png", "boomerang.json");
	////////// OBJETOS //////////////////////
	Q.compileSheets("baul.png", "baul.json");
	Q.compileSheets("coraçao.png", "coraçao.json");
	Q.compileSheets("trofeo.png", "trofeo.json");
	Q.compileSheets("totem.png", "totem.json");
	Q.compileSheets("saco.png", "saco.json");
	Q.compileSheets("orbe.png", "orbe.json");
	////// EFECTOS /////////////////////
	Q.compileSheets("fuego.png", "fuego.json");
	//Q.compileSheets("lifes.png", "lifes.json");
	Q.compileSheets("castillo.png", "castillo.json");
	Q.compileSheets("cred.png", "cred.json");
	Q.compileSheets("balda.png", "balda.json");
	//////////////////////////////////////////////////////////////////////////////////
	 
	//carga musica y sonido////
	Q.load({
         
		  'castlevania':'Castlevania.mp3',
          'boss':'Boss.mp3',
		  'victory':'deadBoss.mp3',
		  'creditos':'Creditos.mp3',
		  'castlevania2':'Castlevania2.mp3',
		  'muerte':'muerte.mp3',
		  'premio':'reward.mp3',
		  'golpe':'golpe.mp3',
		  'latigo':'latigo.mp3',
		  'disparo':'disparo.mp3',
		  'hitEnemy':'hitEnemy.mp3'
        },function() { Q.stageScene("initialMenu"); });	
  });
	//////////////////////////////////////////////////////////////////ANIMACIONES CASTLEVANIA ////////////////////////////////////////
	
	//////////////////// Animaciones de Simon Belmont ////////////////////////////
	Q.animations('simon',{
		walk_left: {frames:[1,2,3], rate:0.3, loop:false, next:'stay_left'},
		walk_right:{frames:[4,5,6], rate:0.3, loop:false, next:'stay_right'},
		stay_left: {frames:[3], rate:1, loop:false},
		stay_right: {frames:[4], rate:1, loop:false},
		jump_left: {frames:[0],rate:0.5, loop:true, next:'stay_left'},
		jump_right: {frames:[7], rate:0.5, loop:true, next:'stay_right'},
		latigo_left: {frames:[5,4,3],rate:0.2, loop:false,trigger:"latigo.left"}, 
		latigo_right:{frames:[0,1,2], rate:0.2, loop:false,trigger:"latigo.right"}
		
	});
	
	Q.animations('vampirekiller',{
		left: {frames:[0], rate:1,loop:true},
		right:{frames:[1], rate:1,loop:true}
		
	});
	
	
	///////////////////////////////////////////////////////////////////////////////Animaciones enemigos ///////////////////////////////////
	//////////////////// Animaciones del Zombie ////////////////////////////
	Q.animations('zombie',{
		walk_left: {frames:[0,1], rate:0.3,  next:'stay_left'},
		walk_right: {frames:[2,3], rate:0.3, next:'stay_right'},
		stay_left: {frames:[0], rate:1},
		stay_right: {frames:[4], rate:1}
	});	
	////////////////// Animaciones murcielago ///////////////////////
	Q.animations('bat',{
		fly_left:{frames:[0,1,2], rate:0.3,  next:'stay'},
		fly_right:{frames:[4,5,6], rate:0.3,  next:'stay'},
		stay:{frames:[3], rate:1}
		
	});	
	
	////////////////// Animaciones perro ///////////////////////////
	Q.animations('dog',{
		run_left:{frames:[0,1], rate:0.3},
		jump_left:{frames:[2],rate:0.5, loop:false},
		jump_right:{frames:[5],rate:0.5, loop:false},
		run_right:{frames:[6,7], rate:0.3},
		stay_left:{frames:[3], rate:1},
		stay_right:{frames:[4], rate:1}
		
	});
	
	////////////////// Animaciones enano ///////////////////////////
	Q.animations('enano',{
		jump_left:{frames:[0],rate:0.3, loop:false},
		jump_right:{frames:[3],rate:0.3, loop:false},
		stay_left:{frames:[1], rate:1},
		stay_right:{frames:[2], rate:1}
		
	});
  	
	////////////////// Animaciones lancero ///////////////////////////
	Q.animations('lancero',{
		walk_left:{frames:[0,1,2], rate:0.3},
		walk_right:{frames:[4,5,6], rate:0.3}
		
	});	
	
	////////////////// Animaciones hachero ///////////////////////////
	Q.animations('hachero',{
		walk_left:{frames:[0,1], rate:0.3},
		walk_right:{frames:[2,3], rate:0.3}
		
	});
	
	////////////////// Animaciones pez ///////////////////////////
	Q.animations('pez',{
		walk_left:{frames:[1,2], rate:0.3},
		walk_right:{frames:[3,4], rate:0.3},
		fire_left:{frames:[0], rate:1,loop:false},
		fire_right:{frames:[5], rate:1,loop:false}
		
	});
	
	////////////////// Animaciones esqueleto rojo ///////////////////////////
	Q.animations('skeletonRed',{
		walk_left:{frames:[2,3], rate:0.3},
		walk_right:{frames:[4,5], rate:0.3},
		die_left:{frames:[1,0], rate:0.3, loop:false,next:"reborn_left"},
		die_right:{frames:[6,7], rate:0.3, loop:false,next:"reborn_right"},
		reborn_left:{frames:[0,1], rate:0.3,loop:false}, // el esqueleto rojo es inmortal , muere pero revive siempre
		reborn_right:{frames:[7,6], rate:0.3,loop:false}
		
	});
	
	////////////////// Animaciones esqueleto azul ///////////////////////////
	Q.animations('skeletonRed',{
		walk_left:{frames:[2,3], rate:0.3},
		walk_right:{frames:[4,5], rate:0.3},
		die_left:{frames:[1,0], rate:0.3, loop:false},
		die_right:{frames:[6,7], rate:0.3, loop:false}	
	});
	
	////////////// Animaciones serpientes medusa ///////////////////
	Q.animations('snakeMedusa',{
		walk_left:{frames:[0,1], rate:0.3},
		walk_right:{frames:[2,3], rate:0.3}
	});
	
	///////////// Animaciones serpientes Momia
	Q.animations('snakeMomia',{
		walk_left:{frames:[2,3], rate:0.3},
		walk_right:{frames:[0,1], rate:0.3}
	});
	///////////// Animaciones Ghost //////////////
	Q.animations('ghost',{
		walk_left:{frames:[0,1], rate:0.3},
		walk_right:{frames:[2,3], rate:0.3}
	});
	
	//////////// Animaciones TorreDragon /////////////
	Q.animations('torreDragon',{
		look_left:{frames:[0], rate:1},
		look_right:{frames:[1], rate:1}
	});
	
	//////////// Animaciones Medusita //////////////
	Q.animations('medusita',{
		fly_left:{frames:[0,1], rate:0.3},
		fly_right:{frames:[2,3], rate:0.3}
	});

  	//////////////////////////////////////////////////////////////////// Animaciones Bosses ////////////////////////////////
	
	Q.animations('superBat',{
		fly:{frames:[0,1], rate:0.3,loop:true}
	});
	Q.animations('superMedusa',{
		fly:{frames:[0,1], rate:0.3,loop:true}
	});
	
	//////////////////////////////////////////////////////////////////// Animaciones ataques /////////////////////////////////
	Q.animations('daga',{
		left:{frames:[0], rate:1},
		right:{frames:[1], rate:1}
	});
	
	Q.animations('hacha',{
		left:{frames:[0,1,3,2], rate:0.3},
		right:{frames:[2,3,0,1], rate:0.3}
	});
	
	Q.animations('boomerang',{
		left:{frames:[1,0,3,2], rate:0.3},
		right:{frames:[0,3,2,1], rate:0.3}
	});
	
	Q.animations('huesoRed',{
		left:{frames:[0,3,2], rate:0.3},
		right:{frames:[3,0,1], rate:0.3}
	});
	
	Q.animations('huesoBlue',{
		left:{frames:[0,3,2], rate:0.3},
		right:{frames:[3,0,1], rate:0.3}
	});
	
	Q.animations('bola',{
		bola:{frames:[0,1], rate:0.3,loop:true}
	});
	//////////////////////////////////////////////////////////////////// Animaciones objetos ///////////////////////////////
	Q.animations('baul',{
		brillo:{frames:[0,1], rate:0.3,loop:true}
	});
	Q.animations('trofeo',{
		brillo:{frames:[0,1], rate:0.3,loop:true}
	});
	Q.animations('totem',{
		brillo:{frames:[0,1], rate:0.3,loop:true}
	});
	Q.animations('saco',{
		brillo:{frames:[0,1,3], rate:0.3,loop:true}
	});
	Q.animations('orbe',{
		brillo:{frames:[0,1], rate:0.3,loop:true}
	});
	///////////////////////////////////////////////////////////////// Animaciones efectos ///////////////////////////////////
	Q.animations('fuego',{
		fuego:{frames:[0,1,3], rate:0.3,loop:false,trigger:"fuego.fin"}
	});
	Q.animations('lifes',{
		alive:{frames:[0], rate:1},
		dead:{frames:[1], rate:1}
	});
	Q.animations('castillo',{
		castillo:{frames:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], rate:0.2,loop:false,next:"castillo2"},
		castillo2:{frames:[12,13,14], rate:0.2,loop:true},
	});
	Q.animations('cred',{
		cred:{frames:[0,1,2,2], rate:3,loop:false}
	});
	Q.animations('balda',{
		brillo:{frames:[0], rate:1,loop:true}
	});

};