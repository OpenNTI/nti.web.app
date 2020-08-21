require('./DiscussionEditor.scss');
const Ext = require('@nti/extjs');
const {Editor} = require('@nti/web-modeled-content');
const {Create} = require('@nti/web-discussions');
const {getService} = require('@nti/web-client');
const {getHistory} = require('@nti/web-routing');

const Anchors = require('legacy/util/Anchors');
const ContextStore = require('legacy/app/context/StateStore');
const UserData = require('legacy/app/userdata/Actions');
const BaseModel = require('legacy/model/Base');

require('legacy/overrides/ReactHarness');

const BodyScrollClass = 'nti-reading-discussion-editor-body-scroll';

module.exports = exports = Ext.define('NextThought.app.contentviewer.components.editor.DiscussionEditor', {
	extend: 'Ext.container.Container',
	alias: 'widget.reading-discussion-editor',

	cls: 'nti-reading-discussion-editor',

	layout: 'none',
	items: [],

	statics: {
		getInitialStateForImage (img) {
			return Editor.getContentForImage(img);
		}
	},


	initComponent () {
		this.callParent(arguments);

		this.ContextStore = ContextStore.getInstance();
		this.UserData = UserData.create();

		this.setupEditor();
	},

	afterRender () {
		this.callParent(arguments);

		if (this.htmlCls) {
			const html = document.documentElement;
			html.classList.add(this.htmlCls);

			this.on('destroy', () => {
				html.classList.remove(this.htmlCls);
			});
		}
	},

	setBodyScroll (isBodyScroll) {
		if (isBodyScroll) {
			this.addCls(BodyScrollClass);
		} else {
			this.removeCls(BodyScrollClass);
		}
	},

	isActive () {
		return !this.isDestroyed;
	},

	async setupEditor () {
		const {location, lineInfo, rangeInfo} = this;

		const page = await this.getPage();

		if (!page) {
			alert('Unable to create a note');
			this.onCancel?.();
			return;
		}

		const bundle = await location.currentBundle.getInterfaceInstance();
		const pagesURL = this.getPagesURL();


		this.add({
			xtype: 'react',
			component: Create,
			discussion: null,
			small: true,
			container: [bundle, page],
			addHistory: true,

			initialContent: this.initialContent,
			extraData: {
				pagesURL,
				applicableRange: this.getApplicableRange(),
				ContainerId: rangeInfo?.container || rangeInfo?.containerId || page.getID(),
				style: lineInfo?.style || 'suppressed',
				selectedText: rangeInfo?.range ? rangeInfo?.range.toString() : ''
			},
			afterSave: (newNote) => {
				this.UserData.onDiscussionNote(BaseModel.interfaceToModel(newNote));
				this.afterSave?.();
			},
			onClose: async () => {
				try {
					await getHistory().awaitUserConfirmation();
					this.onCancel?.();
				} catch (e) {
					//swallow
				}
			}
		});
	},

	async getPage () {
		const page = this.location?.pageInfo;

		if (!page) { return null; }
		if (!page.isMock) { return page.getInterfaceInstance(); }

		try {
			const service = await getService();

			return service.getObject(page.get('NTIID'));
		} catch (e) {
			return null;
		}
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
		if (this.applicableRange) { return this.applicableRange; }

		const range = this?.rangeInfo?.range;

		const doc = range ? range.commonAncestorContainer.ownerDocument : null;
		const rangeDescription = Anchors.createRangeDescriptionFromRange(range, doc);

		return rangeDescription.description;
	}
});
