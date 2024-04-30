const http = require('http')
const express = require('express')
require('dotenv').config()
const port = process.env.SAVG_LISTEN_PORT || 3400;
const bodyParser = require('body-parser')

const expressApp = express();
const server = http.createServer(expressApp)
const request = require('request')
const logger = require('./logger').savgLogger;
const wsLogger = require('./logger').wsLogger;


expressApp.use(bodyParser.json())
const calls = require('./utils').calls;
server.listen(port, function () {
    logger.info(`**** SAVG Listener Server running on port ${port} **** `)
})

const WebSocket = require('ws')
const wss = new WebSocket.Server({server, path: "/confirm"});
const {WebhookResponse} = require('@jambonz/node-client');
const { ack } = require('./ack');
const transcriptHookURL = process.env.CALL_HOOK_BASE_URL + '/confirm'

wss.on('connection', function (ws) {
  logger.debug("Connection from SAVG received")
    ws.on('message', function (dataStr) {
        let wsData = JSON.parse(dataStr)
        const {type, msgid, hook, call_sid, data} = wsData;
        logger.info(`msgid: ${msgid}, ${type}, ${hook}, ${call_sid}`)
        logger.debug(`message received from SAVG: ${dataStr}`);
        let callObj = calls.get(call_sid) || {};
        if (callObj.savgSocket) {
            callObj.msgid = msgid;
        }
        if (wsData.type === 'session:new') {
            logger.info(`new call with sid: ${call_sid}`)
            callObj.call_sid = call_sid;
            callObj.savgSocket = ws;
            callObj.msgid = msgid;
            calls.set(call_sid, callObj);
            const app = new WebhookResponse();
            app.config({
                "transcribe"  : {
                  "enable" : true,
                  "transcriptionHook" : transcriptHookURL,
                  "recognizer": {
                    "vendor": "default",
                    "language": "en-US",
                    "interim": false,
                    "dualChannel": true,
                    "separateRecognitionPerChannel": true,
                    "diarization": true,
                    "diarizationMinSpeakers": 1,
                    "diarizationMaxSpeakers": 2
                  }
                }
            })
            ack(ws, msgid, app)
        } else if (wsData.type === 'verb:hook') {
            if(wsData?.data?.speech?.alternatives) {
                let callObj = calls.get(call_sid);
                //console.log("callObj", callObj)
                let transcript = wsData?.data?.speech?.alternatives[0].transcript
                callObj.socket.emit('transcript', transcript)
                logger.info(`Transcript ${call_sid}: ${transcript}`);
                wsLogger.info(`Transcript ${call_sid}: ${transcript}`);
            }
            const app = new WebhookResponse();
            ack(ws, msgid, app)
        } else if (wsData.type === 'session:reconnect') {
        }
    })
})

expressApp.post('/createCall', (req, res) => {
    let applicationSId = process.env.JAMBONZ_APPLICATION_SID;
    let callHookURL = process.env.CALL_HOOK_BASE_URL + '/confirm';
    let callStatusHookURL = process.env.CALL_HOOK_BASE_URL + '/status';
    let fromNumber = '10006';
    let toBody = req.body;
  
    let dialRequestBody = {
      "application_sid": applicationSId,
      "call_hook": {
        "url": callHookURL,
        "method": "POST"
      },
      "call_status_hook": {
        "url": callStatusHookURL,
        "method": "POST"
      },
      "from": fromNumber,
      "timeout": 60,
      "tag": {
        "callCount": 10
      },
      "to": toBody
    }
    let url = `${process.env.JAMBONZ_REST_API_BASE_URL}/Accounts/${process.env.JAMBONZ_ACCOUNT_SID}/Calls`
    return request({
      url: url,
      method: 'POST',
      headers: getHeaderFields(),
      json: true,
      body: dialRequestBody
    }, function (error, response, body) {
      if (error) {
        console.error(`Error in calling with dial is ${error}`)
      }
      task = "I want to do language test";
      res.json(response.body)
    });
})

function getHeaderFields() {
    var headerFields = {
        'content-type': "application/json"
    };
    headerFields["Authorization"] = "Bearer " + process.env.JAMBONZ_API_KEY;
    return headerFields;
}
module.exports = {};
