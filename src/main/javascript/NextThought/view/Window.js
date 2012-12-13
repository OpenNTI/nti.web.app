Ext.define('NextThought.view.Window',{
	extend: 'Ext.window.Window',
	alias: 'widget.nti-window',

	requires: [
		'NextThought.util.Ranges',
		'NextThought.view.WindowHeader',
		'NextThought.view.WindowManager'
	],

	cls: 'nti-window',
	ui: 'nti-window',
	plain: true,
	shadow: false,

	autoShow: false,
	border: true,
	frame: false,
	header: false,

	constrain: true,
	constrainHeader: false,
	liveDrag: true,
	dragStartTolerance: 5,

	dialog: false,
	modal: false,
	managed: true,

	layout: { type: 'vbox', align: 'stretch' },
	items: [
		{xtype:'nti-window-header' },
		{xtype:'container', flex: 1, windowContentWrapper:true}
	],


	onClassExtended: function(cls, data, hooks) {
		var onBeforeClassCreated = hooks.onBeforeCreated;

		hooks.onBeforeCreated = function(cls, data) {
			var superCls = cls.prototype.superclass,
				frame = Ext.clone(superCls.items),
				layout = Ext.clone(superCls.layout);

			if(data.dialog){
				data.layout = data.layout || 'auto';//dialogs define their own view
			}
			else {
				Ext.apply(frame.last(),{
					items: data.items,
					layout: data.layout,
					autoScroll: data.autoScroll
				});

				Ext.apply(frame.first(),{
					title: data.title || '',
					tools: data.tools || []
				});

				delete data.tools;

				data.items = frame;
				data.layout = layout;
				data.autoScroll = superCls.autoScroll;
			}
			onBeforeClassCreated.call(this, cls, data, hooks);
		};
	},

	constructor: function(config){
		this.manager = NextThought.view.WindowManager;

		if(!this.dialog && !config.dialog){

			Ext.copyTo(this.items.last(),config,['items','layout']);

			delete config.items;
			delete config.layout;

			var title = config.title;
			delete config.title;

			if(title){
				this.items.first().title = title;
			}
		}

		return this.callParent([config]);
	},


	initComponent: function(){
		this.callParent(arguments);
		var me = this,
			w = this.width,
			h = this.height;

		this.widthPercent = typeof w === 'string' ? (parseInt(w,10)/100) : null;
		this.heightPercent = typeof h === 'string' ? (parseInt(h,10)/100) : null;

		if( this.widthPercent || this.heightPercent ) {
			this.resizable = false;
			this.draggable = false;
			this.syncSize();
			Ext.EventManager.onWindowResize(me.syncSize,me);
			this.on('destroy',function(){ Ext.EventManager.removeResizeListener(me.syncSize,me);});
		}

		this.titleBar = this.down('nti-window-header');
		if(this.managed && !this.modal && !this.dialog){
			this.manager.register(this);
		}
	},


	afterRender: function(){
		this.callParent(arguments);
		this.fixScroll();
		this.mon(this.el,{
			contextmenu: function(e){e.stopEvent();return false;}
		});
	},


	fixScroll: function(){
		if(!Ext.isWebKit){return;}

		//This will fix a glitch in WebKit: if you try to drag something into the window, it caused it
		// to scroll sideways off screen.
		var me = this,
            target = 'targetEl',
            c = me.down('container[windowContentWrapper]');

        function getEl(c,sub){ return Ext.get(c.getId()+'-'+sub); }

		function fixIt(c, sub){
			var el = getEl(c,sub);
			if(el){
                el.setStyle({ position: 'fixed', top: 'initial', left: 'initial' });
			}
		}

        function fixWidth(){
            //This is called with various argument lengths, but the last argument is always the one we care about.
            var o = arguments[arguments.length - 1],
                cmp = o.cmp,
                side = 'margin' + Ext.String.capitalize( cmp.dock ),
                margin = cmp.getWidth() + 'px';
            //we need a margin here in webkits case because the docked items do not jive with the position fixed.  So,
            //calculate the margin and which side we need to set and apply.  If it's 0, that's okay.
            getEl(me,target).setStyle(side,margin);
        }

		fixIt(me,target);
		if(c){
			fixIt(c,target);
		}

        //get docked items so we can reset margins because of docked items
        Ext.each(me.getDockedItems(), function(i){
            var o = {
                'show': fixWidth,
                'hide': fixWidth,
                'close': fixWidth,
                'destroy': fixWidth,
                cmp: i,
                scope: me
            };

            me.mon(i, o);
            fixWidth(o);
        });
	},


	show: function(){
		var s = window.getSelection(), r,
			c = Ext.WindowManager.getActive();
		if( c ){
			c.fireEvent('deactivate');
			if( !c || (!c.modal && this.focusOnToFront) ){ c = null; }
			else {
                try {
                    r = RangeUtils.saveRange( s.getRangeAt(0) );
                    if (r.collapsed){r = RangeUtils.saveInputSelection(s);}
                }
                catch (e){
                    //no range to save, like a note to a chat for example...
                }
			}
		}

		this.callParent(arguments);

		if(c && !this.modal){
			c.toFront();
			if (r && r.startContainer) {
                r = RangeUtils.restoreSavedRange(r);
                if(r){
                    setTimeout(function(){
                        c = r.commonAncestorContainer;
                        c = c.focus? c:c.parentNode;
                        c.focus();
                        s.removeAllRanges();
                        s.addRange(r);
                    },50);
                }
            }
            else if (r && r.selectionStart){
                setTimeout(function(){
                    r.input.setSelectionRange(r.selectionStart, r.selectionEnd);
                },50);
            }

		}

		return this;
	},



	syncSize: function(){
		var me = this,
			h = Ext.Element.getViewportHeight() * me.heightPercent,
			w = Ext.Element.getViewportWidth() * me.widthPercent,
			size = me.rendered ? me.getSize() : {width: me.width, height: me.height};

		size.width	= Math.floor( w || size.width );//NaN is falsy
		size.height	= Math.floor( h || size.height );

		this.setSize(size,undefined);
		this.center();
		return size;
	},


	initResizable: function(){
		this.callParent(arguments);

		this.resizer.on({
			scope: this,
			beforeresize: this.resizeDragMaskOn,
			resizedrag: this.cancelResizeMaskTimeout,
			resize: this.dragMaskOff
		});
	},


	initDraggable: function() {
		if(!this.dialog){
			try {
				this.dd = new Ext.util.ComponentDragger(this, {
					constrain: true,
					constrainTo: Ext.getBody(),
					el: this.el,
					tolerance: this.dragStartTolerance,
					delegate: '.nti-window-header'
				});
				this.relayEvents(this.dd, ['dragstart', 'drag', 'dragend']);
				this.mon(this.dd,{
					scope: this,
					dragstart: this.dragMaskOn,
					dragend: this.dragMaskOff
				});
			}
			catch(e){
				console.error(Globals.getError(e));
			}
		}
	},



	setTitle: function(title){
		if( this.titleBar ){
			this.titleBar.update(title);
			this.fireEvent('titleChange',this,title);
		}
	},


	getTitle: function(){
		var title;
		if(this.titleBar){
			title = this.titleBar.getTitle();
		}
		return title || 'Untitled';
	},


	getHeight: function(){
		return this.rendered? this.callParent() : this.height || this.minHeight;
	},


	getWidth: function(){
		return this.rendered? this.callParent() : this.width || this.minWidth;
	},


	addTools: function(tools){
		if( this.titleBar ){
			this.titleBar.addTools(tools);
		}
	},

	resizeDragMaskOn: function(){
		this.dragMaskOn();
		this.resizeDragTimeout = Ext.defer(this.dragMaskOff,2000,this);
	},

	cancelResizeMaskTimeout: function(){
		clearTimeout(this.resizeDragTimeout);
	},

	dragMaskOn: function(){
		var e = Ext.getBody();
		this.wasMasked = this.modal || Boolean(Ext.getBody().isMasked());
		if(!this.wasMasked){

			e.mask('','drag-mask');
			try{
				e.getCache().data.maskEl.addCls('nti-clear');
			}
			catch(badThings){
				console.error('ExtJS private api changed..., find another way to add the class to the mask element');
			}
		}
	},


	dragMaskOff: function(){
		if(this.wasMasked === false){
			Ext.getBody().unmask();
		}
		delete this.wasMasked;
	},


	//stub for interface, WindowManager will implement
	notify: Ext.emptyFn
});
