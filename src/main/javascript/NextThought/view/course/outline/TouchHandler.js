Ext.define('NextThought.view.course.outline.TouchHandler', {
	extend: 'NextThought.modules.TouchHandler',

	alias: 'outline.touchHandler',

	setupHandlers: function () {
		var leftSide = this.container,
			panel = this.container.getEl().down('.lesson-list');

		leftSide.on('touchScroll', function (ele, deltaY) {
			panel.scrollBy(0, deltaY, false);
		}, this);
		leftSide.on('touchElementIsScrollable', this.elementIsAlwaysScrollable);
		leftSide.on('touchTap', this.clickElement);
		leftSide.on('touchElementAt', this.elementAt);
	}
});