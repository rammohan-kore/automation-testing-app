const Server = require("socket.io").Server;
const createServer = require("http").createServer;
const httpServer = createServer();
require('dotenv').config()
const request = require('request')
const calls = require('./utils').calls;
const {WebhookResponse} = require('@jambonz/node-client');
const { ack } = require('./ack');
const logger = require('./logger').wsLogger;

const config = process.env;
let testName = config.TEST_NAME;
const socketServer = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  path:'/avt-server/socket.io/'
});
const port = config.WEB_SOCKET_SERVER_PORT;
httpServer.listen(port, () => {
  logger.info(`**** SmartAssist Test Server Started  on port ${port} ****`)
});

socketServer.on("connection", (socket) => {
    logger.info("New connection received for ws test server")
    socket.on("set_test_name", (data) => {
        logger.info(`setting test name: ${JSON.stringify(data)}`)
        testName = data.testName;    
    })
    socket.on("say", (data) => {
        let call_sid = data.call_sid;
        let callObj = calls.get(call_sid);

        logger.info(`Say ${call_sid}: ${data.text}`)
        const app = new WebhookResponse();
        app.say({
            "text" : data.text
        })
        const msg = {
            type: 'command',
            command:'redirect',
            queueCommand:false,
            data: app.toJSON()
        };
        callObj.savgSocket.send(JSON.stringify(msg))


    })
    socket.on("end_call", (data) => {
        let call_sid = data.call_sid;
        let callObj = calls.get(call_sid);
        logger.info(`end_call ${data.call_sid}`)

        const app = new WebhookResponse();
        app.hangup();
        const msg = {
            type: 'command',
            command:'redirect',
            queueCommand:false,
            data: app.toJSON()
        };
        callObj.savgSocket.send(JSON.stringify(msg))
    })
    socket.on("create_call", (data) => {
        let applicationSId = config.JAMBONZ_APPLICATION_SID;
        let callHookURL = config.CALL_HOOK_BASE_URL + '/confirm';
        let callStatusHookURL = config.CALL_HOOK_BASE_URL + '/confirm';
        let fromNumber = data.fromNumber;
        let toBody = data.toBody;
        logger.info(`create_call: ${fromNumber}, toBody: ${toBody}`)
        // console.log(`fromNumber: ${fromNumber}, toBody: ${toBody}`)
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
            "callCount": 1
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
            let callObj = calls.get(body.sid) || {};
            callObj.socket = socket;
            callObj.call_sid = body.sid;
            calls.set(body.sid, callObj)
            logger.info(`call created with sid: ${callObj.call_sid}`)
            socket.emit("call", body);
            if (error) {
                logger.error(`Error in calling with dial is ${error}`)
            }
        });
    })
    socket.on("dtmf", (data) => {
        let call_sid = data.call_sid;
        let callObj = calls.get(call_sid);

        logger.info(`DTMF ${call_sid}: ${data.text}`)
        const app = new WebhookResponse();
        app.dtmf({
            "dtmf" : data.text,
            "duration" : 500
        })
        const msg = {
            type: 'command',
            command:'redirect',
            queueCommand:false,
            data: app.toJSON()
        };
        callObj.savgSocket.send(JSON.stringify(msg))


    })
})
function getHeaderFields() {
    var headerFields = {
        'content-type': "application/json"
    };
    headerFields["Authorization"] = "Bearer " + process.env.JAMBONZ_API_KEY;
    return headerFields;
}
module.exports = {};