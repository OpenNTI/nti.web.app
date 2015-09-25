export default Ext.define('NextThought.app.profiles.user.components.activity.parts.events.Joined', {
	extend: 'Ext.Component',
	alias: 'widget.joined-event',

	ui: 'activity',
	cls: 'joined-event',

	renderTpl: Ext.DomHelper.markup([
		'{user:avatar}',
		{ cls: 'meta', cn: [
			{ cls: 'label', cn: [{tag: 'span', cls: 'name link', html: '{name}'},' joined NextThought!']},
			{ cls: 'date', html: '{date}' }
		]}
	]),


	beforeRender: function() {
		var me = this;
		me.callParent(arguments);

		UserRepository.getUser(me.username, function(u) {
			var rd = me.renderData = Ext.apply(this.renderData || {},u.getData());
			rd.user = u;
			rd.name = u.getName();
			rd.date = Ext.Date.format(u.get('CreatedTime'), 'F j, Y');
			if (me.rendered) {
				//oops...we resolved later than the render...re-render
				me.renderTpl.overwrite(me.el, rd);
			}
		});
	}
});
