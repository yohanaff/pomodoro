const POMODORO_TIME = 25; // Set this to 1500 => 25 min for production
const SHORT_BREAK_TIME = 5; // Set this to 300 => 5 min for production
const LONG_BREAK_TIME = 15; // Set this to 900 => 15 min for production
const WATER_TIME = 3;

const STORAGE_KEY = "exerciseState";

const stopExerciseButton = document.getElementById('short-break-done-btn');
const stopWaterButton = document.getElementById('water-time-done-btn');


function saveLocalExercise(exerciseIndex = 0) {
    const indexString = "" + exerciseIndex;
    window.localStorage.setItem(STORAGE_KEY, indexString);
}

function loadLocalExercise() {
    const indexString = window.localStorage.getItem(STORAGE_KEY) || "0";
    return isNaN(indexString) ? 0 : Number(indexString);
}

function displayExerciseContainer(exercise = {}) {
    document.getElementById('exercise-name').textContent = exercise.name;
    document.getElementById('exercise-description').textContent = exercise.instructions;
    document.getElementById('exercise-type').textContent = `Type: ${exercise.type}`;
    document.getElementById('exercise-muscle').textContent = `Muscle: ${exercise.muscle}`;
    document.getElementById('exercise-equipment').textContent = `Equipment: ${exercise.equipment}`;
    document.getElementById('exercise-difficulty').textContent = `Difficulty: ${exercise.difficulty}`;
    document.getElementById('exercise-container').classList.remove('hidden');
    stopExerciseButton.classList.remove("hidden");
}

function displayWaterContainer() {
    document.getElementById('water-container').style.display = 'block';
}

function hideExerciseContainer() {
    document.getElementById('exercise-container').classList.add('hidden');
    stopExerciseButton.classList.add("hidden");
}

function hideWaterContainer() {
    document.getElementById('water-container').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start');
    const pauseButton = document.getElementById('pause');
    const workButton = document.getElementById('work');
    const shortBreakButton = document.getElementById('short-break');
    const longBreakButton = document.getElementById('long-break');
    const waterTimeButton = document.getElementById('water-time');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');
    const cycleDisplay = document.getElementById('cycle');
    const timerContainer = document.querySelector('.timer-container');

    let isRunning = false;
    let interval;
    let cycleCount = 1;

    let currentPhase = 'work';
    let secondsRemaining = POMODORO_TIME;

    const updateDisplay = () => {
        let minutes = Math.floor(secondsRemaining / 60);
        let seconds = secondsRemaining - (minutes * 60);
        minutesSpan.textContent = String(minutes).padStart(2, '0');
        secondsSpan.textContent = String(seconds).padStart(2, '0');
        cycleDisplay.textContent = `Cycle: ${cycleCount}`;
    };

    const switchPhase = (phase) => {
        clearInterval(interval);
        isRunning = false;
        currentPhase = phase;

        // let time = phase === 'work' ? POMODORO_TIME : (phase === 'shortBreak' ? SHORT_BREAK_TIME : LONG_BREAK_TIME);
        let time;
        if (phase === 'work') {
            time = POMODORO_TIME;
        } else if (phase === 'shortBreak') {
            time = SHORT_BREAK_TIME;
        } else if (phase === 'waterTime') {
            time = WATER_TIME;
        } else {
            time = LONG_BREAK_TIME;
        }
        secondsRemaining = time;

        const backgroundColors = {
            'work': '#ba4949',
            'shortBreak': '#38858a',
            'longBreak': '#397097',
            'waterTime': '#2798aa'
        };


        if (phase === 'work') {
            hideExerciseContainer();
            hideWaterContainer();

            if (cycleCount === 4) {
                cycleCount = 1;
            } else {
                cycleCount++;
            }

        } else if (phase === "shortBreak") {
            displayExercise();
            hideWaterContainer();
        } else if (phase === "waterTime") {
            hideExerciseContainer();
            displayWaterContainer();
        } else {
            hideExerciseContainer();
            hideWaterContainer();
        }

        document.body.style.backgroundColor = backgroundColors[phase];

        const phaseToClass = {
            'work': 'work',
            'shortBreak': 'short-break',
            'longBreak': 'long-break',
            'waterTime': 'water-time'
        };

        timerContainer.className = 'timer-container';
        timerContainer.classList.add(phaseToClass[phase]);

        updateDisplay();
        togglePomodoroButtons();
    };

    const startPomodoro = () => {
        const alarmElement = document.getElementById('alarmSound');

        if (!isRunning) {
            isRunning = true;
            interval = setInterval(() => {
                secondsRemaining = secondsRemaining - 1;
                updateDisplay();

                if (secondsRemaining <= 0) {
                    alarmElement.play();

                    if (currentPhase === 'work') {
                        switchPhase(cycleCount === 4 ? 'longBreak' : 'shortBreak');
                    } else {
                        switchPhase('work');
                    }
                }
            }, 1000);
        }
        togglePomodoroButtons();
    };

    const pausePomodoro = () => {
        clearInterval(interval);
        isRunning = false;
        togglePomodoroButtons();
    };

    const togglePomodoroButtons = () => {
        startButton.classList.toggle('hidden', isRunning);
        pauseButton.classList.toggle('hidden', !isRunning);
    };

    const fetchExercise = async (offset = 0) => {
        const url = `https://api.api-ninjas.com/v1/exercises?type=stretching&offset=${offset}`;
        const apiKey = 'API-KEY';
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Api-Key': apiKey
                }
            });
            if (!response.ok) throw new Error('Error while fetching exercises.');
            const data = await response.json();
            return data[0] || {}; // get the first array's item
        } catch (error) {
            console.error('API error:', error);
            return null;
        }
    };

    async function displayExercise() {
        const currentExerciseNumber = loadLocalExercise();
        let exercise = await fetchExercise(currentExerciseNumber);

        if (!exercise) { // api error
            exercise = {}
        } else if (!exercise.type) { // empty exercise
            saveLocalExercise();
            exercise = await fetchExercise();
        }

        displayExerciseContainer(exercise);

        const nextExerciseNumber = currentExerciseNumber + 1;
        saveLocalExercise(nextExerciseNumber);
    };

    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            console.log("Button clicked, attempting to play sound");
            document.getElementById('clickSound').play();
        });
    });

    function clickPomodoro() {
        if (currentPhase !== 'work') {
            switchPhase('work');
        }
    }

    workButton.addEventListener('click', () => clickPomodoro());
    shortBreakButton.addEventListener('click', () => switchPhase('shortBreak'));
    longBreakButton.addEventListener('click', () => switchPhase('longBreak'));
    stopExerciseButton.addEventListener('click', () => switchPhase('work'));
    waterTimeButton.addEventListener('click', () => switchPhase('waterTime'));

    startButton.addEventListener('click', startPomodoro);
    pauseButton.addEventListener('click', pausePomodoro);

    updateDisplay();
    togglePomodoroButtons();
});
