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


	onSave: function() {
		var value = this.editorCmp.getValue();

		//TODO: save the values to the parenRecord
	}
});
