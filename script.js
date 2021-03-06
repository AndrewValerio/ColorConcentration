// global constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence


//Global Variables
var pattern = [3, 6, 7, 1, 9, 9, 3, 2, 5, 6, 5, 7, 8, 4, 4, 5, 1, 3];
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5; //must be between 0.0 and 1.0
var guessCounter = 0;
var clueHoldTime = 1000; //how long to hold each clue's light/sound
var holdModifier = 30;
var strikes = 2;
var time = 10;
var myTimeout = -1;
var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
var timeEl = document.getElementById("countdown");
var strikeEl = document.getElementById("strikes");

function start(){
  startGame();
  startTimer();
}

function stop(){
  stopGame();
  stopTimer();
}

function startTimer (){
    if (time === 0){
      loseGame();
      stopTimer();
    }
    else if(gamePlaying == true){
    document.getElementById("countdown").innerHTML = time;
    setTimeout(function(){
      time--;
      startTimer();
    }, 1000);
    }
}


function stopTimer (){
  gamePlaying = false;
  time = 10;
  clearTimeout(myTimeout);
  myTimeout = 1;
}

function strikeCounter(){
  document.getElementById("strikes").innerHTML = strikes;
  if(strikes > 0){
    strikes--;
  }
  else{
    loseGame();
    stopTimer();
    }
  }

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
/*Durstenfeld shuffle algorithm */


function startGame() {
  //initialize game variables
  strikes = 2;
  time = 10;
  document.getElementById("countdown").innerHTML = 10;
  document.getElementById("strikes").innerHTML = 3;
  progress = 0;
  gamePlaying = true;
  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  shuffleArray(pattern);
  playClueSequence();
}

function stopGame() {
  gamePlaying = false;
  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit");
}
function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit");
}

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}

function playClueSequence() {
  context.resume();
  let delay = nextClueWaitTime; //set delay to initial wait time
  if ( progress > 0){    
  holdModifier += progress;
  clueHoldTime -= holdModifier;
  }
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms");
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
    }
  }

function guess(btn) {  
  console.log("user guessed: " + btn);

  if (!gamePlaying) {
    return;
  }
  
    if(pattern[guessCounter] == btn){
    if(guessCounter == progress){
      if(progress == pattern.length - 1){
        winGame();
      }else{
        progress++;
        guessCounter = 0;
        time = 10 * progress;
        playClueSequence();
      }
    }else{
      guessCounter++;
    }
  }else{
    strikeCounter();
  }  
}
/*
function guess(btn){
  console.log("user guessed: " + btn);
  
  if(!gamePlaying){
    return;
  }
  
  if(pattern[guessCounter] == btn){
    //Guess was correct!
    if(guessCounter == progress){
      if(progress == pattern.length - 1){
        //GAME OVER: WIN!
        winGame();
      }else{
        //Pattern correct. Add next segment
        progress++;
        playClueSequence();
      }
    }else{
      //so far so good... check the next guess
      guessCounter++;
    }
  }else{
    //Guess was incorrect
    //GAME OVER: LOSE!
    loseGame();
  }
}   
*/

function loseGame() {
  stopGame();
  alert("Game Over. You lost.");
}

function winGame() {
  stopGame();
  alert("Game Over. You won!");
}

// Sound Synthesis Functions
const freqMap = {
  1: 200,
  2: 245,
  3: 290,
  4: 325,
  5: 370,
  6: 405,
  7: 450,
  8: 495,
  9: 540
};
function playTone(btn, len) {
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  context.resume();
  tonePlaying = true;
  setTimeout(function () {
    stopTone();
  }, len);
}
function startTone(btn) {
  if (!tonePlaying) {
    context.resume();
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    context.resume();
    tonePlaying = true;
  }
}
function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);
