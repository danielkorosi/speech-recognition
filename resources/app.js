'use strict';

const babelKey = '13d7839c-ef5d-40fd-aa70-71d21f06181f';
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
let findingsContent = document.querySelector('.findings-result');
let findingsTitle = document.querySelector('.findings-title');
let transcriptTitle = document.querySelector('.transcript-title');
let transcriptHtmlElement = document.querySelector('.transcript-result');
let message = {
    recording: false,
    languageCode: ''
}
let transcript = '';

function createLanguageOptions (selectTag) {
    languages.forEach(el => {
        let selectOption = document.createElement('option')
        selectOption.innerHTML = el.name;
        selectTag.appendChild(selectOption)
    })
}

createLanguageOptions(sourceLang);
createLanguageOptions(targetLang);

function getEntities() {
    searchButton.disabled = true;
    let request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:3000/entities', true);
    request.send();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            let entityNames = JSON.parse(request.response);
            findingsTitle.innerHTML = 'Results';
            entityNames.forEach(entity => {
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
            addFindings(word, response);
        }
    }
}

function getSelectValueCode (element) {
    let languageString = element.options[element.selectedIndex].value
    let selectedLanguageCode;
    languages.forEach(language => {
        if (language.name === languageString) {
            selectedLanguageCode = language.code;
        }
    })
    return selectedLanguageCode;
}

function addTranscript (text) {
    transcriptHtmlElement.innerHTML = text.join(' ');
    transcriptTitle.innerHTML = 'Speech transcript: ';
    searchButton.disabled = false;
}

function resetSearchState () {
    findingsTitle.innerHTML = '';
    findingsContent.innerHTML = '';
    recordButton.innerHTML = recordButton.innerHTML === recordNow || recordButton.innerHTML === recordAgain ? stop : recordAgain;
    transcriptHtmlElement.innerHTML = '';
    searchButton.disabled = recordButton.innerHTML === stop;
}
function setRecording() {
    resetSearchState();
    let request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:3000/record', true);
    request.setRequestHeader('Content-Type', 'application/json');
    message.recording = message.recording === false ? true : false;
    message.languageCode = getSelectValueCode(sourceLang);
    request.send(JSON.stringify(message));
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            if (request.response !== 'recording') {
                transcript = '';
                transcript = JSON.parse(request.response);
                addTranscript(transcript);
            }
        }
    }
}

function addFindings (word, response) {
    let resultName = document.createElement('div');
    resultName.innerHTML = word + ':';
    resultName.className = 'result-name';
    findingsContent.appendChild(resultName);
    response.forEach(el => {
        let resultItem = document.createElement('div');
        resultItem.innerHTML = el.properties.fullLemma;
        findingsContent.appendChild(resultItem);
    });
}

recordButton.addEventListener('click', setRecording);
searchButton.addEventListener('click', getEntities);
