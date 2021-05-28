const Ext = require('@nti/extjs');
const OverviewGroup = require('internal/legacy/model/courses/overview/Group');

const ContentlinkEditor = require('../contentlink/Editor');
const VideoEditor = require('../video/Editor');
const DiscussionEditor = require('../discussion/Editor');
const EventEditor = require('../event/Editor');
const LTIExternalToolAssetEditor = require('../ltiexternaltoolasset/Editor');
const QuestionsetEditor = require('../questionset/Editor');
const TimelineEditor = require('../timeline/Editor');
const ScormEditor = require('../scorm/Editor');
const SurveyEditor = require('../survey/Editor');
const WebinarEditor = require('../webinar/Editor');
const VideoQuote = require('../quotes/VideoQuote');
const ContentQuote = require('../quotes/ContentQuote');

require('../../creation/ChildCreation');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.overviewgroup.ChildCreation',
	{
		extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
		alias: 'widget.overview-editing-overviewgroup-childcreation',
		title: 'Choose a Content Type',
		backText: 'Content Types',
		saveText: 'Add to Lesson',

		statics: {
			getHandledMimeTypes: function () {
				return [OverviewGroup.mimeType];
			},

			getEditors: function (bundle) {
				var editors = [
					ContentlinkEditor,
					VideoEditor,
					DiscussionEditor,
					QuestionsetEditor,
					TimelineEditor,
					SurveyEditor,
					WebinarEditor,
					EventEditor,
					ScormEditor,
				];

				if (bundle && bundle.hasLink('lti-configured-tools')) {
					editors.push(LTIExternalToolAssetEditor);
				}

				editors.push({
					getTypes: () => [
						{
							isDivider: true,
							text: 'NextThought Can Help—Get a Quote!',
							isAvailable: () => true,
						},
					],
				});
				editors.push(VideoQuote);
				editors.push(ContentQuote);

				return editors;
			},
		},

		setUpTypeList: function () {
			this.callParent(arguments);

			var subTitle =
				this.rootRecord &&
				this.rootRecord.getTitle &&
				this.rootRecord.getTitle();

			if (this.setSubTitle && subTitle) {
				this.setSubTitle(subTitle);
			}
		},

		setUpTypeEditor: function () {
			this.callParent(arguments);

			var subTitle =
				this.rootRecord &&
				this.rootRecord.getTitle &&
				this.rootRecord.getTitle();

			if (this.setSubTitle && subTitle) {
				this.setSubTitle(subTitle);
			}
		},
	}
);
