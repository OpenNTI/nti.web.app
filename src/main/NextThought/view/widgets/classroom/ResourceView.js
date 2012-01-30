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



	templateFunctions: {
		compile: true,

		dataTypeToIcon: {
			'vnd.nextthought.classscipt' : 'resource-script'
		},

		getName: function(values) {
			return values.href.split('?')[0].split('/').pop();
		},

		getClass: function(values){
			var t = values.type,
				ext = values.href.split('.').pop(),
				charRe= /[\._\\]/ig,
				appRe = /^application\//ig,
				imgRe = /^image/ig,
				parRe = /\+.*/ig;

			if(imgRe.test(t)){
				return 'image';
			}

			t = t.replace(appRe,'')
					.replace(parRe,'')
					.replace(charRe,'-');

			t = this.dataTypeToIcon[t] || t;

			if(t==='octet-stream'){
				t = ext;
			}

			return t;
		},

		imgURL: function(values){
			if((/image/i).test(values.type)){
				return this.getLink(values.href);
			}

			return Ext.BLANK_IMAGE_URL;
		},

		getLink: function(ref){
			if(!(/^http:/i).test(ref)){
				//_AppConfig.service.getCollection(??, 'providers');
				console.warn('WARNING, hardcoded dataserver2/providers href here, needs to go away once DS is fixed');
				return _AppConfig.server.host + "/dataserver2/providers/"+ ref;
			}
			return ref;
		}
	},

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
		this.on('itemdblclick',this.fireSelected,this);

		this.accepts = [];
		this.postURL = null;
	},



//	switchView: function(){
//		this.tpl = this.tplGrid;
//		this.refresh();
//	},


	fireSelected: function() {
		var selected = this.selModel.getSelection()[0];
		if (selected) {
			this.fireEvent('selected', selected);
		}
	},


	setRecord: function (r, includeParent) {
		var enclosureLinks = r.getLinks('enclosure') || [],
			parentClassInfo;

		this.accepts = r.get('accepts');
		this.postURL = r.get('href');

		if (includeParent) {
			r.getParent(function(ci){
				if (ci) {
					Ext.Array.insert(enclosureLinks, 0, ci.getLinks('enclosure'));
				}
				//load the store
				this.store.loadRawData(enclosureLinks, false);
			}, this);
		}
		else {
			this.store.loadRawData(enclosureLinks, false);
		}
		this.record = r;
	},


	reload: function() {
		if (!this.record || this.record.phantom) {
			Ext.Error.raise('Cannot reload record');
		}

		var me = this,
			id = this.record.getId(),
			href = _AppConfig.server.host + this.record.get('href');

		this.record.self.load(id, {url:href, callback:function(r, o){
			if (o.success) {
				me.setRecord(r);
			}
			else {
				me.store.removeAll(false);
			}
		}});
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

}, function(){
	var proto = this.prototype;
	proto.tplGrid = new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="item-wrap">',
				'<div class="item">',
					'<img src="{[this.imgURL(values)]}" class="{[this.getClass(values)]}" title="{[this.getName(values)]}">',
					'<span>{[this.getName(values)]}</span>',
				'</div>',
			'</div>',
		'</tpl>',
		'<div class="x-clear"></div>',
		proto.templateFunctions
	);

	proto.tplDetails = new Ext.XTemplate(
		'<div class="details header">',
			'<div>', //row
				'<img src="{[Ext.BLANK_IMAGE_URL]}">',
				'<span>Name</span>',
				'<span>Type</span>',
			'</div>',
		'</div>',

		'<tpl for=".">',
			'<div class="item-wrap details">',
				'<div class="item">', //row
					'<img src="{[this.imgURL(values)]}" class="{[this.getClass(values)]}" title="{[this.getName(values)]}">',
					'<span>{[this.getName(values)]}</span>',
					'<span>{type}</span>',
				'</div>',
			'</div>',
		'</tpl>',
		'<div class="x-clear"></div>',
		proto.templateFunctions
	);

});
