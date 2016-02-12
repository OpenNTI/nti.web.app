Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.ChildCreation', {
	extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
	alias: 'widget.overview-editing-overviewgroup-childcreation',

	requires: [
		'NextThought.model.courses.overview.Group',
		'NextThought.app.course.overview.components.editing.content.contentlink.Editor',
		'NextThought.app.course.overview.components.editing.content.video.Editor',
		'NextThought.app.course.overview.components.editing.content.discussion.Editor',
		'NextThought.app.course.overview.components.editing.content.questionset.Editor'
	],

	title: 'Choose a content type',
	backText: 'Content Types',
	saveText: 'Add to Lesson',

	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.overview.Group.mimeType
			];
		},

		getEditors: function() {
			var base = NextThought.app.course.overview.components.editing.content;

			return [
				base.contentlink.Editor,
				base.video.Editor,
				base.discussion.Editor,
				base.questionset.Editor
			];
		}
	},


	setUpTypeList: function() {
		this.callParent(arguments);

		var subTitle = this.rootRecord && this.rootRecord.getTitle && this.rootRecord.getTitle();

		if (this.setSubTitle && subTitle) {
			this.setSubTitle(subTitle);
		}
	},


	setUpTypeEditor: function() {
		this.callParent(arguments);

		var subTitle = this.rootRecord && this.rootRecord.getTitle && this.rootRecord.getTitle();

		if (this.setSubTitle && subTitle) {
			this.setSubTitle(subTitle);
		}
	}
});
