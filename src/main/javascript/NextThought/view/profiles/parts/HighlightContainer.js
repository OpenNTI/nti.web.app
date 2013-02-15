Ext.define('NextThought.view.profiles.parts.HighlightContainer',{
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-highlight-container',

	cls: 'activity-highlight-container',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn:[
			{tag: 'span', cls: 'name link', html:'{name}'},
			' created ', {tag: 'span', cls:'count', html:'{count}'},
			' highlight',{tag:'span',cls:'plural',html:'{plural}'},
			' on {date}'
		]},
		{ cls: 'box' }
	]),


	renderSelectors: {
		headerEl: '.header',
		nameEl: '.header .name',
		countEl: '.header .count',
		pluralEl:'.header .plural',
		bodyEl: '.box'
	},


	bookTpl: new Ext.XTemplate(Ext.DomHelper.markup([])),


	sectionTpl: new Ext.XTemplate(Ext.DomHelper.markup([])),


	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup([])),


	setupContainerRenderData: function(){
		var me = this,
			u = me.up('[user]').user,
			items = me.items,
			count = items.length,
			books = {},
			d;

		if(this.rendered){ delete me.renderData; }

		d = Ext.apply(me.renderData||{},{
			name: u.getName(),
			count: count === 1 ? 'a' : count,
			plural: count === 1 ? '' : 's',
			date: Ext.Date.format(me.date,'F j, Y')
		});

		Ext.each(items,function( i ){
			LocationMeta.getMeta(i.get('ContainerId'),function(meta){
				i.meta = meta;
				count--;

				if(!LocationMeta.getValue(meta.NTIID)){
					console.error('strang...not in the cache');
				}

				books[meta.root] = books[meta.root] || {};
				books[meta.root][meta.NTIID] = books[meta.root][meta.NTIID] || [];
				books[meta.root][meta.NTIID].push(i);

				if(!count){ me.setupBookRenderData(d,books); }
			});
		});

		return d;
	},

	/**
	 * This is intended to be a callback. No return value. We modify {data}
	 * @param data {Object} the output
	 * @param groupings {Object} the input
	 */
	setupBookRenderData: function(data,groupings){

		data.books = [];

		Ext.Object.each(groupings,function(k,root){
			Ext.Object.each(root,function(page,items){
				Ext.each(items,function(i){

				});
			});
		});

	},


	/**
	 * @override {Ext.Component#beforeRender}
	 */
	beforeRender: function(){
		this.callParent(arguments);
		this.setupContainerRenderData();
	},


	afterRender: function(){
		this.callParent(arguments);
	}
});
