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
		cls: 'grid-item item {featured} row-{rows} col-{cols}', 'data-qtip': '{title}', cn:[
			{ tag:'img', src: Ext.BLANK_IMAGE_URL, cls:'cover', style: {backgroundImage: 'url({icon})'}},
			{ cls: 'wrap', cn:[
				{ cls: 'section', html: '{section}' },  //course section
				{ cls: 'title', html: '{title}' },      //generic
				{ cls: 'author', html: '{author}' },    //generic
				{ cls:'description', html:'{description}' }, //generic
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
			data = this.callParent(arguments);

		Ext.each(data.items,function(i,x){
			var cols= 2;

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
