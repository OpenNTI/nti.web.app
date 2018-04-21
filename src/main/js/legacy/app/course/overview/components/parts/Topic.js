const Ext = require('@nti/extjs');

const NavigationNode = require('legacy/model/courses/navigation/Node');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.Topic', {
	extend: 'Ext.Component',
	alias: ['widget.course-overview-topic', 'widget.course-overview-unit'],
	ui: 'course',

	cls: 'overview-topic',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{label}'}
	]),


	initComponent: function () {
		this.callParent(arguments);
		this.enableBubble(['switch-to-reader']);
	},


	beforeRender: function () {
		this.callParent(arguments);
		var data;

		this.record = this.record || (this.node && new NavigationNode(null, null, this.node));

		if (this.record) {
			data = this.record.getData();
			this.targetNTIID = this.record.get('NTIID');
		} else {
			this.targetNTIID = this.NTIID;
			data = this.initialConfig;
		}

		this.renderData = Ext.apply(this.renderData || {}, data);
	},


	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.el, 'click', 'onClick');
	},


	onClick: function (e) {
		var me = this,
			container = this.up('content-view-container'),
			bundle = container && container.currentBundle;

		e.stopEvent();

		function cb () {
			if (arguments.length === 0) {
				//setlocation aborted (probably because we are already here)
				me.fireEvent('switch-to-reader');
			}
		}

		me.fireEvent('set-location', me.targetNTIID, cb, null, bundle);
	}
});
