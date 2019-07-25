const Ext = require('@nti/extjs');
const {ScormCollection} = require('@nti/web-course');

require('legacy/overrides/ReactHarness');
require('../../Editor');
require('./RefEditor');


const RefMimeType = 'application/vnd.nextthought.scormcontentref';
const ScormContentMimeType = 'application/vnd.nextthought.scorm.scormcontentinfo';

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.scorm.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-scorm',
	SWITCHED: 'switched-items',

	statics: {
		getHandledMimeTypes () {
			return [
				RefMimeType
			];
		},


		getTypes () {
			return [
				{
					title: 'SCORM Package',
					category: 'scorm-package',
					iconCls: 'scorm-package-icon',
					description: '',
					editor: this,
					isAvailable: async (bundle) => {
						const available = await bundle.getAvailableContentSummary();

						return available[ScormContentMimeType];
					}
				}
			];
		}
	},

	cls: 'content-editor content-link lti-tools scorm-list-editor',

	maybeEnableBack (text) {
		if (!this.record && this.enableBack) {
			this.enableBack(text);
		}
	},

	showEditor () {
		if (this.record) {
			this.showItemEditor(this.record);
		} else {
			this.showItemList();
		}
	},


	onBack () {
		if (this.itemEditorCmp) {
			this.showItemList();
		} else if (this.doBack) {
			this.doBack();
		}
	},


	showItemEditor (item) {
		if (this.itemEditorCmp) {
			this.itemEditorCmp.destroy();
			delete this.itemEditorCmp;
		}

		this.itemEditorCmp = this.add({
			xtype: 'scorm-ref-editor',
			interfaceInstance: item,
			record: this.record,
			parentRecord: this.parentRecord,
			rootRecord: this.rootRecord,
			doClose: this.doClose,
			showError: this.showError,
			bundle: this.bundle
		});

		if (this.itemListCmp) {
			this.itemListCmp.destroy();
			delete this.itemListCmp;
		}

		this.enableSave();
		this.setSaveText(this.record ? 'Save' : 'Add to Lesson');
		this.maybeEnableBack('SCORM Packages');
	},


	async showItemList () {
		const course = await this.bundle.getInterfaceInstance();
		let selected = new Set();
		
		if (this.itemEditorCmp) {
			this.itemEditorCmp.destroy();
			delete this.itemEditorCmp;
		}

		this.maybeEnableBack(this.backText);
		this.setSaveText('Select');
		this.disableSave();

		const selectPackage = (obj) => {
			const id = obj.scormId;

			if (selected.has(id)) {
				selected = new Set();
				this.onSelectionChange(null);
			} else {
				selected = new Set([id]);
				this.onSelectionChange(obj);
			}

			this.itemListCmp.setProps({
				selected
			});
		};

		const unselectPackage = (obj) => {
			const id = obj.scormId;

			if (selected.has(id)) {
				selected = new Set();
				this.onSelectionChange(null);
			}

			this.itemListCmp.setProps({
				selected
			});
		};

		this.itemListCmp = this.add({
			xtype: 'react',
			component: ScormCollection,
			selected,
			course,
			addHistory: true,
			onPackageDeleted: unselectPackage,
			getRouteFor: (obj) => {
				if (obj.MimeType === ScormContentMimeType) {
					return () => selectPackage(obj);
				}
			}
		});
	},


	onSelectionChange (selection) {
		this.selectedItem = selection;

		if (selection) {
			this.enableSave();
		} else {
			this.disableSave();
		}
	},


	onSaveFailure (reason) {
		if (reason === this.SWITCHED) { return; }

	},


	doValidation () {
		return Promise.resolve();
	},


	onSave () {
		if (!this.itemEditorCmp) {
			this.showItemEditor(this.selectedItem);
			return Promise.reject(this.SWITCHED);
		}

		this.disableSubmission();

		return this.itemEditorCmp.onSave()
			.catch((reason) => {
				this.enableSubmission();
				return Promise.reject(reason);
			});
	}
});

