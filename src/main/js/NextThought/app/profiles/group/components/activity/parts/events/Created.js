Ext.define('NextThought.app.profiles.group.components.activity.parts.events.Created', {
	extend: 'Ext.Component',
	alias: 'widget.created-event',

	ui: 'activity',
	cls: 'created-event',

	renderTpl: Ext.DomHelper.markup([
		'{entity:avatar}',
		{ cls: 'meta', cn: [
			{ cls: 'label', cn: [{tag: 'span', cls: 'name link', html: '{name}'},' was formed!']},
			{ cls: 'date', html: '{date}' }
		]}
	]),


	beforeRender: function() {
		var me = this;
		me.callParent(arguments);
		var rd = me.renderData = Ext.apply(this.renderData || {},me.entity.getData());
		rd.entity = me.entity;
	    rd.name = me.entity.getName();
		rd.date = Ext.Date.format(me.entity.get('CreatedTime'), 'F j, Y');
	}
});
