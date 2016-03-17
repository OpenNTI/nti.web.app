export default Ext.define('NextThought.app.course.overview.components.editing.content.Prompt', {
	extend: 'NextThought.app.course.overview.components.editing.outline.Prompt',
	alias: 'widget.overview-editing-content-editor',

	requires: [
		'NextThought.app.course.overview.components.editing.content.lessonoverview.ChildCreation',
		'NextThought.app.course.overview.components.editing.content.overviewgroup.ChildCreation',
		'NextThought.app.course.overview.components.editing.outline.outlinenode.ChildCreation',
		'NextThought.app.course.overview.components.editing.content.contentlink.Editor',
		'NextThought.app.course.overview.components.editing.content.video.Editor',
		'NextThought.app.course.overview.components.editing.content.discussion.Editor',
		'NextThought.app.course.overview.components.editing.content.poll.Editor',
		'NextThought.app.course.overview.components.editing.content.questionset.Editor',
		'NextThought.app.course.overview.components.editing.content.survey.Editor',
		'NextThought.app.course.overview.components.editing.content.timeline.Editor'
	],

	statics: {

		getCreators: function() {
			var base = NextThought.app.course.overview.components.editing.content,
				outline = NextThought.app.course.overview.components.editing.outline;


			return [
				base.lessonoverview.ChildCreation,
				base.overviewgroup.ChildCreation,
				outline.outlinenode.ChildCreation
			];
		},


		getTypeEditors: function() {
			var base = NextThought.app.course.overview.components.editing.content;

			return [
				base.contentlink.Editor,
				base.overviewgroup.Editor,
				base.video.Editor,
				base.discussion.Editor,
				base.poll.Editor,
				base.questionset.Editor,
				base.survey.Editor,
				base.timeline.Editor
			];
		}
	}
}, function() {
	this.initRegistry();
});
