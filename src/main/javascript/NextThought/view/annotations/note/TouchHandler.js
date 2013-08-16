Ext.define('NextThought.view.annotations.note.TouchHandler', {
	extend: 'NextThought.modules.TouchHandler',
	alias: 'note.touchHandler',

	setupHandlers: function () {
		var container = this.container;

		container.on('touchElementIsScrollable', this.elementIsAlwaysScrollable);
		container.on('touchScroll', function (ele, deltaY) {
			container.el.up('.note-content-container.scrollbody').scrollBy(0, deltaY, false);
		});
		container.on('touchTap', this.clickElement);
		container.on('touchElementAt', this.elementAt);
	}
});