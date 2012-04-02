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

		getName: function(values,elips) {
			var name = values.href.split('?')[0].split('/').pop();

			if(elips) {
				name = Ext.String.ellipsis(name,15);
				console.log(name);
			}
			return name;
		},

		getClass: function(values){
			var t = values.type,
				ext = values.href.split('.').pop(),
				charRe= /[\._\\]/ig,
				appRe = /^application\//ig,
				imgRe = /^image/ig,
				parRe = (/\+.*/ig);

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
				return $AppConfig.server.host + ref;
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
			fields: ['href','type', 'ntiid'],
			proxy: 'memory'
		});

		//Dirty Haxx
		var r = this.store.loadRawData;
		this.store.loadRawData = function(data){
			var m = '/dataserver2/',
				i = data.length-1;

			for(i;i>=0;i-=1){
				if(!(/^\/dataserver2\//i).test(data[i].href)) {
					data[i].href = m + data[i].href;
					console.log(data[i].href);
				}
			}

			r.apply(this,arguments);
		};
		//Dirty End

		//use details tmpl at default
		this.tpl = this.viewGrid ? this.tplGrid : this.tplDetails;

		this.callParent(arguments);
		this.on('itemdblclick',this.fireSelected,this);

		this.accepts = [];
		this.postURL = null;
	},


	setViewToDetails: function(){
		this.tpl = this.tplDetails;
		this.refresh();
	},


	setViewToGrid: function(){
		this.tpl = this.tplGrid;
		this.refresh();
	},


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
			href = $AppConfig.server.host + this.record.get('href');

		this.record.self.load(id, {url:href, callback:function(r, o){
			if (o.success) {
				me.setRecord(r);
			}
			else {
				me.store.removeAll(false);
			}
		}});
	},


	refresh: function(){
		this.tpl.readOnly = Boolean(this.readOnly);

		this.callParent(arguments);
		Ext.each(
				this.getEl().query('.actions .edit'),
				function(dom){Ext.fly(dom).on('click',this.clickSelect, this);},
				this);

		Ext.each(
				this.getEl().query('.actions .delete'),
				function(dom){Ext.fly(dom).on('click',this.clickDelete, this);},
				this);
	},


	clickSelect: function(evt, dom){
		evt.preventDefault();
		evt.stopPropagation();

		var r = this.getRecord(Ext.fly(dom).up(this.itemSelector, this.getEl()));

		this.getSelectionModel().select([r]);
		this.fireSelected();
	},


	clickDelete: function(evt, dom){
		evt.preventDefault();
		evt.stopPropagation();

		var store = this.store,
			r = this.getRecord(Ext.fly(dom).up(this.itemSelector, this.getEl()));

		Ext.Ajax.request({
			url: $AppConfig.server.host + r.get('href'),
			method: 'DELETE',
			callback: function(req,success){
				if(success){
					store.remove(r);
				}
			}
		});

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
			return false; //for IE
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
		e.stopPropagation();

		var dt = e.browserEvent.dataTransfer;

		if(!dt){
			alert('Please use the add file menu, your browser does not support drag & drop file uploads.');
		}
		else {
			this.doUpload(dt.files);
		}
		return false; //for IE
	},

	doUpload: function(files){
		var i = 0, file;

		for (i; i < files.length; i+=1) {
			file = files[i];

			UploadUtils.postFile( file,
					$AppConfig.server.host+this.postURL,
					this.onProgress,
					this.onFinish,
					this);
		}
	},


	doLegacyUpload: function(fileInput){
		var me = this,
			form = Ext.create('Ext.form.Basic',Ext.create('Ext.panel.Panel'),{}),
			fieldCacheKey = '_fields',
			fields;

		fields = form[fieldCacheKey] = Ext.create('Ext.util.MixedCollection');
		fields.add(fileInput);

		if(form.isValid()){
			form.submit({
				url: $AppConfig.server.host+this.postURL,
				waitMsg: 'Uploading your file...',
				success: function() {
					me.reload();
				},
				failure: function(){
					console.log('failed to upload');
				}
			});
		}
		else {
			fileInput.extractFileInput();
		}
	},


	onProgress: function(file, progress){
		//
	},


	onFinish: function(file, href){
		if(href.charAt(href.length-1)==='/'){
			href = href.substring(0,href.length-1);
		}

		href = href.replace(Globals.HOST_PREFIX_PATTERN,'');

		this.store.loadRawData([{href: href, type: file.type}],true);
	}

}, function(){
	var proto = this.prototype;
	proto.tplGrid = new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="item-wrap">',
				'<div class="item">',
					'<div class="actions">',
						'<span class="edit"></span>',
						'<tpl if="false === this.readOnly">',
							'<span class="delete"></span>',
						'</tpl>',
					'</div>',
					'<img src="{[this.imgURL(values)]}" class="{[this.getClass(values)]}" title="{[this.getName(values)]}">',
					'<span>{[this.getName(values,true)]}</span>',
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
					'<div class="actions">',
						'<span class="edit"></span>',
						'<tpl if="false == this.readOnly">',
							'<span class="delete"></span>',
						'</tpl>',
					'</div>',
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
