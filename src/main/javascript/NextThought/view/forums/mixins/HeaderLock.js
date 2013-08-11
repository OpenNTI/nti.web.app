Ext.define('NextThought.view.forums.mixins.HeaderLock',{

	LOCKED_HEADER_CLS: 'locked',

	constructor: function(){
		this.callParent(arguments);
		this.on('afterrender','headerLockPostRenderInit');
	},


	disable: function(){
		this.headerLockPostRenderInit = Ext.emptyFn;
	},


	headerLockPostRenderInit: function(){
		var container = this.ownerCt.getEl();

		this.on({
			'beforedeactivate':'onBeforeListDeactivateLockHeader',
			'destroy': 'headerLockCleanup'
		});


		this.mon(container,'scroll', 'handleScrollHeaderLock');

		Ext.EventManager.onWindowResize(this.handleWindowResize,this);
	},


	headerLockCleanup: function(){
		this.headerEl.remove();
		Ext.EventManager.removeResizeListener(this.handleWindowResize,this);
	},


	handleWindowResize: function(){
		var left,
			header = this.headerEl,
			domParent = Ext.get('view').dom,
			parent = header && Ext.getDom(header).parentNode;

		if(parent !== domParent){
			console.log('handleWindowResize(): break');
			return;
		}

		left = this.el.getX();
		this.headerEl.setX(left).setStyle('top',undefined);
	},

	onBeforeListDeactivateLockHeader: function(){
		if(this.isVisible() && this.headerLocked){
			this.unlockHeader();
		}
	},


	unlockHeader: function(){
		if(!this.headerLocked){
			return;
		}
		this.headerEl.setStyle({left: 0, top: 0}).removeCls(this.LOCKED_HEADER_CLS).appendTo(this.headerElContainer);
		delete this.headerLocked;
	},


	lockHeader: function(){
		if(this.headerLocked){
			return;
		}
		this.headerEl.addCls(this.LOCKED_HEADER_CLS).appendTo(Ext.get('view'));
		this.headerLocked = true;
		this.handleWindowResize();
	},


	getScrollHeaderCutoff: function(){
		return 0;
	},


	handleScrollHeaderLock: function(e,forumDom){
		var headerEl = this.headerEl,
			domParent = Ext.get('view').dom,
			scroll = Ext.fly(forumDom).getScroll().top,
			parent = headerEl && Ext.getDom(headerEl).parentNode,
			cutoff = this.getScrollHeaderCutoff();

		if( !headerEl || !parent ) {
			console.error('Nothing to handle, el is falsey');
			return;
		}

		if(parent === domParent && (scroll <= cutoff || !this.isVisible())){
			this.unlockHeader();
		}
		else if(parent !== domParent && scroll > cutoff && this.isVisible()) {
			this.lockHeader();
		}
	}
});
