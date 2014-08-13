Ext.define('NextThought.dd.ScrollingDragZone', {
	extend: 'Ext.dd.DragZone',

	constructor: function(el, cfg) {
		this.containerScroll = cfg.containerScroll || true;
		this.callParent([el, cfg]);
	}
});
