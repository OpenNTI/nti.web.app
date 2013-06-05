Ext.define('NextThought.view.chat.WindowManager',{

	registry: [],
	buttonMap: {},


	constructor: function(){
		var me = this;

		function initDockPointer(){
			Ext.defer(me.getDock,1,me);
		}

		//Ensure we have a reference to the dock
		if(!me.getDock()){
			Ext.ComponentManager.onAvailable('chat-dock',initDockPointer,me);
		}

		Ext.EventManager.onWindowResize(this.onViewportResized,this);

		return this.callParent(arguments);
	},


	getDock: function(){
		if(!this.dock){
			this.dock = Ext.getCmp('chat-dock');
			if(this.dock){
				this.dock.getItemWithAssociatedWindow = function(win){
					return this.items.findBy(function(i){
						return win && win.id && (i.associatedWindowId === win.id);
					});
				};

				//Add items that were skipped
				Ext.Object.each(this.registry,this.addToDock,this);
			}
		}

		return this.dock;
	},


	addToDock: function(windowId, window){
		var hide,
			dock = this.getDock(),
			dockedItem;
		if(!dock) { return; }

		if(dock.getItemWithAssociatedWindow(window)){
			console.warn('WARN: duplicate dock add');
			return;
		}

		hide = !isMe(window.roomInfo.get('Creator'));


		dockedItem = dock.add({ associatedWindowId: windowId, associatedWindow: window, hidden: hide, isPresented: !hide });
		if(dockedItem){
			window.dockedItemRef = dockedItem;
		}
	},


	getWindows: function(){
		var wins = [];
		Ext.Object.each(this.registry,function(k,v){wins.push(v);});
		Ext.Array.sort(wins,function(a,b){ return b.x - a.x; });//keep the list descending n->0
		return wins;
	},


	register: function(win){
		if(!win || !win.id){
			return;
		}

		win.x = win.y = NaN;//flagging for un-positioned

		this.registry[win.id] = win;
		this.addToDock(win.id,win);
		win.on({
			scope: this,
			destroy:'unregister',
			show: 'realignWindow'
		});


	},


	unregister: function(win){
		if(!win || !win.id){
			return;
		}

		var dock = this.getDock(),
			id = win.id,
			w = this.registry[id],
			ref = w && w.dockedItemRef;

		delete this.registry[id];

		if(w !== win){
			console.warn('WARN: unregistered an instance with an id of another instance!');
		}

		if(!ref && dock){
			ref = dock.getItemWithAssociatedWindow(win);
		}

		if(ref){
			ref.destroy();
		}
		else if(!dock){
			console.warn('WARN: this should not happen');
		}
	},

	getNextCoordinate: function(winToMove){
		var y = Ext.Element.getViewportHeight(),
			x = Ext.Element.getViewportWidth() - 270,//width of sidebar
			w = winToMove.getWidth() + 10,
			wins = this.getWindows();


		Ext.each(wins,function(win){
			if(winToMove === win || !win.rendered || !win.isVisible()){
				return true;
			}

			var xy = win.getXY(),
				winHeight = win.getHeight(),
				winWidth = win.getWidth();

			if(isNaN(xy[0])){
				return true;
			}

			if((y - (xy[1] + winHeight)) < 10){//the window is low
				if((x-w) > (xy[0]+winWidth) ){//found a gap...fill it.
					return false;
				}
				x = Math.min(x,xy[0]);
			}

			return true;
		});

		return [x-w,y];
	},


	realignWindow: function(win){
		win.setPagePosition(this.getNextCoordinate(win));
	},


	onViewportResized: function(){
		//TODO: reorganize the windows? maybe? We don't have the concept of "docked" or "snapped" anymore...so, this may be a moot point.
	}
});
