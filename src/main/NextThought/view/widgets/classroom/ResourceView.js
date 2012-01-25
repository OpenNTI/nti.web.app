Ext.define('NextThought.view.widgets.classroom.ResourceView', {
	extend: 'Ext.view.View',
	alias: 'widget.classroom-resource-view',
	requires:[
		'NextThought.model.Link',
		'NextThought.util.UploadUtils'
	],

	cls: 'x-class-resourceview-panel',
	deferEmptyText: false,
	emptyText: '<div class="empty">&nbsp;</div>',
	autoScroll: true,

	dataTypeToIcon: {
		'application/vnd.nextthought.classscipt' : 'resource-script'
	},

	tplGrid: new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="item-wrap">',
				'<div class="item">',
					'<img src="{[Ext.BLANK_IMAGE_URL]}" title="{[this.getName(values)]}">',
					'<span>{[this.getName(values)]}</span>',
				'</div>',
			'</div>',
		'</tpl>',
		'<div class="x-clear"></div>',
		{
			compile: true,
			getName: function(values) {
				return values.href.split('?')[0].split('/').pop();
			}
		}
	),

	tplDetails: new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="item-wrap details">',
				'<div class="item">', //row
					'<img src="{[this.imgURL(values)]}" title="{[this.getName(values)]}">',
					'<span><a href="{[this.getLink(values.href)]}">{[this.getName(values)]}</a></span>',
					'<span>{type}</span>',
				'</div>',
			'</div>',
		'</tpl>',
		'<div class="x-clear"></div>',
		{
			compile: true,
			getName: function(values) {
				return values.href.split('?')[0].split('/').pop();
			},
			imgURL: function(values){
//				console.log(values.type);
				if((/image/i).test(values.type)){
					return this.getLink(values.href);
				}

				return Ext.BLANK_IMAGE_URL;
			},
			getLink: function(ref){
				if(!(/^http:/i).test(ref)){
//				_AppConfig.service.getCollection(??, 'providers');
					return _AppConfig.server.host + "/dataserver2/providers/"+ ref;
				}
				return ref;
			}
		}
	),


	multiSelect: false,
	singleSelect: true,
	trackOver: true,
	overItemCls: 'x-item-over',
	itemSelector: 'div.item-wrap',


	initComponent: function(){
		//create dynamic store:
		this.store = Ext.create('Ext.data.Store', {
			fields: ['href','type'],
			proxy: 'memory'
		});

		//use details tmpl at default
		this.tpl = this.tplDetails;

		this.callParent(arguments);

		this.accepts = [];
		this.postURL = null;
	},

	setRecord: function (r, includeParent) {
		this.accepts = r.get('accepts');
		this.postURL = r.get('href');
		this.store.loadRawData(r.getLinks('enclosure'), false);

		if(includeParent){

		}
	},


	afterRender: function(){
		this.callParent();

		var el = this.el,
			t;

		function over(e, dom) {
			el.addCls('drop-over');
			e.stopPropagation();
			e.preventDefault();

			if(t){
				clearTimeout(t);
			}
			t = setTimeout(function(){el.removeCls('drop-over');}, 100);
		}

		el.on({
			scope: this,
			'drop': this.onDrop,
			'dragenter': over,
			'dragover': over
		});
	},


	onDrop: function(e){
		if(!this.postURL) {
			e.stopPropagation();
			e.preventDefault();
			console.warn('Blocked uploading...no url');
			return;
		}

		var i = 0,
			data = e.browserEvent.dataTransfer;

		for (i; i < data.files.length; i++) {
			this.doUpload(data.files[i]);
		}

		e.stopPropagation();
	},

	doUpload: function(file){
		UploadUtils.postFile( file,
				_AppConfig.server.host+this.postURL,
				this.onProgress,
				this.onFinish,
				this);
	},

	onProgress: function(file, progress){
		//
	},


	onFinish: function(file, href){
		if(href.charAt(href.length-1)==='/'){
			href = href.substring(0,href.length-1);
		}
		this.store.loadRawData([{href: href, type: file.type}],true);
	}

});
