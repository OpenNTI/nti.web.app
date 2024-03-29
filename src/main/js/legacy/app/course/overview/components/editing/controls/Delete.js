const Ext = require('@nti/extjs');
const Globals = require('internal/legacy/util/Globals');
const PromptActions = require('internal/legacy/app/prompt/Actions');

require('internal/legacy/app/MessageBox');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.controls.Delete',
	{
		extend: 'Ext.Component',
		alias: 'widget.overview-editing-controls-delete',
		name: 'Delete',
		cls: 'nt-button delete',
		renderTpl: '{name}',

		beforeRender: function () {
			this.callParent(arguments);

			this.PromptActions = PromptActions.create();

			this.renderData = Ext.apply(this.renderData || {}, {
				name: this.name,
			});
		},

		afterRender: function () {
			this.callParent(arguments);

			if (this.color) {
				this.addCls(this.color);
			}

			this.mon(this.el, 'click', this.handleClick.bind(this));
		},

		handleClick: function (e) {
			if (
				e.getTarget('.disabled') ||
				!this.parentRecord ||
				!this.parentRecord.removeRecord
			) {
				return;
			}

			if (this.beforeDelete) {
				this.beforeDelete();
			}

			this.confirm().then(this.doDelete.bind(this));
		},

		confirm: function () {
			const msg =
				this.messageOverride || 'Deleted items cannot be recovered.';

			return new Promise(function (fulfill, reject) {
				Ext.Msg.show({
					title: 'Are you sure?',
					msg,
					icon: 'warning-red',
					buttons: {
						primary: {
							text: 'Delete',
							cls: 'caution',
							handler: fulfill,
						},
						secondary: {
							text: 'Cancel',
							handler: reject,
						},
					},
				});
			});
		},

		doDelete: function () {
			if (this.onDelete) {
				this.onDelete();
			}

			if (!this.afterDelete) {
				this.afterDelete = function () {};
			}

			this.parentRecord
				.removeRecord(this.record)
				.then(function () {
					return true;
				})
				.catch(function (reason) {
					console.error('Failed to delete content: ', reason);
					return false;
				})
				.then(Promise.minWait(Globals.WAIT_TIMES.SHORT))
				.then(this.afterDelete.bind(this));
		},
	}
);
