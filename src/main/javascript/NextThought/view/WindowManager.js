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

		var me = this;
		var task = {
			interval: 600,
			run: function(){ me.organizeSnappedWindows(); }
		};
		var spec = {
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
							{tag: 'span',html: '{0}'},
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
			resize: this.handleResize
		};

		Ext.TaskManager.start(task);
	},


	register: function(win){
		if(Ext.Array.contains(this.registry,win)){
			Ext.Error.raise('duplicate');
		}

		var wrap = this.tpl.append(this.tracker,[win.getTitle()], true),
			map = this.buttonMap,
			reg = this.registry,
			btn = wrap.down('.window-minimized'),
			hlr = wrap.down('.window-placeholder');

		win.mon(win,this.mappedEvents);

		btn.setVisibilityMode(Ext.Element.DISPLAY);
		hlr.setVisibilityMode(Ext.Element.ASCLASS);
		hlr.visibilityCls = 'hidden';

		win.snapped = true;
		win.dragStartTolerance = 50;
		win.trackWrapper = wrap;
		win.minimizedButton = btn;
		win.placeHolder = hlr;

		map[btn.id] = win;
		reg.push(win);

		win.minimized ? btn.show(): btn.hide();
		win.minimized ? hlr.hide(): hlr.show();

		btn.on({
			scope: this,
			click: function(e){
				var id = e.getTarget('.window-minimized',null,true).id;
				this.handleRestore(map[id]);
			}
		});

		btn.down('.closer').on('click',function(e){
			var id = e.getTarget('.window-minimized',null,true).id;
			map[id].close();
		});

		this.organizeSnappedWindows();
	},


	unregister: function(win){
		Ext.Array.remove(this.registry,win);

		if(win.trackWrapper){
			win.trackWrapper.remove();
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
		this.organizeSnappedWindows();
	},


	handleRestore: function(win){
		win.minimized = false;
		win.minimizedButton.hide();
		this.organizeSnappedWindows();
		win.show();
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
		var me = this;
		var win = dd.comp;
		var wrap = win.trackWrapper.dom;
		var p = this.tracker.dom;
		var x = e.getXY()[0];

		Ext.each(me.registry,function(w){
			if(w === win ){return;}

			var t = w.trackWrapper;
			var b = t.getPageBox();
			var n = t.dom;

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
			var as = a.trackWrapper.getPageBox().right;
			var bs = b.trackWrapper.getPageBox().right;
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
	}
});
