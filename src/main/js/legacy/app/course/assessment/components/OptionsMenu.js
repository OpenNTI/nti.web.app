const Ext = require('@nti/extjs');

module.exports = exports = Ext.define('NextThought.app.course.assesment.components.OptionsMenu', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.assignments-options-menu',
	cls: 'assignments-options-menu',

	defaults: {
		ui: 'nt-menuitem',
		plain: true,
		listeners: {
			'click': function (item) {item.up('menu').handleClick(item);}
		}
	},
	items: [{ text: 'Download All Upload Files', downloadData: true}],


	handleClick: function (item) {
		if (item.downloadData) {
			window.location.href = this.bundle && this.bundle.getLink('CourseAssignmentBulkFilePartDownload');
		}
		else {
			this.fireEvent('hide-menu');
		}
	},

	afterRender: function () {
		this.closeEl = Ext.DomHelper.append(this.el, {cls: 'close', html: ''}, true);
		this.callParent(arguments);

		this.closeEl.on('click', function (e) {
			e.stopEvent();
			this.stopHideTimeout();
			this.doDismiss = true;
			this.isClosing = true;
			this.fireEvent('hide-menu');
			return false;
		}, this);


		this.mon(this.el, 'mouseover', function (e) {
			this.stopHideTimeout();
			this.doDismiss = false;
		}, this);

		this.mon(this.el, 'mouseout', function (e) {
			if (!this.isClosing) {
				this.startHideTimeOut();
			}
			this.isClosing = false;
			this.doDismiss = true;
		}, this);

		this.on('beforedeactivcate', function (e) {
			return this.doDismiss;
		}, this);
	},

	startHideTimeOut: function () {
		this.hideTimeout = Ext.defer(function () {
			this.fireEvent('hide-menu');
		}, 1000, this);
	},

	stopHideTimeout: function () {
		clearTimeout(this.hideTimeout);
	}
});
