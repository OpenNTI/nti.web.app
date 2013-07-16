Ext.define('NextThought.view.course.Overview',{
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview',
	ui: 'course',
	cls: 'course-overview',

	requires:[
		'NextThought.view.course.overview.Header',
		'NextThought.view.course.overview.Topic',
		'NextThought.view.course.overview.ContentLink'
	],


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
			locInfo,
			items = [{xtype: 'course-overview-header', record:r}];
		//console.debug('Select???',arguments);

		if(!r || r.getId() === me.currentPage){
			return;
		}

		locInfo = ContentUtils.getLocation(r.getId());

		me.clear();

		me.currentPage = r.getId();

		Ext.each(r.getChildren(),function(i){
			i = me.getComponentForNode(i,locInfo);
			if( i ){
				items.push(i);
			}
		});

		me.add(items);
	},


	getComponentForNode: function(node,info){
		var type = node && node.nodeName;

		if(/^content:related$/i.test(type)){
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
