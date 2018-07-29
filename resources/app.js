'use strict';


let dataDisplayed = document.querySelector('.transcript');
let startNow = 'Start now';
let stop = 'Stop';
let recordButton = document.querySelector('.record-button');
recordButton.innerHTML = startNow;
let sourceLang = document.querySelector('#source-lang');
let targetLang = document.querySelector('#target-lang');

let languages = [
    {
        name: "English",
        code: "EN"
    },
    {
        name: "Afrikaans",
        code: "AF"
    },
    {
        name: "Czech",
        code: "CS"
    },
    {
        name: "Danish",
        code: "DA"
    }
];

function addData (response) {
    console.log(response.entities);

    let dataItem = document.createElement('p')
    dataItem.innerHTML = response.entities[0].name;
    dataDisplayed.appendChild(dataItem);
}


function createLanguageOptions (selectTag) {
    languages.forEach(el => {
        let selectOption = document.createElement('option')
        selectOption.innerHTML = el.name;
        selectTag.appendChild(selectOption)
    })
}

createLanguageOptions(sourceLang);
createLanguageOptions(targetLang);

function addTranscript (transcript) {
    let dataItem = document.createElement('p')
    dataItem.innerHTML = transcript;
    dataDisplayed.appendChild(dataItem);
}

let message = {
    recording: false
}

function setRecording() {
    recordButton.innerHTML = recordButton.innerHTML === startNow ? stop : startNow;
    let request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:3000/record', true);
    request.setRequestHeader('Content-Type', 'application/json')
    message.recording = message.recording === false ? true : false;
    request.send(JSON.stringify(message));
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            if (request.response !== 'recording') {
                let transcript = JSON.parse(request.response).join(' ');
                console.log(transcript);
                addTranscript(transcript);
            }
        }
    }
}

function getSynsets () {
    let request = new XMLHttpRequest();
    request.open('GET', 'https://babelnet.io/v5/getSynsetIds?lemma=beatles&searchLang=EN&targetLang=DE&pos=NOUN&key=13d7839c-ef5d-40fd-aa70-71d21f06181f', true);
    request.send();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            let response = JSON.parse(request.response);
            console.log(response);
            response.forEach(item => {
                getInterpretation(item.id);
            })
        }
    }
}

function getInterpretation (id) {
    let request = new XMLHttpRequest();
    request.open('GET', 'https://babelnet.io/v5/getSynset?id=' + id + '&targetLang=IT&targetLang=DE&key=13d7839c-ef5d-40fd-aa70-71d21f06181f', true);
    request.send();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            let response = JSON.parse(request.response);
            console.log(response);
        }
    }
}

recordButton.addEventListener('click', setRecording);
