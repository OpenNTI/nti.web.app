Ext.define('NextThought.view.image.Roll',{
	extend: 'Ext.container.Container',
	alias: 'widget.image-roll',

	layout: 'anchor',
	defaults: {anchor: '100%'},
	cls: 'image',
	ui: 'image',
	items: [{
		name: 'image',
		xtype: 'box',
		cls: 'image',
		width: 640,
		autoEl: {
			tag: 'img',
			width: 640
		}
	}],

	constructor: function(config){
		var store = config ? (config.store||undefined) : undefined,
			data = config ? (config.data||undefined) : undefined,
			me = this;

		me.callParent(arguments);

		me.image = me.down('box[name=image]');

		me.mon(me.image,'afterrender',function(){
			me.image.el.dom.onload = function(){
				me.updateLayout();
			};
		});

		if(!data){
			data = [{
				url	: 'http://interfacelift.com/wallpaper/D47cd523/03180_doorwaytoheaven_1024x768.jpg'
			},{
				url	: 'http://interfacelift.com/wallpaper/D47cd523/03179_bliss_1024x768.jpg'
			},{
				url	: 'http://interfacelift.com/wallpaper/D47cd523/03178_trollstigen_1024x768.jpg'
			},{
				url	: 'http://interfacelift.com/wallpaper/D47cd523/03180_doorwaytoheaven_1024x768.jpg'
			},{
				url	: 'http://interfacelift.com/wallpaper/D47cd523/03179_bliss_1024x768.jpg'
			},{
				url	: 'http://interfacelift.com/wallpaper/D47cd523/03178_trollstigen_1024x768.jpg'
			}];
		}

		this.store = store || new Ext.data.Store({
			fields: [
				{name:'url', type:'string'}
			],
			data : data
		});

		this.others = this.add({
			xtype: 'dataview',
			preserveScrollOnRefresh: true,
			overflowX: 'auto',
			overflowY: 'hidden',
			store: this.store,
			cls: 'carousel',
			singleSelect: true,
			allowDeselect: false,
			overItemCls: 'over',
			itemSelector: 'div.item-wrap',
			tpl: Ext.DomHelper.markup({
				tag:'tpl', 'for':'.',
				cn: [{
					cls:'item-wrap',
					'data-qtip':'{title}',
					cn:[{
						cls:'item',
						tag: 'img',
						src: Ext.BLANK_IMAGE_URL,
						style:{ backgroundImage: 'url({url})' }
					}]
				}]
			})
		});

		this.mon(this.others,'selectionChange',this.selection,this);
	},


	afterRender: function(){
		this.callParent(arguments);
		Ext.DomHelper.append(this.el,{cls: 'fade-outs', cn: [{cls: 'left'},{cls:'right'}]});
	},


	selection: function(v,s){
		if(s && s[0]){
			this.image.el.dom.setAttribute('src', s[0].get('url'));
		}
	},


	selectFirst: function(){
		this.others.getSelectionModel().select(0);
	}
});
