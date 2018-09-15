const generateAction = require('./generateAction').default;

const ct = generateAction();

const ct1 = generateAction();

ct.setName('create');
ct1.setName('update');

const create = ct.setModel('App').getAsync();
const update = ct1.setModel('App').getAsync();

console.log(create);
console.log(update);