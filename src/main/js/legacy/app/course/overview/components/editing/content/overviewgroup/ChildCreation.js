const Ext = require('@nti/extjs');

const OverviewGroup = require('legacy/model/courses/overview/Group');
const {isFeature} = require('legacy/util/Globals');

const ContentlinkEditor = require('../contentlink/Editor');
const VideoEditor = require('../video/Editor');
const DiscussionEditor = require('../discussion/Editor');
const LTIExternalToolAssetEditor = require('../ltiexternaltoolasset/Editor');
const QuestionsetEditor = require('../questionset/Editor');
const TimelineEditor = require('../timeline/Editor');
const SurveyEditor = require('../survey/Editor');

require('../../creation/ChildCreation');



module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.ChildCreation', {
	extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
	alias: 'widget.overview-editing-overviewgroup-childcreation',
	title: 'Choose a content type',
	backText: 'Content Types',
	saveText: 'Add to Lesson',

	statics: {
		getHandledMimeTypes: function () {
			return [
				OverviewGroup.mimeType
			];
		},

		getEditors: function () {

			var editors = [
				ContentlinkEditor,
				VideoEditor,
				DiscussionEditor,
				QuestionsetEditor,
				TimelineEditor,
				SurveyEditor
			];

			if (isFeature('LTI')) {
				editors.push(LTIExternalToolAssetEditor);
			}

			return editors;
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
