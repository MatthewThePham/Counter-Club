# Counter Club! - Number based memory game.

An Alexa game which tests your memory by reading out a random list of numbers. It then checks if you can recall a certain number on that list. <br />
See how far your memory can take you as you earn a score ranking depending on how well you preform!

### Features
* High scores through Amazon Dynamodb.
* Speechcons for added personality.
* Fallback handler for unhandled user input.
* _Increased mental capacity after playing 47 game sessions._

### Live Gameply
To try a live example of this skill, you can enable the skill [Counter Club](https://www.amazon.com/NotMatt-Counter-Club/dp/B07FNK6TR8/ref=sr_1_1?s=digital-skills&ie=UTF8&qid=1532144294&sr=1-1&keywords=counter+club). Just say: `Alexa, enable Counter Club` and then `Alexa, open Counter Club`.

### Development of skill

This skill uses the [Alexa Skills Kit SDK 2.0 for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs) and also [Amazon Dynamodb](https://aws.amazon.com/dynamodb/) for storing user high score.
Programming language used was node.js.

Reference code used to help make game was [high-low-game](https://github.com/alexa/skill-sample-nodejs-highlowgame/blob/master/lambda/custom/index.js).