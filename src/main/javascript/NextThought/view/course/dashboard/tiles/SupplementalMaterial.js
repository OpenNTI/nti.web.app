Ext.define('NextThought.view.course.dashboard.tiles.SupplementalMaterial',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-supplemental-material',

	statics: {

		getTileFor: function(date, courseTocNode, locationInfo, courseRecord){
			var DQ = Ext.DomQuery,
				items = courseRecord && courseRecord.getChildren(),
				refs = [];
				
			refs = refs	.concat( DQ.filter(items||[],'[type$=externallink]') )
						.concat( DQ.filter(items||[],'[type$=content]:not([section=required])') );
						
			if(Ext.isEmpty(refs)){
				return null; 
			}
			
			return this.create({locationInfo: locationInfo, itemNodes: refs});
		}

	},

	cls: 'content-link-list',
	defaultType: 'course-dashboard-supplemental-material-item',
	
	config: {
		cols: 2,
		rows: 1,
		locationInfo: null,
		itemNodes: []
	},
	
	constructor: function(config){
		var i = config.locationInfo,
			n = config.itemNodes,
			items = [];
			
		config.items = [
			{xtype: 'tile-title', heading:'Additional Reading' },
			{xtype: 'container', defaultType: this.defaultType, cls:'scrollbody', items: items }
		];
		
		Ext.each(n,function(n){items.push({node:n,locationInfo:i});});
		
		this.callParent([config]);
	}
});


Ext.define('NextThought.view.course.dashboard.widgets.SupplementalMaterialItem',{
	extend: 'NextThought.view.course.overview.parts.ContentLink',
	alias: 'widget.course-dashboard-supplemental-material-item',
		
	ui: 'tile',
	cls: 'content-link'
});
