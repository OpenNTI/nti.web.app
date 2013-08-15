Ext.define('NextThought.view.course.overview.TouchHandler', {
	extend: 'NextThought.modules.TouchHandler',
	alias: 'overview.touchHandler',

	setupHandlers: function () {
		var videoList = this.container.frameBodyEl;

		this.container.el.dom.on('touchScroll', function (ele, deltaY) {
			this.container.el.dom.scrollBy(0, deltaY, false);
		}, this);
		this.container.el.dom.on('touchElementIsScrollable', this.elementIsAlwaysScrollable);
		this.container.el.dom.on('touchTap', this.clickElement);
		this.container.el.dom.on('touchElementAt', this.elementAt);

		videoList.on('touchScroll', function (ele, deltaY) {
			videoList.scrollBy(0, deltaY, false);
		}, this);
		videoList.on('touchElementIsScrollable', this.elementIsAlwaysScrollable);
//		videoList.on('touchTap', this.clickElement);
//		videoList.on('touchElementAt', this.elementAt);
	}
});
