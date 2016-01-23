Ext.define('NextThought.app.course.overview.components.editing.controls.Visibility', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-visibility',

	cls: 'nt-button visibility',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'scope', cn: [
			{cls: 'text'},
			{cls: 'arrow'}
		]}
	]),


	renderSelectors: {
		scopeEl: '.scope'
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.scopeEl, 'click', this.showMenu.bind(this));
	},


	createVisibilityMenu: function(){
		var defaultValue = this.defaultValue || 'All',
			menu = 
				Ext.widget('menu', {
					defaults: {
						ui: 'nt-menuitem',
						xtype: 'menucheckitem',
						plain: true,
						group: 'visibility',
						handler: this.onVisibilityChange.bind(this)
					},
					width: 120,
					items: [{
							text: 'All',
							scope: 'All',
							checked: defaultValue === 'All',
							NoReply: false
						},
						{
							text: 'OU',
							scope: 'OU',
							checked: defaultValue === 'Open',
							NoReply: false
						},
						{
							text: 'Enrolled',
							scope: 'ForCredit',
							checked: defaultValue === 'ForCredit',
							NoReply: false
						}
					]
				});

		this.on('destroy', menu.destroy.bind(menu));
		return menu;
	},


	onVisibilityChange: function(){
		
	},


	showMenu: function(e) {
		var target = e.target || e.getTarget();
		if (!this.menu) {
			this.menu = this.createVisibilityMenu();
		}

		if (this.menu && !this.menu.isVisible()) {
			this.menu.showBy(target, 'tr-br?', [0, 2]);	
		}
		else {
			this.menu.hide();
		}
	}
})