const {encodeForURI} = require('@nti/lib-ntiids');
const Ext = require('@nti/extjs');

const ContentUtils = require('legacy/util/Content');
const ContentActions = require('legacy/app/content/Actions');
const NavigationActions = require('legacy/app/navigation/Actions');

require('../ContentPackageSelection');
require('../ReadingEditor');
require('../ReadingSelection');
require('./Base');

const Type = 'application/vnd.nextthought.relatedworkref';

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.Reading', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-contentlink-reading',
	SWITCHED: 'switched-items',

	statics: {
		getTypes: function () {
			return [
				{
					title: 'Reading',
					category: 'content',
					iconCls: 'reading',
					description: '',
					editor: this,
					isAvailable: async (bundle) => {
						const available = await bundle.getAvailableContentSummary();

						return available[Type];
					}
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
		this.ContentActions = ContentActions.create();

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

	createReading () {
		// create a package to fit the reading editor's expectations
		var contentTemplate = this.ContentActions.getEmptyContentPackage();
		contentTemplate.children = [];
		contentTemplate.label = contentTemplate.title;
		contentTemplate.getAttribute = (a) => { return contentTemplate[a]; };
		contentTemplate.get = contentTemplate.getAttribute;

		// this is used to indicate that this new content should be created as
		// there is no selection from the existing reading list
		this.newlyCreatedReading = contentTemplate;

		// must call this to maintain component workflow like selection
		this.showReadingList();
		this.showReadingEditor();
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

		// reset (in case the user selected "Create Reading", then came back
		// to this step and wants to choose an existing reading)
		this.newlyCreatedReading = null;

		let me = this;
		this.createReadingBtn = this.add({
			xtype: 'box',
			autoEl: {tag: 'div', cls: 'create-assignment-overview-editing', html: 'Create Reading'},
			listeners: {
				click: {
					element: 'el',
					fn: me.createReading.bind(me)
				}
			}
		});

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

		if (this.newlyCreatedReading) {
			getContentPackage = Promise.resolve(this.newlyCreatedReading);
		} else if (this.contentPackageSelectionCmp) {
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

		if (this.newlyCreatedReading) {
			getReading = Promise.resolve(this.newlyCreatedReading);
		} else if (this.readingSelectionCmp) {
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


	doValidation: function () {
		return this.readingEditorCmp ? this.readingEditorCmp.doValidation() : Promise.resolve();
	},


	onSaveFailure (reason) {
		if (reason === this.SWITCHED) { return; }

		if (this.readingEditorCmp) {
			return this.readingEditorCmp.onSaveFailure(reason);
		}

		//TODO: figure out this case
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

		// two options, either we're creating a new reading from this screen, or
		// we're adding an existing reading to a lesson
		if(me.newlyCreatedReading) {
			// update the new package based on form values (before creating the bundle)
			me.newlyCreatedReading.label = me.readingEditorCmp.formCmp.getValueOf('label');
			me.newlyCreatedReading.title = me.readingEditorCmp.formCmp.getValueOf('label');
			me.newlyCreatedReading.byline = me.readingEditorCmp.formCmp.getValueOf('byline');
			me.newlyCreatedReading.description = me.readingEditorCmp.formCmp.getValueOf('description');

			// user has decided to create and add this new reading to a lesson
			// so we need to actually create the empty reading, add to lesson,
			// then navigate the user to the reading editor
			return me.ContentActions.createReading(me.bundle, me.newlyCreatedReading)
				.then((pack) => {
					me.readingEditorCmp.contentPackage = pack;

					me.readingEditorCmp.formCmp.setValue('href', pack.get('NTIID'));
					me.readingEditorCmp.formCmp.setValue('target', pack.get('NTIID'));

					return me.readingEditorCmp.onSave()
						.then((rec) => {
							// navigate to newly created content's editor (still unpublished at this point)
							const route = `/course/${encodeForURI(this.bundle.getId())}` +
								(me.outlineNode ? `/lessons/${encodeForURI(me.outlineNode.get('NTIID'))}` : '') +
								`/content/${encodeForURI(pack.get('NTIID'))}/edit/`;

							NavigationActions.pushRootRoute(null, route, {pack});

							return rec;
						})
						.catch(function (reason) {
							me.enableSubmission();
							return Promise.reject(reason);
						});
				});

		}
		else {
			return me.readingEditorCmp.onSave()
				.catch(function (reason) {
					me.enableSubmission();
					return Promise.reject(reason);
				});
		}
	}
});
