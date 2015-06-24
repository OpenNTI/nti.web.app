Ext.define('NextThought.app.search.SearchBar', {
	extend: 'Ext.Component',
	alias: 'widget.search-searchbar',

	requires: [
		'NextThought.app.search.components.AdvancedOptions'
	],


	renderTpl: Ext.DomHelper.markup({
		cls: 'search-field-wrap',
		cn: [
			{
				cls: 'search-field',
				cn: [
					{tag: 'input', type: 'text', placeholder: getString('NextThought.view.form.fields.SearchField.placeholder')},
					{tag: 'a', href: '#', cls: 'trigger'}
				]
			}
		]
	}),


	renderSelectors: {
		boxEl: '.search-field',
		inputEl: 'input',
		triggerEl: '.trigger'
	},


	constructor: function() {
		this.callParent(arguments);
		this.placeholder = 'Search';
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.inputEl, {
			focus: this.onInputFocus.bind(this),
			blur: this.onInputBlur.bind(this)
		});
	},


	onInputFocus: function() {
		this.onSearchFocus();
	},


	onInputBlur: function() {
		this.onSearchBlur();
	}
});
