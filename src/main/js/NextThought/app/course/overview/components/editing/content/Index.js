Ext.define('NextThought.app.course.overview.components.editing.content.Index', {
	extend: 'NextThought.app.course.overview.components.Lesson',
	alias: 'widget.overview-editing-content',

	requires: [
		'NextThought.app.course.overview.components.editing.content.lessonoverview.Index'
	],

	cls: '',

	isLessonView: false,

	initComponent: function() {
		this.callParent(arguments);

		this.loadLesson = this.renderLesson(this.outlineNode, this.record);
	},


	onceLoaded: function() {
		return this.loadLesson || Promise.resolve();
	},


	renderLesson: function(outlineNode, contents) {
		var me = this,
			course = me.bundle;

		if (!outlineNode || !course || !contents) {
			//show empty state?
			console.warn('Unable to edit overview content');
			return;
		}

		me.buildingOverview = true;
		me.maybeMask();

		return me.getInfo(outlineNode, course)
			.then(function(results) {
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
					contents: contents
				});

				return me.currentOverview.onceLoaded();
			})
			.fail(function(reason) {
				console.error(reason);
			})
			.then(me.maybeUnmask.bind(me));
	}
});
