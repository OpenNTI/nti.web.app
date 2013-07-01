Ext.define('NextThought.view.account.history.mixins.Bookmark',{
	alias: 'widget.history-item-bookmark',
	keyVal: 'application/vnd.nextthought.bookmark',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{
			'data-guid': '{guid}',
			cls: 'history favorite',
			cn:[
				{cls: 'path', html:'{path}'},
				{cls: 'location', html:'{location}'}
			]
		}
	])),

	constructor: function(config){
		Ext.apply(this, config);
		if(!this.panel){ return; }

		this.panel.registerSubType(this.keyVal, this.tpl);
		this.panel.registerFillData(this.keyVal, this.fillInData);
		this.panel.registerClickHandler(this.keyVal, this.clicked);
	},

	clicked: function(view, rec){
		var cid = rec.get('ContainerId');
		view.fireEvent('navigation-selected', cid, rec);
	},

	fillInData: function(rec){
		LocationMeta.getMeta(rec.get('ContainerId'),function(meta){
			var lineage = [],
				location = '';

			if(!meta){
				console.warn('No meta for '+rec.get('ContainerId'));
			}
			else {
				lineage = LocationProvider.getLineage(meta.NTIID,true);
				location = lineage.shift();
				lineage.reverse();
			}
			
			rec.set({
				'location': Ext.String.ellipsis(location, 150, false),
				'path': lineage.join(' / ')
			});
		});
	}

});