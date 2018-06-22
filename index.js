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

     const startPrompt= 'Greetings, staff volunteer, and welcome to the Counter institution!'
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

const ExitHandler = {
  canHandle(handlerInput) {
   const request = handlerInput.requestEnvelope.request;
   return request.type === 'IntentRequest'
   && (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
 },
 handle(handlerInput) {
  return handlerInput.responseBuilder
  .speak(' Leaving so soon? Thank you for participating, the Counter experiment. ')
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
      const respondSpeech = ' Sorry but all I can understand is yes and no. Please say yes or no if the number was on the list';
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
      .speak(' Sorry, I can\'t understand the command. Speak loud and clear.')
      .reprompt(' Sorry, I can\'t understand the command. Speak a bit louder and clearer.')
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
        outputString = outputString + '<break time="1.2s"/>' +  '<emphasis level="reduced"> '+ questions[i] +'</emphasis>';
      } 

    //when the user score reaches every 4rd round add one random big integer at the end of the array
    if(sessionAttributes.score % 4 == 0 && sessionAttributes.score != 0){
      var trollArray = [321, 123 ,432];
      var troll = randomizedStrings(trollArray);
      questions.push(troll);
      outputString = outputString + '<break time="1.2s"/>' +  '<emphasis level="reduced"> '+ troll +'</emphasis>';
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
  var correctArray = [' bingo',' booya',' bravo', 'fancy that'];
  var redoArray = [' Would you like to aim higher?',' Want to improve yourself? ', ' Do you want to retry? ' , ' Want to restart the test? '];

  if(answer == sessionAttributes.stateDetermine && sessionAttributes.gameState === 'ongoing'){
        //means the user answer is correct and the game is not over aka they will continue to the next round
        var congratzPrompt = ' Commencing validation, .' + '<say-as interpret-as="interjection"> ' +  randomizedStrings(correctArray) + '</say-as>' 
        + ' . Next round.  <break time=".5s"/>'
        var reprompt = ' Say yes or no depending if the given number was in that list.'
        +' If you need help, some volunteers like to focus on where the concept of numbers came from.';

        sessionAttributes.score = sessionAttributes.score + 1;
        sessionAttributes.arrayAmount = sessionAttributes.arrayAmount + 1 ;

        return handlerInput.responseBuilder
        .speak(congratzPrompt + stringArray(handlerInput))
        .reprompt(reprompt)
        .getResponse();
      }
      else{
        //means the user said no and the game is ongoing 
        var correctNum = sessionAttributes.correctRandomNum;
        var defaultRank = 'NaN';
        var sadPrompt = 'NaN';
        var reprompt = ' Say yes or no if you want to play again.';
        sessionAttributes.gameState = 'ended';

        //congradulatory message based on what score the user got
        if(sessionAttributes.score <= 4){
          defaultRank = ' . , Unfortunately, your memory is, below the minimum baseline. But, I am sure there is room for improvement. ';
        }
        else if(sessionAttributes.score >= 18){
           defaultRank = ' . , <say-as interpret-as="interjection"> Oh my </say-as> . This is the end of the ranking system. '
           + 'You have the honor of reaching genius status, only few volunteers have made it this far. ';
        }
        else if(sessionAttributes.score >= 13){
          defaultRank = ' . , <say-as interpret-as="interjection"> Wow </say-as> , you have a strong memory capacity.'
          +' Most volunteers fail to reach this rank. You are a living legend among volunteers. ';
        }
        else if(sessionAttributes.score >= 8){
          defaultRank = ' . , Impressive, either you are very good at guessing, or you have excellent memory. You have surpassed the common volunteer. ';
        }
        else if(sessionAttributes.score >= 4){
          defaultRank = ' . Congratulations, your memory is, just at the required baseline. Good job for being common . ';
        }

        //changes the correct num message
        if(answer == false ){
          //means they said no and are wrong
          sadPrompt = 'Sorry. But , ' + correctNum + ', was in the list. Your score results are in, you scored a , ';
        }
        else{
          //means they said yes and are wrong
          sadPrompt = 'Sorry. But , ' + correctNum + ', was not in the list. Your score results are in, you scored a , ';
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
