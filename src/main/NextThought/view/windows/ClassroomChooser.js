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
	layout: 'fit',
	modal: true,
	items: {
		layout: {
			type: 'hbox',
			align: 'stretch'
		},
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
		items: [
			{text: 'Create Class', create:true},
			//TODO - only enable when a class is highlighted
			{text: 'Edit Class', edit:true, disabled: true}
		]
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
	}
});
