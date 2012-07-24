Ext.define('NextThought.view.account.contacts.Activity',{
	extend: 'Ext.Component',
	alias: 'widget.contact-activity',

	renderTpl: Ext.DomHelper.createTemplate({
		cls:"activity {type}",
		html: '{message}',
		cn: [{cls: 'fade-mask'}]
	}).compile(),

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.applyIf(this.renderData||{},this.initialConfig);
	},


	afterRender: function() {
		this.callParent(arguments);
		this.el.on('click', function(e){
			var targets = (this.item.get('references') || []).slice();
			e.stopEvent();
			try{
				targets.push( this.item.getId() );
				this.fireEvent('navigation-selected', this.ContainerId, targets);
			}
			catch(er){
				console.error(Globals.getError(er));
			}
			return false;
		}, this);
	}
});
