

Ext.define('NextThought.ui.ModeContainer', {
	extend: 'Ext.panel.Panel',
	
	border: false, 
	frame: false,
	layout: {
		type: 'card',
		deferredRender: true
	},
	activeItem: 0,
	items:[],
	
	constructor: function(config){
    	if(!config || !config.librarySource){
    		throw "no config, or no library source";
    	}
    	if(!config || !config.modeSwitch){
    		throw "no config, or no modeSwitch control";
    	}
    	
    	var ms = config.modeSwitch,
    		ls = config.librarySource;
    	
    	this.items.push(Ext.create('NextThought.ui.modes.Home',   {id: 'a', librarySource: ls, toggleButton: ms.addMode('home-mode','home-mode', Ext.bind(this._switchHome,this)) } ));
    	this.items.push(Ext.create('NextThought.ui.modes.Reader', {id: 'b', librarySource: ls, toggleButton: ms.addMode('book-mode','book-mode', Ext.bind(this._switchBook,this)) } ));
    	this.items.push(Ext.create('NextThought.ui.modes.Stream', {id: 'c', librarySource: ls, toggleButton: ms.addMode('strm-mode','strm-mode', Ext.bind(this._switchStream,this)) } ));

    	this.self.superclass.constructor.apply(this,arguments);
    	var m = this;
    	setTimeout(function(){
			m.items.get(1).toggleButton.toggle(true);
    	},100);
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