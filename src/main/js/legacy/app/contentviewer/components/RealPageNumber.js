const Ext = require('@nti/extjs');
const {VisibleComponentTracker} = require('@nti/web-commons');

const DomUtils = require('legacy/util/Dom');

require('../overlay/Panel');
require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.app.contentviewer.components.RealPageNumber', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.overlay-content-real-page-number',

	cls: 'overlay-content-real-page-number',
	layout: 'none',
	items: [],

	initComponent () {
		this.callParent(arguments);

		const config = DomUtils.parseDomObject(this.contentElement);


		this.add({
			xtype: 'react',
			component: VisibleComponentTracker,
			data: {pageNumber: config['attribute-data-real-page-number']},
			group: 'real-page-numbers'
		});
	},


	setupContentElement () {
		try {
			if (this.contentElement) {
				Ext.fly(this.contentElement).setStyle({
					height: 0,
					width: 0,
					margin: 0,
					float: 'left'
				});
			}
		} catch (e) {
			//swallow
		}
	}
});
