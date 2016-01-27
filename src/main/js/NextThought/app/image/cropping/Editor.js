Ext.define('NextThought.app.image.cropping.Editor', {
	extend: 'Ext.container.Container',
	alias: 'widget.image-cropping-editor',

	requires: [
		'NextThought.app.image.cropping.Canvas'
	],

	layout: 'none',
	cls: 'image-cropping-editor',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.canvas = this.add({
			xtype: 'image-cropping-canvas',
			crop: this.crop
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
						html: 'Rotate'
					},
					listeners: {
						click: {
							element: 'el',
							fn: this.doRotate.bind(this)
						}
					}
				}
			]
		});

		if (this.img) {
			this.canvas.setImage(this.img);
		} else if (this.src) {
			this.canvas.loadImage(this.src);
		}
	},


	doRotate: function() {
		if (this.canvas) {
			this.canvas.rotate();
		}
	},


	onSave: function() {
		if (this.canvas) {
			return this.canvas.getValue();
		}

		return Promise.reject();
	}
});
