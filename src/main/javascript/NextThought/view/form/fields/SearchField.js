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
		this.menu = Ext.widget('search-advanced-menu', {width: this.boxEl.getWidth()});
		this.inputEl.on('keypress', this.keyPressed, this);
		this.inputEl.on('keydown', this.keyDown, this); //keypress does not always fire for escape
	},


	keyDown: function(event) {
		if (event.getKey() === event.ESC) {
			this.inputEl.dom.value = '';
			this.fireEvent('clear-search');
		}
	},


	keyPressed: function(event){
		var k = event.getKey();
		if (k === event.ENTER) {
			this.fireSearchEventNow();
		}
		else {
			this.fireSearchEventBuffered()
		}
	},


	fireSearchEventNow: function(){
		this.fireEvent('search', this.inputEl.getValue());
	},


	fireSearchEventBuffered: function(){
		this.fireEvent('search', this.inputEl.getValue());
	},


	triggerMenu: function(e,el){
		e.stopPropagation();
		e.preventDefault();

		//show menu
		this.menu.showBy(this.boxEl,'tl-bl?',[0,5]);

		//IE needs this
		return false;
	}

},
function(){
	this.prototype.fireSearchEventBuffered = Ext.Function.createBuffered(this.prototype.fireSearchEventBuffered, 500);
});
