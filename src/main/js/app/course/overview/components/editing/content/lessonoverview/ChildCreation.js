var Ext = require('extjs');
var CreationChildCreation = require('../../creation/ChildCreation');
var OverviewLesson = require('../../../../../../../model/courses/overview/Lesson');
var OverviewgroupEditor = require('../overviewgroup/Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.lessonoverview.ChildCreation', {
    extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
    alias: 'widget.overview-editing-lessonoverview-childcreation',
    title: 'Content Types',
    saveText: 'Add to Lesson',

    statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.overview.Lesson.mimeType
			];
		},

		getEditors: function() {
			var base = NextThought.app.course.overview.components.editing.content;

			return [
				base.overviewgroup.Editor
			];
		}
	},

    setUpTypeList: function() {
		this.callParent(arguments);
	}
});
