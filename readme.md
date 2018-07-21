# Remember This! - Number based memory game.

This is an Alexa skill tests your memory by reading out a random list of numbers and then asks you if a certain number was in that list.

 * __Features__
 		* High score with Dynamodb.
        * Added Speechcon for personality.
        * Fallback handler for unhandled user input.

### Live example
To try a live example of this skill, you can enable the [Remember This!](https://www.amazon.com/NotMatt-Counter-Club/dp/B07FNK6TR8/ref=sr_1_1?s=digital-skills&ie=UTF8&qid=1532144294&sr=1-1&keywords=counter+club). Just say: `Alexa, enable Remember This` and then `Alexa, open Remember This`.

### Development of skill

This skill uses the [Alexa Skills Kit SDK 2.0 for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs) and also [Amazon Dynamodb](https://aws.amazon.com/dynamodb/) for storing user high score.
Programming language used was node.js.

Reference code used to help make game was [high-low-game](https://github.com/alexa/skill-sample-nodejs-highlowgame/blob/master/lambda/custom/index.js).