Ext.define('NextThought.view.menus.Reports', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.report-menu',

	requires: [
		'NextThought.view.menus.LabeledSeparator'
	],

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menuitem',
		cls: 'report-menu-option',
		height: 40,
		plain: true
	},

	initComponent: function() {
		this.callParent(arguments);

		if (!this.links) {
			return;
		}

		var items = [], me = this;

		(me.links || []).forEach(function(link) {
			if (link.rel.indexOf('report-') === 0) {
				items.push({
					text: link.title,
					pdf: link.href,
					handler: me.reportItemClicked
				});
			}
		});

		if (!Ext.isEmpty(items)) {
			items.unshift({ xtype: 'labeledseparator', text: 'Reports', height: 1});
			me.add(items);
		}
	},


	reportItemClicked: function(item) {
		if (!item.pdf) {
			console.log('Cant show a report with out an pdf');
			return;
		}

		var win = Ext.widget('iframe-window', {
			width: 700,
			saveText: 'Save Report',
			link: item.pdf
		});

		win.show();
	}
});
