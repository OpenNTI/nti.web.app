var Ext = require('extjs');
var ComponentsLesson = require('../../Lesson');
var LessonoverviewIndex = require('./lessonoverview/Index');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.Index', {
	extend: 'NextThought.app.course.overview.components.Lesson',
	alias: 'widget.overview-editing-content',
	cls: '',
	isLessonView: false,

	initComponent: function () {
		this.callParent(arguments);

		this.loadLesson = this.renderLesson(this.outlineNode, this.record);
	},

	onceLoaded: function () {
		return this.loadLesson || Promise.resolve();
	},

	renderLesson: function (outlineNode, contents) {
		var me = this,
			course = me.bundle,
			overviewsrc = (outlineNode && outlineNode.getLink('overview-content')) || null;

		if (!outlineNode || !course || !contents) {
			//show empty state?
			console.warn('Unable to edit overview content');
			return;
		}

		me.buildingOverview = true;
		me.maybeMask();

		return me.getInfo(outlineNode, course, overviewsrc)
			.then(function (results) {
				var assignments = results[0],
					enrollment = results[1],
					//Just use the first one for now
					locInfo = results[2][0];

				me.currentOverview = me.add({
					xtype: 'overview-editing-lessonoverview',
					record: outlineNode,
					locInfo: locInfo,
					assignments: assignments,
					enrollment: enrollment,
					bundle: course,
					contents: contents,
					navigate: me.navigate
				});

				return me.currentOverview.onceLoaded();
			})
			.fail(function (reason) {
				console.error(reason);
			})
			.then(me.maybeUnmask.bind(me));
	}
});
