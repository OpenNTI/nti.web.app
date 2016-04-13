const Ext = require('extjs');

require('legacy/common/StateStore');

module.exports = exports = Ext.define('NextThought.app.forums.StateStore', {
	extend: 'NextThought.common.StateStore',

	onTopicDeleted (topic) {
		this.fireEvent('topic-deleted', topic.getId());
	}
});
