//goal: Get alexa to say 3 random words from an array

const APP_ID = undefined;

const SKILL_NAME = 'Counter';

// here to
const Alexa = require('alexa-sdk');
exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID // APP_ID is your skill id which can be found in the Amazon developer console where you create the skill.
    alexa.registerHandlers(newSessionHandlers, gameHandlers);
    alexa.execute();
};
//here is required by alexa sdk to import and export


const states = {
    GAMEMODE: '_GAMEMODE'  // Prompt the user to start or restart the game.
};

const GAME_LENGTH= 3;
const NUMS_GIVEN = 3;


const newSessionHandlers = {

    'NewSession': function () {

        //array for the 3 selected numbers
        var questions = []; 

        //this is randomizer and target value between 0 and 2 (for index values)
        this.attributes["guess"] = Math.floor(Math.random() * 2) + 0;
        var correct = this.attributes.guess;

        for (let i = 0; i < NUMS_GIVEN; i++) {
        //x and y is the range
        const x=0;
        const y=100;
        //puts random values into question
        questions[i]= Math.floor(Math.random() * ((y-x)+1) + x);
        }


        this.handler.state = states.GAMEMODE;  //goes to the next state

        this.response.speak('Welcome to Counter! Simply say the position of each given number, Ready? GO! ....' 
           +  questions[0] + '.........................................................................' +questions[1]+'.....'+questions[2]+ '.....'+ ' What was the number at ' + questions[correct] + '?')
            .listen('What was the number at ' + questions[correct] + '?');
            this.emit(':responseReady');
            
    },

    'AMAZON.HelpIntent': function () {    
        this.emit(':tell',
         'Just say the position of each given number. Example '+ 
         '...23...43...9...'+
         'What was the position of 23?'+
         '...1'+
         '...Correct!');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak( 'Catch ya later!');
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
       this.response.speak('Bye!');
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.response.speak( 'Bye!');
         this.emit(':responseReady');
    },
};


const gameHandlers = Alexa.CreateStateHandler(states.GAMEMODE, {
 /*    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Uses the handler in newSessionHandlers
    },
*/
   'userinputintent': function() {

    //parse the number from the intent slots using base 10
    //var guessPosition = parseInt(this.event.request.intent.slots.numberin, 10);
    var guessPosition = this.event.request.intent.slots.numberin.value;
    var correct = this.attributes["guess"];

    
    if (guessPosition == correct){

        this.response.speak('TESTING! RIGHT' + correct);
        this.emit(':responseReady');
    }
    else{
        this.response.speak('WRONG! Want to restart the game idiot?' + correct+ guessPosition);
        this.emit(':responseReady');
    }


    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('Rate this app in the Alexa skills store, and catch ya later!');
        this.emit(':responseReady');

    },
    'AMAZON.StopIntent': function () {
       this.response.speak('Rate this app in the Alexa skills store, and catch ya later!');
        this.emit(':responseReady');

    },
     'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.response.speak( 'Bye!');
        this.emit(':responseReady');

    },

 'Unhandled': function() {
        console.log("UNHANDLED");
        this.response.speak('Sorry, I didn\'t get that. Try saying a number.')
        .listen('Try saying a number.');
        this.emit(':responseReady');
    }
});
