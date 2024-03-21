let btnIniciar = document.querySelector('#btn-iniciar')
let btnParar = document.querySelector('#btn-parar')

let minutosMain = document.querySelector('#minutos-main')
let segundosMain = document.querySelector('#segundos-main')

let minutosRest = document.querySelector('#minutos-rest')
let segundosRest = document.querySelector('#segundos-rest')

let minutosTimer2 = 1;
let segundosTimer2 = 59;

let contador = '';

let minutosTimer1 = 1
let segundosTimer1 = 59

function iniciaTimer() {
    minutosMain.textContent = minutosTimer1
    segundosMain.textContent = segundosTimer1

    contador = setInterval(() => {
        if(segundosTimer1 > 0) {
            segundosTimer1--;
            segundosMain.textContent = segundosTimer1;
        } else if(minutosTimer1 == 0){
            clearInterval(contador)
            minutosTimer1 = 1
            segundosTimer1 = 59
            restTime()
        }
        else {
            minutosTimer1--;
            minutosMain.textContent = minutosTimer1;
            segundosTimer1 = 59
        }
    }, 50)
}


function pararTimer() {
    clearInterval(contador)
}

function restTime() {
    minutosRest.textContent = minutosTimer2
    segundosRest.textContent = segundosTimer2

    contador = setInterval(() => {
        if(segundosTimer2 > 0) {
            segundosTimer2--;
            segundosRest.textContent = segundosTimer2;
        } else if(minutosTimer2 == 0){
            alert("Parou")
            clearInterval(contador)
            minutosTimer2 = 1
            segundosTimer2 = 59
            // restTime()
        }
        else {
            minutosTimer2--;
            minutosRest.textContent = minutosTimer2;
            segundosTimer2 = 59
        }
    }, 50)
}
btnIniciar.addEventListener('click', iniciaTimer)
btnParar.addEventListener('click', pararTimer)