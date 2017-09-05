### **Step to operate**

Prerequisite
1. Open a terminal, and type `yarn install` or `npm install` to install all the dependencies
2. Make sure you have at least node version 6.10.0

Basic operations
1. Type: `node jwt_me` to start the cli program
2. `user_id` and `email` will be required first 2 answers
3. after completing the first 2 questions, user can elect to supply more answers
4. Only relavent additional answers are going to be used (such as 'expiration', 'algorithm', 'secret')
5. Enter "no" to exit the prompt and generate the jwt

Test
1. In terminal, hit `yarn test` or `npm run test` to run unit test
2. In terminal, hit `yarn coverage` or `npm run coverage` to run coverage report

Other
1. If you wish to change the default configurations used, it can be found in `./config.js`

### **Example Output**
```
Shengtaos-MBP-2:thredup shengtaoli$ node jwt_me
Starting with JWT token generation.
user_id and email are required to generate jwt..
? Enter user_id 123
? Enter email a@b.com
? Any additional inputs? (yes/no) Yes
? Enter key 3 a
? Enter value b
? Any additional inputs? (yes/no) Yes
? Enter key 4 algorithm
? Enter value HS256
? Any additional inputs? (yes/no) Yes
? Enter key 5 secret
? Enter value shhhhh
? Any additional inputs? (yes/no) No
token is generated, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzIiwiZW1haWwiOiJhQGIuY29tIiwiaWF0IjoxNTA0NTgxOTg4fQ.4Ud7JhHrQhw-zSEMDZlufS_crEgVDV2nCawnmdIPG_0
The JWT has been copied to your clipboard! 
```

### **Original Question **
 
#### **The task**
 
**Build an CLI for generating Json Web Tokens (JWT's)**
 
The CLI should be able to take multiple key value pairs as input, and copy the generated JWT to your clipboard.
 
Required inputs are user_id and email. In addition, other key/value pairs can also be entered
 
 
***An example session could look like this:***
 
    $ jwt_me
    Starting with JWT token generation.
    Enter key 1
    $ user_id
    Enter user_id value
    $ 12312
    Enter key 2
    $ email
    Enter email value
    $ something
    Invalid email entered! Enter email value
    $ syed@thredup.com
    Any additional inputs? (yes/no)
    $ no
    The JWT has been copied to your clipboard!
    
  ***What we are looking for:***
  - General programming style
  - Test coverage
  - CLI ease of use
