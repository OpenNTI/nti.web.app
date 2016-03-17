export default Ext.define('NextThought.app.profiles.group.components.activity.parts.events.Created', {
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
		this.callParent(arguments);
		this.setEntity(this.entity);
	},


	setEntity: function(entity){
		var rd = this.renderData = Ext.apply(this.renderData || {}, entity && entity.getData());

		// Update the entity if it's different. This method can be used to update an existing cmp.
		if (entity !== this.entity) {
			this.entity = entity;
		}

		rd.entity = this.entity;
	    rd.name = this.entity && this.entity.getName();
		rd.date = this.entity && Ext.Date.format(this.entity.get('CreatedTime'), 'F j, Y');	

		if (this.rendered) {
			this.renderTpl.overwrite(this.el, rd);
		}
	}
});
