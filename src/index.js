var defineAction = require('redux-define').defineAction;

const CREATE_TODO = defineAction('CREATE_TODO', ['ERROR']);

alert(CREATE_TODO.ERROR);