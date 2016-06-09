var Ext = require('extjs');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.SyncLock', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-synclock',
	ui: 'course',

	cls: 'overview-synclock',

	search: false,

	renderTpl: Ext.DomHelper.markup([
		{cls: 'overview-synclock', html: '{locked}'}
	]),

	beforeRender: function () {
		this.callParent(arguments);

		console.log(this);

		let rootNode = this.contents;
		let locked;

		if (this.search) {
			locked = this.isLockedOrDecendentLocked(rootNode);
		} else {
			locked = this.isLocked(rootNode);
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			locked: locked ? 'locked' : 'unlocked'
		});
	},

	isLocked: function (currentNode) {
		if (currentNode && currentNode.data && currentNode.data.Links) {
			return currentNode.data.Links.hasLink('SyncUnlock');
		} else {
			return false;
		}
	},

	isLockedOrDecendentLocked: function (currentNode) {
		if (this.isLocked(currentNode)) {
			return true;
		}
		if (currentNode && currentNode.data && currentNode.data.Items) {
			for (let i = 0; i < currentNode.data.Items.length; ++i) {
				if (this.isLockedOrDecendentLocked(currentNode.data.Items[i])) {
					return true;
				}
			}
		}
		return false;
	},

	afterRender: function () {
		this.callParent(arguments);
	}
});
