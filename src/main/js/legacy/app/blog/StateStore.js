const Ext = require('@nti/extjs');

require('legacy/common/StateStore');

module.exports = exports = Ext.define('NextThought.app.blog.StateStore', {
	extend: 'NextThought.common.StateStore',

	onBlogDeleted: function (blog) {
		this.fireEvent('blog-deleted', blog.getId());
	}
});
