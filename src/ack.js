const { WebhookResponse } = require('@jambonz/node-client');

function ack(ws, msgid, res) {
    if (res) {
        res = res instanceof WebhookResponse ? res.toJSON() : res;
    }
    let msg = {
        type: 'ack',
        msgid
    };
    if (res) msg = { ...msg, data: res };
    ws.send(JSON.stringify(msg));
}
exports.ack = ack;
