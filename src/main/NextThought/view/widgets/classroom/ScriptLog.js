Ext.define('NextThought.view.widgets.classroom.ScriptLog', {
	extend:'Ext.panel.Panel',
	alias: 'widget.script-log-view',
	requires: [
		'NextThought.view.widgets.classroom.ScriptEntry',
		'NextThought.cache.IdCache',
		'NextThought.model.ClassScript'
	],

	cls: 'script-log-view',
	autoScroll: true,
	layout: 'anchor',
	split: true,
	title: 'Class Script',
	defaults: {border: false},
	dockedItems: {dock: 'bottom', xtype: 'toolbar', items:[
		{text: 'something'}
	]},


	initComponent: function(config) {
		this.callParent(arguments);

		//set border so it doesn't get overridden...
		this.on('beforerender', function(){
			this.border = '0 2px 0 2px';
		}, this);
	},


	addMessage: function(bodies) {
		var b,m;

		if (!Ext.isArray(bodies)){bodies = [bodies];}

		for (b in bodies) {
			if (bodies.hasOwnProperty(b)){
				if (!Ext.isArray(b)){b = [b];}
				m = Ext.create('NextThought.model.MessageInfo', {body : [bodies[b]]});
				this.add(
					{
						xtype: 'script-entry',
						message: m,
						roomInfo: this.roomInfo
					}
				);
			}
		}
	},

	afterRender: function() {
		this.callParent(arguments);
		if (this.script) {
			this.setClassScript();
		}
	},


	setClassScript: function(s) {
		/*
		if (!s) {
			console.log('there is no script, so im making one up');
			var b = [
				'Once upon a time, there existed a math unlike other all other maths',
				'It was a visual math, not numbers and formulas, but colors and shapes',
				'Behold, the most complex formula that is ever devised...',
				[{"Class":"Canvas","shapeList":[{"Class":"CanvasCircleShape","transform":{"Class":"CanvasAffineTransform","a":0.04396195652173913,"b":0,"c":0,"d":0.04396195652173913,"tx":0.06038647342995169,"ty":0.04830917874396135},"strokeColor":"rgb(0,0,0)","strokeOpacity":1,"fillColor":"rgb(255,255,255)","fillOpacity":1,"strokeWidth":"0.0012077294685990338%"},{"Class":"CanvasCircleShape","transform":{"Class":"CanvasAffineTransform","a":0.05169311594202899,"b":0,"c":0,"d":0.05169311594202899,"tx":0.11352657004830917,"ty":0.0893719806763285},"strokeColor":"rgb(0,0,0)","strokeOpacity":1,"fillColor":"rgb(255,204,0)","fillOpacity":1,"strokeWidth":"0.0012077294685990338%"},{"Class":"CanvasPolygonShape","transform":{"Class":"CanvasAffineTransform","a":0.041062801932367145,"b":0.00966183574879227,"c":-0.00966183574879227,"d":0.041062801932367145,"tx":0.043478260869565216,"ty":0.12681159420289853},"strokeColor":"rgb(0,0,0)","strokeOpacity":1,"fillColor":"rgb(51,153,102)","fillOpacity":1,"sides":4,"strokeWidth":"0.0012077294682827922%"}]}],
				'Yes, it appears to be several circles and a square, but it is much more than that...',
				'Okay, okay, no its not, this is just dummy content that is designed to fill space.',
				'Want to see that picture again?  Okay, here you go!',
				[{"Class":"Canvas","shapeList":[{"Class":"CanvasCircleShape","transform":{"Class":"CanvasAffineTransform","a":0.04396195652173913,"b":0,"c":0,"d":0.04396195652173913,"tx":0.06038647342995169,"ty":0.04830917874396135},"strokeColor":"rgb(0,0,0)","strokeOpacity":1,"fillColor":"rgb(255,255,255)","fillOpacity":1,"strokeWidth":"0.0012077294685990338%"},{"Class":"CanvasCircleShape","transform":{"Class":"CanvasAffineTransform","a":0.05169311594202899,"b":0,"c":0,"d":0.05169311594202899,"tx":0.11352657004830917,"ty":0.0893719806763285},"strokeColor":"rgb(0,0,0)","strokeOpacity":1,"fillColor":"rgb(255,204,0)","fillOpacity":1,"strokeWidth":"0.0012077294685990338%"},{"Class":"CanvasPolygonShape","transform":{"Class":"CanvasAffineTransform","a":0.041062801932367145,"b":0.00966183574879227,"c":-0.00966183574879227,"d":0.041062801932367145,"tx":0.043478260869565216,"ty":0.12681159420289853},"strokeColor":"rgb(0,0,0)","strokeOpacity":1,"fillColor":"rgb(51,153,102)","fillOpacity":1,"sides":4,"strokeWidth":"0.0012077294682827922%"}]}],
				'Boom, did you see that?'
			];

			s = Ext.create('NextThought.model.ClassScript');
			s.set('body', b);
		}
		*/
		if (this.script) {
			this.addMessage(this.script.get('body'));
		}
	},

	scrollToFirstNonPromotedEntry: function() {
		var entries = this.query('script-entry[promoted=false]'),
			o = entries[0] ? entries[0] : null;

		if (!o){return;}

		o.el.scrollIntoView(this.el.first('.x-panel-body'));

	}
});
