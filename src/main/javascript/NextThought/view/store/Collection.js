Ext.define('NextThought.view.store.Collection',{
	extend: 'NextThought.view.navigation.Collection',
	alias: 'widget.purchasable-collection',

	overItemCls: 'over',

	cls: 'purchasables',
	rowSpan: 3,

	ellipsis: Ext.DomHelper.createTemplate({cls:'ellipsis',cn:[{},{},{}]}).compile(),

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
				{ cls: 'courseName', html: '{Name}' },
				{ cls: 'title', html: '{Title}' },
				{ cls: 'author', html: '{Provider}' },
				{tag:'tpl', 'if':'Amount', cn:{ cls: 'price', html: '{Amount:ntiCurrency(values.Currency)}'}},
				{tag: 'tpl', 'if': 'HasHistory', cn: [
					{ cls: 'history', html: 'Purchase History'}
				]},
				{ cls: 'description', html: '{Description}'}
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
	},


	onItemUpdate: function(rec,index,node){
		var desc = Ext.fly(node).down('.description',true),
			pos, e, texts, bottom,
			marker = 'This will need to be optimized, bute force is slow. Moving ellipsis took:';

		if(!desc || !Ext.fly(desc).isVisible()){
			return;
		}

		pos = Ext.fly(desc).getPositioning(true);
		pos.bottom = pos.right = pos.left; //dirty... i know
		pos.position = 'absolute';
		Ext.fly(desc).setPositioning(pos);

		if(desc.scrollHeight <= desc.offsetHeight){
			console.log('no need');
			return;
		}

		bottom = desc.getBoundingClientRect().bottom - parseInt(pos.bottom,10);


		/*
		TODO: Make this MUCH more efficient.
		Using a 0px span to binary search the insertion point would be WAY more effcient. As it is now, with Prmia's
		description, it takes 599 moves to settle on the correct spot. ICK.
		 */

		//Get all text nodes and split on spaces
		texts = AnnotationUtils.getTextNodes(desc);
		Ext.each(texts,function(v){
			var i;
			do {
				i = v.nodeValue.indexOf(' ');
				if(i>=0){
					v = v.splitText(i);
					//split the space
					v = v.splitText(1);
				}
			} while(v && i>=0);
		});

		//then append the ellipsis node
		e = this.ellipsis.append(desc);

		//then move it up the sibling links until it peeks into view.
		console.time(marker);
		while(e.previousSibling && e.getBoundingClientRect().top > bottom){
			desc.insertBefore(e,e.previousSibling);
		}
		console.timeEnd(marker);
	},


	refresh:function(){
		this.callParent(arguments);

		console.log('Detecting overflow...');
		Ext.each(this.getNodes(),function(v){this.onItemUpdate(null,null,v);},this);
	}
});
