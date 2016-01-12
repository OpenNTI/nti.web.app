Ext.define('NextThought.app.course.overview.components.editing.content.Prompt', {
	extend: 'NextThought.app.course.overview.components.editing.outline.Prompt',
	alias: 'widget.overview-editing-content-editor',

	requires: [
		'NextThought.app.course.overview.components.editing.content.lessonoverview.ChildCreation',
		'NextThought.app.course.overview.components.editing.content.overviewgroup.ChildCreation',
		'NextThought.app.course.overview.components.editing.content.contentlink.Editor'
	],

	statics: {

		getCreators: function() {
			var base = NextThought.app.course.overview.components.editing.content;

			return [
				base.lessonoverview.ChildCreation,
				base.overviewgroup.ChildCreation
			];
		},


		getTypeEditors: function() {
			var base = NextThought.app.course.overview.components.editing.content;

			return [
				base.contentlink.Editor,
				base.overviewgroup.Editor,
				base.video.Editor
			];
		}
	}
}, function() {
	this.initRegistry();
});
