Ext.define('NextThought.view.form.fields.SearchField', {
	extend: 'Ext.Component',
	alias: 'widget.searchfield',
	requires: [
		'NextThought.view.form.fields.SearchAdvancedOptions'
	],

	renderTpl: [
		'<div class="search-field-wrap">',
			'<div class="search-field">',
				'<input type="text" placeholder="Search">',
				'<a href="#" class="trigger"></a>',
			'</div>',
		'</div>'
	],

	renderSelectors: {
		boxEl: 'div.search-field',
		inputEl: 'input',
		triggerEl: 'a'
	},

	afterRender: function(){
		this.callParent(arguments);
		this.triggerEl.on('click',this.triggerMenu,this);
		this.triggerEl.addCls(Ext.baseCSSPrefix + 'menu');//make clicks on this not hide the menu
		this.menu = Ext.widget({xtype: 'search-advanced-menu', width: this.boxEl.getWidth()});
		this.inputEl.on({
			scope: this,
			keypress: this.keyPressed,
			keydown: this.keyDown //keypress does not always fire for escape
		});
	},


	specialKeys: {
		27: true,	//Ext.EventObject.prototype.ESC
		8: true,	//Ext.EventObject.prototype.BACKSPACE
		46: true	//Ext.EventObject.prototype.DELETE
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
		var val = this.inputEl.getValue();
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

	triggerMenu: function(e,el){
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
	}
});
