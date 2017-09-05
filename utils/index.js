const jwt = require('jsonwebtoken');
const _ = require('lodash');
const Promise = require('bluebird');
const ncp = require("copy-paste");
const config = require('../config');

const generateToken = answers => {
  const payload = {
    user_id: answers.user_id,
    email: answers.email,
  }

  const token = jwt.sign(
    payload, 
    answers.secret|| config.jwtSecret, 
    { algorithm: answers.algorithm || config.defaultEncryptionAlgorithm }, 
    { expiresIn: answers.exp || config.tokenExpiration }
  );
  return token;
}

const writeToClipboard = token => {
  return Promise.resolve(ncp.copy(token))
  .then(() => {
    console.log("The JWT has been copied to your clipboard!");
    return;
  })
}


const validate = (currentAnswer, question) => {
  if (question.key === 'email') {
    return validateEmail(currentAnswer);
  } else {
    return noValidate(currentAnswer);
  }
}

const validateEmail = value => {
  let pass = value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  if (pass) {
    return true;
  }
  return 'Please enter a valid email address...';
}

const noValidate = value => {
  return true;
}

const filter = currentKey => {
  currentKey = currentKey.toLowerCase();
  switch(currentKey) {
    case 'uid':
    case 'userid':
    case 'user_id':
      return 'user_id';
    case 'email':
      return 'email';
    case 'algo':
    case 'alg':
    case 'algorithm':
      return 'algorithm';
    case 'expiresin':
    case 'expires':
    case 'expire':
    case 'expiration':
    case 'exp':
      return 'exp';
    default: return currentKey;
  }
}

let promptQuestions = (answers, inquirer, cb) => {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'user_id',
      message: `Enter user_id`,
    },
    {
      type: 'input',
      name: 'email',
      message: 'Enter email',
      validate: validateEmail,
    },
    {
      message: "Any additional inputs? (yes/no)",
      type: "confirm",
      name: "moreInput",
      default: false,
    },
  ], cb)
}

let isAlgorithmQuestion = isAlgorithm => {
  if (isAlgorithm) {
    return function(currentAnswer) {
      return currentAnswer.key ==='algorithm';
    }
  } else {
    return function(currentAnswer) {
      return currentAnswer.key !=='algorithm';
    }
  }
}

let promptOptionalQuestions = (answers, question, inquirer, cb) => {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'key',
      message: `Enter key ${question.current}`,
      filter: filter
    },
    {
      type: 'input',
      name: 'value',
      message: 'Enter value',
      when: isAlgorithmQuestion(false)
    },
    {
      type: 'list',
      name: 'value',
      choices: ['HS256', 'HS384', 'HS512'],
      message: 'Enter value',
      when: isAlgorithmQuestion(true)
    },
    {
      message: "Any additional inputs? (yes/no)",
      type: "confirm",
      name: "moreInput",
      default: false,
    },
  ], cb)
}

let recursePrompt = (answers, question, inquirer, cb) => {
  return Promise.resolve(cb(answers, question, inquirer))
  .then(result => {
    answers[result.key] = result.value;
    question.current++;
    if (result.moreInput) {
      return recursePrompt(answers, question, inquirer, cb)
    } else {
      return Promise.resolve();
    }
  })
}

module.exports = {
  generateToken,
  writeToClipboard,
  validate,
  validateEmail,
  filter,
  promptQuestions,
  promptOptionalQuestions,
  isAlgorithmQuestion,
  recursePrompt,
}
