Ext.define('NextThought.view.course.dashboard.tiles.SupplementalMaterial',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-supplemental-material',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord, finish){
			var DQ = Ext.DomQuery, me = this,
				items = this.getChildrenNodes(courseNodeRecord),
				refs = [], c = [];
				
			refs = refs	.concat( DQ.filter(items||[],'[type$=externallink]') )
						.concat( DQ.filter(items||[],'[type$=content]') );
						
			if(!Ext.isEmpty(refs)){
				Ext.Array.each(refs, function(ref){
					c.push(me.create({locationInfo: locationInfo, itemNode: ref, lastModified: courseNodeRecord.get('date')}));	
				});				
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
			n = config.itemNode;
			
		config.items = [
			{xtype: 'container', defaultType: this.defaultType, cls:'scrollbody', items: {
				node: n,
				locationInfo: i
			}}
		];

		// NOTE: For now, since we don't have good way to sort these nodes,
		// at least, let's make sure, required ones are at the top.
		// Ext.Array.each(n, function(a){
		// 	var s = a.getAttribute('section');

		// 	if(s === 'required'){ r.push(a); }
		// 	else{ o.push(a); }
		// });
		
		this.callParent([config]);
	}
});


Ext.define('NextThought.view.course.dashboard.widgets.SupplementalMaterialItem',{
	extend: 'NextThought.view.course.overview.parts.ContentLink',
	alias: 'widget.course-dashboard-supplemental-material-item',
		
	ui: 'tile',
	cls: 'content-link'
});
