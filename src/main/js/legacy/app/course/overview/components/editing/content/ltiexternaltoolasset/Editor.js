const Ext = require('extjs');

const LTIExternalToolAsset = require('legacy/model/LTIExternalToolAsset');
const EditingActions = require('legacy/app/course/overview/components/editing/Actions');

require('../../Editor');
require('./LTIExternalToolAssetSelection');
require('./LTIExternalToolAssetEditor');
require('legacy/app/course/assessment/components/CreateMenu');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.ltiexternaltoolasset.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-ltiexternaltoolasset',

	statics: {
		getHandledMimeTypes: function () {
			return [
				LTIExternalToolAsset.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Add an LTI Tool',
					advanced: false,
					category: 'ltiexternaltoolasset',
					iconCls: 'link',
					description: '',
					editor: this
				}
			];
		}
	},
	LIST_XTYPE: 'overview-editing-ltiexternaltoolasset-selection',
	EDITOR_XTYPE: 'overview-editing-ltiexternaltoolasset-editor',
	backToList: 'Configured Tools',
	SWITCHED: 'switched',
	cls: 'content-editor content-link',

	afterRender: function () {
		this.callParent(arguments);
		this.EditingActions = new EditingActions();

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
		return this.bundle.getLTIConfiguredTools();
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
				me.itemSelectionCmp.setSelectionItems(items.Items);
			});
	},

	getSelectionFromRecord: function (record) {
		return this.bundle.getLTIConfiguredTools()
			.then(function (tools) {
				const ConfiguredToolNTIID = record.get('ConfiguredTool').NTIID;
				var ConfiguredTool = undefined;
				tools.Items.forEach(function (tool) {
					if (tool.NTIID === ConfiguredToolNTIID) {
						ConfiguredTool = tool;
					}
				});
				return ConfiguredTool;
			});
	},

	getSelection: function () {
		var getTool,
			record = this.record;

		if (this.itemSelectionCmp) {
			getTool = Promise.resolve(this.itemSelectionCmp.getSelection()[0]);
		} else if (record) {
			getTool = this.getSelectionFromRecord(record);
		} else {
			getTool = Promise.resolve(null);
		}

		return getTool;
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
			.catch(function (reason) {
				me.enableSubmission();
				return Promise.reject(reason);
			});
	}
});
