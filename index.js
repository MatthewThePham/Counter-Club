//counter alexa application
const Alexa = require('ask-sdk');

//starts the app from this handler
const LaunchRequestHandler = {
    canHandle(handlerInput){
        const requestEnvelope =handlerInput.requestEnvelope;
        return requestEnvelope.session.new || requestEnvelope.request.type == 'LaunchRequestHandler';
    },
    handle(handlerInput){
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        //sets the default number of list to 5 and score to 0
        var sessionAttributes.score = 0;
        var sessionAttributes.arrayAmount =5;
        var sessionAttributes.gameState = 'ongoing'; 

        const startPrompt= 'Hello fellow human and welcome to Counter! A list complex integer numbers will be given to you.'
        + ' Your job is to say yes or no depending if the number was in that list. Begin!';

        return handlerInput.responseBuilder;
            .speak(startPrompt + stringArray());
            .getResponse();
    },
};

const YesIntentHandler = {
    canHandle(handlerInput){
        const request =handlerInput.requestEnvelope.request;
        return request.type == 'IntentRequest' && request.intent.name == 'AMAZON.YesIntent';
    },
    handle(handlerInput){
        var answer = true;
        checkAnswer(answer);
    },
}

const NoIntentHandler = {
    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
        return request.type == 'IntentRequest' && request.intent.name == 'AMAZON.YesIntent';
    },
    handle(handlerInput){
        var answer = false;
        checkAnswer(answer);
    },
}


const HelpIntentHandler = {
    canHandle(handerInput){
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
    const speechOutput = 'Say yes or no depending if the given number was in that list. No repeats.'
        +'If you need help, try flipping a coin?';
    const reprompt = 'I would recommend the coinflip.';

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
}

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
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Speak loud and clear.')
      .reprompt('Sorry, I can\'t understand the command. Speak a bit louder and clearer.')
      .getResponse();
  },
};


//makes a string output and creates a correct number value
function stringArray (){
    const sessionAttributes=handlerInput.attributesManager.getSessionAttributes();

    var questions = []; 
    var outputString= '';
    var NUMS_GIVEN =sessionAttributes.arrayAmount;
    var sessionAttributes.correctRandomNum= 0;
    var sessionAttributes.stateDetermine = false;

    //this is randomizer and target value between 0 and max number * 2 
    var random = Math.floor(Math.random() * (NUMS_GIVEN * 2)-1) + 0;
    sessionAttributes.correctRandomNum = random;

    for (let i = 0; i < NUMS_GIVEN; i++) {
        //x and y is the range
        const x=0; const y=100;

        //puts random values into a question String
        questions[i]= Math.floor(Math.random() * ((y-x)+1) + x);
        outputString= outputString + '<break time=".7s"/>' +  '<emphasis level="reduced"> '+ questions[i] +'</emphasis>';

        //checks if random was in the list or not and sets stateDetermine
        if(random == questions[i]){
            sessionAttributes.stateDetermine = true;
        }else{
            sessionAttributes.stateDetermine = false;
        }

    } 
    outputString = outputString +'Was the number ' + random + ' in the list?';
    return outputString;
}

 //sees if user answer is correct or not
function checkAnswer(answer) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    //sessionAttributes.gameState = 'ongoing'; 
    var isCorrect = sessionAttributes.stateDetermine;
    var score= sessionAttributes.score;
    var amount = sessionAttributes.arrayAmount;
    var state = sessionAttributes.gameState;

    else if(answer= true && state != 'ongoing'){
        //means the user said yes and the game is over aka they want to restart the game
        let restartPrompt = 'New round new me. Begin! ';

        score= 0;
        amount= 5;

        return handlerInput.responseBuilder
            .speak(restartPrompt+ stringArray());
            .getResponse();
    }
      else if(answer= false && state != 'ongoing'){
        //means the user said no and the game is over aka they want to restart the game
        const exitPrompt = 'Hey. See you next time!';

         return handlerInput.responseBuilder
            .speak(exitPrompt);
            .getResponse();
    }
    else if(answer == isCorrect && state = 'ongoing'){
        //means the user said yes and the game is not over aka they will continue to the next round
        const congratzPrompt = '<say-as interpret-as="interjection">booya! Nice one. </say-as>' + 'Next round.';

        score = score+1;
        amount = amount +1 ;

        return handlerInput.responseBuilder
            .speak(congratzPrompt + stringArray());
            .getResponse();
    }
    else{
        //means the user said no and the game is ongoing
        let correctNum= sessionAttributes.correctRandomNum;

        let sadPrompt = 'Oh Shucks. The correct number was actually' + correctNum + '. Your total score is ' 
        + score +'. Would you like to regain your honor?';
        const reprompt = 'A simple yes or no if you want to play again.';

        state = 'ended';

          return handlerInput.responseBuilder
            .speak(sadPrompt)
            .reprompt(reprompt)
            .getResponse();
    }
}

//need to edit this
const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    YesIntentHandler,
    NoIntentHandler,
    HelpIntentHandler,
    SessionEndedRequestHandler,
    UnhandledIntentHandler,
    ErrorHandler,
  )
  .addErrorHandlers(ErrorHandler)
//.withTableName('')
//.withAutoCreateTable(true)
  .lambda();