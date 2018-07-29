'use strict';


let transcriptWrapper = document.querySelector('.transcript-wrapper');
let startNow = 'Start now';
let stop = 'Stop';
let buttons = document.querySelector('.buttons');
let recordButton = document.querySelector('.record-button');
recordButton.innerHTML = startNow;
let sourceLang = document.querySelector('#source-lang');
let targetLang = document.querySelector('#target-lang');
let transcriptHtmlElement = null;
let searchButton = document.querySelector('.search-button');
let transcript;
const babelKey = '13d7839c-ef5d-40fd-aa70-71d21f06181f';

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
    let dataItem = document.createElement('p')
    dataItem.innerHTML = response.entities[0].name;
    transcriptParent.appendChild(dataItem);
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

function addSearchButton () {
    searchButton = document.createElement('div');
    searchButton.innerHTML = 'Search';
    searchButton.className = 'button'
    buttons.appendChild(searchButton)
}

function addTranscript (text) {
    transcriptHtmlElement = document.createElement('div');
    transcriptHtmlElement.innerHTML = text;
    transcriptWrapper.appendChild(transcriptHtmlElement);
    searchButton.disabled = false;
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
                transcript = JSON.parse(request.response).join(' ');
                console.log(transcript);
                addTranscript(transcript);
            }
        }
    }
}

function getEntities() {
    let request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:3000/entities', true);
    request.send();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            let entityNames = JSON.parse(request.response);
            console.log(entityNames);
            entityNames.forEach(entity => {
                getSynsets(entity, 'EN', 'DE');
            })

        }
    }
}

function getSynsets (text, searchLang, targetLang) {
    let request = new XMLHttpRequest();
    request.open('GET', 'https://babelnet.io/v5/getSynsetIds?lemma=' + text + '&searchLang=' + searchLang + '&targetLang=' + targetLang + '&pos=NOUN&key=' + babelKey, true);
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
    request.open('GET', 'https://babelnet.io/v5/getSynset?id=' + id + '&targetLang=DE&key=' + babelKey, true);
    request.send();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            let response = JSON.parse(request.response);
            console.log(response);
        }
    }
}

recordButton.addEventListener('click', setRecording);
searchButton.addEventListener('click', getEntities);
