Ext.define('NextThought.view.course.overview.TouchHandler', {
	extend: 'NextThought.modules.TouchHandler',
	alias: 'overview.touchHandler',

	setupHandlers: function () {
		var videoList = this.container.down('.course-overview-video-section').getTargetEl();

		// Make the main overview view and the videoList subview scrollable
		this.container.on('touchScroll', function (ele, deltaY) {
			if (videoList.isAncestor(ele)) {
				videoList.scrollBy(0, deltaY, false);
			}
			else {
				this.container.scrollBy(0, deltaY, false);
			}
		}, this);
		this.container.on('touchElementIsScrollable', this.elementIsAlwaysScrollable);
		this.container.on('touchTap', this.clickElement);
		this.container.on('touchElementAt', this.elementAt);

		// Make the videoList scrollable
		videoList.on('touchElementIsScrollable', this.elementIsAlwaysScrollable);
	}
});
