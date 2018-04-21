const Ext = require('@nti/extjs');

require('legacy/mixins/ModelWithPublish');
require('./HeadlineTopic');


module.exports = exports = Ext.define('NextThought.model.forums.CommunityHeadlineTopic', {
	extend: 'NextThought.model.forums.HeadlineTopic',

	mixins: {
		publishActions: 'NextThought.mixins.ModelWithPublish'
	}
});
