Ext.define('NextThought.view.course.Overview',{
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview',
	ui: 'course',
	cls: 'course-overview',

	requires:[
		'NextThought.view.course.overview.Header',
		'NextThought.view.course.overview.Section',
		'NextThought.view.course.overview.Topic',
		'NextThought.view.course.overview.ContentLink'
	],

	autoScroll: true,

	SECTION_TITLE_MAP: {
		'videos': 'Videos',
		'discussions': 'Discussions',
		'additional': 'Additional Reading',
		'required': 'Required Reading'
	},

	SECTION_TYPE_MAP: {
		'course-overview-content': 'additional',
		'course-overview-externallink': 'additional'
	},


	getCourseStore: DelegateFactory.getDelegated(),
	getSelectionModel: DelegateFactory.getDelegated(),


	beforeRender: function(){
		this.callParent(arguments);
		var s = this.getSelectionModel();
		this.mon(s,'select','onNodeSelected',this);
		if(s.hasSelection()){
			this.onNodeSelected(s, s.getSelection()[0]);
		}
	},


	clear: function(){
		this.removeAll(true);
		delete this.currentPage;
	},


	onNodeSelected: function(s,r){
		var me = this,
			SECTION_TYPE_MAP = me.SECTION_TYPE_MAP,
			SECTION_TITLE_MAP = me.SECTION_TITLE_MAP,
			locInfo,
			items = [],
			sections = {};
		//console.debug('Select???',arguments);

		if(!r || r.getId() === me.currentPage){
			return;
		}

		locInfo = ContentUtils.getLocation(r.getId());

		me.clear();

		me.currentPage = r.getId();

		Ext.each(r.getChildren(),function(i){
			var c, t;
			i = me.getComponentForNode(i,locInfo);
			t = i && (i.sectionOverride || SECTION_TYPE_MAP[i.xtype] || 'Unknown');
			if( t ){
				if(i.xtype !== 'course-overview-topic'){
					c = sections[t];
					if(!c){
						c = sections[t] = {
							xtype: 'course-overview-section',
							type: t,
							title: SECTION_TITLE_MAP[t] || 'Section '+t,
							items: []
						};
						items.push(c);
					}
					c.items.push(i);
				}
				else {
					items.push(i);
				}

			}
		});



		me.add([{xtype: 'course-overview-header', record:r}].concat(items));
	},


	getComponentForNode: function(node,info){
		var type = node && node.nodeName,
			section = (node && node.getAttribute('section')) || null;

		if(/^content:related$/i.test(type) || /^object$/i.test(type)){
			type = node.getAttribute('type') || node.getAttribute('mimeType');
			type = type && type.replace(/^application\/vnd\.nextthought\./,'');
		}

		type = type && ('course-overview-'+type.toLowerCase());

		if(type && Ext.ClassManager.getByAlias('widget.'+type)){
			return {xtype: type, node:node, locationInfo: info, sectionOverride: section};
		}

		console.warn('Unknown overview type:', type, node);
		return null;
	}

});
