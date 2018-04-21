const Ext = require('@nti/extjs');

require('./RelatedWork');


module.exports = exports = Ext.define('NextThought.model.DiscussionRef', {
	extend: 'NextThought.model.RelatedWork',

	statics: {
		defaultIcon: '/app/resources/images/elements/discussion-icon.png'
	}
});
