Ext.define('NextThought.view.account.contacts.Activity',{
	extend: 'Ext.Component',
	alias: 'widget.contact-activity',

	renderTpl: [
		'<div class="activity {type}">{message}</div>'
	],

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.applyIf(this.renderData||{},this.initialConfig);
	},


	afterRender: function() {
		this.callParent(arguments);
		this.el.on('click', function(e){
			e.stopPropagation();
			e.preventDefault();
			try{
				this.fireEvent('navigation-selected', this.ContainerId, this.item.getId());
			}
			catch(er){
				console.error(Globals.getError(er));
			}
			return false;
		}, this);
	}
});
