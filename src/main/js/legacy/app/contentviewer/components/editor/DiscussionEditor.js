const Ext = require('@nti/extjs');
const {Editor} = require('@nti/web-discussions');

const Anchors = require('legacy/util/Anchors');

require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.app.contentviewer.components.editor.DiscussionEditor', {
	extend: 'Ext.container.Container',
	alias: 'widget.reading-discussion-editor',

	cls: 'nti-reading-discussion-editor',
	
	layout: 'none',
	items: [],


	initComponent () {
		this.callParent(arguments);

		this.setupEditor();
	},

	async setupEditor () {
		const {location, lineInfo, rangeInfo} = this;

		const page = await location.pageInfo.getInterfaceInstance();
		const bundle = await location.currentBundle.getInterfaceInstance();

		this.add({
			xtype: 'react',
			component: Editor,
			discussion: null,
			container: [bundle, page],
			extraData: {
				applicableRange: this.getApplicableRange(),
				ContainerId: rangeInfo.container || page.getID(),
				style: lineInfo.style || 'suppressed'
			},
			afterSave: (...args) => this.afterSave(...args),
			onCancel: (...args) => this.onCancel(...args)
		});
	},

	getApplicableRange () {
		const range = this?.rangeInfo?.range;

		const doc = range ? range.commonAncestorContainer.ownerDocument : null;
		const rangeDescription = Anchors.createRangeDescriptionFromRange(range, doc);

		return rangeDescription.description;
	},


	afterSave () {

	},


	onCancel () {

	},
});