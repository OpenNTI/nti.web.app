/*eslint-disable*/
require('raf/polyfill');
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
Enzyme.configure({ adapter: new Adapter() });

global.Ext = require('extjs');
require('../legacy/model/index');
