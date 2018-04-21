const Ext = require('@nti/extjs');

require('./HeadlinePost');



module.exports = exports = Ext.define('NextThought.model.forums.CommunityHeadlinePost', {
	extend: 'NextThought.model.forums.HeadlinePost',
	searchProps: ['body', 'title', 'tags']
});
