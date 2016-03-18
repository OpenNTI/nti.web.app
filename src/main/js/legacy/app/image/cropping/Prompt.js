var Ext = require('extjs');
var PromptStateStore = require('../../prompt/StateStore');
var CroppingEditor = require('./Editor');


module.exports = exports = Ext.define('NextThought.app.image.cropping.Prompt', {
    extend: 'Ext.container.Container',
    alias: 'widget.image-cropping-prompt',
    layout: 'none',
    cls: 'image-cropping-prompt',
    items: [],
    title: 'Crop & Rotate',
    saveText: 'Save',

    initComponent: function() {
		this.callParent(arguments);

		var data = this.Prompt.data;

		if (data.src) {
			this.loadSrc(data.src, data.name);
		} else if (data.image) {
			this.loadImage(data.image, data.name);
		}

		this.Prompt.Header.setTitle(data.title || this.title);
		this.Prompt.Footer.setSaveText(data.saveText || this.saveText);
		this.Prompt.Footer.enableSave();
	},

    loadSrc: function(src, name) {
		this.editor = this.add({
			xtype: 'image-cropping-editor',
			name: name,
			src: src,
			crop: this.Prompt.data.crop
		});
	},

    loadImage: function(img, name) {
		this.editor = this.add({
			xtype: 'image-cropping-editor',
			name: name,
			img: img,
			crop: this.Prompt.data.crop
		});
	},

    showError: function() {
		this.add({
			xtype: 'box',
			autoEl: {cls: 'error', html: 'Failed to load image.'}
		});

		this.Prompt.Footer.disableSave();
	},

    onSave: function() {
		if (this.editor && this.editor.onSave) {
			return this.editor.onSave();
		}

		return Promise.reject('Nothing to submit.');
	}
}, function() {
	NextThought.app.prompt.StateStore.register('image-cropping', this);
});
