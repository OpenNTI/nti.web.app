var Ext = require('extjs');
var ContentEditor = require('../Editor');
var ModelPollRef = require('../../../../../../../model/PollRef');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.poll.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-poll',

	statics: {
		getHandledMimeTypes: function () {
			return [
				NextThought.model.PollRef.mimeType
			];
		}
	},

	addFormCmp: function () {}
});
