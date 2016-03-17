export default Ext.define('NextThought.app.course.overview.components.editing.content.poll.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-poll',

	requires: ['NextThought.model.PollRef'],

	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.PollRef.mimeType
			];
		}
	},

	addFormCmp: function() {}
});
