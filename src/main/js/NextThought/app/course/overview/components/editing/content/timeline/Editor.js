Ext.define('NextThought.app.course.overview.components.editing.content.timeline.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-timeline',

	requires: ['NextThought.model.Timeline'],

	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.Timeline.mimeType
			];
		}
	},

	addFormCmp: function() {}
});
