const Ext = require('@nti/extjs');
const {Forums} = require('@nti/web-discussions');

const WindowActions = require('legacy/app/windows/Actions');
const DomUtils = require('legacy/util/Dom');

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
		const windowActions = new WindowActions();

		const gotoItem = (item) => {
			const itemId = item.getID();

			windowActions.pushWindow(itemId, null, null, {afterClose: () => this.refresh()});
		};

		Ext.apply(config, {
			layout: 'none',
			items: [{
				xtype: 'react',
				component: Forums.TopicParticipationSummary,
				topicID: data.ntiid,
				userID: student && student.getId(),
				gotoTopic: gotoItem,
				gotoComment: gotoItem
			}]
		});

		this.callParent([config]);
	},


	initComponent () {
		this.callParent(arguments);

		this.reactComponent = this.down('react');
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
	},

	refresh () {
		if (this.reactComponent && this.reactComponent.componentInstance) {
			this.reactComponent.componentInstance.refresh();
		}
	}
});
