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
		this.callParent(arguments);
		this.renderData = Ext.copyTo({},this,'category');
	},


	addResult: function(r) {
		if (!this.fullResults){
			this.fullResults = [];
		}
		this.fullResults.push(r);

		if (this.fullResults.length <= this.MAX_RESULTS_AT_FIRST) {
			this.add(r);
		}
		else if (this.fullResults.length === this.MAX_RESULTS_AT_FIRST + 1) {
			this.add({xtype: 'search-more'});
		}
	},


	showAll: function(){
		var i;

		//remove showAll if its there
		this.remove(this.down('search-more'));

		for (i = this.MAX_RESULTS_AT_FIRST; i < this.fullResults.length; i++) {
			this.add(this.fullResults[i]);
		}
	}
});
