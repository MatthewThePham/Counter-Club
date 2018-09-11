  //load ask-sdk libraries
  const Alexa = require('ask-sdk');
  //string variables for if the user says something outside the intent model, IE they say something totally random.
  const FALLBACK_MESSAGE = ' Sorry , but yes , or no, is all I can understand. Please say ,yes ,or , no , . ';
  const FALLBACK_REPROMPT = ' Please say ,yes ,or , no , . ';

  const LaunchRequestHandler = {
      canHandle(handlerInput) {
          const request = handlerInput.requestEnvelope.request;
          //The 'LaunchRequest' request type will start the the skill from this handler
          return request.type === 'LaunchRequest';
      },
      async handle(handlerInput) {
        //Creates attributeManager to set session attributes. Session attributes are variables that exist throughout the skill's sesssion, aka when the user is still using the skill.
        //The session attribute variable will be gone after the user exits the skill, unless it is saved onto a database, making the data permanent.
        //In our skill, we will use DyamboDB for saving permanent user data. (Our skill saves the user's high score aka an Integer value to DyamboDB) 
        
          const attributesManager = handlerInput.attributesManager;
        //Using await attributesManager.getPersistentAttributes() is called to fetch the user's high score. If there is no high score, set the sessionAttributes to an empty array.
        //HINT, if you want to use await, you have to have async with it as well.
        //We use async/await to make sure the database data is properly fetched. Async will return a promise, and await pause the skill, and wait until the promise returns a value. 
          var sessionAttributes = await attributesManager.getPersistentAttributes() || {}; 
        
        //This is the default start prompt if the user has not played yet.
          var startPrompt = ' Welcome, have you come to gain wisdom? ' +
              ' Here at the Counter society, we improve our minds daily, by giving out memory exercises , where a list of numbers will be given to you.' +
              ' All you have to do is say, yes, or , no, depending if a given number was inside that list . I hope you are ready ,  as your exercise is about to begin! ';
          const reprompt = ' , If you need help deciding, just relax and let the numbers flow through you. ';

          //Sets the intial user score to zero if it is the first time the user has played, aka the sessionAttributes is set to an empty array.
          if (Object.keys(sessionAttributes).length === 0) { 
              sessionAttributes.highScore = 0;
          }
          
         //other sessionAttributes reset every time, that is not high score.
         //sets the default list to 5 numbers and current score to 0
         //POSSIBLE improvement? Instead of saving all sessionAttributes, you could just pinpoint one, such as sessionAttributes.highScore          
          sessionAttributes.score = 0; 
          sessionAttributes.arrayAmount = 6;
          sessionAttributes.gameState = 'ongoing';
          sessionAttributes.correctRandomNum = 0;
          sessionAttributes.stateDetermine = false;
          
          //sets all the sessionAttributes variables to attributesManager, which is a built in function from ask-sdk. 
          attributesManager.setSessionAttributes(sessionAttributes);

        //compares the high score values, depending on what the user got, they get a welcome message.
          if (sessionAttributes.highScore != 0) {
              var defaultRank = ' human infant. ';  //user got a score less than 3
              if (sessionAttributes.highScore >= 18) {
                  defaultRank = ' expert math genius. '
              } else if (sessionAttributes.highScore >= 12) {
                  defaultRank = ' low level math genius. ';
              } else if (sessionAttributes.highScore >= 8) {
                  defaultRank = ' math magician. ';
              } else if (sessionAttributes.highScore >= 5) {
                  defaultRank = ' common human. ';
              }
            
            //We will override the default start prompt if the user has earned a score.
              startPrompt = ' Welcome back, to the counter society. Your current benchmark is , ' + defaultRank +
                  ' , or a numbered ranking of ' + sessionAttributes.highScore.toString() + ' out of 18 genius points. ' + ' . Get ready , for another mind exercise! ';
          }

        //This will control what the Alexa skill says.
        //speak is what is said intially, reprompt is a repeat if the user has not responded in the last few seconds.
        //HINT, if reprompt() is not called, the session will end right after the speak. IE your skill will say what is the speak output, and exit not taking user input.
        //getResponse() will end the reponse builder call
          return handlerInput.responseBuilder
              .speak(startPrompt + stringArray(handlerInput))
              .reprompt(reprompt)
              .getResponse();
      },
  };

  const HelpIntentHandler = {
      canHandle(handlerInput) {
          const request = handlerInput.requestEnvelope.request;
          //The 'IntentRequest' request type will match what json inputs are listed for the intent name. 
          //In this case, we used a prebuilt in intent, called AMAZON.HelpIntent. You can tell, as it has the constant keyword AMAZON.
        
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
              
              //will exit the skill, as reprompt is not called.
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
        //Because there is no speak or reprompt, the handler will just end
          return handlerInput.responseBuilder.getResponse();
      },
  };

//This handler will catch user input that cannot be understood, or ones that do not match the given intents you made. 
//It will continue the skill, after saying the error message
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
  //Similiar to the error handler, but can be modified to have specific error messages based on what state it is in.
  const FallbackHandler = {
      canHandle(handlerInput) {
          const request = handlerInput.requestEnvelope.request;
          return request.type === 'IntentRequest' && request.intent.name == 'AMAZON.FallbackIntent';
      },
      handle(handlerInput) {
          return handlerInput.responseBuilder
              .speak(FALLBACK_MESSAGE)
              .reprompt(FALLBACK_REPROMPT)
              .getResponse();
      },
  };

  //HELPER FUNCTIONS
  //makes a string output and creates a correct number value
  function stringArray(handlerInput) {
      //gets the getSessionAttributes data
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
           //The '<break time=".6s"/>' is SSML, which allows for a more controlled pause, and '<emphasis level="reduced">' 
           //allows emphasis on certain words.
        
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
    //arrays allow for more random sayings to allow your skill to a little different each time.
      var correctArray = [' bingo. ', ' booya. ', ' bravo. ', ' hurray. ', ' eureka. ', ' well done. ', ' Wowzer. '];
      var rightArray = [' flawless round. ', ' Killing spree. ', ' You nailed it. ', ' Plus one genius point. ', ' Another one bites the dust. ', ' Play of the game. ', ' What a legend. '];
      var failArray = [' le sigh. ', ' aw man. ', ' blast. ', ' oof. ', ' wah wah. '];
      var redoArray = [' Would you like to redo the exercise?', ' Would you like to improve your score? ', ' Do you want to retry? ', ' Want to restart the exercise? '];

      if (answer == sessionAttributes.stateDetermine && sessionAttributes.gameState === 'ongoing') {
          //means the user answer is correct and the game is not over aka they will continue to the next round
          //<say-as interpret-as="interjection">  is more SSML used to add more personality when saying the word.
           //NOT ALL words are supported with interjection, could sound strange if the word is not supported.
        
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

        //sets the user high score to a dyamboDB table
        //handlerInput.attributesManager.setPersistentAttributes will set the newly updated high score from sessionAttributes.
        //savePersistentAttributes will update the dyamboDB table.
        
          if (sessionAttributes.score > sessionAttributes.highScore) {  
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

//puts the handlers into the skillBuilder to use in your skill.
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
    //'counter' is the DyamboDB table name that will be created. Make sure you allow for proper IAM permissions for lambda and dyamboDB.
    //withAutoCreateTable will create a new table for us, if a DB table called 'counter' is not made yet.
      .withTableName('counter')
      .withAutoCreateTable(true)
      .lambda();
