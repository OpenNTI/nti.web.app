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

		this.on('hide', 'destroy');

		var items = [], me = this;

		(me.links || []).forEach(function(link) {
			if (link.rel.indexOf('report-') === 0) {
				items.push({
					text: link.title,
					pdf: link.href,
					handler: Ext.bind(me.reportItemClicked, me)
				});
			}
		});

		if (this.items.length === 0 && items.length === 1 && this.showIfOne) {
			this.showReport(items[0].pdf);
			me.hide();
			return;
		}

		if (!Ext.isEmpty(items)) {
			items.unshift({ xtype: 'labeledseparator', text: 'Reports', height: 1});
			me.add(items);
		}

		if (this.showByEl) {
			this.showBy(this.showByEl);
		}
	},


	showReport: function(href) {
		var win = Ext.widget('iframe-window', {
				width: 'max',
				saveText: 'Open in new window',
				link: href
			});

		win.show();
	},


	reportItemClicked: function(item) {
		if (!item.pdf) {
			console.log('Cant show a report with out an pdf');
			return;
		}

		this.showReport(item.pdf);
	}
});
