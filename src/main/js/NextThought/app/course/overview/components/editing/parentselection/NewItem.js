Ext.define('NextThought.app.course.overview.components.editing.parentselection.NewItem', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-parentselection-newitem',

	cls: 'over-editit-parentseleciton-newitem',
	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		if (!this.editor) {
			this.onBackClick();
			return;
		}

		this.add([
			{
				xtype: 'box',
				autoEl: {
					cls: 'back',
					html: 'Back'
				},
				listeners: {
					click: {
						element: 'el',
						fn: this.onBackClick.bind(this)
					}
				}
			},
			this.editor.create({
				isEditor: true
			}),
			{
				xtype: 'box',
				autoEl: {
					cls: 'save',
					html: 'Save'
				},
				listeners: {
					click: {
						element: 'el',
						fn: this.onSave.bind(this)
					}
				}
			}
		]);


		this.editorCmp = this.down('[isEditor]');
	},


	onBackClick: function() {
		if (this.onBack) {
			this.onBack();
		}
	},


	addMask: function() {
		this.el.mask('Saving...');
	},


	unMask: function() {
		this.el.unmask();
	},


	onSave: function() {
		var value = this.editorCmp.getValue(),
			minWait = 300,
			start = new Date();

		if (!this.parentRecord || !this.parentRecord.appendContent) { return; }

		this.addMask();

		this.parentRecord.appendContent(value)
			.then(function(result) {
				var end = new Date(),
					duration = end - start;

				if (duration < wait) {
					return wait(wait - duration)
						.then(function() {
							return result;
						});
				}

				return result;
			})
			.then(this.addNewItem.bind(this))
			.then(this.unMask.bind(this));
	},


	addNewItem: function(record) {
		if (this.afterCreation) {
			this.afterCreation(record);
		}
	}
});
