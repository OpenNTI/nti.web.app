const Ext = require('@nti/extjs');
const {scoped} = require('@nti/lib-locale');

const OverviewGroup = require('legacy/model/courses/overview/Group');

const ParentSelection = require('./ParentSelection');

require('../../Editor');
require('./InlineEditor');

const t = scoped('nti-web-app.course.overview.editing.content.overviewgroup.Editor', {
	deleteMessage: {
		zero: 'Deleting this section cannot be undone.',
		one: 'This section contains 1 item that will also be deleted. This action cannot be undone.',
		other: 'This section contains %(count)s items that will also be deleted. This action cannot be undone.'
	}
});


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-overviewgroup-editor',

	statics: {
		getHandledMimeTypes: function () {
			return [
				OverviewGroup.mimeType
			];
		},


		getTypes: function () {
			return [
				{
					title: 'Section',
					category: 'content',
					iconCls: 'group',
					description: 'Section are used for',
					editor: this
				}
			];
		}
	},

	addFormCmp: function () {
		return this.add({
			xtype: 'overview-editing-overviewgroup-inlineeditor',
			record: this.record,
			onChange: this.onFormChange.bind(this)
		});
	},

	onSave: function () {
		const me = this,
			parentSelection = me.parentSelection,
			originalPosition = parentSelection && parentSelection.getOriginalPosition(),
			currentPosition = parentSelection && parentSelection.getCurrentPosition();

		me.disableSubmission();

		return me.EditingActions.saveValues(me.formCmp.getValue(), me.record, originalPosition, currentPosition, me.rootRecord)
			.catch(function (reason) {
				me.enableSubmission();

				return Promise.reject(reason);
			});
	},


	getDeleteMessage () {
		const items = this.record.get('Items');

		return t('deleteMessage', {
			count: items.length
		});
	},

	addParentSelection: function (record, parentRecord, rootRecord, onChange) {
		if (!rootRecord) { return null; }

		// const items = rootRecord.get('Items');

		return this.add(new ParentSelection({
			selectionItems: [rootRecord],
			selectedItem: rootRecord,
			parentRecord: parentRecord,
			rootRecord: rootRecord,
			editingRecord: record,
			scrollingParent: this.scrollingParent,
			onChange: onChange
		}));
	}
});
