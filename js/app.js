let currentPage = 0;
let currentExerciseIndex = 0

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start');
    const pauseButton = document.getElementById('pause');
    const workButton = document.getElementById('work');
    const shortBreakButton = document.getElementById('short-break');
    const longBreakButton = document.getElementById('long-break');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');
    const cycleDisplay = document.getElementById('cycle');
    const timerContainer = document.querySelector('.timer-container');

    let isRunning = false;
    let interval;
    let cycleCount = 0;

    const workTime = 0.05; // Set this to 25 for production
    const shortBreakTime = 0.05; // Set this to 5 for production
    const longBreakTime = 0.10; // Set this to 15 for production

    let currentPhase = 'work';
    let secondsRemaining = workTime * 60;

    const loadSavedState = () => {
        const savedState = JSON.parse(localStorage.getItem('exerciseState')) || { currentPage: 0, currentExerciseIndex: 0, displayedExercises: [] };
        currentPage = savedState.currentPage;
        currentExerciseIndex = savedState.currentExerciseIndex;
        localStorage.setItem('exerciseState', JSON.stringify(savedState));
    };

    loadSavedState();

    const updateDisplay = () => {
        let minutes = Math.floor(secondsRemaining / 60);
        let seconds = secondsRemaining % 60;
        minutesSpan.textContent = String(minutes).padStart(2, '0');
        secondsSpan.textContent = String(seconds).padStart(2, '0');
        cycleDisplay.textContent = `Cycle: ${cycleCount + 1}`;
    };

    const switchPhase = (phase) => {
        clearInterval(interval);
        isRunning = false;
        currentPhase = phase;

        let time = phase === 'work' ? workTime : (phase === 'shortBreak' ? shortBreakTime : longBreakTime);
        secondsRemaining = time * 60;

        const backgroundColors = {
            'work': '#ba4949',
            'shortBreak': '#38858a',
            'longBreak': '#397097'
        };
        const exerciseContainerBackgroundColors = {
            'work': '#c15b5c',
            'shortBreak': '#4d9196',
            'longBreak': '#4d7fa2'
        };

        if (phase === 'work') {
            document.getElementById('exercise-container').classList.add('hidden');

            if (cycleCount === 3) {
                cycleCount = 0;
            } else {
                cycleCount++;
            }
        }

        document.body.style.backgroundColor = backgroundColors[phase];
        document.getElementById('exercise-container').style.backgroundColor = exerciseContainerBackgroundColors[phase];

        const phaseToClass = {
            'work': 'work',
            'shortBreak': 'short-break',
            'longBreak': 'long-break'
        };

        timerContainer.className = 'timer-container';
        timerContainer.classList.add(phaseToClass[phase]);

        updateDisplay();
        toggleButtons();
    };

    const startPomodoro = () => {
        if (!isRunning) {
            isRunning = true;
            interval = setInterval(() => {
                secondsRemaining--;
                updateDisplay();

                if (secondsRemaining <= 0) {
                    if (currentPhase === 'work') {
                        switchPhase(cycleCount === 3 ? 'longBreak' : 'shortBreak');
                        displayExercise();
                    } else {
                        switchPhase('work');
                    }
                }
            }, 1000);
        }
        toggleButtons();
    };

    const pausePomodoro = () => {
        clearInterval(interval);
        isRunning = false;
        toggleButtons();
    };

    const toggleButtons = () => {
        startButton.classList.toggle('hidden', isRunning);
        pauseButton.classList.toggle('hidden', !isRunning);
    };

    const fetchExercises = async (page = 0) => {
        const url = `https://api.api-ninjas.com/v1/exercises?type=stretching&page=${page}`;
        const apiKey = 'JUsNoEnkuPaf4D9xULuTbQ==N7xtfAPpJyO2YhWW';
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Api-Key': apiKey
                }
            });
            if (!response.ok) throw new Error('Error while fetching exercises.');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API error:', error);
            return [];
        }
    };

    const displayExercise = async () => {
        const savedState = JSON.parse(localStorage.getItem('exerciseState')) || { currentPage: 0, currentExerciseIndex: 0, displayedExercises: [] };
        const exercises = await fetchExercises(savedState.currentPage);

        if (!exercises || exercises.length === 0) return;

        let exercise;
        if (savedState.currentExerciseIndex >= exercises.length) {
            savedState.currentPage++;
            savedState.currentExerciseIndex = 0;
            const newExercises = await fetchExercises(savedState.currentPage);
            exercise = newExercises[0];
        } else {
            exercise = exercises[savedState.currentExerciseIndex];
        }

        document.getElementById('exercise-name').textContent = exercise.name;
        document.getElementById('exercise-description').textContent = exercise.instructions;
        document.getElementById('exercise-type').textContent = `Type: ${exercise.type}`;
        document.getElementById('exercise-muscle').textContent = `Muscle: ${exercise.muscle}`;
        document.getElementById('exercise-equipment').textContent = `Equipment: ${exercise.equipment}`;
        document.getElementById('exercise-difficulty').textContent = `Difficulty: ${exercise.difficulty}`;
        document.getElementById('exercise-container').classList.remove('hidden');

        savedState.currentExerciseIndex++;
        savedState.displayedExercises.push(currentExerciseIndex);
        localStorage.setItem('exerciseState', JSON.stringify(savedState));
    };

    document.getElementById('complete-exercise').onclick = () => {
        document.getElementById('exercise-container').classList.add('hidden');
        displayExercise();
    };

    workButton.addEventListener('click', () => switchPhase('work'));
    shortBreakButton.addEventListener('click', () => switchPhase('shortBreak'));
    longBreakButton.addEventListener('click', () => switchPhase('longBreak'));

    startButton.addEventListener('click', startPomodoro);
    pauseButton.addEventListener('click', pausePomodoro);

    updateDisplay();
    toggleButtons();
});