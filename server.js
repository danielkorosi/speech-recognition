'use strict';

let express = require('express');
let app = express();
app.use('/resources', express.static('resources'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
const fs = require('fs');
const language = require('@google-cloud/language');

// Creates a client
const speechClient = new speech.SpeechClient();

// The name of the audio file to transcribe
const fileName = './resources/male_voice_cut.wav';

// Reads a local audio file and converts it to base64
const file = fs.readFileSync(fileName);
const audioBytes = file.toString('base64');

// The audio file's encoding, sample rate in hertz, and BCP-47 language code
const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 8000,
    languageCode: 'en-US'
};

const request = {
  audio: {
    content: audioBytes,
  },
  config: config
};

// Creates a client
const languageClient = new language.LanguageServiceClient();

let entityResponse = {
    audioDetected: '',
    entities: []
}

app.get('/audio', function(req, res){
    speechClient
      .recognize(request)
      .then(data => {
        const response = data[0];
        const transcription = response.results
          .map(result => result.alternatives[0].transcript)
          .join('\n');
          response.audioDetected = transcription;
          const documentToAnalyze = {
            content: transcription,
            type: 'PLAIN_TEXT',
          };
          languageClient
            .analyzeEntities({document: documentToAnalyze})
            .then(results => {
              const entities = results[0].entities;
              console.log('Entities:');
              entities.forEach(entity => {
                entityResponse.entities.push(entity);
                console.log(entity);
                console.log(entity.name);
                // console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
                if (entity.metadata && entity.metadata.wikipedia_url) {
                  // console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
                }
              });
              res.send(entityResponse);
            })
            .catch(err => {
              console.error('ERROR:', err);
            });
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
});

app.listen(3000, function(){
    console.log('server is running');
});
