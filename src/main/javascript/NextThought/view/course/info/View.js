Ext.define('NextThought.view.course.info.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course-info',

	requires: [
		'NextThought.view.course.info.outline.View',
		'NextThought.view.course.info.Panel'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},


	navigation: {xtype: 'course-info-outline'},
	body: {xtype: 'course-info-panel'},


	initComponent: function() {
		this.callParent(arguments);
		//we set this up to listen to a node that will not scroll...
		// so that when this view is activated it will reset the view.
		this.initCustomScrollOn('content');
	},


	onCourseChanged: function(pageInfo) {
		var me = this,
			l = ContentUtils.getLocation(pageInfo),
			toc, course, info, content;

		function update(info) {
			me.hasInfo = !!info;
			me.currentCourseInfoNtiid = Ext.isString(info) ? info : (info && info.ntiid);

			if (info) {
				info.locationInfo = l;
			}

			me[me.infoOnly?'addCls':'removeCls']('info-only');
			me.navigation.margin = (me.infoOnly? '105':'0')+' 5 5 0';

			me.body.setContent(info);
			me.navigation.setContent(info);
		}


		delete me.infoOnly;

		if (l && l !== ContentUtils.NO_LOCATION) {
			toc = l.toc && l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
			info = course && course.querySelector('info');
		}

		if (info) {
			update();//clear the current view while we load.
			me.parseNode(info, course, l, update);
			return;
		}

		content = pageInfo.isPartOfCourse() && course && course.getAttribute('courseInfo');
		update(content);
	},


	parseNode: function(infoNode, courseNode, locInfo, callback){
		var proxy = ($AppConfig.server.jsonp) ? JSONP : Ext.Ajax,
			src = getURL(infoNode.getAttribute('src'), locInfo.root);

		this.hasInfo = !!infoNode;
		this.infoOnly = !courseNode.querySelector('unit');


		function success(r){
			var json = Ext.decode(r.responseText,true),
				startDate;


			//<editor-fold desc="Date Parse & Time cleanup">
			function times(t) {
				var v = t;
				if(t.split('T').length === 1){
					v = startDate+t;
				}

				return Ext.Date.parse(v,'c');
			}

			if (json) {
				json.startDate = Ext.Date.parse(json.startDate,'c');
				startDate = Ext.Date.format(json.startDate,'Y-m-d\\T');
				(json.schedule||{}).times = Ext.Array.map((json.schedule||{}).times||[],times);
			}
			//</editor-fold>

			Ext.callback(callback,this,[json]);
		}

		proxy.request({
			jsonpUrl: src+'p',
			url: src,
			expectedContentType: 'application/json',
			scope: this,
			success: success,
			failure: function(){
				Ext.callback(callback,this,[]);
			}
		});
	}
});
