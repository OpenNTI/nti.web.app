Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.Reading', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-contentlink-reading',

	requires: [
		'NextThought.app.content.Actions',
		'NextThought.app.course.overview.components.editing.content.contentlink.ReadingSelection',
		'NextThought.app.course.overview.components.editing.content.contentlink.ReadingEditor'
	],

	SWITCHED: 'switched-items',

	statics: {
		getTypes: function() {
			return [
				{
					title: 'From Catalog',
					advanced: true,
					category: 'content',
					iconCls: 'reading',
					description: '',
					editor: this
				}
			];
		},

		//TODO: override getEditorForRecord to check if the related work ref
		//is pointing to a reading
		getEditorForRecord: function(record) {
			if (record.isContent()) {
				return this;
			}
		}
	},

	cls: 'content-editor reading-editor',

	initComponent: function() {
		this.ContentActions = NextThought.app.content.Actions.create();

		this.callParent(arguments);
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.loading) {
			this.el.mask('Loading...');
		}
	},


	showEditor: function() {
		if (this.record) {
			this.showReadingEditor();
		} else {
			this.showReadingList();
		}
	},


	onBack: function() {
		if (this.readingEditorCmp) {
			this.showReadingList(this.readingEditorCmp.selectedItem);
		} else if (this.doBack) {
			this.doBack();
		}
	},


	maybeEnableBack: function(text) {
		if (!this.record && this.enableBack) {
			this.enableBack(text);
		}
	},


	showReadingList: function(selectedItems) {
		var me = this;

		if (this.readingSelectionCmp) {
			this.readingSelectionCmp.destroy();
			delete this.readingSelectionCmp;
		}

		if (this.readingEditorCmp) {
			this.readingEditorCmp.destroy();
			delete this.readingEditorCmp;
		}

		me.maybeEnableBack(me.backText);
		me.removeAll(true);

		me.readingSelectionCmp = me.add({
			xtype: 'overview-editing-reading-selection',
			onSelectionChanged: this.onReadingListSelectionChange.bind(this),
			selectedItems: selectedItems
		});

		ContentUtils.getReadings(this.bundle)
			.then(function(readings) {
				if (readings.length > 1) {
					console.warn('Dont know how to handle more than one set of readings, just picking the first.');
				}

				readings = readings[0];

				me.readingSelectionCmp.setSelectionItems(readings);
			});
	},


	getSelection: function() {
		var getReading;

		if (this.readingSelectionCmp) {
			getReading = Promise.resolve(this.readingSelectionCmp.getSelection()[0]);
		} else if (this.record) {
			getReading = ContentUtils.getReading(this.record.get('href'), this.bundle);
		} else {
			getReading = Promise.resolve(null);
		}

		return getReading;
	},


	showReadingEditor: function() {
		if (this.readingEditorCmp) {
			this.readingEditorCmp.destroy();
			delete this.readingEditorCmp;
		}

		var me = this;

		me.loading = true;

		if (me.rendered) {
			me.el.mask('Loading...');
		}

		me.getSelection()
			.then(function(selection) {
				me.readingEditorCmp = me.add({
					xtype: 'overview-editing-reading-editor',
					record: me.record,
					parentRecord: me.parentRecord,
					rootRecord: me.rootRecord,
					selectedItem: selection,
					doClose: me.doClose,
					onChangeReading: me.showReadingList.bind(me, [selection]),
					showError: me.showError,
					enableSave: me.enableSave,
					disableSave: me.disableSave,
					setSaveText: me.setSaveText
				});

				me.maybeEnableBack('Catalog');
				me.setSaveText(me.record ? 'Save' : 'Add to Lesson');
			})
			.then(function() {
				if (me.readingSelectionCmp) {
					me.readingSelectionCmp.destroy();
					delete me.readingSelectionCmp;
				}
			})
			.always(function() {
				delete me.loading;
				if (me.rendered) {
					me.el.unmask();
				}
			});
	},


	onReadingListSelectionChange: function(selection) {
		var length = selection.length;

		this.setSaveText('Select');

		if (length === 0) {
			this.disableSave();
		} else {
			this.enableSave();
		}
	},


	onSaveFailure: function(reason) {
		if (reason === this.SWITCHED) { return; }

		this.callParent(arguments);
	},


	doValidation: function() {
		return Promise.resolve();
	},


	onSave: function() {
		var me = this;

		if (!me.readingEditorCmp) {
			me.showReadingEditor();
			return Promise.reject(me.SWITCHED);
		}

		me.disableSubmission();
		return me.readingEditorCmp.onSave()
			.fail(function(reason) {
				me.enableSubmission();
				return Promise.reject(reason);
			});
	}
});
