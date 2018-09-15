import generateAction from '../generateAction';

const AppPhoto = generateAction().setNamespace('App').setModel('Photo');

export const load = AppPhoto.setName('load').getAsync();

export const setToCompare = AppPhoto.setName('setToCompare').get();