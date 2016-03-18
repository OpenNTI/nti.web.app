var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.library.components.Navigation', {
	extend: 'Ext.Component',
	alias: 'widget.library-navigation',

	cls: 'library-navigation',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'dropdown',
			cn: [
				{cls: 'label', html: 'Your Courses'},
				{cls: 'available', html: 'Find Courses'}
			]
		}
	]),

	renderSelectors: {
		dropdownEl: '.dropdown',
		labelEl: '.dropdown .label',
		availableEl: '.dropdown .available'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.dropdownEl, 'click', this.dropDownClick.bind(this));
	},


	buildMenu: function(options) {
		if (this.viewMenu) {
			this.viewMenu.hide();
			this.viewMenu.removeAll();
			this.viewMenu.add(options);
		} else {
			this.viewMenu = Ext.widget('menu', {
				cls: 'library-view-menu',
				ui: 'library-menu',
				ownerCmp: this,
				items: options,
				defaults: {
					ui: 'nt-menuitems',
					xtype: 'menucheckitem',
					group: 'library-menu',
					cls: 'group-by-option',
					height: 50,
					plain: true,
					listeners: {
						'checkchange': this.switchView.bind(this)
					}
				}
			});
		}

		if (options.length) {
			this.dropdownEl.removeCls('disabled');
		} else {
			this.dropdownEl.addCls('disabled');
		}
	},


	switchView: function(item) {
		this.bodyView.setState({
			active: item.type
		});
	},


	updateState: function(active, options) {
		if (!this.rendered) {
			this.on('afterrender', this.updateState.bind(this, active, options));
			return;
		}

		this.activeItem = active;
		this.labelEl.update(active.text);

		if (active.available && active.available.enabled) {
			this.availableEl.removeCls('hidden');
			this.availableEl.update(active.available.text);
		} else {
			this.availableEl.addCls('hidden');
		}

		this.buildMenu(options);
	},


	dropDownClick: function(e) {
		if (e.getTarget('.available')) {
			this.bodyView.showAvailable(this.activeItem.available.title, this.activeItem.available.route);
		} else if (!e.getTarget('.disabled') && e.getTarget('.label')) {
			this.viewMenu.showBy(this.dropdownEl, 'tl-bl');
		}
	}
});
