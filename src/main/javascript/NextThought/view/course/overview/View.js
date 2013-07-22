Ext.define('NextThought.view.course.overview.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview',
	ui: 'course',
	cls: 'course-overview',

	requires:[
		'NextThought.view.course.overview.Header',
		'NextThought.view.course.overview.Section',
		'NextThought.view.course.overview.Topic',
		'NextThought.view.course.overview.ContentLink',
		'NextThought.view.course.overview.Discussion',
		'NextThought.view.course.overview.Videos',
		'NextThought.view.course.overview.QuestionSet'
	],

	autoScroll: true,

	SECTION_TITLE_MAP: {
		'video': 'Videos',
		'discussions': 'Discussions',
		'additional': 'Additional Reading',
		'required': 'Required Reading',
		'assessments': 'Assessments'
	},

	SECTION_TYPE_MAP: {
		'course-overview-ntivideo': 'video',
		'course-overview-content': 'additional',
		'course-overview-discussion': 'discussions',
		'course-overview-externallink': 'additional',
		'course-overview-naquestionset': 'assessments'
	},


	SECTION_CONTAINER_MAP: {
		'video': 'course-overview-video-section',
		'discussions': 'course-overview-section',
		'additional': 'course-overview-section',
		'required': 'course-overview-section',
		'assessments': 'course-overview-section'
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
			SECTION_CONTAINER_MAP = me.SECTION_CONTAINER_MAP,
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
							xtype: SECTION_CONTAINER_MAP[t] || 'course-overview-section',
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
