Ext.define('NextThought.view.slidedeck.media.GridView',{
	extend: 'Ext.view.View',
	alias: 'widget.media-grid-view',


	//<editor-fold desc="Config">
	config: {
		source: null,
		locationInfo: null
	},

	selModel: {
		allowDeselect: false,
		toggleOnClick: false,
		deselectOnContainerClick: false
	},

	preserveScrollOnRefresh: true,

	ui: 'media-viewer-grid',
	trackOver: true,
	overItemCls: 'over',
	selectedItemCls: 'selected',

	itemSelector: '.item',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
			{ tag: 'tpl', 'if': 'this.is(values)', cn: { cls: 'item heading', cn:[
				{ tag: 'tpl', 'if': 'this.splitNumber(values)', cn:''},
				{ tag:'span', cls:'number', html:'{number}'},
				{ tag:'span', cls:'name', html:'{section}'}
			] } },
			{ tag: 'tpl', 'if': '!this.is(values)', cn: [
				{ cls: 'item video', cn: [
					{ cls: 'thumbnail', style: { backgroundImage: 'url({[this.thumb(values.sources)]})'} },
					{ cls: 'meta', cn:[
						{ cls: 'title', html: '{title}' },
						{ cls: 'info', cn: [
//							{ tag: 'span', html: '{diration}'},
//							{ tag: 'span', html: '{comments:plural("Comment")}'}
						] }
					] }
				] }
			] }
		] }
	), {
		is: function (values) {
			return values.sources.length===0;
		},

		splitNumber: function(values){
			var s = (values.section||'').split(' '),
				number = s.shift(),
				numberVal = parseFloat(number),
				section = s.join(' ');

			if(!isNaN(numberVal) && isFinite(numberVal)){
				values.number = number;
				values.section = section;
			}
		},

		thumb: function(sources){
			return sources[0].thumbnail;
		}
	}),
	//</editor-fold>


	//<editor-fold desc="Setup">
	initComponent: function(){
		this.callParent(arguments);

		var lineage = ContentUtils.getLineage(this.getSource().get('NTIID')),
			location = ContentUtils.getLocation(lineage.last()),
			title = location.title;

		this.setLocationInfo(location);
		Library.getVideoIndex(title,this.applyVideoData,this);


		this.on({
			itemclick: function () {
				this.fromClick = true;
			},
			beforeselect: function (s, r) {
				var pass = r.get('sources').length > 0,
					store = s.getStore(),
					last = s.lastSelected || store.first(),
					next;

				if (this.fromKey && !pass) {
					last = store.indexOf(last);
					next = store.indexOf(r);
					next += ((next - last) || 1);

					//do the in the next event pump
					Ext.defer(s.select, 1, s, [next]);
				}
				return pass;

			},
			select: function (s, r) {
				var node = this.getNodeByRecord(r),
					ct = this.el.getScrollingEl();
				if( node && Ext.fly(node).needsScrollIntoView(ct)){
					node.scrollIntoView(ct,false,{});
				}
				if (this.fromClick) {
					this.fireSelection();
				}
				delete this.fromClick;
				delete this.fromKey;
			}
		});
	},


	processSpecialEvent: function(e){
		var k = e.getKey();
		if(k === e.SPACE || k === e.ENTER){
			this.fireSelection();
		}
	},


	beforeRender: function () {
		this.callParent();
		var me = this, s = this.getSelectionModel();
		s.onNavKey = Ext.Function.createInterceptor(s.onNavKey, function () {
			me.fromKey = true;
		});
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
	},
	//</editor-fold>


	fireSelection: function(){
		var rec = this.getSelectionModel().getSelection().first(),
			li = this.getLocationInfo();

		//console.log('Change video to:', rec);
		this.fireEvent('change-media-in-player', rec.raw, rec.get('NTIID'), getURL(li.root));
	}
});
