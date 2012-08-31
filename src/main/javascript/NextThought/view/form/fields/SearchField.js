Ext.define('NextThought.view.form.fields.SearchField', {
	extend: 'Ext.Component',
	alias: 'widget.searchfield',
	requires: [
		'NextThought.view.form.fields.SearchAdvancedOptions'
	],

	renderTpl: Ext.DomHelper.markup({
		cls:'search-field-wrap',
		cn: [{
			cls:'search-field',
			cn: [
				{tag:'input', type:'text', placeholder:'Search'},
				{tag:'a', href:'#', cls:'trigger'}
			]
		}]
	}),

	renderSelectors: {
		boxEl: 'div.search-field',
		inputEl: 'input',
		triggerEl: 'a'
	},

	afterRender: function(){
		this.callParent(arguments);

		var parentMenu = this.up('menu');

		this.triggerEl.on('click',this.triggerMenu,this);
		this.triggerEl.addCls(Ext.baseCSSPrefix + 'menu');//make clicks on this not hide the menu

		this.menu = Ext.widget('search-advanced-menu',{width: this.boxEl.getWidth(),
			parentMenu: parentMenu,
			parentItem: parentMenu
		});

		this.menu.mon(parentMenu,'hide',this.menu.hide,this.menu);

		this.mon(this.inputEl,{
			scope: this,
			keypress: this.keyPressed,
			keydown: this.keyDown //keypress does not always fire for escape
		});
	},


	specialKeys: {
		8: true,	//Ext.EventObject.BACKSPACE
		27: true,	//Ext.EventObject.ESC
		32: true,	//Ext.EventObject.SPACE
		46: true,	//Ext.EventObject.DELETE
		37: true,	//Ext.EventObject.LEFT
		39: true 	//Ext.EventObject.RIGHT
	},


	keyDown: function(event) {
		var k = event.getKey();
		if(this.specialKeys[k]){
			if(k === event.ESC){
				this.inputEl.dom.value = '';
			}
			event.stopPropagation();
			this.keyPressed(event);
		}
	},


	keyPressed: function(event){
		event.stopPropagation();
		var k = event.getKey();
		if (k === event.ENTER || k === event.ESC) {
			this.fireSearchEvent();
		}
		else {
			this.fireSearchEventBuffered();
		}
	},


	fireSearchEvent: function(){
		clearTimeout(this.searchEventDelayId);
		var val = this.getValue();
		if(!val){
			this.fireEvent('clear-search');
		}
		else if(val.length > 3) {
			this.fireEvent('search', val);
		}
	},

	fireSearchEventBuffered: function(){
		var me = this;
		clearTimeout(this.searchEventDelayId);
		this.searchEventDelayId = setTimeout(function(){ me.fireSearchEvent(); }, 500);
	},

	triggerMenu: function(e){
		e.stopPropagation();
		e.preventDefault();

		if(!this.menu.isVisible()){
			this.menu.showBy(this.boxEl,'tl-bl?',[0,5]);
		}
		else {
			this.menu.hide();
		}

		//IE needs this
		return false;
	},


	getValue: function() {
		return this.inputEl.getValue();
	},

	getFocusEl: function(){
		return this.inputEl;
	}


});
