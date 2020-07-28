const Ext = require('@nti/extjs');
const {Drive} = require('@nti/web-integrations');
const {AssetIcon} = require('@nti/web-commons');

const RelatedWork = require('legacy/model/RelatedWork');

require('./Base');

const Type = 'application/vnd.nextthought.relatedworkref';
const DriveHrefRegex = /docs\.google/;
const DriveTypeRegex = /google-apps/;

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.GoogleDrive', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-contentlink-google-drive',

	statics: {
		getTypes () {
			return [
				{
					title: 'Google Drive',
					category: 'content',
					iconCls: 'google-drive',
					editor: this,
					isAvailable: async (bundle) => {
						const available = await bundle.getAvailableContentSummary();
						//TODO: check if the google drive
						return available[Type];
					}
				}
			];
		},

		getEditorForRecord (record) {
			if (DriveTypeRegex.test(record.get('type')) && DriveHrefRegex.test(record.get('href'))) {
				return this;
			}
		}
	},

	afterRender () {
		this.callParent(arguments);

		this.formCmp.setPlaceholder('icon', RelatedWork.getIconForURL());

		if (!this.record) {
			this.blockForm();
		} else {
			this.formCmp.setPlaceholder('icon', AssetIcon.getGoogleAppAsset(this.record.get('targetMimeType')));
		}
	},

	getDefaultValues () {
		const base = this.callParent(arguments);

		return base;
	},

	getFormSchema () {
		const base = this.callParent(arguments);

		base.push({type: 'hidden', name: 'targetMimeType'});
		base.push({type: 'hidden', name: 'href'});

		return base;
	},

	addHeaderCmp () {
		const rec = this.record;
		const selectedDoc = !rec ? null : {name: rec.get('label'), url: rec.get('href'), iconUrl: rec.get('icon')};

		const picker = this.add({
			xtype: 'react',
			component: Drive.Picker.Bar,
			autoLaunch: !selectedDoc,
			value: selectedDoc,
			onChange: (docs) => {
				if (!docs || !docs[0]) { return; }

				this.addDocumentData(docs[0]);
				picker.setProps({value: docs[0]});
			},
			onError: () => {
				alert('Unable to get Drive document');
			}
		});

		return picker;
	},

	addDocumentData (doc) {
		const form = this.getForm();

		form.setValue('label', doc.name);
		form.setValue('href', doc.url);
		form.setValue('targetMimeType', doc.mimeType);
		form.setPlaceholder('icon', AssetIcon.getGoogleAppAsset(doc.mimeType));

		this.unblockForm();
	},


	blockForm () {
		this.el.select('.group.card').addCls('blocked');
		this.el.select('.group.card input').set({disabled: true});
		this.el.select('.group.card textarea').set({disabled: true});
	},

	unblockForm () {
		this.el.select('.group.card').removeCls('blocked');
		this.el.select('.group.card input').set({disabled: void 0});
		this.el.select('.group.card textarea').set({disabled: void 0});
	}
});