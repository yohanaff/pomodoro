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

    const workTime = 0.25; // Set this to 25 for production
    const shortBreakTime = 0.05; // Set this to 5 for production
    const longBreakTime = 0.10; // Set this to 15 for production

    let currentPhase = 'work';
    let secondsRemaining = workTime * 60;

    const updateDisplay = () => {
        let minutes = Math.floor(secondsRemaining / 60);
        let seconds = secondsRemaining % 60;
        minutesSpan.textContent = String(minutes).padStart(2, '0');
        secondsSpan.textContent = String(seconds).padStart(2, '0');
        cycleDisplay.textContent = `Ciclo: ${cycleCount + 1}`;
    };

    const switchPhase = (phase) => {
        clearInterval(interval);
        isRunning = false;
        currentPhase = phase;

        if (phase === 'work') {
            if (cycleCount === 3) {
                cycleCount = 0;
            } else {
                cycleCount++;
            }
        }

        let time = phase === 'work' ? workTime : (phase === 'shortBreak' ? shortBreakTime : longBreakTime);
        secondsRemaining = time * 60;

        const phaseToClass = {
            'work': 'work',
            'shortBreak': 'short-break',
            'longBreak': 'long-break'
        };
        document.body.style.backgroundColor = phase === 'work' ? '#ba4949' : (phase === 'shortBreak' ? '#38858a' : '#397097');
        timerContainer.classList.remove('work', 'short-break', 'long-break');
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

    workButton.addEventListener('click', () => switchPhase('work'));
    shortBreakButton.addEventListener('click', () => switchPhase('shortBreak'));
    longBreakButton.addEventListener('click', () => switchPhase('longBreak'));

    startButton.addEventListener('click', startPomodoro);
    pauseButton.addEventListener('click', pausePomodoro);

    updateDisplay();
    toggleButtons();
});
