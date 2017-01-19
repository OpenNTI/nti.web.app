const Ext = require('extjs');
const DomUtils = require('../../util/Dom');

require('legacy/overrides/ReactHarness');
require('../contentviewer/overlay/Panel');

module.exports = exports = Ext.define('NextThought.app.forums.OverlayedPanel', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.overlay-topic',

	cls: 'topic-embed-widget',

	constructor (config) {
		if (!config || !config.contentElement) {
			throw new Error('you must supply a contentElement');
		}

		const assessment = config.reader.getAssessment();
		const student = assessment.activeStudent;
		const data = DomUtils.parseDomObject(config.contentElement);


		Ext.apply(config, {
			layout: 'fit',
			items: [{
				xtype: 'box',
				autoEl: {html: 'Topic Embed'},
				topicId: data.ntiid,
				perspective: student && student.getId()
			}]
		});

		this.callParent([config]);
	}
});
