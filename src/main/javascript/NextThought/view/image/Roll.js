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
		height: 480,
		autoEl: {
			tag: 'img',
			src: Ext.BLANK_IMAGE_URL
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

		this.preload(data);

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


	preload: function(data){
		var me = this,
			loaded = 0,
			maxAspect = 0;

		function fin(img){
			loaded++;
			var h, w;

			if(img){
				w = img.width;
				h = img.height;

				maxAspect = Math.max(maxAspect,w/h);

				console.debug('Image Roll Preloaded Image: Width: '+w+', Height: '+h+', Aspect Ratio: '+(w/h)+', Source: '+img.src);
			}

			if(data.length <= loaded){
				console.debug('Image Roll finished preloading, max aspect ratio:', maxAspect);
				me.updateAspect(maxAspect);
			}
		}

		Ext.each(data,function(i){
			var o = i.img = new Image();
			o.onload = function(){ fin(o); };
			o.onerror = function(){ fin(); console.warn('Failed to load: '+i.url); };
			o.src = i.url;
		});
	},


	updateAspect: function(aspect){
		var w = this.image.getWidth(),
			h = Math.round(w/(aspect||1));

		console.debug('Image Roll: setting new height based on max aspect ratio: ',h);
		this.image.setHeight(h);
		this.updateLayout();
	},


	afterRender: function(){
		this.callParent(arguments);
		Ext.DomHelper.append(this.el,{cls: 'fade-outs', cn: [{cls: 'left'},{cls:'right'}]});
	},


	selection: function(v,s){
		if(s && s[0]){
			this.image.el.setStyle({
				backgroundImage: 'url('+s[0].get('url')+')',
				backgroundSize: 'contain',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat'
			});
		}
	},


	selectFirst: function(){
		this.others.getSelectionModel().select(0);
	}
});
