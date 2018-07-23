  //counter alexa application
  const Alexa = require('ask-sdk');
  const FALLBACK_MESSAGE = ' Sorry , but yes , or no, is all I can understand. Please say ,yes ,or , no , . ';
  const FALLBACK_REPROMPT = ' Please say ,yes ,or , no , . ';

  //starts the app from this handler
  const LaunchRequestHandler = {
      canHandle(handlerInput) {
          const request = handlerInput.requestEnvelope.request;
          return request.type === 'LaunchRequest';
      },
      async handle(handlerInput) {
          const attributesManager = handlerInput.attributesManager;
          var sessionAttributes = await attributesManager.getPersistentAttributes() || {};
          var startPrompt = ' Welcome, have you come to gain wisdom? ' +
              ' Here at the Counter society, we improve our minds daily, by giving out memory exercises , where a list of numbers will be given to you.' +
              ' All you have to do is say, yes, or , no, depending if a given number was inside that list . I hope you are ready ,  as your exercise is about to begin! ';
          const reprompt = ' , If you need help deciding, just relax and let the numbers flow through you. ';

          if (Object.keys(sessionAttributes).length === 0) { //sets the intial user score to zero 
              sessionAttributes.highScore = 0;
          }

          sessionAttributes.score = 0; //other sessionAttributes reset every time
          sessionAttributes.arrayAmount = 6;
          sessionAttributes.gameState = 'ongoing';
          sessionAttributes.correctRandomNum = 0;
          sessionAttributes.stateDetermine = false;

          //sets the default list to 5 numbers and score to 0
          attributesManager.setSessionAttributes(sessionAttributes);

          if (sessionAttributes.highScore != 0) {
              var defaultRank = ' human infant. '; //user got a score less than 3
              if (sessionAttributes.highScore >= 18) {
                  defaultRank = ' expert math genius. '
              } else if (sessionAttributes.highScore >= 12) {
                  defaultRank = ' low level math genius. ';
              } else if (sessionAttributes.highScore >= 8) {
                  defaultRank = ' math magician. ';
              } else if (sessionAttributes.highScore >= 5) {
                  defaultRank = ' common human. ';
              }

              startPrompt = ' Welcome back, to the counter society. Your current benchmark is , ' + defaultRank +
                  ' , or a numbered ranking of ' + sessionAttributes.highScore.toString() + ' out of 18 genius points. ' + ' . Get ready , for another mind exercise! ';
          }

          return handlerInput.responseBuilder
              .speak(startPrompt + stringArray(handlerInput))
              .reprompt(reprompt)
              .getResponse();
      },
  };

  const HelpIntentHandler = {
      canHandle(handlerInput) {
          const request = handlerInput.requestEnvelope.request;
          return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
      },
      handle(handlerInput) {
          const speechOutput = 'Again, respond with ,yes, or ,no, depending if the given number was in that list , . ' +
              ' If you need help deciding, you could always flip a coin. ';
          const reprompt = ' Heads for yes, tails for no.';

          return handlerInput.responseBuilder
              .speak(speechOutput)
              .reprompt(reprompt)
              .getResponse();
      },
  };

  const YesIntentHandler = {
      canHandle(handlerInput) {
          const request = handlerInput.requestEnvelope.request;
          return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
      },
      handle(handlerInput) {
          const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
          const answer = true;

          if (sessionAttributes.gameState != 'ongoing') {
              //means the user said yes and the game is over aka they want to restart the game
              var restartPrompt = ' That is the spirit! Let us begin. ';
              var reprompt = 'Say, yes or no, depending if the given number was in that list.' +
                  ' ,If you need help, some people like to visualize the numbers.';

              sessionAttributes.gameState = 'ongoing';
              sessionAttributes.score = 0;
              sessionAttributes.arrayAmount = 6;

              return handlerInput.responseBuilder
                  .speak(restartPrompt + stringArray(handlerInput))
                  .reprompt(reprompt)
                  .getResponse();
          } else {
              return checkAnswer(handlerInput, answer); //user answered and is in game
          }

      },
  };

  const NoIntentHandler = {
      canHandle(handlerInput) {
          const request = handlerInput.requestEnvelope.request;
          return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
      },
      handle(handlerInput) {
          const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
          const answer = false;

          if (sessionAttributes.gameState != 'ongoing') {
              //means the user said no and the game is over aka they want to end the game
              var exitPrompt = ' Your session has concluded. Come back anytime, for another Counter exercise!' 
              + '<say-as interpret-as="interjection"> ' + ' ta ta. ' + '</say-as>';

              return handlerInput.responseBuilder
                  .speak(exitPrompt)
                  .getResponse();
          } else {
              return checkAnswer(handlerInput, answer); //user answered and is in game
          }

      },
  };

  const ExitHandler = {
      canHandle(handlerInput) {
          const request = handlerInput.requestEnvelope.request;
          return request.type === 'IntentRequest' &&
              (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
      },
      handle(handlerInput) {
          return handlerInput.responseBuilder
              .speak(' Busy, are we? I hope we can resume our exercise, another time.')
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
          return handlerInput.responseBuilder
              .speak(FALLBACK_MESSAGE)
              .reprompt(FALLBACK_REPROMPT)
              .getResponse();
      },
  };

  //as of 2018, only works in english united states. For some reason needs a custom intent for it to work. The only reason why unhandled intent was made in the json intents.
  const FallbackHandler = {
      canHandle(handlerInput) {
          const request = handlerInput.requestEnvelope.request;
          return request.type === 'IntentRequest' && request.intent.name == 'AMAZON.FallbackIntent';
      },
      handle(handlerInput) {
          //const respondSpeech = ' Sorry but all I can understand is yes and no. Please say yes or no if the number was on the list';
          return handlerInput.responseBuilder
              .speak(FALLBACK_MESSAGE)
              .reprompt(FALLBACK_REPROMPT)
              .getResponse();
      },
  };

  //makes a string output and creates a correct number value
  function stringArray(handlerInput) {
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      var questions = [];
      var outputString = '';
      //range of possible output numbers in the array are the max and min
      const max = 19;
      const min = 0;

      //this is randomizer and target value between 0 and max number 
      const random = Math.floor(Math.random() * ((max - min) + 1) + min);
      sessionAttributes.correctRandomNum = random;

      for (let i = 0; i < sessionAttributes.arrayAmount - 1; i++) {
          //puts random values into a question String
          questions[i] = Math.floor(Math.random() * ((max - min) + 1) + min);
          outputString = outputString + '<break time=".6s"/>' + '<emphasis level="reduced"> ' + questions[i] + '</emphasis>';
      }

      //when the user score reaches every 5th round add one random big integer at the end of the array
      if (sessionAttributes.score % 5 == 0 && sessionAttributes.score != 0) {
          var trollArray = [321, 123, 432, 234];
          var troll = randomizedStrings(trollArray);
          questions.push(troll);
          outputString = outputString + '<break time=".6s"/>' + '<emphasis level="reduced"> ' + troll + '</emphasis>';
      }

      //checks if the random number was in the list or not
      if (questions.includes(random)) {
          sessionAttributes.stateDetermine = true;
      } else {
          sessionAttributes.stateDetermine = false;
      }

      outputString = outputString + '<break time="1.2s"/>' + ' Was the number ' + random + ' in the list?';
      return outputString;
  }

  //randomizes some string phrases
  function randomizedStrings(stringArray) {
      var randomString = stringArray[Math.floor(Math.random() * stringArray.length)];
      return randomString;
  }

  //sees if user answer is correct or not and the game is ongoing
  async function checkAnswer(handlerInput, answer) {
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      var correctArray = [' bingo. ', ' booya. ', ' bravo. ', ' hurray. ', ' eureka. ', ' well done. ', ' Wowzer. '];
      var rightArray = [' flawless round. ', ' Killing spree. ', ' You nailed it. ', ' Plus one genius point. ', ' Another one bites the dust. ', ' Play of the game. ', ' What a legend. '];
      var failArray = [' le sigh. ', ' aw man. ', ' blast. ', ' oof. ', ' wah wah. '];
      var redoArray = [' Would you like to redo the exercise?', ' Would you like to improve your score? ', ' Do you want to retry? ', ' Want to restart the exercise? '];

      if (answer == sessionAttributes.stateDetermine && sessionAttributes.gameState === 'ongoing') {
          //means the user answer is correct and the game is not over aka they will continue to the next round
          var congratzPrompt = '<say-as interpret-as="interjection"> ' + randomizedStrings(correctArray) + '</say-as>' +
              randomizedStrings(rightArray) + ' . Next round.  <break time=".5s"/>'
          var reprompt = ' Say yes or no depending if the given number was in that list.' +
              ' If you need help, some people like to focus on where the concept of numbers came from.';

          sessionAttributes.score = sessionAttributes.score + 1;

          //sets every other round increment, and capps the amount of numbers to 7 
          if (sessionAttributes.score % 3 == 0 && sessionAttributes.score != 0 && sessionAttributes.arrayAmount != 8) {
              sessionAttributes.arrayAmount = sessionAttributes.arrayAmount + 1;
          }

          return handlerInput.responseBuilder
              .speak(congratzPrompt + stringArray(handlerInput))
              .reprompt(reprompt)
              .getResponse();
      } else {
          //means the user is wrong and the end has ended 
          var correctNum = sessionAttributes.correctRandomNum;
          var defaultRank = ' . , Unfortunately, your memory is, below the minimum baseline. But, I am sure there is room for improvement. '; //user got a score less than 3
          var sadPrompt = '<say-as interpret-as="interjection"> ' + randomizedStrings(failArray) + '</say-as>' +
              ' Sorry. But , ' + correctNum;
          var reprompt = ' Say yes or no if you want to play again.';

          if (sessionAttributes.score > sessionAttributes.highScore) {  //sets the user high score
              sessionAttributes.highScore = sessionAttributes.score;

              await handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);
              handlerInput.attributesManager.savePersistentAttributes();
          }

          sessionAttributes.gameState = 'ended'; //ends the game

          if (answer === false) { //if the user said no, meaning it was in the list
              sadPrompt = sadPrompt + ', was inside of the list. Your score results are in, you scored a , ';
          } else {
              sadPrompt = sadPrompt + ', was not in the list. Your score results are in, you scored a , '; //user said yes and it was not in the list
          }

          //congradulatory message based on what score the user got
          if (sessionAttributes.score >= 18) {
              defaultRank = ' . , <say-as interpret-as="interjection"> Oh my </say-as> . ' +
                  ' Most people fail to reach this far. You are a living legend among humans. ';
          } else if (sessionAttributes.score >= 12) {
              defaultRank = ' . , <say-as interpret-as="interjection"> Wow </say-as> , you have a strong mental capacity.' +
                  ' You should be a professional, in the field of numerology. ';
          } else if (sessionAttributes.score >= 8) {
              defaultRank = ' . , Impressive, either you are very good at guessing, or you have excellent memory. ';
          } else if (sessionAttributes.score >= 5) {
              defaultRank = ' . Congratulation , your memory is, just at the required baseline. Good job for being a commoner. ';
          }

          sadPrompt = sadPrompt + sessionAttributes.score + defaultRank + randomizedStrings(redoArray);

          return handlerInput.responseBuilder
              .speak(sadPrompt)
              .reprompt(reprompt)
              .getResponse();
      }
  }
  //needed for DyamboDB
  const skillBuilder = Alexa.SkillBuilders.standard();

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
      .withTableName('counter')
      .withAutoCreateTable(true)
      .lambda();