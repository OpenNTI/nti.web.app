Ext.define('NextThought.view.courseware.dashboard.tiles.SupplementalMaterial', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-supplemental-material',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord, finish) {
			var DQ = Ext.DomQuery, me = this,
				items = this.getChildrenNodes(courseNodeRecord),
				refs = [], c = [], max = 0;

			refs = refs	.concat(DQ.filter(items || [], '[type$=externallink]'))
						.concat(DQ.filter(items || [], '[type$=content]'));

			if (Ext.isEmpty(refs)) {
				Ext.callback(finish);
				return;
			}


			function maybeFinish(total, tile, node) {
				refs.pop();

				if (node && node.getAttribute('section') === 'required') {
					total = total + 10;
				}

				max = (max > total) ? max : total;

				tile.innerWeight = total;
				c.push(tile);

				if (!refs.length) {
					c.sort(function(a, b) { return b.innerWeight - a.innerWeight; });//sort greatest to least
					Ext.each(c.slice(0, 5), function(item) { item.maxInner = max;});//set the max on each tile so we can figure the %
					Ext.callback(finish, null, [c.splice(0, 5)]);//splice returns the items cut from the array 'c' and leaves the remainer in 'c'
					Ext.destroy(c);//clean up the leftovers
				}
			}

			Ext.each(refs.slice(), function(ref) {
				me.create({
					locationInfo: locationInfo,
					itemNode: ref,
					lastModified: courseNodeRecord.get('date'),
					callback: maybeFinish
				});
			});
		}

	},

	cls: 'content-link-list',
	defaultType: 'course-dashboard-supplemental-material-item',

	config: {
		cols: 3,
		itemNodes: []
	},

	constructor: function(config) {
		var i = config.locationInfo,
			n = config.itemNode,
			me = this;

		config.items = [
			{
				xtype: 'container',
				defaultType: this.defaultType,
				cls: 'scrollbody',
				items: {
					node: n,
					locationInfo: i,
					callback: function(total) {
						Ext.callback(config.callback, null, [total, me, n]);
					}
				}
			}
		];

		this.callParent([config]);
	}
});


Ext.define('NextThought.view.courseware.dashboard.widgets.SupplementalMaterialItem', {
	extend: 'NextThought.view.courseware.overview.parts.ContentLink',
	alias: 'widget.course-dashboard-supplemental-material-item',

	ui: 'tile',
	cls: 'content-link',

	config: {
		callback: null
	},

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'tile-title', html: 'Resource'},
		{ cls: 'thumbnail', style: { backgroundImage: 'url({thumbnail})'} },
    //		{ cls: 'controls', cn: [
    //			{ cls: 'favorite' },
    //			{ cls: 'like' }
    //		]},
		{ cls: 'meta', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'byline', html: 'By {creator}' },
			{ cls: 'description', html: '{description}' }
		]}
	]),

	initComponent: function() {
		this.callParent(arguments);
		this.loadContainer();
		this.loadContainer = Ext.emptyFn;
		this.renderTotal = this.appendTotal;
		this.appendTotal = this.totalLoaded;
	},

	afterRender: function() {
		this.callParent(arguments);

		var tileTitle = this.el.down('.tile-title'),
			section = this.node.getAttribute('section'),
			textMap = { 'additional': 'additional', 'required': 'required'};

		if (section) {
			tileTitle.update('Resource - ' + textMap[section]);
		}

	},

	totalLoaded: function(total) {
		this.renderTotal(total);//base class defers call until after render
		Ext.callback(this.getCallback(), null, [total]);
	}
});
