var Ext = require('extjs');
var ForumsHeadlineTopic = require('./HeadlineTopic');


module.exports = exports = Ext.define('NextThought.model.forums.ContentHeadlineTopic', {
	extend: 'NextThought.model.forums.HeadlineTopic',

	mimeType: 'application/vnd.nextthought.forums.contentheadlinetopic'
});
