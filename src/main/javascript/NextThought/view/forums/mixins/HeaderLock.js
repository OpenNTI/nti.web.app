Ext.define('NextThought.view.forums.mixins.HeaderLock', {

	LOCKED_HEADER_CLS: 'locked',

	constructor: function() {
		this.callParent(arguments);
		this.on('afterrender', 'headerLockPostRenderInit');
	},


	disable: function() {
		this.headerLockPostRenderInit = Ext.emptyFn;
	},


	headerLockPostRenderInit: function() {
		this.on({
			'destroy': 'headerLockCleanup'
		});

		this.mon(this.scrollParent, 'scroll', 'handleScrollHeaderLock');
		this.headerEl.addCls(this.LOCKED_HEADER_CLS);

		Ext.EventManager.onWindowResize(this.handleWindowResize, this);
	},


	headerLockCleanup: function() {
		this.headerEl.remove();
		Ext.EventManager.removeResizeListener(this.handleWindowResize, this);
	},


	handleWindowResize: function() {
		var left,
			header = this.headerEl,
			domParent = Ext.get('view').dom,
			parent = header && Ext.getDom(header).parentNode;

		if (parent !== domParent) {
			console.log('handleWindowResize(): break');
			return;
		}

		left = this.el.getX();
		this.headerEl.setX(left).setStyle('top', undefined);
	},


	handleScrollHeaderLock: function(e,parentDom) {
		var top = this.scrollParent.getScrollTop();

		this.headerEl.setTop(top);
	}
});
