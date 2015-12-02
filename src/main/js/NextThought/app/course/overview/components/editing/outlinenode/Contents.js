Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Contents', {
	extend: 'NextThought.app.course.overview.components.Lesson',
	alias: 'widget.overview-editing-outlinenode-contents',

	requires: [
		'NextThought.app.course.overview.components.editing.lessonoverview.Index'
	],

	cls: 'outline-node-editing-contents',

	initComponent: function() {
		this.callParent(arguments);

		this.renderLesson(this.outlineNode);
	},


	onceLoaded: function() {
		if (this.loadLesson) {
			return this.loadLesson;
		}

		return Promise.resolve();
	},


	renderLesson: function(record) {
		var me = this,
			course = me.bundle,
			overviewsrc = (record && record.getLink('overview-content'));

		if (!record || !course || !overviewsrc) {
			//show empty state?
			console.warn('Unable to edit overview contents: ', record, course, overviewsrc);
			return;
		}

		me.buildingOverview = true;
		me.maybeMask();

		me.loadLesson = me.getInfo(record, course)
			.then(function(results) {
				var assignments = results[0],
					enrollment = results[1],
					//Just use the first one for now
					locInfo = results[2][0];

				me.currentOverview = me.add({
					xtype: 'overview-editing-lessonoverview',
					record: record,
					locInfo: locInfo,
					assignments: assignments,
					enrollment: enrollment,
					bundle: course
				});

				return me.currentOverview.loadCollection(overviewsrc);
			})
			.fail(function(reason) {
				console.error(reason);
			})
			.then(me.maybeUnmask.bind(me));

		return me.loadLesson;
	}
});
