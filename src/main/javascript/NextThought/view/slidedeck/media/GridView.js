Ext.define('NextThought.view.slidedeck.media.GridView',{
	extend: 'Ext.view.View',
	alias: 'widget.media-grid-view',

	config: {
		source: null,
		locationInfo: null
	},

	ui: 'media-viewer-grid',
	trackOver: true,
	overItemCls: 'over',
	selectedItemCls: 'selected',

	itemSelector: '.item',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
			{ tag: 'tpl', 'if': 'this.is(values)', cn: { cls: 'item heading', cn:'{section}' } },
			{ tag: 'tpl', 'if': '!this.is(values)', cn: [
				{ cls: 'item video', cn: [
					{ cls: 'thumbnail', style: { backgroundImage: 'url({[this.thumb(values.sources)]})'} },
					{ cls: 'meta', cn:[
						{ cls: 'title', html: '{title}' },
						{ cls: 'info', cn: [
							{ tag: 'span', html: '{diration}'},
							{ tag: 'span', html: '{comments:plural("Comment")}'}
						] }
					] }
				] }
			] }
		] }
	), {
		is: function (values) {
			return values.sources.length===0;
		},

		thumb: function(sources){
			return sources[0].thumbnail;
		}
	}),

	initComponent: function(){
		this.callParent(arguments);

		var lineage = ContentUtils.getLineage(this.getSource().get('NTIID')),
			location = ContentUtils.getLocation(lineage.last()),
			title = location.title;

		this.setLocationInfo(location);
		Library.getVideoIndex(title,this.applyVideoData,this);
	},


	applyVideoData: function(data){
		//data is a NTIID->source map
		var reader = Ext.data.reader.Json.create({model: NextThought.model.PlaylistItem}),
			selected = this.getSource().get('NTIID'),
			sections = {},
			videos = [];

		function iter(key,v){
			if(key !== v.ntiid){
				console.error(key, '!=', v);
			}

			var section = ContentUtils.getLineage(key,true)[1];

			if(!sections.hasOwnProperty(section)){
				sections[section] = NextThought.model.PlaylistItem({section:section,sources:[]});
				videos.push(sections[section]);
			}

			videos.push(reader.read(Ext.apply(v,{
				NTIID: v.ntiid,
				section: ContentUtils.getLineage(key,true)[1]
			})).records[0]);

			if(key === selected){
				selected = videos.last();
			}
		}

		Ext.Object.each(data,iter);


		this.store = new Ext.data.Store({
			model: NextThought.model.PlaylistItem,
			proxy: 'memory',
			data: videos,
			sorters: [
				{
					fn: function(a,b){
						var sa = a.get('section'), sb = b.get('section');
						return Globals.naturalSortComparator(sa,sb);
					}
				},{
					property: 'title',
					direction: 'ASC'
				}
			]
		});

		this.bindStore(this.store);
		if(!Ext.isString(selected)){
			this.getSelectionModel().select(selected,false,true);
		}
	}
});
