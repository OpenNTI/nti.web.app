Ext.define('NextThought.view.course.info.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-panel',
	cls: 'course-info-panel make-white scrollable',
	ui: 'course',
	layout: 'auto',

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},


	initComponent: function() {
		this.callParent(arguments);
		this.initCustomScrollOn('content');
	},


	setContent: function(content){
		this.removeAll(true);

		if (Ext.isString(content)) {
			$AppConfig.service.getPageInfo(
					content,
					this.loadPage,
					this.loadPageFailed,
					this);
			return;
		}

		if (!Ext.isObject(content)) {
			console.log('bad info');
			return;
		}


	},


	isCurrent: function(ntiid){
		var ci = this.up('course-info');
		return ci && ci.currentCourseInfoNtiid === ntiid;
	},


	fillInPage: function(html) {
		var bodyTag = html.match(/<body.*?>(.*)<\/body>/i),
			parent = this.up('course-info');

		if (bodyTag.length > 1) {
			parent.addCls('make-white');
			this.add({
				xtype: 'box',
				cls: 'course-info-panel-legacy',
				html:bodyTag[1],
				listeners: {
					destroy: function() {
						parent.removeCls('make-white');
					}
				}
			});
		}
		else {
			console.error('info page has no body tag?? ', arguments);
		}
	},


	loadPage: function(pageInfo) {
		var proxy = ($AppConfig.server.jsonp) ? JSONP : Ext.Ajax;

		proxy.request({
			pageInfo: pageInfo,
			ntiid: pageInfo.getId(),
			jsonpUrl: pageInfo.getLink('jsonp_content'),
			url: pageInfo.getLink('content'),
			expectedContentType: 'text/html',
			scope: this,
			success: this.loadedPage,
			failure: this.loadPageFailed
		});
	},


	loadPageFailed: function(r) {
		console.error('server-side failure with status code ' + r.status + '. Message: ' + r.responseText);
	},


	loadedPage: function(r,req) {
		if (!this.isCurrent(req.pageInfo.getId())) {
			return;
		}

		this.fillInPage(r.responseText);
	}

});
