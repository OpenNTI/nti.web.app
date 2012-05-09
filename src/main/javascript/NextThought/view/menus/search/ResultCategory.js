Ext.define('NextThought.view.menus.search.ResultCategory',{
	extend: 'Ext.container.Container',
	alias: 'widget.search-result-category',
	requires: [
		'NextThought.view.menus.search.Result'
	],
	cls: 'search-result-category',
	renderTpl: [
			'<div class="label">{category}</div>',
			'<div class="body">{%this.renderContainer(out,values);%}</div>'
	],

	MAX_RESULTS_AT_FIRST: 2,

	renderSelectors: {
		frameBody: 'div.body'
	},

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
