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

	defaultType: 'search-result',

	MAX_RESULTS_AT_FIRST: 2,
	PAGE_SIZE: 25,
	childEls: ['body'],

	initComponent: function(){
		this.fullResults = this.items.slice();

		if(this.items.length > this.MAX_RESULTS_AT_FIRST){
			this.items.splice(this.MAX_RESULTS_AT_FIRST);
			this.items.push({xtype: 'search-more'});
		}

		this.callParent(arguments);
		this.renderData = Ext.copyTo({},this,'category');
		this.on('more-clicked', this.showMore, this);
	},

	showMore: function(cmp){
		var count;

		this.suspendLayouts();

		try{
			if(cmp){
				this.remove(cmp);
			}
			count = this.items.length;
			this.add(this.fullResults.slice(count, count+this.PAGE_SIZE));

			if(this.items.length < this.fullResults.length){
				this.add({xtype: 'search-more'});
			}
		}
		catch(e){
			console.error('An error occurred showing more', Globals.getError(e));
		}

		this.resumeLayouts(true);

		return false;
	}
});
