var Ext = require('extjs');
var ContentEditor = require('../../Editor');
var ModelAssignmentRef = require('../../../../../../../../model/AssignmentRef');
var QuestionsetAssignmentSelection = require('../AssignmentSelection');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.questionset.types.Assignment', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-questionset-assignment',

	statics: {
		getHandledMimeTypes: function () {
			return [
				NextThought.model.AssignmentRef.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Assignment',
					category: 'question-set',
					advanced: true,
					iconCls: 'assignment',
					description: '',
					editor: this
				}
			];
		},

		getEditorForRecord: function (record) {
			if (record instanceof NextThought.model.AssignmentRef) {
				return this;
			}
		}
	},

	LIST_XTYPE: 'overview-editing-assignment-selection',
	EDITOR_XTYPE: 'overview-editing-assignment-editor',
	backToList: 'Assignments',
	SWITCHED: 'switched',
	cls: 'content-editor questionset assignment',

	afterRender: function () {
		this.callParent(arguments);

		if (this.loading) {
			this.el.mask('Loading...');
		}
	},

	showEditor: function () {
		if (this.record) {
			this.showItemEditor();
		} else {
			this.showItemList();
		}
	},

	onBack: function () {
		if (this.itemEditorCmp) {
			this.showItemList([this.itemEditorCmp.selectedItem]);
		} else if (this.doBack) {
			this.doBack();
		}
	},

	maybeEnableBack: function (text) {
		if (!this.record && this.enableBack) {
			this.enableBack(text);
		}
	},

	getItemList: function () {
		return this.bundle.getAllAssignments();
	},

	showItemList: function (selectedItems) {
		var me = this;

		if (me.itemSelectionCmp) {
			me.itemSelectionCmp.destroy();
			delete me.itemSelectionCmp;
		}

		if (me.itemEditorCmp) {
			me.itemEditorCmp.destroy();
			delete me.itemEditorCmp;
		}

		me.removeAll(true);
		me.maybeEnableBack(me.backText);

		me.itemSelectionCmp = me.add({
			xtype: this.LIST_XTYPE,
			onSelectionChanged: this.onItemListSelectionChange.bind(this),
			selectedItems: selectedItems
		});


		me.getItemList()
			.then(function (items) {
				me.itemSelectionCmp.setSelectionItems(items);
			});
	},

	getSelectionFromRecord: function (record) {
		return this.bundle.getAssignments()
			.then(function (assignments) {
				return assignments.findItem(record.get('Target-NTIID'));
			});
	},

	getSelection: function () {
		var getAssignment,
			record = this.record;

		if (this.itemSelectionCmp) {
			getAssignment = Promise.resolve(this.itemSelectionCmp.getSelection()[0]);
		} else if (record) {
			getAssignment = this.getSelectionFromRecord(record);
		} else {
			getAssignment = Promise.resolve(null);
		}

		return getAssignment;
	},

	showItemEditor: function () {
		if (this.itemEditorCmp) {
			this.itemEditorCmp.destroy();
			delete this.itemEditorCmp;
		}

		var me = this;

		me.loading = true;

		if (me.rendered) {
			me.el.mask('Loading...');
		}

		me.getSelection()
			.then(function (selection) {
				me.itemEditorCmp = me.add({
					xtype: me.EDITOR_XTYPE,
					record: me.record,
					parentRecord: me.parentRecord,
					rootRecord: me.rootRecord,
					selectedItem: selection,
					doClose: me.doClose,
					onChangeItem: me.showItemList.bind(me, [selection]),
					showError: me.showError,
					enableSave: me.enableSave,
					disableSave: me.disableSave,
					setSaveText: me.setSaveText
				});

				me.maybeEnableBack(me.backToList);
				me.setSaveText(me.record ? 'Save' : 'Add to Lesson');
			})
			.then(function () {
				if (me.itemSelectionCmp) {
					me.itemSelectionCmp.destroy();
					delete me.itemSelectionCmp;
				}
			})
			.always(function () {
				delete me.loading;
				if (me.rendered) {
					me.el.unmask('Loading...');
				}
			});
	},

	onItemListSelectionChange: function (selection) {
		var length = selection.length;

		this.setSaveText('Select');

		if (length === 0) {
			this.disableSave();
		} else {
			this.enableSave();
		}
	},

	onSaveFailure: function (reason) {
		if (reason === this.SWITCHED) { return; }

		this.callParent(arguments);
	},

	onSave: function () {
		var me = this;

		if (!me.itemEditorCmp) {
			me.showItemEditor();
			return Promise.reject(me.SWITCHED);
		}

		me.disableSubmission();
		return me.itemEditorCmp.onSave()
			.fail(function (reason) {
				me.enableSubmission();
				return Promise.reject(reason);
			});
	}
});
