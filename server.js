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
const client = new speech.SpeechClient();

const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

const request = {
    config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
    },
    interimResults: false, // If you want interim results, set this to true
};

let isRecordStarted = false;
let audioTranscript = [];


function recordStream () {
    const recognizeStream = client
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
        sampleRateHertz: sampleRateHertz,
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

app.post('/record', function(req, res){
    console.log(req.body);
    if (req.body.recording === false) {
        console.log('stop');
        stopStream();
        res.send(audioTranscript);
    } else {
        console.log('start');
        recordStream();
        res.send('recording');
    }
});



/* record
  .start({
    sampleRateHertz: sampleRateHertz,
    threshold: 0,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: false,
    recordProgram: 'rec', // Try also "arecord" or "sox"
    silence: '10.0',
  })
  .on('error', console.error)
  .pipe(recognizeStream);
  console.log(recognizeStream);
 app.get('/audio', function(req, res){
    // Create a recognize stream
    const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data => {
        let audioDetected = data.results[0] && data.results[0].alternatives[0] ? data.results[0].alternatives[0].transcript : null;
        console.log(audioDetected);
    });
    // Start recording and send the microphone input to the Speech API
    record
      .start({
        sampleRateHertz: sampleRateHertz,
        threshold: 0,
        // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
        verbose: false,
        recordProgram: 'arecord', // Try also "arecord" or "sox"
        silence: '10.0',
      })
      .on('error', console.error)
      .pipe(recognizeStream);
      console.log(recognizeStream);
      languageClient.analyzeEntities({document: documentToAnalyze}).then(results => {
          const entities = results[0].entities;
          console.log('Entities:');
          console.log(entities);
          entities.forEach(entity => {
              entityResponse.entities.push(entity);
              if (entity.metadata && entity.metadata.wikipedia_url) {
                  // console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
              }
          });
          res.send(entities);
      })
      .catch(err => {
          console.error('ERROR:', err);
      });
}) */

app.listen(3000, function(){
    console.log('server is running');
});
