var Ext = require('extjs');
var MenusLabeledSeparator = require('./LabeledSeparator');


module.exports = exports = Ext.define('NextThought.common.menus.Reports', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.report-menu',

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menuitem',
		cls: 'report-menu-option',
		height: 40,
		plain: true
	},

	initComponent: function () {
		this.callParent(arguments);

		if (!this.links) {
			return;
		}

		this.on('hide', 'destroy');

		var items = [], me = this;

		(me.links || []).forEach(function (link) {
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
			items.unshift({ xtype: 'labeledseparator', text: getString('NextThought.view.menus.Reports.reports'), height: 1});
			me.add(items);
		}

		if (this.showByEl) {
			this.showBy(this.showByEl);
		}
	},

	showReport: function (href) {
		/*
		....Report.pdf#view=FitH&toolbar=0&navpanes=0&statusbar=0&page=1

		http://partners.adobe.com/public/developer/en/acrobat/PDFOpenParameters.pdf

		Chrome ignores most Open PDF Paramaters. Only Safari's, FireFox's & Adobe's viewer seem to honor them...meaning we can't control how the PDF will look
		if we let the window get too big in Chrome. We have to figure out what the size the window should be for 100% and that be its max...otherwise chrome
		will not scale the pdf up.
		 */

		var win = Ext.widget('iframe-window', {
			width: 'max',
			saveText: getString('NextThought.view.menus.Reports.savetext'),
			link: href,
			loadingText: getString('NextThought.view.menus.Reports.loadingtext')
		});

		win.show();
	},

	reportItemClicked: function (item) {
		if (!item.pdf) {
			console.log('Cant show a report with out an pdf');
			return;
		}

		this.showReport(item.pdf);
	}
});
