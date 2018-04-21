const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.common.dd.ScrollingDragZone', {
	extend: 'Ext.dd.DragZone',

	constructor: function (el, cfg) {

		Ext.apply(Ext.dd.ScrollManager, {
			vthresh: 75,
			increment: 100,
			frequency: 300,
			animate: true,
			animDuration: 0.2
		});


		var observable = new Ext.util.Observable();
		this.containerScroll = cfg.containerScroll || true;
		this.callParent([el, cfg]);

		var scrollMonitor = observable.mon(this.scrollEl || el, {
			destroyable: true,
			scope: this,
			scroll: function () {
				this.DDMInstance.refreshCache(this.groups);
			}
		});

		this.destroy = Ext.Function.createSequence(this.destroy, function () {
			scrollMonitor.destroy();
			observable.clearListeners();
		});
	}
});
