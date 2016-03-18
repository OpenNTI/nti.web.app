var Ext = require('extjs');
var ModelRelatedWork = require('./RelatedWork');


module.exports = exports = Ext.define('NextThought.model.DiscussionRef', {
	extend: 'NextThought.model.RelatedWork',

	statics: {
		defaultIcon: '/app/resources/images/elements/discussion-icon.png'
	}
});
