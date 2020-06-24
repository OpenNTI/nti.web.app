const Ext = require('@nti/extjs');
const {Editor} = require('@nti/web-discussions');

const Anchors = require('legacy/util/Anchors');
const ContextStore = require('legacy/app/context/StateStore');
const UserData = require('legacy/app/userdata/Actions');
const BaseModel = require('legacy/model/Base');

require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.app.contentviewer.components.editor.DiscussionEditor', {
	extend: 'Ext.container.Container',
	alias: 'widget.reading-discussion-editor',

	cls: 'nti-reading-discussion-editor',
	
	layout: 'none',
	items: [],


	initComponent () {
		this.callParent(arguments);

		this.ContextStore = ContextStore.getInstance();
		this.UserData = UserData.create();

		this.setupEditor();
	},

	isActive () {
		return !this.isDestroyed();
	},

	async setupEditor () {
		const {location, lineInfo, rangeInfo} = this;

		const page = await location.pageInfo.getInterfaceInstance();
		const bundle = await location.currentBundle.getInterfaceInstance();
		const pagesURL = this.getPagesURL();


		this.add({
			xtype: 'react',
			component: Editor,
			discussion: null,
			container: [bundle, page],
			extraData: {
				pagesURL,
				applicableRange: this.getApplicableRange(),
				ContainerId: rangeInfo.container || page.getID(),
				style: lineInfo.style || 'suppressed',
				selectedText: rangeInfo?.range ? rangeInfo?.range.toString() : ''
			},
			afterSave: (newNote) => {
				this.UserData.onDiscussionNote(BaseModel.interfaceToModel(newNote));
				this.afterSave?.();
			},
			onCancel: () => this.onCancel?.()
		});
	},

	getPagesURL () {
		const context = this.ContextStore.getContext();

		for (let i = context.length - 1; i >= 0; i--) {
			if (context[i]?.obj?.hasLink?.('Pages')) {
				return context[i].obj.getLink('Pages');
			}
		}
	},

	getApplicableRange () {
		const range = this?.rangeInfo?.range;

		const doc = range ? range.commonAncestorContainer.ownerDocument : null;
		const rangeDescription = Anchors.createRangeDescriptionFromRange(range, doc);

		return rangeDescription.description;
	}
});