Ext.define('NextThought.view.course.overview.Topic',{
	extend: 'Ext.Component',
	alias: ['widget.course-overview-topic','widget.course-overview-unit'],
	ui:'course',

	cls: 'overview-topic',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html:'{label}'}
	]),


	beforeRender: function(){
		this.callParent(arguments);

		this.record = this.record || new NextThought.model.course.navigation.Node(null,null,this.node);

		this.renderData = Ext.apply(this.renderData||{},this.record.getData());
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.el,'click','onClick');
	},


	onClick: function(e){
		e.stopEvent();

		this.fireEvent('set-location',this.record.get('NTIID'));
	}
});
