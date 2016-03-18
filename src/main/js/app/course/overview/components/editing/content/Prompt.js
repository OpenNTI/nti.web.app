var Ext = require('extjs');
var OutlinePrompt = require('../outline/Prompt');
var LessonoverviewChildCreation = require('./lessonoverview/ChildCreation');
var OverviewgroupChildCreation = require('./overviewgroup/ChildCreation');
var OutlinenodeChildCreation = require('../outline/outlinenode/ChildCreation');
var ContentlinkEditor = require('./contentlink/Editor');
var VideoEditor = require('./video/Editor');
var DiscussionEditor = require('./discussion/Editor');
var PollEditor = require('./poll/Editor');
var QuestionsetEditor = require('./questionset/Editor');
var SurveyEditor = require('./survey/Editor');
var TimelineEditor = require('./timeline/Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.Prompt', {
    extend: 'NextThought.app.course.overview.components.editing.outline.Prompt',
    alias: 'widget.overview-editing-content-editor',

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
