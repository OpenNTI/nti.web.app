Ext.define('NextThought.view.windows.ClassroomChooser', {
	extend: 'Ext.panel.Panel',
	alias : 'widget.classroom-chooser',

	requires:[
		'NextThought.view.widgets.classroom.Browser',
		'NextThought.view.widgets.classroom.BrowserStudyGroups',
		'NextThought.view.widgets.LinkButton'
	],

	cls: 'classroom-chooser',

	frame: true,
	floating: true,
	width: 650,
	height: 425,
	closable: false,
	constrain: true,
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	modal: true,
	items: {
		layout: {
			type: 'hbox',
			align: 'stretch'
		},
		flex: 1,
		border: false,
		padding: 5,
		defaults:{
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			defaultType: 'component',
			border: false,
			margin: 5
		},
		items: [
			{
				flex: 1,
				items:[
					{html: '<h2>Classes:<h2>'},
					{xtype: 'classroom-browser', flex: 1}
				]
			},

			{border: true, width: 1},
			{
				flex: 1,
				items:[
					{html: '<h2>Study groups:<h2>'},
					{xtype: 'classroom-browser-study-groups', flex: 1}
				]

			}
//			,
//			{xtype: 'link', text: 'Create a class', htmlPrefix: '<hr/>'}
		]
	},
	dockedItems: {
		dock: 'bottom',
		xtype: 'toolbar',
		items: []
	},


	afterRender: function(){
		this.callParent(arguments);
		this.getOwner().on('resize',this.center,this);
	},


	center: function(){
		var me = this.callParent(arguments),
			xy = me.getPosition(),
			x = xy[0],
			y = xy[1];

		if(x < 0){x = 0;}
		if(y < 0){y = 0;}

		if(!x || !y) {//only setPosition if x or y are 0
			me.setPosition(x,y);
		}

		return me;
	},

	close: function() {
		this.getOwner().un('resize',this.center,this);
		this.callParent(arguments);
	},

	getBubbleTarget: function(){
		return this.getOwner();
	},


	getOwner: function(){
		return this.ownerCt || this.floatParent;
	},

	notify: function(msg){
		var n = this.items.getAt(0),
			remove = Ext.bind(this.remove, this);
		if (n && n.is('[notify]')) { this.remove(n); }
		n = this.insert(0,{
			cls: 'notify',
			notify: true,
			border: false,
			height: 50,
			padding: 5,
			defaults: {
				border:false
			},
			layout: {
				type: 'hbox',
				align: 'stretch'
			},
			items: [
				{html: msg, cls: 'message', flex:1},
				{xtype: 'tool', type:'close', handler:function(e,d,p){
					n = null;
					p.destroy();
				}}
			]
		});

		setTimeout(function(){
			if (n) {
				remove(n);
			}
		}, 30000);

		return n;
	}
});
