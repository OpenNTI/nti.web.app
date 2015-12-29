Ext.define('NextThought.app.course.overview.components.editing.parentselection.NewItem', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-parentselection-newitem',

	cls: 'over-editit-parentselection-newitem',
	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		if (!this.editor) {
			this.onBackClick();
			return;
		}

		var items = [];

		items.push({
			xtype: 'box',
			autoEl: {
				cls: 'error-msg'
			}
		});

		items.push(this.editor.create({isEditor: true}));

		if (this.hasOtherItems) {
			items.push({
				xtype: 'box',
				autoEl: {
					cls: 'back',
					html: 'Cancel'
				},
				listeners: {
					click: {
						element: 'el',
						fn: this.onBackClick.bind(this)
					}
				}
			});
		}

		items.push({
			xtype: 'box',
			autoEl: {
				cls: 'save',
				html: 'Create'
			},
			listeners: {
				click: {
					element: 'el',
					fn: this.onSave.bind(this)
				}
			}
		});

		this.add(items);

		this.editorCmp = this.down('[isEditor]');
	},

	renderSelectors: {
		errorEl: '.error-msg'
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
			minWait = Globals.WAIT_TIMES.SHORT,
			start = new Date(),
			me = this;

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
			.then(this.unMask.bind(this))
			.fail(function(error){
				me.unMask();
				me.errorEl.setHTML("Unable to create section");
				if(error){ console.error("Unable to create section because: " + error); }
			});
	},


	addNewItem: function(record) {
		if (this.afterCreation) {
			this.afterCreation(record);
		}
	}
});
