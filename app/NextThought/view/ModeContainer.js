

Ext.define('NextThought.view.ModeContainer', {
	extend: 'Ext.panel.Panel',
	
	border: false, 
	frame: false,
	layout: {
		type: 'card',
		deferredRender: true
	},
	activeItem: 0,
	items:[],
	
	constructor: function(){//i don't know why the initComponent isn't called... put everything in the constructor for this class.
    	this.callParent(arguments);
    	
		var m = this, 
			ms = NextThought.modeSwitcher, 
			s = function(){ m.items.get(1).toggleButton.toggle(true); };
		
    	this.add(Ext.create('NextThought.view.modes.Home',   {id: 'a', toggleButton: ms.addMode('home-mode','home-mode', Ext.bind(this._switchHome,this)) } ));
    	this.add(Ext.create('NextThought.view.modes.Reader', {id: 'b', toggleButton: ms.addMode('book-mode','book-mode', Ext.bind(this._switchBook,this)) } ));
    	this.add(Ext.create('NextThought.view.modes.Stream', {id: 'c', toggleButton: ms.addMode('strm-mode','strm-mode', Ext.bind(this._switchStream,this)) } ));

    	setTimeout(s,100);
    	return this;
	},
	
	_switchHome: function(btn, state){
		this.getLayout().setActiveItem(0);
	},
	_switchBook: function(btn, state){
		this.getLayout().setActiveItem(1);
		// this.items.get(1).modeButton.toggle(true);
	},
	_switchStream: function(btn, state){
		this.getLayout().setActiveItem(2);
		// this.items.get(2).modeButton.toggle(true);
	},
    
    initComponent: function(){
   		this.callParent(arguments);
    }
});