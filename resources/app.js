'use strict';

let dataDisplayed = document.querySelector('.dataDisplayed');
let button = document.querySelector('.button');

function addData (response) {
    console.log(response.entities);

    let dataItem = document.createElement('p')
    dataItem.innerHTML = response.entities[0].name;
    dataDisplayed.appendChild(dataItem);
}

function getAudio(url) {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
            let response = JSON.parse(request.response);
            console.log(response);
            addData(response);
        }
    }
    request.send();
}

button.addEventListener('click', getAudio('http://localhost:3000/audio'));
