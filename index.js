var Botkit = require('botkit')
var express  = require('express')
var app      = express()

var bodyParser = require('body-parser');
app.use(bodyParser.json({
    limit: '50mb'
})); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
})); // to support URL-encoded bodies

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//TODO: Need to secure these incoming calls
app.get('/', function(request, response) {
  response.render('pages/index');
});

app.post('/slack/webhook', function(request, response) {
    console.log("POGI: " + request.body);
    response.send("pogi");
});

var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot({
    // reconnect to Slack RTM when connection goes bad
    retry: Infinity,
    debug: false
})

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
    console.log('Starting in single-team mode')
    controller.spawn({
            token: token
        }).startRTM(function(err, bot, payload) {
            if (err) {
                throw new Error(err)
            }

            console.log('Connected to Slack RTM')
        })
        // Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
    console.log('Starting in Beep Boop multi-team mode')
    require('beepboop-botkit').start(controller, {
        debug: true
    })
}

controller.on('bot_channel_join', function(bot, message) {
    bot.reply(message, "I'm here!")
})

controller.hears(['hello', 'hi'], ['direct_mention'], function(bot, message) {
    bot.reply(message, 'Hello.')
})

controller.hears(['hello', 'hi'], ['direct_message'], function(bot, message) {
    bot.reply(message, 'Hello.')
    bot.reply(message, 'It\'s nice to talk to you directly.')
})

controller.hears('.*', ['mention'], function(bot, message) {
    bot.reply(message, 'You really do care about me. :heart:')
})

controller.hears('help', ['direct_message', 'direct_mention'], function(bot, message) {
    var help = 'I will respond to the following messages: \n' +
        '`bot hi` for a simple message.\n' +
        '`bot attachment` to see a Slack attachment message.\n' +
        '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
        '`bot help` to see this again.'
    bot.reply(message, help)
})

controller.hears(['attachment'], ['direct_message', 'direct_mention'], function(bot, message) {

    var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
    var attachments = [{
        fallback: text,
        pretext: 'We bring bots to life. :sunglasses: :thumbsup:',
        title: 'Host, deploy and share your bot in seconds.',
        image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
        title_link: 'https://beepboophq.com/',
        text: text,
        color: '#7CD197'
    }]

    bot.reply(message, {
        attachments: attachments
    }, function(err, resp) {
        console.log(err, resp)
    })
})

controller.hears(['comic'], ['direct_message', 'direct_mention'], function(bot, message) {
    var text = 'New comic book alert!'
    var attachments = [
        {
            "title": "The Further Adventures of Slackbot",
            "fields": [
                {
                    "title": "Volume",
                    "value": "1",
                    "short": true
                },
                {
                    "title": "Issue",
                    "value": "3",
            "short": true
                }
            ],
            "author_name": "Stanford S. Strickland",
            "author_icon": "https://api.slack.com/img/api/homepage_custom_integrations-2x.png",
            "image_url": "http://i.imgur.com/OJkaVOI.jpg?1"
        },
        {
            "title": "Synopsis",
            "text": "After @episod pushed exciting changes to a devious new branch back in Issue 1, Slackbot notifies @don about an unexpected deploy..."
        },
        {
            "fallback": "Would you recommend it to customers?",
            "title": "Would you recommend it to customers?",
            "callback_id": "comic_1234_xyz",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "recommend",
                    "text": "Recommend",
                    "type": "button",
                    "value": "recommend"
                },
                {
                    "name": "no",
                    "text": "No",
                    "type": "button",
                    "value": "bad"
                }
            ]
        }
    ]

    bot.reply(message, {
        attachments: attachments
    }, function(err, resp) {
        console.log(err, resp)
    })
})

controller.hears(['approval02'], ['direct_message', 'direct_mention'], function(bot, message) {
    //var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
    var attachments = [{
        "pretext": "*John Agan* has *3* outstanding reports for your review.",
        "mrkdwn_in": ["text", "pretext"],
        "color": "#2ab27b",
        "fields": [{
            "title": "Report Name",
            "value": "Trip to Seattle",
            "short": true
        }, {
            "title": "Date",
            "value": "7/1/2016",
            "short": true
        }, {
            "title": "Amount",
            "value": "$9,000.00",
            "short": true
        }, {
            "value": ":white_check_mark: Approved"

        }]
    }, {
        "fallback" : "Fallback test",
        "callback_id" : "approval_02",
        "fields": [{
            "title": "Report Name",
            "value": "Trip to Seattle",
            "short": true
        }, {
            "title": "Date",
            "value": "7/1/2016",
            "short": true
        }, {
            "title": "Amount",
            "value": "$9,000.00",
            "short": true
        }, {
            "title": "Status",
            "value": "Pending Review",
            "short": true
        }],
        "actions": [{
            "name": "Approve",
            "text": "Approve",
            "type": "button",
            "style": "primary",
            "value": "approve"
        }, {
            "name": "Reject",
            "text": "Reject",
            "type": "button",
            "style": "danger",
            "value": "Reject"
        }]
    }, {
        "fields": [{
            "title": "Report Name",
            "value": "Trip to Seattle",
            "short": true
        }, {
            "title": "Date",
            "value": "7/1/2016",
            "short": true
        }, {
            "title": "Amount",
            "value": "$9,000.00",
            "short": true
        }, {
            "title": "Status",
            "value": "Pending Review",
            "short": true
        }],
        "actions": [{
            "name": "Approve",
            "text": "Approve",
            "type": "button",
            "style": "primary",
            "value": "approve"
        }, {
            "name": "Reject",
            "text": "Reject",
            "type": "button",
            "style": "danger",
            "value": "Reject"
        }]
    }, {
        "text": "<https://concur.com|View In Concur>"
    }]

    bot.reply(message, {
        attachments: attachments
    }, function(err, resp) {
        console.log(err, resp)
    })
})

controller.hears('.*', ['direct_message', 'direct_mention'], function(bot, message) {
    bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
