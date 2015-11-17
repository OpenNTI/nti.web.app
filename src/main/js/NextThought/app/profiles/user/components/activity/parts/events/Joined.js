Ext.define('NextThought.app.profiles.user.components.activity.parts.events.Joined', {
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
		this.callParent(arguments);
		UserRepository.getUser(this.username, this.setUser.bind(this));
	},


	setUser: function(u){
		var rd = this.renderData = Ext.apply(this.renderData || {}, u && u.getData());

		rd.user = u;
		rd.name = u && u.getName();
		rd.date = Ext.Date.format(u && u.get('CreatedTime'), 'F j, Y');
		if (this.rendered) {
			//oops...we resolved later than the render...re-render
			this.renderTpl.overwrite(this.el, rd);
		}
	}
});
