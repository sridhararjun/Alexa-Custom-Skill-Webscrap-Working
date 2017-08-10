// require('dotenv').config();
// var AlexaSkill=require('AlexaSkill');

var request      = require('request');
var cheerio    =require('cheerio');
var AlexaSkill = require('./AlexaSkill');
var APP_ID     = '';
// , MTA_KEY    = process.env.MTA_KEY;

var url = function(shop,place){
  return 'http://directory.stokesentinel.co.uk/search/' + place + '/' + shop;
};

var getJsonResponse = function(shop,place, callback){
  // http.get(url(stopId), function(res){
  //   var body = '';

  //   res.on('data', function(data){
  //     body += data;
  //   });

  //   res.on('end', function(){
  //     var result = JSON.parse(body);
  //     callback(result);
  //   });

  // }).on('error', function(e){
  //   console.log('Error: ' + e);
  // });
  request(url(shop,place), function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $=cheerio.load(html);
      var sendBack=[];
      $('h2.ser-title').each(function(){
        var result = $(this);
        var resultShop={
          description:result.text().trim()
        };
        sendBack.push(resultShop);
       
      });
       callback(sendBack);
      // console.log(sendBack)

    }
    else{
      console.log(error);
    }
  });
};

var searchBusinessRequest = function(intent, session, response){
  getJsonResponse(intent.slots.shop.value,intent.slots.place.value, function(data){
    // if(data.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit){
    //   var text = data
    //   .Siri
    //   .ServiceDelivery
    //   .StopMonitoringDelivery[0]
    //   .MonitoredStopVisit[0]
    //   .MonitoredVehicleJourney
    //   .MonitoredCall
    //   .Extensions
    //   .Distances
    //   .PresentableDistance;
    //   var cardText = 'The next bus is: ' + text;
    // } else {
    //   var text = 'That bus stop does not exist.'
      var cardText = JSON.stringify(data);
    // }

    var heading = 'At: ' + intent.slots.place.value;
    response.tellWithCard(cardText, heading, cardText);
  });
};

var LocalBusiness = function(){
  AlexaSkill.call(this, APP_ID);
};

LocalBusiness.prototype = Object.create(AlexaSkill.prototype);
LocalBusiness.prototype.constructor = LocalBusiness;

LocalBusiness.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session){
  // What happens when the session starts? Optional
  console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
    + ", sessionId: " + session.sessionId);
};

LocalBusiness.prototype.eventHandlers.onLaunch = function(launchRequest, session, response){
  // This is when they launch the skill but don't specify what they want. Prompt
  // them for their bus stop
  var output = 'Welcome to LocalBusiness. ' +
  'Say the name of a shop and a place to get how far you are.';

  var reprompt = 'Which shop do you want to find more about?';

  response.ask(output, reprompt);

  console.log("onLaunch requestId: " + launchRequest.requestId
    + ", sessionId: " + session.sessionId);
};

LocalBusiness.prototype.intentHandlers = {
  SearchBusinessIntent: function(intent, session, response){
    searchBusinessRequest(intent, session, response);
  },

  HelpIntent: function(intent, session, response){
    var speechOutput = 'Get the shops near your place. ' +
    'Which shop would you like?';
    response.ask(speechOutput);
  }
};

exports.handler = function(event, context) {
  var skill = new LocalBusiness();
  skill.execute(event, context);
};
