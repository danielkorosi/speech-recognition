'use strict';

let transcriptWrapper = document.querySelector('.transcript-wrapper');
let recordNow = 'Record now';
let recordAgain = 'Record again';
let stop = 'Stop';
let buttons = document.querySelector('.buttons');
let recordButton = document.querySelector('.record-button');
recordButton.innerHTML = recordNow;
let sourceLang = document.querySelector('#source-lang');
let targetLang = document.querySelector('#target-lang');
let searchButton = document.querySelector('.search-button');
// let findingsElement = document.querySelector('.findings');
let findingsContent = document.querySelector('.findings-content');
// let findingsTitle = document.querySelector('.findings-title');
let transcriptTitle = document.querySelector('.transcript-title');
let transcriptHtmlElement = document.querySelector('.transcript-result');
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
    },
    {
        name: "Hungarian",
        code: "HU"
    },
    {
        name: "German",
        code: "DE"
    }
];

function createLanguageOptions (selectTag) {
    languages.forEach(el => {
        let selectOption = document.createElement('option')
        selectOption.innerHTML = el.name;
        selectTag.appendChild(selectOption)
    })
}

createLanguageOptions(sourceLang);
createLanguageOptions(targetLang);

function getSelectValueCode (element) {
    let languageString = element.options[element.selectedIndex].value
    let selectedLanguageCode;
    languages.forEach(language => {
        if (language.name === languageString) {
            selectedLanguageCode = language.code;
        }
    })
    console.log(selectedLanguageCode);
    return selectedLanguageCode;
}

function addSearchButton () {
    searchButton = document.createElement('div');
    searchButton.innerHTML = 'Search';
    searchButton.className = 'button'
    buttons.appendChild(searchButton)
}

function addTranscript (text) {
    // transcriptHtmlElement.innerHTML = '';
    transcriptHtmlElement.innerHTML = text.join(' ');
    transcriptTitle.innerHTML = 'Detected keywords: ';
    searchButton.disabled = false;
}
let message = {
    recording: false,
    languageCode: ''
}
let transcript = '';

function setRecording() {
    recordButton.innerHTML = recordButton.innerHTML === recordNow || recordButton.innerHTML === recordAgain ? stop : recordAgain;
    transcriptHtmlElement.innerHTML = '';
    let request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:3000/record', true);
    request.setRequestHeader('Content-Type', 'application/json');
    message.recording = message.recording === false ? true : false;
    message.languageCode = getSelectValueCode(sourceLang);
    request.send(JSON.stringify(message));
    console.log('setrecord1')
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            console.log('setrecord2');
            if (request.response !== 'recording') {
                transcript = '';
                transcript = JSON.parse(request.response);
                console.log(transcript);
                addTranscript(transcript);
            }
        }
    }
}

function getEntities() {
    searchButton.disabled = true;
    let request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:3000/entities', true);
    request.send();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            let entityNames = JSON.parse(request.response);
            console.log(entityNames);
            entityNames.forEach(entity => {
                // getSynsets(entity);
                getSenses(entity);
            })
        }
    }
}

function getSenses (word) {
    let request = new XMLHttpRequest();
    request.open('GET', 'https://babelnet.io/v5/getSenses?lemma=' + word + '&searchLang=' + getSelectValueCode(sourceLang) + '&targetLang=' + getSelectValueCode(targetLang) + '&pos=NOUN&key=' + babelKey, true);
    request.send();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            let response = JSON.parse(request.response);
            console.log(response);
            addFindings(word, response);
        }
    }
}

function addFindings (word, response) {
    findingsContent.remove();
    // findingsTitle.innerHTML = null;
    // findingsTitle.innerHTML = word;
    // findingsElement.appendChild(findingsTitle)
    response.forEach(el => {
        let resultItem = document.createElement('div');
        resultItem.innerHTML = el.properties.fullLemma
        findingsContent.appendChild(resultItem)
    });
}

function getSynsets (word) {
    let request = new XMLHttpRequest();
    request.open('GET', 'https://babelnet.io/v5/getSynsetIds?lemma=' + word + '&searchLang=' + getSelectValueCode(sourceLang) + '&targetLang=' + getSelectValueCode(targetLang) + '&pos=NOUN&key=' + babelKey, true);
    request.send();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            let response = JSON.parse(request.response);
            response.forEach(item => {
                getInterpretation(item.id);
            })
        }
    }
}

function getInterpretation (id) {
    let request = new XMLHttpRequest();
    request.open('GET', 'https://babelnet.io/v5/getSynset?id=' + id + '&targetLang=' + getSelectValueCode(targetLang) + '&key=' + babelKey, true);
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
