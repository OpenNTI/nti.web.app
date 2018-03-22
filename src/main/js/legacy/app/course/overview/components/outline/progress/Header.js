const Ext = require('extjs');

require('./Progress');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.outline.progress.Header', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-outline-progress-header',


	cls: 'outline-progress-header',

	initComponent () {
		this.callParent(arguments);

		this.wrapperRequest.then(wrapper => {
			const courseProgress = wrapper.get('CourseProgress');

			const itemsComplete = (courseProgress && courseProgress.get('AbsoluteProgress')) || 0;
			const itemsTotal = (courseProgress && courseProgress.get('MaxPossibleProgress')) || 0;

			const isCompleted = (courseProgress && courseProgress.get('CompletedDate') !== null);
			const pctComplete = itemsTotal === 0 ? 0 : parseInt(itemsComplete * 100.0 / itemsTotal * 100.0, 10);
			const remainingItems = itemsTotal - itemsComplete;

			let subLabel = '0 Items Remaining';
			if(isCompleted) {
				subLabel = 'Completed';
			}
			else {
				subLabel = remainingItems === 1 ? '1 Item Remaining' : remainingItems + ' Items Remaining';
			}

			const containerClass = itemsComplete === 0 ? 'progress-container no-progress' : 'progress-container';

			this.add({
				xtype: 'overview-outline-progress',
				pctComplete,
				isCompleted,
				containerClass,
				subLabel
			});
		});
	}
});
