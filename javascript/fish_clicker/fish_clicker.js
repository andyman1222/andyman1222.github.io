

//for the for loop only
var x = 0;

//bool to check if an update code is already looping
var looping = false;

//bool for if you lost
//var player.eaten = false;

//player health
var player = { eaten: 0, health: 100, attack: 0 };

//currency
var gold = 0;

//number of clicks by you and clickers
var clickings = 0;

//used for showing how much of item x you bought
var buy = { health: 0, click: 0, attack: 0, defend: 0 };

//fish health
var fish = { health: 100, attack: 0, kill: 0 };

//how many times you were attacked by the fish
//fish.attack  = 0;

//how many times you attacked the fish
//player.attack = 0;

//number of fish you kill
//fish.kill = 0;


//what happens if you press the fish
function press() {

	//the fish quickly gets wide eyes then goes to normal
	document.getElementById("fish").innerHTML = "<img onCLick='press()' src='//" + window.location.host + "/javascript/fish_clicker/fish-click.png' style='width:64px;height:64px'></img>";

	//increase number of clicks
	clickings = clickings + 1;

	//waits 100 ms before switching fish to normal
	setTimeout(poke, 100);

	//run attack function for attacking both you and fish
	didFishEatYou();

	//check if the updating code is running
	if (looping) { }
	else {
		loop();
	}
	updateDocument();
}

//used for looping loop()
function loop2() {
	loop();
}

//code for clickers, hiding/showing shop buttons, statistics
function loop() {

	//makes sure this code doesn't run more than once at the same time
	looping = true;

	//update the shoppe
	updateDocument();

	//handles auto clickers
	x = 0;
	while ((x < buy.click) && (!player.eaten)) {
		//when x is less than clickers and you are not eaten, then "use" a clicker to click
		x++;

		//adds one gold every time instead of random amount of gold or being attacked
		gold = gold + 1;

		//changes fish image to big eye fish
		document.getElementById("fish").innerHTML = "<img onCLick='press()' src='//" + window.location.host + "/javascript/fish_clicker/fish-click.png' style='width:64px;height:64px'></img>";

		//increases number of clicks
		clickings = clickings + 1;

		//waits 100 ms before switching fish image to normal
		setTimeout(poke, 100);
	}


	//loop loop() every second
	setTimeout(loop2, 1000);
}

//code that changes fish image to big eye fish
function poke() {
	document.getElementById("fish").innerHTML = "<img onCLick='press()' src='//" + window.location.host + "/javascript/fish_clicker/fish.png' style='width:64px;height:64px'></img>";
}

//what happens when you click the button to buy a clicker
function addClicker() {

	//remove 200 gold
	if (gold - 200 >= 0) {
		gold -= 200;

		//update amount of gold


		//update stats
		buy.click++;
	}

	//update shoppe
	updateButtons();
}

//what happens when you buy health
function healthAdd() {

	//remove 10 gold
	if (gold - 10 >= 0) {
		gold -= 10;

		//increase item 0 of buy[] by 1 (hint: item 0 is amount of health bought)
		buy.health++;

		//increase player.health by 1
		player.health++;
	}
	//update health


	//update amount of health bought in stats


	//update shoppe
	updateButtons();
}

//what happens when you buy defenders
function defenderAdd() {

	//remove 300 gold
	if (gold - 300 >= 0) {
		gold -= 300;

		//increase number of defenders by 1
		buy.defend++;

		//update number of defenders in stats


		//update shoppe
	}
	updateButtons();
}

//what happens when you buy attackers
function attackerAdd() {

	//remove 400 gold
	if (gold - 400 >= 0) {
		gold -= 400;

		//increase number of attackers by 1
		buy.attack++;

		//update number of attackers in stats


		//update shoppe
	}
	updateButtons();
}


function updateButtons() {
	//if you have 10 or more gold, change shoppe status and show button to add health
	if (gold >= 10) {

		//shoppe status change
		document.getElementById("shoppe status").innerHTML = "Look at that! Now you can buy something! Why not be greedy and collect some belongings...";

		//button is visible
		document.getElementById("health").style.visibility = "visible";
	}

	//else, change status to default and hide the buttin
	else {

		//shoppe status change
		document.getElementById("shoppe status").innerHTML = "Welcome to the shoppe! Nothing's on sale, why not try to tap that fish over there?";

		//button is hidden
		document.getElementById("health").style.visibility = "hidden";
	}

	//if you have 200 or more gold, show clicker buy button
	if (gold >= 200) {
		document.getElementById("clickerv1").style.visibility = "visible";
	}

	//if you dont have 200 or more gold, hide the clicker buy button
	else {
		document.getElementById("clickerv1").style.visibility = "hidden";
	}

	//if you have 300 or more gold, show the defender buy button.
	if (gold >= 300) {
		document.getElementById("defender").style.visibility = "visible";
	}

	//if you dont have 300 or more gold, hide the defender buy button
	else {
		document.getElementById("defender").style.visibility = "hidden";
	}

	//if you have 400 or more gold, show the attacker buy button
	if (gold >= 400) {
		document.getElementById("attacker").style.visibility = "visible";
	}

	//if you do not have 400 or more gold, hide the attacker buy button
	else {
		document.getElementById("attacker").style.visibility = "hidden";
	}
}

