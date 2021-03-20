// Timer colors 
const colors = [
  "#F81B00", // red
  "#DF8000", // orange
  "#F666A1", // pink
  "#640587", // purple
  "#268EEF", // light blue
  "#5CC500", // green
  "#D82E44", // burgundy
  "#49E4A0", // turquoise
  "#F290BF", // light pink
  "#922EBD", // violet
  "#084A99", // dark blue
  "#1D7164", // dark green
];


let inputHrs = document.getElementById("inputHrs");
let inputMin = document.getElementById("inputMin");
let inputSec = document.getElementById("inputSec");

let allInputs = [inputHrs, inputMin, inputSec];

let timerNumbers = document.getElementById("timerNumbers");

let timerHrs = document.getElementById("timerHrs");
let timerMin = document.getElementById("timerMin");
let timerSec = document.getElementById("timerSec");

let startButton = document.getElementById("startButton");

let pauseButton = document.getElementById("pauseButton");
let stopButton = document.getElementById("stopButton");

let inputSection = document.getElementById("inputSection");
let timerSection = document.getElementById("timerSection");

let backgroundFront = document.getElementById("backgroundFront");
let backgroundBack = document.getElementById("backgroundBack");

let colorMenuOverlay = document.getElementById("colorMenuOverlay");

let startColorElements = document.getElementById("startColorHolder").children;
let endColorElements = document.getElementById("endColorHolder").children;

let colorPickerButton = document.getElementById("colorPickerButton");
let confirmColorButton = document.getElementById("confirmColorButton");

let startTime, elapsedTime, remainingTime;
let duration, originalDuration;

let isTimerReadyToStart = false;
let isTimerPaused = false;

let countDownInterval;
let resumeTimeout;


inputHrs.addEventListener("keyup", checkInput);
inputMin.addEventListener("keyup", checkInput);
inputSec.addEventListener("keyup", checkInput);

startButton.addEventListener("click", startTimer);

pauseButton.addEventListener("click", () => {
  isTimerPaused = !isTimerPaused;
  if (!isTimerPaused) {
    resumeTimer();
    pauseButton.classList.add("pause-icon");
    pauseButton.classList.remove("play-icon");
  } else {
    pauseTimer();
    pauseButton.classList.add("play-icon");
    pauseButton.classList.remove("pause-icon");
  }
});

stopButton.addEventListener("click", resetTimer);


// Set up the colors for the color menu
for (i = 0; i < startColorElements.length; i++) {
  startColorElements[i].style.backgroundColor = colors[i];
}

for (i = 0; i < endColorElements.length; i++) {
  endColorElements[i].style.backgroundColor = colors[i];
}


// Applying the picked color to the background on click
Array.from(startColorElements).forEach((el) => {
  el.addEventListener("click", (e) => {
    backgroundFront.style.backgroundColor = e.target.style.backgroundColor;

    Array.from(startColorElements).forEach((el) => {
      el.classList.remove("selected-item");
    });

    e.target.classList.add("selected-item");
  });
});

Array.from(endColorElements).forEach((el) => {
  el.addEventListener("click", (e) => {
    backgroundBack.style.backgroundColor = e.target.style.backgroundColor;

    Array.from(endColorElements).forEach((el) => {
      el.classList.remove("selected-item");
    });

    e.target.classList.add("selected-item");
  });
});


// Opening and closing the color menu
colorPickerButton.addEventListener("click", () => {
  colorMenuOverlay.classList.remove("hidden");
});

confirmColorButton.addEventListener("click", () => {
  colorMenuOverlay.classList.add("hidden");
});

colorMenuOverlay.addEventListener("click", function (e) {
  if (this == e.target) {
    colorMenuOverlay.classList.add("hidden");
  }
});


