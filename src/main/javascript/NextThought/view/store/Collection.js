Ext.define('NextThought.view.store.Collection',{
	extend: 'NextThought.view.navigation.Collection',
	alias: 'widget.purchasable-collection',

	overItemCls: 'over',

	cls: 'purchasables',
	rowSpan: 3,

	tpl: Ext.DomHelper.markup([
		{ cls: 'stratum collection-name', cn: [
			'{name}', {cls:'count',html: '{count}'}
		]},
		{ cls: 'grid', cn:{ tag: 'tpl', 'for':'items', cn:['{menuitem}']} }
	]),

	menuItemTpl: Ext.DomHelper.markup({
		cls: '{inGrid} purchasable item {Class:lowercase} {featured} row-{rows} col-{cols}', 'data-qtip': '{Title}', cn:[
			{ cls:'cover', style: { backgroundImage: 'url({Icon})' }},
			{ cls: 'meta', cn:[
				{ cls: 'courseName', html: '{courseName}' },
				{ cls: 'title', html: '{Title}' },
				{ cls: 'author', html: '{Provider}' },
				{tag:'tpl', 'if':'Amount', cn:{ cls: 'price', html: '{Amount:ntiCurrency(values.Currency)}'}},
				{ cls: 'description', html: '{Description}'},
				{tag: 'tpl', 'if': 'HasHistory', cn: [
					{ cls: 'history', html: 'Purchase History'}
				]}
			]}
		]
	}),


	collectData: function(){
		var rows = this.rowSpan,
			data = this.callParent(arguments),
			isNew = isFeature('new-library');

		Ext.each(data.items,function(i,x){
			var cols= 2;

			i.inGrid = isNew ? 'grid-item':'stratum';

			if(rows > 1 && x===0){
				i.featured = 'featured';
				cols = 4;
			}

			i.rows = rows;
			i.cols = cols;
		});
		return data;
	},

	onBeforeItemClick: function(record, item, idx, event, opts){
		var t = event && event.getTarget && event.getTarget();

		if(t && Ext.fly(t).hasCls('history')){
			this.fireEvent('history-click', record);
			return false;
		}

		return true;
	}
});
