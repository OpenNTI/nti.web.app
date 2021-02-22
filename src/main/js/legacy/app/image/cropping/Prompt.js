const Ext = require('@nti/extjs');

const PromptStateStore = require('../../prompt/StateStore');

require('./Editor');

module.exports = exports = Ext.define(
	'NextThought.app.image.cropping.Prompt',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.image-cropping-prompt',
		layout: 'none',
		cls: 'image-cropping-prompt',
		items: [],
		title: 'Crop & Rotate',
		saveText: 'Save',

		initComponent() {
			this.callParent(arguments);
			const { title, saveText, ...data } = this.Prompt.data;

			this.load(data);

			this.Prompt.Header.setTitle(title || this.title);
			this.Prompt.Footer.setSaveText(saveText || this.saveText);
			this.Prompt.Footer.enableSave();
		},

		async load(src) {
			this.editor = this.add({ xtype: 'image-cropping-editor', ...src });
			if (src.auto) {
				await this.editor.imageReady;
				this.Prompt.doSave();
			}
		},

		showError() {
			this.add({
				xtype: 'box',
				autoEl: { cls: 'error', html: 'Failed to load image.' },
			});

			this.Prompt.Footer.disableSave();
		},

		onSave() {
			if (this.editor && this.editor.onSave) {
				return this.editor.onSave();
			}

			return Promise.reject('Nothing to submit.');
		},
	},
	function () {
		PromptStateStore.register('image-cropping', this);
	}
);
