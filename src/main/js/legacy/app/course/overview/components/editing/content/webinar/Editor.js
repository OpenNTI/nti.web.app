const Ext = require('@nti/extjs');
const {WebinarEditor} = require('@nti/web-course');

const Webinar = require('legacy/model/Webinar');
const EditingActions = require('legacy/app/course/overview/components/editing/Actions');

require('../../Editor');
require('legacy/app/course/assessment/components/CreateMenu');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.webinar.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-webinar',

	statics: {
		getHandledMimeTypes: function () {
			return [
				Webinar.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Webinar',
					editorTitle: 'Add a Webinar',
					advanced: false,
					category: 'webinar',
					iconCls: 'webinar',
					hideFooter: true,
					description: '',
					editor: this
				}
			];
		}
	},
	LIST_XTYPE: 'overview-editing-webinar-selection',
	EDITOR_XTYPE: 'overview-editing-webinar-editor',
	backToList: 'Configured Tools',
	SWITCHED: 'switched',
	cls: 'content-editor content-webinar',

	afterRender: function () {
		this.callParent(arguments);
		this.EditingActions = new EditingActions();

		if (this.loading) {
			this.el.mask('Loading...');
		}
	},

	showEditor: async function () {
		const lessonOverview = await this.rootRecord.getInterfaceInstance();
		const overviewGroup = await this.parentRecord.getInterfaceInstance();

		this.webinarEditor = this.add({
			xtype: 'react',
			component: WebinarEditor,
			activePanel: 'overview', // determine which panel to show based on status (not connected yet, choosing a webinar, etc)
			lessonOverview,
			overviewGroup,
			onCancel: () => {
				if(this.doClose) {
					this.doClose();
				}
			},
			onAddToLesson: (selectedSection, selectedRank, img, webinar) => {
				if(this.doSave) {
					// get ext record based on selected interface record
					const parent = this.rootRecord.get('Items').filter(x=>x.getId() === selectedSection.getID())[0];

					this.doSave();
				}
			}
		});
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

	onSaveFailure: function (reason) {
		if (reason === this.SWITCHED) { return; }

		this.callParent(arguments);
	},

	onSave: function () {
		// TODO: Handle adding to lesson

		return Promise.resolve();

		// var me = this;
		//
		// if (!me.itemEditorCmp) {
		// 	me.showItemEditor();
		// 	return Promise.reject(me.SWITCHED);
		// }
		//
		// me.disableSubmission();
		// return me.itemEditorCmp.onSave()
		// 	.catch(function (reason) {
		// 		me.enableSubmission();
		// 		return Promise.reject(reason);
		// 	});
	}
});
