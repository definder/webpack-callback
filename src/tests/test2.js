const generateAction = require('../generateAction').default;

const AppArticle = generateAction().setNamespace('Administration').setModel('Article');

export const create = AppArticle.setName('create').getAsync(['SUCCESS', 'FAILURE']);

export const setField = AppArticle.setName('setField').get();