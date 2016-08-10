const Ext = require('extjs');

module.exports = exports = Ext.define('NextThought.app.assessment.components.editing.components.Reset', {
	extend: 'Ext.container.Container',
	alias: 'widget.assignment-reset',

	layout: 'none',
	items: [],
	cls: 'inline-reset-menu',

	renderSelectors: {
		reset: '.publish-reset'
	},

	initComponent () {
		this.callParent(arguments);

		this.maybeShow();
		let resetLabel = 'Students have started your assignment.';
		let resetText = 'Resetting or deleting this assignment will result in erasing students work and submissions. You cannot undo this action.';

		if(!this.assignment.hasLink('Reset') && !this.hasPublishingLinks()) {
			resetLabel = 'Students have started this assignment';
			resetText = 'The instructor must reset this assignment before a publish change can occur.';
		}

		let items = [
			{tag: 'span', cls: 'publish-reset-label', html: resetLabel},
			{tag: 'span', cls: 'publish-reset-text', html: resetText},
		];

		// User can reset the assignment
		if(this.assignment.hasLink('Reset')) {
			items.push({tag: 'div', cls: 'publish-reset', html: 'Reset Assignment'});
		}

		this.add({
			xtype: 'box',
			autoEl: {
				cls: 'reset',
				cn: [
					{cls: 'nti-checkbox', cn: items}
				]
			}
		});
	},


	afterRender () {
		this.callParent(arguments);

		if (this.reset) {
			this.reset.on('click', this.onClick, this);
		}
	},


	onClick () {
		const resetLink = this.assignment.getLink('Reset') || !this.assignment.getDateEditingLink();

		if (!resetLink) { return; }

		if (this.beforeReset) {
			this.beforeReset();
		}

		Service.post(resetLink)
			.then((response) => {
				this.assignment.syncWithResponse(response);

				if (this.onReset) {
					this.onReset();
				}
			});
	},


	setAssignment (assignment) {
		this.assignment = assignment;
		this.maybeShow();
	},

	maybeShow () {
		if(this.assignment.hasLink('Reset') || (!this.hasPublishingLinks() && !this.assignment.hasLink('date-edit-start'))) {
			this.show();
		} else {
			this.hide();
		}
	},


	hasPublishingLinks () {
		return this.assignment.hasLink('publish') || this.assignment.hasLink('unpublish');
	}
});
