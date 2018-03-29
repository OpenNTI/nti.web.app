const Ext = require('extjs');

require('../creation/ChildCreation');

const getTargetId = require('../../../../util/get-target-id');
const saveRequireStatus = require('../../../../util/save-require-status');

const DEFAULT = 'Default';
const REQUIRED = 'Required';
const OPTIONAL = 'Optional';

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.typeswitcher.Switcher', {
	extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
	alias: 'widget.outline-editing-type-switcher',

	title: 'Pick New Type',

	initComponent () {
		this.callParent(arguments);

		const index = this.parentRecord && this.parentRecord.indexOfId(this.record.getId());

		this.lockedPosition = {
			parentRecord: this.parentRecord,
			index: index
		};
	},


	getTypes () {
		const types = this.group ? this.group.getTypes() : [];
		const {record} = this;

		//Filter out the editor for the current type
		return types.filter((type) => {
			const {editor} = type;

			return editor && !editor.getEditorForRecord(record);
		});
	},


	onSave () {
		const doSave = this.callParent(arguments);

		return doSave
			.then((result) => {
				return this.removeOldRecord()
					.then(() => result, () => result)
					.then(() => {
						// apply require status
						const basedOnDefault = this.record.get('IsCompletionDefaultState');
						const isRequired = this.record.get('CompletionRequired');
						const requiredValue = basedOnDefault ? DEFAULT : isRequired ? REQUIRED : OPTIONAL;

						const targetId = getTargetId(result);
						saveRequireStatus(this.bundle, targetId, requiredValue);
					});
			});
	},


	removeOldRecord () {
		if (this.parentRecord) {
			return this.parentRecord.removeRecord(this.record);
		}

		return Promise.resolve();
	}
});