//shows/hides shoppe buttons depending on various statements
//also updates everything
function updateDocument() {

	//update everything
	document.getElementById("fishKill").innerHTML = fish.kill;
	document.getElementById("fishHitpoints").innerHTML = fish.health;
	document.getElementById("att-buy").innerHTML = buy.attack;
	document.getElementById("def-buy").innerHTML = buy.defend;
	document.getElementById("heal-buy").innerHTML = buy.health;
	document.getElementById("hitpoints").innerHTML = player.health;
	document.getElementById("click-buy").innerHTML = buy.click;
	document.getElementById("lootNumber").innerHTML = gold;
	//update amount of gold shown
	document.getElementById("lootNumber").innerHTML = gold;

	//update number of clicks
	document.getElementById("clickerz").innerHTML = "You and your clickers have clicked " + clickings + " times.";

	//update amount of gold shown if not done so
	document.getElementById("lootNumber").innerHTML = gold;

	//if you are eaten, hide everything from the shoppe
	if (player.eaten) {
		document.getElementById("clickerv1").style.visibility = "hidden";
		document.getElementById("health").style.visibility = "hidden";
		document.getElementById("defender").style.visibility = "hidden";
		document.getElementById("attacker").style.visibility = "hidden";
	}
	else {
		updateButtons();

	}
}

//checks if dragon "eats" you
function didFishEatYou() {
	if (Math.random() * 100 < 10) {
		//if a random number between 0-100 is less than 10, attack the player

		//increase number of times fish attacked you in stats and update
		fish.attack = fish.attack + 1;
		document.getElementById("fishAttack").innerHTML = fish.attack;

		//deal one tenth of your total gold minus the number of defenders you bought times 10. subtract that damage from health
		//note: if done correctly you could gain health from an attack (easter egg!)
		var damage = (gold / 10) - (buy.defend * 10);
		player.health = player.health - damage;

		//update health and tell player how much damage was caused
		document.getElementById("hitpoints").innerHTML = player.health;
		alert("fish deals " + damage + " damage to player.");

		//if health is less than or equal to 0, then player is dead.
		if (player.health <= 0) {
			//hides shoppe buttons
			player.eaten = true;

			//a critical hit is when the fish deals damage that puts your health into negative
			if (player.health < 0) {
				alert("Critical hit!!!");
			}

			//run code to hide everything that would allow the player to move on
			youAreDead();
		}
	}

	//if not eaten, add a random long (long as in variables) amount of gold between 1-20 and update
	else {
		gold = Math.round(Math.random() * 20) + 1 + gold;
		document.getElementById("lootNumber").innerHTML = gold;
		updateDocument();
	}

	//if a random between 0 to 100 minus number of attackers is less than 10, then attack the fish
	//note; if you have 100 attackers, you will always attack the fish (easter egg!)
	if (Math.random() * 100 - buy.attack < 10) {
		attackingFish();
	}
}

//what happens when you attack the fish
function attackingFish() {

	//deal one tenth of gold plus 10 times the amount of attackers to fish, update, and tell player how much damage was dealt
	damage = (gold / 10) + (buy.attack * 10);
	fish.health = fish.health - damage;
	document.getElementById("fishHitpoints").innerHTML = fish.health;
	alert("player and attackers deal " + damage + " damage to fish.");

	//increase  number of attacks by player in stats by 1 and update
	player.attack = player.attack + 1;
	document.getElementById("playerAttack").innerHTML = player.attack;

	//if fish is dead, do stuff below
	if (fish.health <= 0) {

		//gives player 100 gold
		gold = gold + 100;

		//tells player that you defeated the fish
		alert("You have defeated a fish and gained 100 gold! Another fish is coming!!!");

		//resets the fish health to make it look like a new one came, increase number of fish kills in stats and update
		fish.health = 100;
		fish.kill = fish.kill + 1;
	}

}

//what happens when fish kills you
function youAreDead() {

	//hides fish image so player doesn't click on it
	document.getElementById("fish").innerHTML = "<img onCLick='press()' src='fish.png' style='width:64px;height:64px;visibility:hidden;'></img>";
	document.getElementById("fish").style.visibility = "hidden";

	//tells player you die and update shoppe status
	alert("The fish ate you!!!");
	document.getElementById("shoppe status").innerHTML = "It's a shame, you scared away the fish...";
	updateDocument();
} 
