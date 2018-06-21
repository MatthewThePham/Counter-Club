//TODO Maybe after 3 rounds, start adding random words?
//LONG TERM Polish, sound effects, high score
//counter alexa application
'use strict';
const Alexa = require('ask-sdk-core');

//starts the app from this handler
const LaunchRequestHandler = {
  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput){
    const attributesManager  = handlerInput.attributesManager;

    const sessionAttributes = {};

    sessionAttributes.score= 0;
    sessionAttributes.arrayAmount= 5;
    sessionAttributes.gameState= 'ongoing';
    sessionAttributes.correctRandomNum= 0;
    sessionAttributes.stateDetermine= false;

     //sets the default list to 5 numbers and score to 0
     attributesManager.setSessionAttributes(sessionAttributes);

     const startPrompt= 'Hello fellow human, and welcome to Counter! This is a memory test, where a list of integer numbers will be given to you.'
     + ' Your job is to say yes or no, depending if the number was in that list. Ready? Begin! ' + stringArray(handlerInput);

    const reprompt = 'If you need help deciding, you could always flip a quarter.';

     return handlerInput.responseBuilder
     .speak(startPrompt)
     .reprompt(reprompt)
     .getResponse();
   },
 };

 const HelpIntentHandler = {
  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechOutput = 'Please repond with ,yes or no, depending if the given number was in that list.'
    +'If you need help deciding, you could always flip a nickle. Heads for yes, tails for no.';
    const reprompt = 'I would recommend the coinflip.';

    return handlerInput.responseBuilder
    .speak(speechOutput)
    .reprompt(reprompt)
    .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
   const request = handlerInput.requestEnvelope.request;
   return request.type === 'IntentRequest'
   && (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
 },
 handle(handlerInput) {
  return handlerInput.responseBuilder
  .speak('Taking an early leave? See you next time.')
  .getResponse();
},
};

const YesIntentHandler = {
  canHandle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput){
   const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
   const answer = true;

   if(sessionAttributes.gameState != 'ongoing'){
        //means the user said yes and the game is over aka they want to restart the game
        var restartPrompt = 'New round, new me. Begin! ';
        var reprompt = 'Say, yes or no, depending if the given number was in that list.'
        +',If you need help, try flipping a coin?';

        sessionAttributes.gameState= 'ongoing';
        sessionAttributes.score = 0;
        sessionAttributes.arrayAmount = 5;

        return handlerInput.responseBuilder
        .speak(restartPrompt+ stringArray(handlerInput))
        .reprompt(reprompt)
        .getResponse();
      }
      else{
        return checkAnswer(handlerInput, answer);
      }

    },
  };

  const NoIntentHandler = {
    canHandle(handlerInput){
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput){
     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
     const answer = false;

     if(sessionAttributes.gameState != 'ongoing'){
        //means the user said no and the game is over aka they want to end the game
        var exitPrompt = ' The test has concluded. I hope I will see you next time!';

        return handlerInput.responseBuilder
        .speak(exitPrompt)
        .getResponse();
      }
      else{
        return checkAnswer(handlerInput, answer);
      }


    },
  };

  const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
      console.log('Session ended with ${handlerInput.requestEnvelope.request.reason}');
      return handlerInput.responseBuilder.getResponse();
    },
  };

  const UnhandledIntentHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput) {
      const respondSpeech = 'Sorry but all I can understand is yes and no. Please say yes or no if the number was on the list';
      return handlerInput.responseBuilder
      .speak(respondSpeech)
      .reprompt(respondSpeech)
      .getResponse();
    },
  };

  const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log('Error handled: ${error.message}');

      return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Speak loud and clear.')
      .reprompt('Sorry, I can\'t understand the command. Speak a bit louder and clearer.')
      .getResponse();
    },
  };



//makes a string output and creates a correct number value
function stringArray (handlerInput){
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

  var questions = []; 
  var outputString= '';
  const NUMS_GIVEN = 20;

    //this is randomizer and target value between 0 and max number * 2 
    const random = Math.floor(Math.random() * (NUMS_GIVEN-1) + 1);
    sessionAttributes.correctRandomNum = random;

    for (let i = 0; i < sessionAttributes.arrayAmount; i++) {
        //x and y is the range
        const x=0; const y=20;

        //puts random values into a question String
        questions[i]= Math.floor(Math.random() * ((y-x)+1) + x);
        outputString= outputString + '<break time=".4s"/>' +  '<emphasis level="reduced"> '+ questions[i] +'</emphasis>';
      } 

    //checks if the random number was in the list or not
    if(questions.includes(random)){
      sessionAttributes.stateDetermine = true;
    }else{
      sessionAttributes.stateDetermine = false;
    }

    outputString = outputString + '<break time=".7s"/>' + ' Was the number ' + random + ' in the list?';
    return outputString;
  }

//randomizes some string phrases
function randomizedStrings(stringArray){
  var randomString =  stringArray[Math.floor(Math.random()*stringArray.length)];
  return randomString;
}

 //sees if user answer is correct or not and the game is ongoing
 function checkAnswer(handlerInput, answer) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  var correctArray = ['bingo','booya','bravo'];
  var redoArray = ['Would you like to regain your honor?','Want to redeem yourself?', 'Want to retry?'];

  if(answer == sessionAttributes.stateDetermine && sessionAttributes.gameState === 'ongoing'){
        //means the user answer is correct and the game is not over aka they will continue to the next round
        var congratzPrompt = '<say-as interpret-as="interjection"> ' +  randomizedStrings(correctArray) + '</say-as>' + '! Nice one. Next round.'
        var reprompt = 'Say yes or no depending if the given number was in that list.'
        +'If you need help, try flipping a coin?';

        sessionAttributes.score = sessionAttributes.score + 1;
        sessionAttributes.arrayAmount = sessionAttributes.arrayAmount + 1 ;

        return handlerInput.responseBuilder
        .speak(congratzPrompt + stringArray(handlerInput))
        .reprompt(reprompt)
        .getResponse();
      }
      else{
        //means the user said no and the game is ongoing 
        var correctNum= sessionAttributes.correctRandomNum;

        var sadPrompt = 'Oh Shucks. The correct number was actually' + correctNum + '. The results are in, you scored a ' 
        + sessionAttributes.score +' . ' + randomizedStrings(redoArray);
        var reprompt = 'Say yes or no if you want to play again.';

        sessionAttributes.gameState = 'ended';

        return handlerInput.responseBuilder
        .speak(sadPrompt)
        .reprompt(reprompt)
        .getResponse();
      }
    }


    const skillBuilder = Alexa.SkillBuilders.custom();

    exports.handler = skillBuilder
    .addRequestHandlers(
      LaunchRequestHandler,
      HelpIntentHandler,
      ExitHandler,
      YesIntentHandler,
      NoIntentHandler,
      SessionEndedRequestHandler,
      UnhandledIntentHandler
      )
    .addErrorHandlers(ErrorHandler)
//.withTableName('')
//.withAutoCreateTable(true)
.lambda();
