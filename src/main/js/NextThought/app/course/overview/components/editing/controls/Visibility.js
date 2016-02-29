Ext.define('NextThought.app.course.overview.components.editing.controls.Visibility', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-visibility',

	cls: 'nt-button visibility',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: 'Visibility:'},
		{cls: 'scope', cn: [
			{cls: 'text'}
		]},
		{cls: 'menu-container', cn: [{
			cls: 'options', cn: [
				{tag: 'tpl', 'for': 'options', cn: [
					{cls: 'option', html: '{.}', 'data-scope': '{.}'},
				]}
			]}
		]}
	]),


	renderSelectors: {
		scopeEl: '.scope',
		textEl: '.scope .text',
		menuContainer: '.menu-container',
		optionEl: '.options .option'
	},


	beforeRender: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			options: this.schema ? this.schema.choices : []
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		var selection;

		this.mon(this.scopeEl, 'click', this.toggleMenu.bind(this));
		this.textEl.update(this.getDefaultValue());
		
		if (this.defaultValue) {
			this.selected = this.defaultValue;
			selection = this.el.down('.option[data-scope='+ this.defaultValue +']');	
			this.selectOption(selection);
		}

		this.mon(this.el.select('.option'), 'click', this.onVisibilityChange.bind(this));
	},


	onVisibilityChange: function(e){
		var target = e.target,
		 	scope = target && target.getAttribute('data-scope');

		this.selectOption(target);
		this.scopeEl.update(scope);
		this.selected = scope;
		if (this.onChange) {
			this.onChange(this);
		}

		this.toggleMenu();
	},


	selectOption: function(item){
		var current = this.el.down('.option.selected'),
			newItem = item && Ext.fly(item);

		if (current) {
			current.removeCls('selected');
		}

		if (newItem) {
			Ext.fly(newItem).addCls('selected');	
		}
	},


	getDefaultValue: function() {
		return this.defaultValue || 'everyone';
	},


	getValue: function(){
		return {visibility: this.selected};
	},


	getChangedValues: function(){
		if (this.defaultValue && this.defaultValue === this.selected) {
			return {};
		}
		else {
			return {visibility: this.selected};
		}
	},


	toggleMenu: function(e) {		
		this.menuContainer.toggleCls('open');
	}
})