Ext.define('NextThought.view.course.dashboard.tiles.SupplementalMaterial',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-supplemental-material',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord, finish){
			var DQ = Ext.DomQuery,
				items = this.getChildrenNodes(courseNodeRecord),
				refs = [], c;
				
			refs = refs	.concat( DQ.filter(items||[],'[type$=externallink]') )
						.concat( DQ.filter(items||[],'[type$=content]') );
						
			if(!Ext.isEmpty(refs)){
				c = this.create({locationInfo: locationInfo, itemNodes: refs, lastModified: courseNodeRecord.get('date')});
			}

			Ext.callback(finish,null,[c]);
		}

	},

	cls: 'content-link-list',
	defaultType: 'course-dashboard-supplemental-material-item',
	
	config: {
		cols: 3,
		itemNodes: []
	},
	
	constructor: function(config){
		var i = config.locationInfo,
			n = config.itemNodes,
			items = [], r = [], o = [];
			
		config.items = [
			{xtype: 'tile-title', heading:'Resources' },
			{xtype: 'container', defaultType: this.defaultType, cls:'scrollbody', items: items }
		];

		// NOTE: For now, since we don't have good way to sort these nodes,
		// at least, let's make sure, required ones are at the top.
		Ext.Array.each(n, function(a){
			var s = a.getAttribute('section');

			if(s === 'required'){ r.push(a); }
			else{ o.push(a); }
		});

		n = r.concat(o);
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
