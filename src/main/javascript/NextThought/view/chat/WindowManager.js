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


	register: function(win){
		var coord = this.getNextCoordinate();

		if(!win || !win.id){
			return;
		}

		this.registry[win.id] = win;

		win.x = coord[0] - win.width;
		win.y = coord[1];
		//win.setPagePosition(coord[0] - win.width,coord[1]);
		this.addToDock(win.id,win);

		win.on('destroy','unregister',this);
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

	getNextCoordinate: function(){
		var y = Ext.Element.getViewportHeight(),
			x = Ext.Element.getViewportWidth() - 280;//width of sidebar

		Ext.Object.each(this.registry, function(key, win){
			if(!win.rendered || !win.isVisible()){
				return;
			}
			var coord = win.getXY(),
				winHeight = win.getHeight(),
				winWidth = win.getWidth();
			if((y - (coord[1] + winHeight)) < 10){
				x = Math.min(x,coord[0]);
			}
		});

		return [x,y];
	}


});
