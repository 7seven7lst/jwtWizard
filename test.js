const chai = require('chai');
const Promise = require('bluebird');
const sinon = require('sinon');
const inquirer = require('inquirer');

const ncp = require("copy-paste");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const {
  filter, 
  generateToken, 
  validate, 
  validateEmail, 
  writeToClipboard, 
  promptQuestions, 
  promptOptionalQuestions, 
  isAlgorithmQuestion, 
  recursePrompt
} = require('./utils');

describe('generating token', () => {
  it('should generate token with user_id and email', () => {
    let answers = {user_id: 12345, email: "dummy@gmail.com"};
    expect(generateToken(answers)).to.be.a('string')
  })
});

describe('copy jwt to clipboard', () => {
  it('should copy jwt to clipboard', ()=> {
    Promise.resolve(writeToClipboard('abc'))
    .then(() => {
      let token = ncp.paste();
      expect(token).to.be.a('string');
      expect(token).to.equal('abc');
    })
  });
});

describe('validate input', () => {
  it('should validate email input', () => {
    expect(validateEmail('dummy@gmail.com')).to.be.true;
    expect(validateEmail('abcde')).to.not.be.true;
  });

  it('should recognize email input and use the correct validator', () => {
    expect(validate('dummy@gmail.com', {key: 'email'})).to.be.true;
    expect(validate('abcde', {key: 'email'})).to.not.be.true;
  });

  it('should always return true if input does not require validation', () => {
    expect(validate('12334', {key: 'other'})).to.be.true;
  })
});

describe('filtering input into correct name', () => {
  it('should filter different format of user id to "user_id"', () => {
    expect(filter('userId')).to.equal('user_id');
    expect(filter('user_id')).to.equal('user_id');
    expect(filter('uid')).to.equal('user_id');
    expect(filter('Uid')).to.equal('user_id');
  });
 
  it('should filter different format of email to "email"', () => {
    expect(filter('Email')).to.equal('email');
    expect(filter('email')).to.equal('email');
  });

  it('should filter different format of algorithm to "algorithm"', () => {
    expect(filter('Algorithm')).to.equal('algorithm');
    expect(filter('algo')).to.equal('algorithm');
    expect(filter('alg')).to.equal('algorithm');
    expect(filter('algorithm')).to.equal('algorithm');
  });

  it('should filter different format of expiration to "exp"', () => {
    expect(filter('ExpiresIn')).to.equal('exp');
    expect(filter('Expires')).to.equal('exp');
    expect(filter('expire')).to.equal('exp');
    expect(filter('Expiration')).to.equal('exp');
    expect(filter('exp')).to.equal('exp');
  });

  it('should not filter input not specified in the filter', () => {
    expect(filter('test')).to.equal('test');
    expect(filter('Memo')).to.equal('memo');
  })
});

describe('mock mandatory prompt', () => {
  let answers, question;
  beforeEach(() => {
    let fn = function (questions, cb) {
      setTimeout(function() {
        cb({
          user_id: '123', 
          email: 'a@b.com',
          moreInput: 'no'
        });
      }, 0);
    }
    Promise.resolve(sinon.stub(inquirer, 'prompt').callsFake(fn));
    answers = {};
  });
  afterEach(() => {
    inquirer.prompt.restore();
  });
  it('supply mandatory answers', done => {
    promptQuestions(answers, inquirer, result => {
      expect(Promise.resolve(result.user_id)).to.eventually.equal('123');
      expect(Promise.resolve(result.email)).to.eventually.equal('a@b.com');
      done();
    })
  });
});

describe('mock optional prompt, (regular input) ', () => {
  let answers, question;
  beforeEach(() => {
    let fn = function (questions, cb) {
      setTimeout(function() {
        cb({
          key: 'secret',
          value: 'super secret',
          moreInput: 'no'
        });
      }, 0);
    }
    Promise.resolve(sinon.stub(inquirer, 'prompt').callsFake(fn));
    answers = {}, question = {question: 3};
  });
  afterEach(() => {
    inquirer.prompt.restore();
  });
  it('supply optional answers', done => {
    promptOptionalQuestions(answers, question, inquirer, result => {
      expect(Promise.resolve(result.key)).to.eventually.equal('secret');
      expect(Promise.resolve(result.value)).to.eventually.equal('super secret');
      expect(Promise.resolve(result.moreInput)).to.eventually.equal('no');
      done();
    })
  });
});

describe('mock optional prompt (list selection) ', () => {
  let answers, question;
  beforeEach(() => {
    let fn = function (questions, cb) {
      setTimeout(function () {
        cb({
          key: 'algorithm',
          value: 'HS256',
          moreInput: 'no'
        });
      }, 0);
    }
    Promise.resolve(sinon.stub(inquirer, 'prompt').callsFake(fn));
    answers = {}, question = {question: 3};
  });
  afterEach(() => {
    inquirer.prompt.restore();
  });
  it('supply optional answers', done => {
    promptOptionalQuestions(answers, question, inquirer, result => {
      expect(Promise.resolve(result.key)).to.eventually.equal('algorithm');
      expect(Promise.resolve(result.value)).to.eventually.equal('HS256');
      expect(Promise.resolve(result.moreInput)).to.eventually.equal('no');
      done();
    })
  });
});

describe('identify if a prompt is an algorithm selection ', () => {
  it('able to supply different question if it\'s algorithm or not', () => {
    let algoQuestion = {key: "algorithm"}, 
    otherQuestion = {key: "other"};
    expect(isAlgorithmQuestion(true)(algoQuestion)).to.be.true;
    expect(isAlgorithmQuestion(false)(otherQuestion)).to.be.true;
  });
});

describe('recurse prompt with no recursion (base case) ', () => {
  it('should handle the recurse function', done => {
    let testcb = (answers, questions, inquirer) => {
      return {key: 'a', value: 'b', moreInput: false};
    };
    let answers = {}, question = {question:3}, inquier;
    recursePrompt(answers, question, inquier, testcb)
    .then(() => {
      expect(Promise.resolve(answers.a)).to.eventually.equal('b');
      done();
    })
  })
})

describe('recurse prompt with 3 recursion', () => {
  it('should handle the recurse function', done => {
    let i = 0;
    let testcb = (answers, questions, inquirer) => {
      i++;
      let obj = {
        key: `a${i}`, 
        value: `b${i}`,
        moreInput: i < 3 ? true: false,
      }
      return obj;
    };
    let answers = {}, question = {question:3}, inquier;
    recursePrompt(answers, question, inquier, testcb)
    .then(() => {
      expect(Promise.resolve(answers.a1)).to.eventually.equal('b1');
      expect(Promise.resolve(answers.a2)).to.eventually.equal('b2');
      expect(Promise.resolve(answers.a3)).to.eventually.equal('b3');
      done();
    })
  })
})
