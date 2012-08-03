Ext.define('NextThought.view.menus.search.ResultCategory',{
	extend: 'Ext.container.Container',
	alias: 'widget.search-result-category',
	requires: [
		'NextThought.view.menus.search.Result',
		'NextThought.layout.component.TemplatedContainer'
	],
	cls: 'search-result-category',

	layout: 'auto',
	componentLayout: 'templated-container',
	renderTpl: Ext.DomHelper.markup([
		{cls:'label', html:'{category}'},
		{cls:'body', id:'{id}-body', cn:['{%this.renderContainer(out,values);%}']}
	]),

	getTargetEl: function () { return this.body; },

	MAX_RESULTS_AT_FIRST: 2,
	childEls: ['body'],

	initComponent: function(){
		this.fullResults = this.items.slice();

		if(this.items.length > this.MAX_RESULTS_AT_FIRST){
			this.items.splice(this.MAX_RESULTS_AT_FIRST);
			this.items.push({xtype: 'search-more'});
		}

		this.callParent(arguments);
		this.renderData = Ext.copyTo({},this,'category');
	},


	showAll: function(){
		if(!this.fullResults){return;}
		this.removeAll(true);
		this.add(this.fullResults);
		delete this.fullResults;
	}
});
