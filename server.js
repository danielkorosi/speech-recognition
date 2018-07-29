'use strict';

let express = require('express');
const bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.json());
app.use('/resources', express.static('resources'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

const fs = require('fs');
const language = require('@google-cloud/language');
const record = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient();
const languageClient = new language.LanguageServiceClient();

let request = {
    config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en',
    },
    interimResults: false, // If you want interim results, set this to true
};

let audioTranscript = [];

function recordStream () {
    const recognizeStream = speechClient
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data => {
        let fragment = data.results[0] && data.results[0].alternatives[0] ? data.results[0].alternatives[0].transcript : null;
        console.log(fragment);
        audioTranscript.push(fragment);
    }
);
    record
    .start({
        sampleRateHertz: 16000,
        threshold: 0,
        // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
        verbose: false,
        recordProgram: 'rec', // Try also "arecord" or "sox"
        silence: '10.0',
    })
    .on('error', console.error)
    .pipe(recognizeStream);
}

function stopStream () {
    record.stop();
}

app.post('/record', function(req, res) {
    console.log(req.body);
    if (req.body.recording === false) {
        console.log('stop');
        stopStream();
        res.send(audioTranscript);
    } else {
        console.log('start');
        request.config.languageCode = req.body.languageCode.toLowerCase();
        console.log(request);
        recordStream();
        res.send('recording');
    }
});

app.get('/entities', function(req, res) {
    const document = {
        content: audioTranscript,
        type: 'PLAIN_TEXT',
    };
    languageClient
        .analyzeEntities({document: document})
        .then(results => {
            const entities = results[0].entities;
            console.log('Entities:');
            entities.forEach(entity => {
                console.log(entity.name);
                console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
                if (entity.metadata && entity.metadata.wikipedia_url) {
                    console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
                }
            });
            let entityNames = entities.map(entity => {
                return entity.name;
            });
            res.send(entityNames);
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
});

app.listen(3000, function(){
    console.log('server is running');
});
