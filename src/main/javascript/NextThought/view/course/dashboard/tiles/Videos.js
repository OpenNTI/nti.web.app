Ext.define('NextThought.view.course.dashboard.tiles.Videos',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-videos',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord, finish){
			var f = 'object[mimeType$=ntivideo]',
				DQ = Ext.DomQuery,
				videos = [],
				store = this.getCourseNavStore(courseNodeRecord), r, i, len, c;

			function addDate(r){
				return function(n){
					if( r ){
						//this will only be referenced within THIS class/file. WARNING: VERY PRIVATE
						n.NTCourseNode = r;
					}
					videos.push(n);
				};
			}

			if(store){
				i = store.indexOf(courseNodeRecord);
				len = store.getCount();
				for(i; i<len; i++){
					r = store.getAt(i);
					Ext.each(DQ.filter(r.getChildren()||[],f),addDate(r));
				}
			}

			if(!Ext.isEmpty(videos)){
				c = this.create({lastModified: courseNodeRecord.get('date'), sources: videos, locationInfo: locationInfo});
			}

			console.debug('Giving dashboard:',c);
			Ext.callback(finish,null,[c]);
		}

	},

	config: {
		cols: 6,
		rows: 4,
		weight: 10,
		sources: []
	},


	//Effectively disable, I know we aren't really deprecating them, but rather just blocking them.
	add:Ext.deprecated('This component is not meant to be handled like a container.'),
	remove:Ext.deprecated('This component is not meant to be handled like a container.'),


	afterRender: function(){
		this.callParent(arguments);

		var items = [],
			l = this.getLocationInfo();

		Ext.each(this.getSources(),function(s){
			var rec = s.NTCourseNode;
			delete s.NTCourseNode;
			items.push({node:s, locationInfo: l, courseRecord: rec});
		});

		console.debug('Rendering Video Container');
		this.content = Ext.widget({
			xtype: 'course-overview-video-section',
			floatParent: this,
			playerWidth: 711,
			renderTo: this.el,
			items: items,
			cls: 'dashboard-videos',
			leaveCurtain: true,
			tpl:Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [{
					cls: 'video-row',
					cn: [
						{ cls: 'poster', style: { backgroundImage:'url({poster})'} },
						{ cls: 'meta', cn:[
							{ cls:'date', html: '{date:date("l, F j")}' },
							{ cls:'label', html: '{label}', 'data-qtip':'{label}' }
						]}
					]
				}]})
		});

		this.mon(this.content,{
			'player-command-play':'onPlayerPlay',
			'player-command-stop':'onPlayerStop',
			'player-command-pause':'onPlayerStop',
			'player-event-play':'onPlayerPlay',
			'player-event-pause':'onPlayerStop',
			'player-event-ended':'onPlayerStop',
			'player-error':'onPlayerStop'
		});
	},


	onPlayerPlay: function(){
		this.content.addCls('hide-list');
	},


	onPlayerStop: function(){
		this.content.removeCls('hide-list');
	}
});
