Ext.define('NextThought.app.course.overview.components.editing.controls.Visibility', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-visibility',

	cls: 'nt-button visibility',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: 'Visibility:'},
		{cls: 'scope', cn: [
			{cls: 'text'}
		]}
	]),


	renderSelectors: {
		scopeEl: '.scope',
		textEl: '.scope .text'
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.scopeEl, 'click', this.showMenu.bind(this));
		this.textEl.update(this.getDefaultValue());
		this.selected = this.defaultValue;
	},


	createVisibilityMenu: function(){
		var defaultValue = this.getDefaultValue(),
			menu = 
				Ext.widget('menu', {
					defaults: {
						ui: 'nt-menuitem',
						xtype: 'menucheckitem',
						plain: true,
						group: 'visibility',
						handler: this.onVisibilityChange.bind(this)
					},
					width: 125,
					items: [{
							text: 'Everyone',
							scope: 'everyone',
							checked: defaultValue === 'everyone',
							NoReply: false
						},
						{
							text: 'OU',
							scope: 'OU',
							checked: defaultValue === 'OU',
							NoReply: false
						},
						{
							text: 'ForCredit',
							scope: 'ForCredit',
							checked: defaultValue === 'ForCredit',
							NoReply: false
						}
					]
				});

		this.on('destroy', menu.destroy.bind(menu));
		return menu;
	},


	onVisibilityChange: function(item, e){
		this.scopeEl.update(item.scope);
		this.selected = item.scope;
		if (this.onChange) {
			this.onChange(this);
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


	showMenu: function(e) {
		if (!this.menu) {
			this.menu = this.createVisibilityMenu();
		}

		if (this.menu && !this.menu.isVisible()) {
			this.menu.showBy(this.scopeEl, 'tr-br?', [0, 1]);	
		}
		else {
			this.menu.hide();
		}
	}
})