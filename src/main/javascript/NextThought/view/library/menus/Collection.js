Ext.define('NextThought.view.library.menus.Collection',{
	extend: 'NextThought.view.menus.navigation.Collection',
	alias: 'widget.library-collection',

	mixins: {
		track: 'NextThought.mixins.InstanceTracking'
	},

	store: 'library',

	rowSpan: 1,

	tpl: Ext.DomHelper.markup([
		{ cls: 'stratum collection-name', cn: [
			'{name}', {cls:'count',html: '{count}'}
		]},
		{ cls: 'grid', cn:{ tag: 'tpl', 'for':'items', cn:['{menuitem}']} }
	]),

	menuItemTpl: Ext.DomHelper.markup({
		cls: '{inGrid} item {featured} row-{rows} col-{cols}', cn:[
			{ cls:'cover', style: {backgroundImage: 'url({icon})'}},
			{ cls: 'meta', cn:[
				{ cls: 'section', html: '{section}' },  //course section
				{ cls: 'title', html: '{title:ellipsis(50)}',//because multi-line text won't honor ellipsis css, manually do it.
					'data-qtip': '{[values.title.length>50?values.title:""]}' },
				{ cls: 'author', html: '{author}',
					//it will likely be clipped if its longer than 20 chars, so add a tip if it is
					'data-qtip':'{[values.author.length>20?values.author:""]}' },
				{ cls:'description', html:'{description}' },
				{ tag:'tpl', 'if':'sample', cn:{ cls:'sample', html:'Sample' }} //store - sample flag
			]}
		]
	}),


	constructor: function(){
		this.callParent(arguments);
		this.trackThis();
	},


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


	handleSelect: function(selModel, record){
		if(!this.suppressSetLocation){
			this.fireEvent('set-last-location-or-root',record.get('NTIID'));
		}
		delete this.suppressSetLocation;
		this.callParent(arguments);
	},


	updateSelection: function(pageInfo, silent, suppressEvent){
		var me = this,
			ntiid = pageInfo && (pageInfo.isModel ? pageInfo.getId() : pageInfo),
			last = ContentUtils.getLineage(ntiid).last(),
			r = me.store.findRecord('NTIID',last,0,false,true,true);

		if(!suppressEvent){
			Ext.each(this.getInstances(), function(cmp){
				if(cmp !== me){
					cmp.updateSelection(pageInfo,silent,true);
				}
			});
		}
		if(r){
			me.suppressSetLocation = Boolean(silent);
			me.getSelectionModel().select(r);
		}
		else{
			me.getSelectionModel().deselectAll();
		}
	}
});
