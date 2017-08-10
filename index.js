// require('dotenv').config();
// var AlexaSkill=require('AlexaSkill');

var request      = require('request');
var cheerio    =require('cheerio');
var AlexaSkill = require('./AlexaSkill');
var APP_ID     = '';
var utils      =require('util');
// , MTA_KEY    = process.env.MTA_KEY;
var outputMessage="There are %d shops available at";
var url = function(shop,place){
  return 'http://directory.stokesentinel.co.uk/search/' + place + '/' + shop;
};

var getJsonResponse = function(shop,place, callback){

  request(url(shop,place), function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $=cheerio.load(html);
      var sendBack=new Array();
      $('h2.ser-title').each(function(){
        var result = $(this);
        var resultShop=result.text().trim();
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

    if(data.length>0){
      var voiceText = utils.format(outputMessage,data.length);
      var cardContent = voiceText+" "intent.slots.place.value+"\n Here are the first five.\n  1)"+data[0]+"\n  2)"+data[1]+"\n  3)"+data[2]+"\n  4)"+data[3]+"\n  5)"+data[4];
      voiceText    += " "+intent.slots.place.value+" I have sent you the details to your Alexa app  Here are the top five shops  The first is "+data[0]+"  The second is "+data[1]+"  The third is "+data[2]+"  The fourth is "+data[3]+"  The fifth shop is "+data[4];
      
    }
    else
    {
      voiceText  = "Sorry there are no shops available there.";
    }
    var heading = 'At: ' + intent.slots.place.value;
    response.tellWithCard(voiceText, heading, cardContent);
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