/*
  Checks the input value, moves focus forward and backwards,
  and deletes unwanted characters
*/
function checkInput(e) {
  let target = e.target;
  let charCode = e.which || e.keyCode;
  let inputIndex = allInputs.findIndex((element) => element === target);
  let maxLength = parseInt(target.attributes["maxlength"].value, 10);
  let inputLength = target.value.length;

  if ((charCode >= 49 && charCode <= 57) || (charCode >= 97 && charCode <= 105)) { // numbers
    // If input text is at max value, go to next input field
    if (inputLength >= maxLength) {
      try {
        let next = allInputs[inputIndex + 1];
        next.focus();
      } catch { }
    }
  } else if (charCode == 48 || charCode == 96) { // zero
    // if inputted 0, go to next input field
    if (inputLength == 1)
      target.value = 0;
    try {
      let next = allInputs[inputIndex + 1];
      next.focus();
    } catch { }
  } else if (charCode == 8) { // backspace
    // if pressed backspace and no input text, go to previous input field
    if (inputLength === 0) {
      try {
        let previous = allInputs[inputIndex - 1];
        previous.focus();
      } catch { }
    }
  } else if (charCode == 13) { // enter
    // if pressed enter, go to next input field or start timer
    try {
      let next = allInputs[inputIndex + 1];
      next.focus();
    } catch {
      if (isTimerReadyToStart) {
        startTimer();
      }
    }
  } else {
    // if inputted anything else, it gets deleted
    target.value = target.value.replace(/\D/g, '');
  }

  changeStartButtonState();
}


function changeStartButtonState() {
  let active = false;
  allInputs.forEach(e => {
    if (e.value > 0) {
      active = true;
    }
  });

  isTimerReadyToStart = active;

  if (active && startButton.classList.contains("disabled")) {
    startButton.classList.remove("disabled");
  } else if (!active && !startButton.classList.contains("disabled")) {
    startButton.classList.add("disabled");
  }
}


/*
  Hides the input section, shows the timer section,
  gets the input hours, minutes and seconds, gets start time,
  calculates the duration and starts the count down interval
*/
function startTimer() {
  inputSection.classList.add("hidden");
  timerSection.classList.remove("hidden");

  pauseButton.classList.remove("hidden");
  pauseButton.classList.add("pause-icon");
  pauseButton.classList.remove("play-icon");

  let hours = 0,
    minutes = 0,
    seconds = 0;
  let inputSecNum = parseInt(inputSec.value);
  let inputMinNum = parseInt(inputMin.value);
  let inputHrsNum = parseInt(inputHrs.value);

  if (inputSec.value != "") {
    if (inputSecNum >= 60) {
      minutes += Math.floor(inputSecNum / 60);
      seconds += inputSecNum % 60;
    } else {
      seconds += inputSecNum;
    }
  }

  if (inputMin.value != "") {
    if (inputMinNum >= 60) {
      hours += Math.floor(inputMinNum / 60);
      minutes += inputMinNum % 60;
      console.log("Minutes: " + minutes);
    } else {
      minutes += inputMinNum;
    }
  }

  if (inputHrs.value != "") {
    hours += inputHrsNum;
  }

  duration = 3600 * hours + 60 * minutes + seconds;
  originalDuration = duration;
  startTime = Date.now();

  countDown();
  countDownInterval = setInterval(countDown, 1000);
}


// Counts the timer down
function countDown() {
  let diff = duration - (((Date.now() - startTime) / 1000) | 0);

  let hours = (diff / 3600) | 0;
  let minutes = ((diff / 60) % 60) | 0;
  let seconds = (diff % 60) | 0;

  updateTimer(hours, minutes, seconds);

  // Time up
  if (diff <= 0) {
    clearInterval(countDownInterval);
    pauseButton.classList.add("hidden");
    document.title = "Color Timer - Time Up";
    timerNumbers.classList.add("blinking");
  }

  backgroundFront.style.opacity = diff / originalDuration;
}


// Writes the hours, minutes and seconds into their respective elements
function updateTimer(hours, minutes, seconds) {
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  timerHrs.innerHTML = hours;
  timerMin.innerHTML = minutes;
  timerSec.innerHTML = seconds;
}


function pauseTimer() {
  clearInterval(countDownInterval);
  clearTimeout(resumeTimeout);
  let timeDifference = Date.now() - startTime;
  remainingTime = 1000 - ((timeDifference) % 1000);
  elapsedTime = timeDifference + remainingTime;
}


function resumeTimer() {
  resumeTimeout = setTimeout(() => {
    startTime = Date.now();
    duration = duration - elapsedTime / 1000;
    countDownInterval = setInterval(countDown, 1000);
    countDown();
  }, remainingTime);
}


function resetTimer() {
  clearInterval(countDownInterval);
  clearTimeout(resumeTimeout);

  duration = null;
  originalDuration = null;
  startTime = null;
  isTimerPaused = false;
  elapsedTime = null;
  remainingTime = null;

  timerSection.classList.add("hidden");
  inputSection.classList.remove("hidden");
  backgroundFront.style.opacity = 1;

  document.title = "Color Timer";
  timerNumbers.classList.remove("blinking");
}