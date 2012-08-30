Ext.define('NextThought.ux.VideoPopout',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.video-lightbox',
	requires: [
		'Ext.data.Store',
		'Ext.view.View'
	],

	modal: true,
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	floating: true,
	cls: 'videos',
	ui: 'video',
	width: 640,
	height: 475,
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	items: [
		{
			name: 'video',
			xtype: 'box',
			cls: 'video',
			height: 360,
			width: 640,
			autoEl: {
				src: Ext.SSL_SECURE_URL,
				tag: 'iframe',
				frameBorder: 0,
				marginWidth: 0,
				marginHeight: 0,
				seamless: true,
				transparent: true,
				allowFullscreen: true,
				allowTransparency: true,
				style: 'overflow: hidden',
				height: 360,
				width: 640
			}
		}
	],


	constructor: function(config){
		var store = config ? (config.store||undefined) : undefined,
			data = config ? (config.data||undefined) : undefined;
		this.callParent(arguments);

		this.iframe = this.down('box[name=video]');

		if(!data){
			data = [
				 {video: 'https://www.youtube.com/embed/S4knArgz7cA?rel=0&wmode=opaque',
				  thumb: 'http://img.youtube.com/vi/S4knArgz7cA/2.jpg'},
				 {video: 'https://www.youtube.com/embed/yY2NVw-aXqY?rel=0&wmode=opaque',
				  thumb: 'http://img.youtube.com/vi/yY2NVw-aXqY/2.jpg'},
				 {video: 'https://www.youtube.com/embed/j-EB1O-vRS4?rel=0&wmode=opaque',
				  thumb: 'http://img.youtube.com/vi/j-EB1O-vRS4/2.jpg'}
			 ];
		}
		else{
			//CUTZ we have a paraity mismatch between the good content param names
			//and what we are expecting here
			Ext.each(data, function(videoObj){
				videoObj.video = videoObj.url || videoObj.video;
				videoObj.thumb = videoObj.thumbnail || videoObject.thumb;
			});
		}

		this.store = store || Ext.create('Ext.data.Store',{
			fields: [
				{name:'video', type:'string'},
				{name:'thumb', type:'string'}
			],
			data : data
		});

		this.others = this.add({
			xtype: 'dataview',
			overflowX: 'scroll',
			overflowY: 'hidden',
			height: 115,
			store: this.store,
			cls: 'carousel',
			singleSelect: true,
			overItemCls: 'over',
			itemSelector: 'div.item-wrap',
			tpl: Ext.DomHelper.markup(
				{tag:'tpl', 'for':'.', cn: [
					{cls:'item-wrap', cn:[{
						cls:'item',
						tag: 'img',
						src: Ext.BLANK_IMAGE_URL,
						style:{ backgroundImage: 'url({thumb})' }
					}]
				}]
			})
		});
		this.mon(this.others,'selectionChange',this.selection,this);

		this.task = {
			scope: this,
			interval: 300,
			run: function(){
				var m = Ext.getBody().down('.x-mask');
				if (m) {
					Ext.TaskManager.stop(this.task);
					Ext.getBody().appendChild(m);
				}
			}
		};

		Ext.TaskManager.start(this.task);
		return this;
	},


	destroy: function(){
		Ext.TaskManager.stop(this.task);
		this.callParent(arguments);
	},


	selection: function(v,s){
		this.iframe.el.dom.setAttribute('src',s[0].get('video'));
	},


	onShow: function(){
		this.others.getSelectionModel().select(0);
		return this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon( Ext.DomHelper.append(this.el, { cls:'close', title: 'close' }, true),{
			scope: this,
			click: this.close
		});
	}

});
