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
		var dock = this.getDock(),
			dockedItem;
		if(!dock) { return; }

		if(dock.getItemWithAssociatedWindow(window)){
			console.warn('WARN: duplicate dock add');
			return;
		}

		dockedItem = dock.add({ associatedWindowId: windowId, associatedWindow: window });
		if(dockedItem){
			window.dockedItemRef = dockedItem;
		}
	},


	register: function(win){
		if(!win || !win.id){
			return;
		}

		this.registry[win.id] = win;

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
	}


});
