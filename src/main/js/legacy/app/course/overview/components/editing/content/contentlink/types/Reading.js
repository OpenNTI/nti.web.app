const Ext = require('extjs');
const ContentUtils = require('../../../../../../../../util/Content');

require('./Base');
require('../../../../../../../content/Actions');
require('../ReadingSelection');
require('../ContentPackageSelection');
require('../ReadingEditor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.Reading', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-contentlink-reading',
	SWITCHED: 'switched-items',

	statics: {
		getTypes: function () {
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
		getEditorForRecord: function (record) {
			if (record.isContent()) {
				return this;
			}
		}
	},

	cls: 'content-editor reading-editor',

	initComponent: function () {
		this.ContentActions = NextThought.app.content.Actions.create();

		this.callParent(arguments);
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.loading) {
			this.el.mask('Loading...');
		}
	},

	showEditor: function () {
		if (this.record) {
			this.showReadingEditor();
		} else {
			this.showContentPackageList();
		}
	},

	onBack: function () {
		if (this.readingEditorCmp) {
			this.maybeShowReadingList(this.readingEditorCmp.selectedItem);
		} else if (this.readingSelectionCmp) {
			this.showContentPackageList();
		} else if (this.doBack) {
			this.doBack();
		}
	},

	maybeEnableBack: function (text) {
		if ((!this.record || !this.readingSelctionCmp) && this.enableBack) {
			this.enableBack(text);
		}
	},


	maybeShowReadingList (selection) {
		ContentUtils.getContentPackageContainingReading(selection.getAttribute ? selection.getAttribute('ntiid') : selection, this.bundle)
			.then((contentPackage) => {
				if (!contentPackage) {
					return Promise.reject();
				}

				return ContentUtils.getReadings(this.bundle, false, contentPackage.get('NTIID'))
					.then((readings) => {
						if (readings.length === 1) {
							this.showContentPackageList(contentPackage);
						} else {
							this.showReadingList(selection);
						}
					});
			})
			.catch(() => {
				this.showContentPackageList();
			});
	},


	getContentPackageList () {
		return this.bundle.getContentPackages();
	},


	showContentPackageList (selectedItems) {
		if (this.contentPackageSelectionCmp) {
			this.contentPackageSelectionCmp.destroy();
			delete this.contentPackageSelectionCmp;
		}

		if (this.readingSelectionCmp) {
			this.readingSelectionCmp.destroy();
			delete this.readingSelectionCmp;
		}

		if (this.readingEditorCmp) {
			this.readingEditorCmp.destroy();
			delete this.readingEditorCmp;
		}

		this.maybeEnableBack(this.backText);
		this.removeAll(true);

		this.contentPackageSelectionCmp = this.add({
			xtype: 'overview-editing-content-package-item-selection',
			onSelectionChanged: this.onContentPackageSelectionChange.bind(this),
			selectionItems: this.getContentPackageList(),
			selectedItems
		});

	},

	showReadingList: function (selectedItems) {
		if (this.readingSelectionCmp) {
			this.readingSelectionCmp.destroy();
			delete this.readingSelectionCmp;
		}

		if (this.readingEditorCmp) {
			this.readingEditorCmp.destroy();
			delete this.readingEditorCmp;
		}

		this.maybeEnableBack(this.backText);
		this.removeAll(true);

		this.loading = true;

		if (this.rendered) {
			this.el.mask('Loading...');
		}

		this.getContentPackageSelection()
			.then((selection) => {
				this.readingSelectionCmp = this.add({
					xtype: 'overview-editing-reading-selection',
					onSelectionChanged: this.onReadingListSelectionChange.bind(this),
					selectedItems: selectedItems,
					applyFilter: () => this.showFilteredList(selection),
					removeFilter: () => this.showUnfilteredList(selection)
				});

				return this.showFilteredList(selection);
			})
			.then(() => {
				if (this.contentPackageSelectionCmp) {
					this.contentPackageSelectionCmp.destroy();
					delete this.contentPackageSelectionCmp;
				}
			})
			.always(() => {
				delete this.loading;

				if (this.rendered) {
					this.el.unmask();
				}
			});
	},


	showFilteredList: function (contentPackage) {
		return ContentUtils.getReadings(this.bundle, false, contentPackage.get('NTIID'))
			.then(this.showReadings.bind(this));
	},


	showUnfilteredList: function (contentPackage) {
		return ContentUtils.getReadings(this.bundle, true, contentPackage.get('NTIID'))
			.then(this.showReadings.bind(this));
	},


	showReadings: function (readings) {
		this.readingSelectionCmp.setSelectionItems(readings);

		if (readings.length === 1) {
			this.readingSelectionCmp.selectItem(readings[0]);
			this.showReadingEditor();
		}
	},


	getContentPackageSelection () {
		let getContentPackage;

		if (this.contentPackageSelectionCmp) {
			getContentPackage = Promise.resolve(this.contentPackageSelectionCmp.getSelection()[0]);
		} else if (this.record) {
			getContentPackage = ContentUtils.getContentPackageContainingReading(this.record.get('href'), this.bundle);
		} else {
			getContentPackage = Promise.resolve(null);
		}

		return getContentPackage;
	},

	getReadingSelection: function () {
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

	showReadingEditor: function () {
		if (this.readingEditorCmp) {
			this.readingEditorCmp.destroy();
			delete this.readingEditorCmp;
		}

		var me = this;

		me.loading = true;

		if (me.rendered) {
			me.el.mask('Loading...');
		}

		Promise.all([
			me.getContentPackageSelection(),
			me.getReadingSelection()
		])
			.then(function (results) {
				const contentPackage = results[0];
				const selection = results[1];

				me.readingEditorCmp = me.add({
					xtype: 'overview-editing-reading-editor',
					record: me.record,
					parentRecord: me.parentRecord,
					rootRecord: me.rootRecord,
					editorGroup: me.editorGroup,
					copyValues: me.copyValues,
					copyVisibility: me.copyVisibility,
					switchRecordType: me.switchRecordType,
					contentPackage,
					selectedItem: selection,
					doClose: me.doClose,
					onChangeReading: () => me.maybeShowReadingList(selection),
					showError: me.showError,
					enableSave: me.enableSave,
					disableSave: me.disableSave,
					setSaveText: me.setSaveText
				});

				me.maybeEnableBack('Catalog');
				me.setSaveText(me.record ? 'Save' : 'Add to Lesson');
			})
			.then(function () {
				if (me.readingSelectionCmp) {
					me.readingSelectionCmp.destroy();
					delete me.readingSelectionCmp;
				}
			})
			.always(function () {
				delete me.loading;
				if (me.rendered) {
					me.el.unmask();
				}
			});
	},

	onContentPackageSelectionChange (selection) {
		var length = selection.length;

		this.setSaveText('Select');

		if (length === 0) {
			this.disableSave();
		} else {
			this.enableSave();
		}
	},

	onReadingListSelectionChange (selection) {
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

	doValidation: function () {
		return this.readingEditorCmp ? this.readingEditorCmp.doValidation() : Promise.resolve();
	},

	onSave: function () {
		var me = this;

		if (!me.readingSelectionCmp && !me.readingEditorCmp) {
			me.showReadingList();
			return Promise.reject(me.SWITCHED);
		}

		if (!me.readingEditorCmp) {
			me.showReadingEditor();
			return Promise.reject(me.SWITCHED);
		}

		me.disableSubmission();
		return me.readingEditorCmp.onSave()
			.catch(function (reason) {
				me.enableSubmission();
				return Promise.reject(reason);
			});
	}
});
