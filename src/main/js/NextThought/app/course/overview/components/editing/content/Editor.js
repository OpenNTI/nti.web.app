Ext.define('NextThought.app.course.overview.components.editing.content.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.outline.Editor',
	alias: 'widget.overview-editing-content-editor',

	requires: [
		'NextThought.app.course.overview.components.editing.content.lessonoverview.ChildCreation',
		'NextThought.app.course.overview.components.editing.content.contentlink.Editor'
	],

	statics: {

		getCreators: function() {
			var base = NextThought.app.course.overview.components.editing.content;

			return [
				base.lessonoverview.ChildCreation
			];
		},


		getTypeEditors: function() {
			var base = NextThought.app.course.overview.components.editing.content;

			return [
				base.contentlink.Editor
			];
		}
	}
}, function() {
	this.initRegistry();
});
