var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
const URL_TOKEN = 'EAASQQkwQZAVMBABZBnfgFjogeccBPEbVrNnZCZCS4aFyJeFdnEj4ViRw03AZBnSfXPJ1v7aWeVZACvTZBF7BO7KgFFL3gBP7hILXv3n5cWwxrlHvJdpb7yY06PGKEqUb3Wgh5LYpfV51XEUIxGsjVKnnio5l7oiNtqDnFReF4bWDasDWBIVPG7R';
///////////////////////////////
app.use(bodyParser.json());
app.listen(3000, function() {
    console.log('El servidor se encuentra en el puerto 3000');
})
// GET Message Welcome
app.get('/', (req, res) => {
    res.send('Welcome');
});
// TOKEN CONFIRM
app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === 'test_token_say_hello') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Denied Access');
    }
});
// RECEIVE MESSAGE
app.post('/webhook', (req, res) => {
    let body = req.body;
    // console.log(body);
    if (body.object == 'page') {
        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
            if (webhook_event.message) {
                receiveMessage(webhook_event);
            }
        });
        res.sendStatus(200);
    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
});
//Receive Message
function receiveMessage(entry) {
    let senderId = entry.sender.id;
    let message = entry.message;
    evaluateMessage(senderId, message)
    // console.log(senderId);
    // console.log(message.text);
}
//Evaluate Message 
function evaluateMessage(senderId, message) {
    let response;
    if (message.text) {
        response = builStructureMessageText(message.text);
    } else if (message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = message.attachments[0].payload.url;
        // console.log(attachment_url);
        response = builStructureMessageAttachment(attachment_url);
    }
    callSendAPI(senderId, response);
}
//Build structure text message and evaluate
function builStructureMessageText(text) {
    let response = {
        "text": "---"
    }
    if (isContain(text, 'precio')) {
        response.text = `Curso JAVA: 48$, 
Curso Python: 68$,
Curso .Net: 38$,Curso Go: 42$,
Curso C#/C/C++: 78$,`;
    } else if (isContain(text, 'info')) {
        response.text = `Sé un app developer usando el lenguaje que mas te guste,disponemos de una gran variedad de cursos de desarrollo back-end para que seas un genio del desarrollo. Inicio de clases 20 de Setiembre 2020.`;
    } else {
        response.text = 'Gracias por escribirnos, Academia TEC le responderá en breve.';
    }
    return response;
}
//Build structure attachement message and reply same image
function builStructureMessageAttachment(attachment_url) {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "¿Esta imagen es correcta?",
                    "subtitle": "Presione Sí o No",
                    "image_url": attachment_url,
                    // "item_url",
                    "buttons": [{
                        "type": "postback",
                        "title": "Sí!",
                        "payload": "yes",
                    }, {
                        "type": "postback",
                        "title": "No!",
                        "payload": "no",
                    }],
                }]
            }
        }
    }
    return response;
}
//Send message to RECIPIENT(CLIENT)
function callSendAPI(senderId, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": senderId
        },
        "message": response
    }
    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": {
            "access_token": URL_TOKEN
        },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}
//search word in the message
function isContain(message, word) {
    return message.indexOf(word) > -1;
}