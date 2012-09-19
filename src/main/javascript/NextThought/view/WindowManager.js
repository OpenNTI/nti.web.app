Ext.define('NextThought.view.WindowManager',{
	singleton: true,

	padding: 6,
	snapZone: 40,

	registry: [],
	buttonMap: {},

	constructor: function(){
		this.tracker = Ext.DomHelper.append(Ext.getBody(),{
			tag: 'div',
			id: 'window-tracker',
			cls: 'window-tracker'
		}, true);

		var me = this,
			task = { interval: 600, run: function(){ me.organizeSnappedWindows(); } },
			spec = {
			cls: 'wrapper',
			children: [
				{ cls: 'window-placeholder' },
				{
					cls: 'window-minimized',
					children: [
						{
							cls: 'closer',
							children: [ {
								tag: 'img',
								src: Ext.BLANK_IMAGE_URL,
								cls: 'closer-nib'
							} ]
						},
						{ cls: 'title', children: [
							{ tag: 'span', html: '{0}' },
							{ cls: 'activity' }]
						}
					]
				}
			]
		};

		this.tpl = Ext.DomHelper.createTemplate(spec).compile();

		this.mappedEvents = {
			scope: this,
			titleChange: this.handleTitleChange,
			minimize: this.handleMinimize,
			close: this.handleClose,
			dragstart: this.handleDragStart,
			dragend: this.handleDragEnd,
			drag: this.handleDrag,
			move: this.handleMove,
			resize: this.handleResize,
			show: this.handleRestore
		};

		Ext.TaskManager.start(task);
	},


	initWindow: function(win,wrap){
		var btn = wrap.down('.window-minimized'),
			hlr = wrap.down('.window-placeholder');

		btn.setVisibilityMode(Ext.Element.DISPLAY);
		hlr.setVisibilityMode(Ext.Element.ASCLASS);
		hlr.visibilityCls = 'hidden';

		this.buttonMap[btn.id] = win;

		win.mon(win,this.mappedEvents);
		Ext.apply(win,{
			snapped: true,
			dragStartTolerance: 50,
			trackWrapper: wrap,
			minimizedButton: btn,
			placeHolder: hlr
		});

		btn.on('click',this.handleButtonClicked, this);
	},


	register: function(win){
		if(Ext.Array.contains(this.registry,win)){
			Ext.Error.raise('duplicate');
		}

		this.registry.push(win);
		this.initWindow(win, this.tpl.append(this.tracker,[win.getTitle()], true));

		win.notify = this.notifyTracker();

		if(win.minimized){ this.handleMinimize(win); }
		else { this.handleRestore(win); }
	},


	unregister: function(win){
		Ext.Array.remove(this.registry,win);

		win.notify = Ext.emptyFn;

		if(win.trackWrapper){
			win.trackWrapper.remove();
		}
	},


	handleButtonClicked: function(e){
		var id = e.getTarget('.window-minimized',null,true).id,
			m = this.buttonMap;

		if(e.getTarget('.closer')){
			m[id].close();
			delete m[id];
		}
		else {
			this.handleRestore(m[id]);
		}
	},


	handleClose: function(window){
		this.unregister(window);
	},


	handleMinimize: function(win){
		var btn = win.minimizedButton,
			hlr = win.placeHolder;
		win.minimized = true;
		win.hide();
		hlr.hide();
		btn.show();
		this.resetNotifications(win);
		this.organizeSnappedWindows();
	},


	handleRestore: function(win){
		win.minimized = false;
		win.minimizedButton.hide();
		this.resetNotifications(win);
		this.organizeSnappedWindows();
		if(win.rendered){
			win.show();
		}
	},


	handleTitleChange: function(win, newTitle){
		var btn = win.minimizedButton;
		if(!btn){
			console.warn('no associated button with win: ', win, 'now titled: ', newTitle);
			return;
		}
		btn.down('.title span').update(newTitle);
	},


	handleDragStart: function(dd){
		dd.comp.dragging = true;
	},


	handleDrag: function(dd,e){
		var me = this,
			win = dd.comp,
			wrap = win.trackWrapper.dom,
			p = this.tracker.dom,
			x = e.getXY()[0];

		Ext.each(me.registry,function(w){
			if(w === win ){return;}

			var t = w.trackWrapper,
				b = t.getPageBox(),
				n = t.dom;

			if(b.left <= x && x <= b.right){
				if(wrap.previousSibling){ p.insertBefore(wrap, n); }
				else { p.insertBefore(n,wrap); }
			}
		});
	},


	handleDragEnd: function(dd){
		var win = dd.comp;
		delete win.dragging;
	},


	handleMove: function(win,x, y){
		var bottom = y+win.getHeight(),
			zone = Ext.Element.getViewportHeight() - this.snapZone;

		win.snapped = (bottom >= zone);

		if(!win.snapped){
			win.placeHolder.hide();
		}
		else {
			win.placeHolder.show();
		}
	},


	handleResize: function(win,w){
		win.placeHolder.setWidth(w);
		if(win.snapped){
			this.organizeSnappedWindows();
		}
	},


	organizeSnappedWindows: function(){
		var me = this;

		Ext.Array.sort(me.registry,function(a,b){
			var as = a.trackWrapper.getPageBox().right,
				bs = b.trackWrapper.getPageBox().right;
			return as === bs ? 0 : as < bs ? 1 : -1; //smaller is greater in this case (0 = MAX, width of screen = MIN)
		});

		Ext.each(me.registry,function(win){
			if(!win.snapped || win.minimized===true || win.dragging){return;}

			win.placeHolder.show();


			var box = win.placeHolder.getPageBox();


			win.setPosition(
				box.right-win.getWidth(),
				box.bottom-win.getHeight());

		});
	},


	notifyTracker: function(){
		return function(){
			var btn = this.minimizedButton;
			this.notificationCount = (this.notificationCount || 0) + 1;
			btn.addCls(['notice-me']);
			btn.down('.activity').update(this.notificationCount);
		};
	},


	resetNotifications: function(win){
		delete win.notificationCount;
		var btn = win.minimizedButton;
		btn.removeCls(['notice-me','someone-is-typing']);
	}

});
