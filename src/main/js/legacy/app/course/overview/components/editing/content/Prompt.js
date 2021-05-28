const Ext = require('@nti/extjs');

const OutlinenodeChildCreation = require('../outline/outlinenode/ChildCreation');

const LessonoverviewChildCreation = require('./lessonoverview/ChildCreation');
const OverviewgroupChildCreation = require('./overviewgroup/ChildCreation');
const OverviewgroupEditor = require('./overviewgroup/Editor');
const ContentlinkEditor = require('./contentlink/Editor');
const VideoEditor = require('./video/Editor');
const DiscussionEditor = require('./discussion/Editor');
const LTIExternalToolAssetEditor = require('./ltiexternaltoolasset/Editor');
const PollEditor = require('./poll/Editor');
const QuestionsetEditor = require('./questionset/Editor');
const ScormEditor = require('./scorm/Editor');
const SurveyEditor = require('./survey/Editor');
const TimelineEditor = require('./timeline/Editor');
const WebinarEditor = require('./webinar/Editor');
const EventEditor = require('./event/Editor');
const styles = require('./Prompt.css');

require('../outline/Prompt');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.Prompt',
	{
		extend: 'NextThought.app.course.overview.components.editing.outline.Prompt',
		alias: 'widget.overview-editing-content-editor',
		cls: styles['overview-editing-content-editor-prompt'],

		statics: {
			getCreators: function () {
				return [
					LessonoverviewChildCreation,
					OverviewgroupChildCreation,
					OutlinenodeChildCreation,
				];
			},

			getTypeEditors: function () {
				return [
					ContentlinkEditor,
					OverviewgroupEditor,
					VideoEditor,
					DiscussionEditor,
					LTIExternalToolAssetEditor,
					PollEditor,
					QuestionsetEditor,
					ScormEditor,
					SurveyEditor,
					TimelineEditor,
					WebinarEditor,
					EventEditor,
				];
			},
		},
	},
	function () {
		this.initRegistry();
	}
);
