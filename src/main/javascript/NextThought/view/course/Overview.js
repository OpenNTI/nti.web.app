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


	SECTION_TITLE_MAP: {
		'course-overview-content': 'Supplemental Reading'
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
			SECTION_TITLE_MAP = me.SECTION_TITLE_MAP,
			locInfo,
			items = [],
			kinds = {};
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
			t = i && i.xtype;
			if( t ){
				c = kinds[t];
				if(t !== 'course-overview-topic'){
					if(!c){
						c = kinds[t] = {
							xtype: 'course-overview-section',
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
		var type = node && node.nodeName;

		if(/^content:related$/i.test(type) || /^object$/i.test(type)){
			type = node.getAttribute('type');
			type = type && type.replace(/^application\/vnd\.nextthought\./,'');
		}

		type = 'course-overview-'+type.toLowerCase();

		if(Ext.ClassManager.getByAlias('widget.'+type)){
			return {xtype: type, node:node, locationInfo: info};
		}

		console.warn('Unknown overview type,', node);
		return null;
	}

});
