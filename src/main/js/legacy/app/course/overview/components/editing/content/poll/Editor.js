const Ext = require('@nti/extjs');

const PollRef = require('legacy/model/PollRef');

require('../Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.poll.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-poll',

	statics: {
		getHandledMimeTypes: function () {
			return [
				PollRef.mimeType
			];
		}
	},

	addFormCmp: function () {}
});
