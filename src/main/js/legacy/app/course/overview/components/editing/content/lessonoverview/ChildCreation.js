const Ext = require('extjs');

const OverviewLesson = require('legacy/model/courses/overview/Lesson');

const OverviewgroupEditor = require('../overviewgroup/Editor');

require('../../creation/ChildCreation');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.lessonoverview.ChildCreation', {
	extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
	alias: 'widget.overview-editing-lessonoverview-childcreation',
	title: 'Content Types',
	saveText: 'Add to Lesson',

	statics: {
		getHandledMimeTypes: function () {
			return [
				OverviewLesson.mimeType
			];
		},

		getEditors: function () {
			return [
				OverviewgroupEditor
			];
		}
	},

	setUpTypeList: function () {
		this.callParent(arguments);
	}
});
