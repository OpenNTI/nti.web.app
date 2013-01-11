Ext.define('NextThought.view.video.Roll',{
	extend: 'Ext.container.Container',
	alias: 'widget.video-roll',

	layout: 'anchor',
	defaults: {anchor: '100%'},
	cls: 'videos',
	ui: 'video',
	items: [{
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
	}],

	constructor: function(config){
		var store = config ? (config.store||undefined) : undefined,
			data = config ? (config.data||undefined) : undefined,
			me = this;

		me.callParent(arguments);

		this.iframe = this.down('box[name=video]');

		if(!data){
			data = [{
				thumbnail	: 'http://img.youtube.com/vi/S4knArgz7cA/2.jpg',
				url			: 'https://www.youtube.com/embed/S4knArgz7cA?rel=0&wmode=opaque'
			},{
				thumbnail	: 'http://img.youtube.com/vi/yY2NVw-aXqY/2.jpg',
				url			: 'https://www.youtube.com/embed/yY2NVw-aXqY?rel=0&wmode=opaque'
			},{
				thumbnail	: 'http://img.youtube.com/vi/j-EB1O-vRS4/2.jpg',
				url			: 'https://www.youtube.com/embed/j-EB1O-vRS4?rel=0&wmode=opaque'
			}];
		}

		this.store = store || new Ext.data.Store({
			fields: [
				{name:'url', type:'string'},
				{name:'thumbnail', type:'string'}
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
						style:{ backgroundImage: 'url({thumbnail})' }
					}]
				}]
			})
		});
		this.mon(this.others,'selectionChange',this.selection,this);
	},

	selection: function(v,s){
		if(s && s[0]){
			this.iframe.el.dom.setAttribute('src', this.filterVideoUrl(s[0].get('url')));
		}
	},


	filterVideoUrl: function(url){

		if((/^(http(s)?:)?\/\/www.youtube.com/i).test(url)){
			url = url.split('?')[0];
			url += '?html5=1&&autohide=1&modestbranding=0&rel=0&showinfo=1';
		}

		return url;
	},


	selectFirst: function(){
		this.others.getSelectionModel().select(0);
	}
});
