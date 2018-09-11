# Counter Club! - Alexa Game Skill.
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/npm.svg)](https://badge.fury.io/js/npm)

This skill is intended to used to be used as an educational reference of what can be done with persistent data in Alexa. The skill saves a user's high score into a database, which can be fetched for future game sessions.

Inside lambda/custom folder is the [index.js file](https://github.com/MatthewThePham/Counter-Club---Alexa-Game-Skill-/blob/master/lambda/custom/index.js), which is the main script code. It is heavily commented to help those implementing persistent data in their Alexa skills. 

A game developed for the Alexa that tests your memory by reading out a randomized list of numbers. See if you can remember if a random number was inside said list. Earn ranked scores depending on how well you preform.

### Features
* High scores through Amazon Dynamodb.
* Speechcons and SSML for added personality.
* Fallback/Error handler for unhandled user input.
* _Increased mental capacity after playing 47 game sessions._

### Live Gameply
To try a live example of this skill, you can enable the skill [Counter Club](https://www.amazon.com/NotMatt-Counter-Club/dp/B07FNK6TR8/). Just say: `Alexa, enable Counter Club` and then `Alexa, open Counter Club`.

### Development of skill

This skill uses the [Alexa Skills Kit SDK 2.0 for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs) for Alexa skill libraries and [Amazon Dynamodb](https://aws.amazon.com/dynamodb/) for storing the user's high score.
Programming language used was Node.js. Uses asyc/await, which requires Node.js version 8.10 during lambda runtime.

### Installation
1. Clone the repository.

	```bash
	$ git clone https://github.com/MatthewThePham/Counter-Club---Alexa-Game-Skill-.git
	```

2. Navigating into the repository's root folder.

	```bash
	$ cd Counter-Club---Alexa-Game-Skill-
	```

3. Install npm dependencies by navigating into the `lambda/custom` directory and running the npm command: `npm install`

	```bash
	$ cd lambda/custom
	$ npm install
	```
