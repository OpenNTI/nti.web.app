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
	},


	triggerMenu: function(e,el){
		e.stopPropagation();
		e.preventDefault();

		//show menu
		this.menu.showBy(this.boxEl,'tl-bl?',[0,5]);

		//IE needs this
		return false;
	}

});
