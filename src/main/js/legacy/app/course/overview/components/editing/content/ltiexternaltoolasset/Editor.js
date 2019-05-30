const Ext = require('@nti/extjs');
const React = require('react');
const { Prompt } = require('@nti/web-commons');
const { ContentSelection, LTIContent } = require('@nti/web-course');

const { isFeature } = require('legacy/util/Globals');
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
					title: 'LTI Tools',
					advanced: false,
					category: 'ltiexternaltoolasset',
					iconCls: 'ltitools',
					description: '',
					editor: this,
					isAvailable: (bundle) => {
						return bundle.hasLink('lti-configured-tools');
					}
				}
			];
		}
	},
	LIST_XTYPE: 'overview-editing-ltiexternaltoolasset-selection',
	EDITOR_XTYPE: 'overview-editing-ltiexternaltoolasset-editor',
	backToList: 'Configured Tools',
	SWITCHED: 'switched',
	cls: 'content-editor content-link lti-tools',

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
		return this.bundle.getLTIConfiguredTools(true);
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

		if (me.maybeShowCreateButton()) {
			if (this.addToolBtn) {
				this.addToolBtn.destroy();
				delete this.addToolBtn;
			}

			me.addToolBtn = me.add({
				xtype: 'box',
				autoEl: {tag: 'div', cls: 'create-ltitool-overview-editing', html: 'Create LTI Tool'},
				listeners: {
					click: {
						element: 'el',
						fn: me.showToolModal.bind(me)
					}
				}
			});
		}

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

	maybeShowCreateButton: function () {
		return isFeature('show-create-ltitool-button');
	},

	showToolModal: function () {
		var me = this;
		me.dialog = Prompt.modal(
			<LTIContent
				title="Add Tool"
				onSubmit={this.onToolModalSubmit.bind(this)}
				onBeforeDismiss={this.onToolModalDismission.bind(this)} />
		);

	},

	onToolModalSubmit: async function (item) {
		const me = this;
		try {
			const inst = await this.bundle.getInterfaceInstance();
			await inst.postToLink('lti-configured-tools', item);

			if (me.dialog) {
				me.dialog.dismiss();
			}

			me.getItemList()
				.then(function (items) {
					me.itemSelectionCmp.setSelectionItems(items.Items);
					me.itemSelectionCmp.clearSearch();
				});

		} catch (err) {
			console.log(err);
		}
	},

	onToolModalDismission: function () {
		const me = this;
		if (me.dialog) {
			me.dialog.dismiss();
		}
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
		var me = this;

		if (me.maybeShowCreateButton()) {
			if (this.addToolBtn) {
				this.addToolBtn.destroy();
				delete this.addToolBtn;
			}
		}

		if (me.itemEditorCmp) {
			me.itemEditorCmp.destroy();
			delete me.itemEditorCmp;
		}

		me.loading = true;

		if (me.rendered) {
			me.el.mask('Loading...');
		}

		me.getSelection()
			.then(function (selection) {
				const contentSelectionLink = (selection.Links || []).find(x => x.rel === 'ContentSelection');

				if (contentSelectionLink && !me.record) {
					me.ltiContentSelection = me.add({
						xtype: 'react',
						component: ContentSelection,
						src: contentSelectionLink.href,
						overviewGroupOID: me.parentRecord.get('OID'),
						width: selection.selection_height,
						height: selection.selection_height,
						title: selection.title || '',
						selectContent: me.selectContent.bind(me),
						onClose: me.onClose.bind(me)
					});
				}

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
	},

	onClose () {
		if (this.ltiContentSelection) {
			this.ltiContentSelection.destroy();
		}
		this.onBack();
	},

	selectContent (content) {
		const { title, ConfiguredTool, description, launchUrl } = content;
		if (this.itemEditorCmp) {
			this.itemEditorCmp.formCmp.setValue('title', title || '');
			this.itemEditorCmp.formCmp.setValue('description', description || '');
			this.itemEditorCmp.formCmp.setValue('ConfiguredTool', ConfiguredTool);
			this.itemEditorCmp.formCmp.setValue('launch_url', launchUrl);
			if (this.ltiContentSelection) {
				this.ltiContentSelection.destroy();
			}
		}
	}
});
