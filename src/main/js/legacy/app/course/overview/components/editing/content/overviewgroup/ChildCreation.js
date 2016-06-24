var Ext = require('extjs');
var CreationChildCreation = require('../../creation/ChildCreation');
var OverviewGroup = require('../../../../../../../model/courses/overview/Group');
var ContentlinkEditor = require('../contentlink/Editor');
var VideoEditor = require('../video/Editor');
var DiscussionEditor = require('../discussion/Editor');
var QuestionsetEditor = require('../questionset/Editor');
var TimelineEditor = require('../timeline/Editor');
var SurveyEditor = require('../survey/Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.ChildCreation', {
	extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
	alias: 'widget.overview-editing-overviewgroup-childcreation',
	title: 'Choose a content type',
	backText: 'Content Types',
	saveText: 'Add to Lesson',

	statics: {
		getHandledMimeTypes: function () {
			return [
				NextThought.model.courses.overview.Group.mimeType
			];
		},

		getEditors: function () {
			var base = NextThought.app.course.overview.components.editing.content;

			return [
				base.contentlink.Editor,
				base.video.Editor,
				base.discussion.Editor,
				base.questionset.Editor,
				base.timeline.Editor,
				base.survey.Editor
			];
		}
	},

	setUpTypeList: function () {
		this.callParent(arguments);

		var subTitle = this.rootRecord && this.rootRecord.getTitle && this.rootRecord.getTitle();

		if (this.setSubTitle && subTitle) {
			this.setSubTitle(subTitle);
		}
	},

	setUpTypeEditor: function () {
		this.callParent(arguments);

		var subTitle = this.rootRecord && this.rootRecord.getTitle && this.rootRecord.getTitle();

		if (this.setSubTitle && subTitle) {
			this.setSubTitle(subTitle);
		}
	}
});
