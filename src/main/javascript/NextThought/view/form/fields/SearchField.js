Ext.define('NextThought.view.form.fields.SearchField', {
	extend: 'Ext.Component',

	alias: 'widget.searchfield',

	renderTpl: [
		'<div class="search-field-wrap">',
			'<div class="search-field">',
				'<input type="text">',
				'<a href="#" class="trigger"></a>',
			'</div>',
		'</div>'
	],

	menu: {

	},

	renderSelectors: {
		boxEl: 'div',
		inputEl: 'input',
		triggerEl: 'a'
	},

	afterRender: function(){
		this.callParent(arguments);
		this.triggerEl.on('click',this.triggerMenu,this);

	},


	triggerMenu: function(e,el){
		e.stopPropagation();
		e.preventDefault();

		//show menu

		//IE needs this
		return false;
	}

});
