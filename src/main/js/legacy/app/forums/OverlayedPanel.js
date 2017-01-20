const Ext = require('extjs');
const {Forums} = require('nti-web-discussions');
const DomUtils = require('../../util/Dom');

require('legacy/overrides/ReactHarness');
require('../contentviewer/overlay/Panel');

function getMutationObserver () {
	return window.MutationObserver || window.WebKitMutationObserver;
}

const OBSERVER_INIT = {
	childList: true,
	characterData: true,
	subtree: true,
	attributes: true
};

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
			layout: 'none',
			items: [{
				xtype: 'react',
				component: Forums.TopicParticipationSummary,
				topicID: data.ntiid,
				user: student && student.getId()
			}]
		});

		this.callParent([config]);
	},


	afterRender () {
		this.callParent(arguments);

		const mutation = getMutationObserver();
		const mutationHandler = Ext.Function.createBuffered(() => this.syncElementHeight(), 100);
		const observer = new mutation(mutationHandler);

		this.syncElementHeight();

		if (this.el.dom) {
			observer.observe(this.el.dom, OBSERVER_INIT);
		}

		this.on('destroy', () => {
			if (observer) {
				observer.disconnect();
			}
		});
	}
});
