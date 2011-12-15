Ext.define('NextThought.view.windows.ClassroomChooser', {
	extend: 'Ext.panel.Panel',
	alias : 'widget.classroom-chooser',

	requires:[
		'NextThought.view.widgets.classroom.Browser',
		'NextThought.view.widgets.LinkButton'
	],

	cls: 'classroom-chooser',

	frame: true,
	floating: true,
	width: 450,
	height: 310,
	closable: false,
	constrain: true,
	layout: 'fit',
	modal: true,
	items: {
		layout: 'anchor',
		border: false,
		padding: 5,
		defaults:{
			margin: 5
		},
		defaultType: 'component',
		items: [
			{html: '<h2>Host a class<h2>'},
			{xtype: 'classroom-browser', anchor: '100% -55'},
			{xtype: 'link', text: 'Create a class', htmlPrefix: '<hr/>'}
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

		if(x < 0) x = 0;
		if(y < 0) y = 0;

		if(!x || !y)//only setPosition if x or y are 0
			me.setPosition(x,y);

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
