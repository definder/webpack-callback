var defineAction = require('redux-define').defineAction;

const CREATE_TODO = defineAction('CREATE_TODO', ['ERROR']);

console.log(CREATE_TODO.ERROR);