Ext.define('NextThought.view.course.overview.parts.Topic', {
	extend: 'Ext.Component',
	alias:  ['widget.course-overview-topic', 'widget.course-overview-unit'],
	ui:     'course',

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

		this.record = this.record || new NextThought.model.course.navigation.Node(null, null, this.node);

		this.renderData = Ext.apply(this.renderData || {}, this.record.getData());
	},


	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.el, 'click', 'onClick');
	},


	onClick: function (e) {
		var me = this;
		e.stopEvent();

		function cb() {
			if (arguments.length === 0) {
				//setlocation aborted (probably because we are already here)
				me.fireEvent('switch-to-reader');
			}
		}

		me.fireEvent('set-location', me.record.get('NTIID'), cb);
	}
});
