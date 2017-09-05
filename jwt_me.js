const _ = require('lodash');
const inquirer = require('inquirer');
const Promise = require('bluebird');
const { 
  generateToken, 
  writeToClipboard, 
  validate, 
  filter,
  promptQuestions,
  promptOptionalQuestions,
  recursePrompt,
} = require('./utils');

console.log("Starting with JWT token generation.");
console.log("user_id and email are required to generate jwt..");
let answers = {}, questionNumber = {current : 3};

Promise.resolve(promptQuestions(answers,inquirer))
.then(result => {
  answers.user_id = result.user_id;
  answers.email = result.email;
  if (result.moreInput) {
    return recursePrompt(answers, questionNumber, inquirer, promptOptionalQuestions);
  } else {
    return Promise.resolve();
  }
})
.then(result => {
  let token = generateToken(answers);
  console.log(`token is generated, ${token}`);
  return writeToClipboard(token);
})
.catch(err => {
  console.log(`error generating token, ${err}`);
  process.exit(1);
})
