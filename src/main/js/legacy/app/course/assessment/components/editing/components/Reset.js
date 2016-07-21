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

		this.add({
			xtype: 'box',
			autoEl: {
				cls: 'reset',
				cn: [
					{cls: 'nti-checkbox', cn: [
						{tag: 'span', cls: 'publish-reset-label', html: 'Students have started your assignment.'},
						{tag: 'span', cls: 'publish-reset-text', html: 'Resetting or deleting this assignment will result in erasing students work and submissions. You cannot undo this action.'},
						{tag: 'div', cls: 'publish-reset', html: 'Reset Assignment'}
					]}
				]
			}
		});
	},


	afterRender () {
		this.callParent(arguments);
		this.reset.on('click', this.onClick, this);
	},


	onClick () {
		const resetLink = this.assignment.getLink('Reset');
		Service.post(resetLink);
	},


	setAssignment (assignment) {
		this.assignment = assignment;
		this.maybeShow();
	},

	maybeShow () {
		if(this.assignment.hasLink('Reset') || !this.assignment.hasLink('publish')) {
			this.show();

			if(!this.assignment.hasLink('Reset')) {
				this.reset.hide();
			}
		} else {
			this.hide();
		}
	}
});
