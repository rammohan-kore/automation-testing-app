const Server = require("socket.io").Server;
const createServer = require("http").createServer;
const httpServer = createServer();
require('dotenv').config()
const request = require('request')
const calls = require('./utils').calls;
const {WebhookResponse} = require('@jambonz/node-client');
const { ack } = require('./ack');

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
  console.log(`**** SmartAssist Test Server Started  on port ${port} ****`)
});

socketServer.on("connection", (socket) => {
    // console.log("socket connection established");
    socket.on("set_test_name", (data) => {
        // console.log(`inside set_test_name ${JSON.stringify(data)}`)
        testName = data.testName;    
    })
    socket.on("say", (data) => {
        let call_sid = data.call_sid;
        let callObj = calls.get(call_sid);

        console.log("Say:", data.text)
        const app = new WebhookResponse();
        app.say({
            "text" : data.text
        })
        //ack(callObj.savgSocket, callObj.msgid, app)
        //callObj.savgSocket.send(JSON.stringify(app))
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

        const app = new WebhookResponse();
        app.hangup();
        const msg = {
            type: 'command',
            command:'redirect',
            queueCommand:false,
            data: app.toJSON()
        };
        callObj.savgSocket.send(JSON.stringify(msg))
        //ack(callObj.savgSocket, callObj.msgid, app)
        
    })
    socket.on("create_call", (data) => {
        let applicationSId = config.JAMBONZ_APPLICATION_SID;
        let callHookURL = config.CALL_HOOK_BASE_URL + '/confirm';
        let callStatusHookURL = config.CALL_HOOK_BASE_URL + '/confirm';
        let fromNumber = data.fromNumber;
        let toBody = data.toBody;
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
            // console.log("body=====", body)
            let callObj = calls.get(body.sid) || {};
            callObj.socket = socket;
            callObj.call_sid = body.sid;
            calls.set(body.sid, callObj)
            socket.emit("call", body);
            if (error) {
                console.error(`Error in calling with dial is ${error}`)
            }
        });
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