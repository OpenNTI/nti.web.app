Ext.define('NextThought.view.course.overview.Header',{
	extend: 'Ext.Component',
	alias: 'widget.course-overview-header',
	ui:'course',

	cls: 'overview-header',

	renderTpl: Ext.DomHelper.markup([
		{tag:'tpl', 'if':'date', cn: {cls: 'date', html:'{date:date("l, F jS")}'}},
		{tag:'tpl', 'if':'!date', cn: {cls: 'date', html:' '}},
		{cls: 'title', html:'{label}'}
	]),


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},this.record.getData());
	}
});
