//TODO Polish, high score
//LONG TERM Polish high score
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
    sessionAttributes.arrayAmount= 6;
    sessionAttributes.gameState= 'ongoing';
    sessionAttributes.correctRandomNum= 0;
    sessionAttributes.stateDetermine= false;

     //sets the default list to 5 numbers and score to 0
     attributesManager.setSessionAttributes(sessionAttributes);

     const startPrompt= 'Greetings, staff volunteer, and welcome to the Counter Society!'
     + 'Today, we will facilitate a memory test, where a list of integer numbers will be read off to you.'
     + ' Your job is to say, yes, or , no, depending if a given number was in that list , . Ready , ? Begin! ' + stringArray(handlerInput);

    const reprompt = ' , If you need help deciding, some volunteers flip a coin in desperation. ';

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
    const speechOutput = 'Again, respond with ,yes, or ,no, depending if the given number was in that list , . '
    +' If you need help deciding, you could always flip a coin, as testing protocols prevents us from repeating the list.';
    const reprompt = ' Heads for yes, tails for no.';

    return handlerInput.responseBuilder
    .speak(speechOutput)
    .reprompt(reprompt)
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
        var restartPrompt = ' That is the spirit! Let us begin. ';
        var reprompt = 'Say, yes or no, depending if the given number was in that list.'
        +' ,If you need help, some volunteers like to visualize the numbers.';

        sessionAttributes.gameState= 'ongoing';
        sessionAttributes.score = 0;
        sessionAttributes.arrayAmount = 6;

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
       var exitPrompt = ' The test has concluded. Come back anytime, for another Counter experiment!';

      return handlerInput.responseBuilder
        .speak(exitPrompt)
        .getResponse();
    }
    else{
      return checkAnswer(handlerInput, answer);
    }

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
    .speak(' Leaving so soon? Thank you for participating in the Counter experiment. ')
    .getResponse();
  },
};


//as of 2018, only works in english united states? This catch all is not working currently WHY AMAZON.
// Unhandled intents get pushed to some sort of default fallback prebuilt by amazon so no custom message appears?
const FallbackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
      const respondSpeech = ' Sorry but all I can understand is yes and no. Please say yes or no if the number was on the list';
      return handlerInput.responseBuilder
        .speak(respondSpeech)
        .reprompt(respondSpeech)
        .getResponse();
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

const ErrorHandler = {
  canHandle() {
      return true;
  },
  handle(handlerInput, error) {
    console.log('Error handled: ${error.message}');

    const respondSpeech = ' Sorry but all I can understand is yes and no. Please say yes or no if the number was on the list';
    return handlerInput.responseBuilder
    .speak(respondSpeech)
    .reprompt(respondSpeech)
    .getResponse();
  },
};

//makes a string output and creates a correct number value
function stringArray (handlerInput){
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

  var questions = []; 
  var outputString= '';
  //range of possible output numbers in the array are the max and min
  const max = 19;
  const min=0;

  //this is randomizer and target value between 0 and max number 
  const random = Math.floor(Math.random() * ((max-min)+1) + min);
  sessionAttributes.correctRandomNum = random;

    for (let i = 0; i < sessionAttributes.arrayAmount-1; i++) {
        //puts random values into a question String
        questions[i] = Math.floor(Math.random() * ((max-min)+1) + min);
        outputString = outputString + '<break time=".6s"/>' +  '<emphasis level="reduced"> '+ questions[i] +'</emphasis>';
      } 

    //when the user score reaches every 4rd round add one random big integer at the end of the array
    if(sessionAttributes.score % 5 == 0 && sessionAttributes.score != 0){
      var trollArray = [321, 123 ,432 ,234];
      var troll = randomizedStrings(trollArray);
      questions.push(troll);
      outputString = outputString + '<break time=".6s"/>' +  '<emphasis level="reduced"> '+ troll +'</emphasis>';
    }

    //checks if the random number was in the list or not
    if(questions.includes(random)){
      sessionAttributes.stateDetermine = true;
    }else{
      sessionAttributes.stateDetermine = false;
    }

    outputString = outputString + '<break time="1.2s"/>' + ' Was the number ' + random + ' in the list?';
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
  var correctArray = [' bingo. ',' booya.',' bravo.' , ' hurray. ' , ' eureka. ', ' well done. ',' Wowzer. '];
  var rightArray = [' I am so proud. ',' Killing spree. ',' You nailed it. ', ' Plus one genius points. ' , ' Another one bites the dust. ' , ' Play of the game. ', ' What a legend. '];

  var failArray = [' le sigh. ',' aw man. ' , ' blast. ' , ' oof. ' , ' wah wah. '];
  var redoArray = [' Would you like to redo the test?',' Would you like to improve your score? ', ' Do you want to retry? ' , ' Want to restart the test? '];

  if(answer == sessionAttributes.stateDetermine && sessionAttributes.gameState === 'ongoing'){
        //means the user answer is correct and the game is not over aka they will continue to the next round
        var congratzPrompt = '<say-as interpret-as="interjection"> ' +  randomizedStrings(correctArray)  + '</say-as>' 
        + randomizedStrings(rightArray)+ ' . Next round.  <break time=".5s"/>'
        var reprompt = ' Say yes or no depending if the given number was in that list.'
        +' If you need help, some volunteers like to focus on where the concept of numbers came from.';

        sessionAttributes.score = sessionAttributes.score + 1;

        if(sessionAttributes.score % 2 == 0 && sessionAttributes.score != 0 && sessionAttributes.arrayAmount != 7){
          sessionAttributes.arrayAmount = sessionAttributes.arrayAmount + 1 ;
        }

        return handlerInput.responseBuilder
        .speak(congratzPrompt + stringArray(handlerInput))
        .reprompt(reprompt)
        .getResponse();
      }
      else{
         //means the user is false and the  and the game is ongoing 
        var correctNum = sessionAttributes.correctRandomNum;
        var defaultRank = ' . , Unfortunately, your memory is, below the minimum baseline. But, I am sure there is room for improvement. '; //user got a score less than 3
        var sadPrompt = '<say-as interpret-as="interjection"> ' + randomizedStrings(failArray) + '</say-as>' 
        + ' Sorry. But , ' + correctNum + ', was not in the list. Your score results are in, you scored a , '; //user said yes and they are wrong
        var reprompt = ' Say yes or no if you want to play again.';
        sessionAttributes.gameState = 'ended';

        //congradulatory message based on what score the user got
        if(sessionAttributes.score >= 18){
           defaultRank = ' . , <say-as interpret-as="interjection"> Oh my </say-as> . '
           + 'Most volunteers fail to reach this rank. You are a living legend among volunteers. ';
        }
        else if(sessionAttributes.score >= 12){
          defaultRank = ' . , <say-as interpret-as="interjection"> Wow </say-as> , you have a strong mental capacity.'
          +' You should be a professional, in the field of mathematics. ';
        }
        else if(sessionAttributes.score >= 8){
          defaultRank = ' . , Impressive, either you are very good at guessing, or you have excellent memory. You have surpassed the commoner volunteer. ';
        }
        else if(sessionAttributes.score >= 5){
          defaultRank = ' . Congratulation , your memory is, just at the required baseline. Good job for being a commoner. ';
        }

        sadPrompt = sadPrompt + sessionAttributes.score + defaultRank + randomizedStrings(redoArray);

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
      YesIntentHandler,
      NoIntentHandler,
      ExitHandler,
      FallbackHandler,
      SessionEndedRequestHandler
      )
    .addErrorHandlers(ErrorHandler)
//.withTableName('')
//.withAutoCreateTable(true)
.lambda();
