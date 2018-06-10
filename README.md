# Castlevania I
Poyecto final de la asignatura de Diseño de Videojuegos con tecnologias web.
## 0-El Juego
  **Año de publicación:** 1986.
  
  **Plataformas:** FDS, NES, Commodore 64, Amiga, DOS, Windows, Game Boy Advance y AT&T. 
  
  **Distribuidores:**  Konami y Nintendo. 
  
  ### Resumen de la Historia: 
  Nos ponemos en la piel de Simón Belmont, heredero de una famosa familia de caza vampiros de Transilvania, cuya    misión es matar a Drácula cada vez que este revive cada 100 años en su castillo.
  ### Jugabilidad:
  Castlevania es el típico juego de plataformas de la era de los 8-bits: El juego está compuesto por seis niveles de estricta progresión lineal. Simon Belmont tiene como modo primario de ataque el uso de su látigo, pero pueden obtenerse varias sub-armas que proveen diferentes formas de ataque. Cada uno de los niveles del juego concluye con una pelea con un jefe generalmente inspirado en la literatura de horror y leyendas clásicas. 
## 1-Diseño del Juego
   ### 1.1-Objetivo del juego: cómo se gana, cómo se pierde.
   El objetivo del juego es avanzar a traves de los niveles consiguiendo puntos para finalmente  derrotar al jefe que hay al final de cada uno. En el juego original hay 6 fases diferenciadas con un jefe cada una, el último de  ellos es Drácula , jefe final del juego , tras su derrota habriamos ganado el juego. 
   
   En el caso de mi juego , es una version reducida del juego original , constando de 2 fases con un jefe cada una , derrotando al segundo jefe ( Medusa ) ganamos el juego.
   
   Para perder tanto en el juego original como en mi version siguen vigentes las mismas ideas, aunque con algun leve cambio. El jugador cuenta con 3 vidas para pasarse el juego , cada una de ellas compuesta por 16 bloques de salud. Si perdemos todos los bloques de salud o si caemos al vacio perdemos automaticamente una vida , y reiniciaríamos en la estancia en la que hemos muerto a menos que no nos quedara ninguna vida mas , en cuyo caso volveriamos al comienzo del juego.
   
   Cada una de las fases dispone de un contador de tiempo que se inicia a 300 segundos al principio del nivel , si el contador llega a 0 en cualquiera de las fases perdemos el juego automaticamente y comenzariamos en el principio.
   ### 1.2-Principales Mecanicas
   -**Mecanicas del protagonista** 
   
      -Andar: desplazamiento horizontal a izquierda o derecha
      
      -Saltar: util para sobrepasar obstaculos y evitar enemigos
      
      -Ataque de latigo: ataque principal de nuestro protagonista, golpea en una direccion con el latigo y mata instantaneamente al enemigo al que golpee , excepto a los bosses que solo son debiles a armas a distancia.
      
      -Arma a distancia: ataque secundario de nuestro jugador , util para eliminar enemigos a distancia , y especialmente importantes para la eliminacion de los bosses finales.
      
   -**Mecanicas de los enemigos**   
   
     -Zombie: Corre en una direccion y al chocar contra una pared da la vuelta , si choca con el jugador le quita vida y da la vuelta tambien . Al morir deja un objeto que otorga puntos al jugador.
       
    -Pantera: Corre de lado a lado de una estancia y de forma aleatoria da saltos abalanzandose sobre lo que encuentre , al morir deja un objeto para el jugador.
   
    -Serpiente: Repta de lado a lado de una estancia y muere automaticamente al cabo de un tiempo , tambien deja un objeto y es un enemigo auxiliar del segundo boss.
   
    -Lancero: Patrulla de lado a lado y hace daño al jugador si este choca con el , al morir deja un objeto.
   
    -Hachero: Se mueve de lado a lado y cambia su direccion aleatoriamente , cada cierto tiempo lanza una hacha boomerang 
   
    -HombrePez: Anda de lado a lado y cambia su direccion cada cierto tiempo , de la misma forma que cada cierto tiempo dispara una bola de fuego.
   
    -Enano: Cada cierto tiempo da un salto de altura y anchura aleatoria , si cae sobre el jugador le hace daño y al morir tambien deja un objeto.
   
    -Murcielago: Vuela de lado a lado de una estancia , y tambien deja un objeto al morir.
   
    -Cabeza de Medusa: Vuela siguiendo una trayectoria sinusoidal en una direccion, tratando de hacer una embestida kamikaze al protagonista , solo muere si es golpeado por una arma a distancia y no deja objetos.
   
   -**Mecanicas de los Bosses**   
   
     -Super Murcielago: Realiza movimientos erraticos ondulando de izquierda a derecha y dispara rondas de proyectiles de fuego cada cierto tiempo, al morir suelta un orbe que al recogerlo nos permitira atravesar la puerta hasta la siguiente fase.
     
     -Medusa: Se mueve sinusoidalmente de lado a lado y va soltando sus serpientes para dificultar al jugador . Solo es vulnerable a armas a distancia y al morir suelta el orbe que permite atravesar la puerta y finalizar el juego.
   ### 1.3-Personajes
     En el juego solo hay un protagonista , Simon Belmont , que con ayuda de su latigo y arma a distancia debera derrotar a los enemigos citados previamente.
## 2-Diseño de la implementacion y arquitectura
    El código del juego esta todo  en un unico  game.js ( tuve la intencion de cambiarlo al final  pero resultó dar mas problemas de los esperados para separarlo en diferentes scripts) , las imágenes en /images, los sonidos en /audio,  los .json y .tmx en /data
