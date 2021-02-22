const Ext = require('@nti/extjs');

require('./Canvas');

module.exports = exports = Ext.define('NextThought.app.image.cropping.Editor', {
	extend: 'Ext.container.Container',
	alias: 'widget.image-cropping-editor',
	layout: 'none',
	cls: 'image-cropping-editor',
	items: [],

	initComponent() {
		this.callParent(arguments);

		this.canvas = this.add({
			xtype: 'image-cropping-canvas',
			crop: this.crop,
			name: this.name,
		});

		this.add({
			xtype: 'container',
			layout: 'none',
			cls: 'image-cropping-controls',
			items: [
				{
					xtype: 'box',
					autoEl: {
						cls: 'rotate',
						html: 'Rotate',
					},
					listeners: {
						click: {
							element: 'el',
							fn: this.doRotate.bind(this),
						},
					},
				},
			],
		});

		this.imageReady = this.image
			? this.canvas.setImage(this.image)
			: this.src
			? this.canvas.loadImage(this.src)
			: Promise.reject('No Source');
	},

	doRotate() {
		if (this.canvas) {
			this.canvas.rotate();
		}
	},

	onSave() {
		if (this.canvas) {
			return this.canvas.getValue();
		}

		return Promise.reject();
	},
});
