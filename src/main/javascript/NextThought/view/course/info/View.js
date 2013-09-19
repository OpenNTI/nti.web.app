Ext.define('NextThought.view.course.info.View', {
	extend: 'Ext.Component',
	alias:  'widget.course-info',
	cls:    'make-white scrollable',

	mixins:{
		customScroll: 'NextThought.mixins.CustomScroll'
	},


	initComponent: function(){
		this.callParent(arguments);
		if(isFeature('fancy-scroll')){
			this.initCustomScrollOn('content');
		}
	},

	setPage: function (ntiid) {
		this.hasInfo = !!ntiid;

		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setPage, this, [ntiid]), this, {single: true});
			return;
		}

		this.currentCourseInfoNtiid = ntiid;
		this.update('');

		Ext.getBody().mask('Loading...', 'navigation');

		$AppConfig.service.getPageInfo(ntiid, this.loadPage, this.failedToLoad, this);
	},


	fillInPage: function (html) {
		var bodyTag = html.match(/<body.*?>(.*)<\/body>/i);

		Ext.getBody().unmask();
		if( bodyTag.length > 1){
			this.update(bodyTag[1]);
		}
		else{
			console.error('info page has no body tag?? ', arguments);
		}
	},


	loadPage: function (pageInfo) {
		var me = this,
				proxy = ($AppConfig.server.jsonp) ? JSONP : Ext.Ajax;

		proxy.request({
						  pageInfo:            pageInfo,
						  ntiid:               pageInfo.getId(),
						  jsonpUrl:            pageInfo.getLink('jsonp_content'),
						  url:                 pageInfo.getLink('content'),
						  expectedContentType: 'text/html',
						  scope:               this,
						  success:             function (r) {
							  if (this.currentCourseInfoNtiid !== pageInfo.getId()) {
								  console.warn('Dropping out of order course info', this.currentCourseInfoNtiid, pageInfo);
								  return;
							  }
							  me.fillInPage(r.responseText);
						  },
						  failure:             function (r) {
							  console.error('server-side failure with status code ' + r.status + '. Message: ' + r.responseText);
						  }
					  });
	},


	failedToLoad: function () {
		console.error('Failed to load course info', arguments);
	},


	onCourseChanged: function (pageInfo) {
		console.log('Course change being handled by course info', this);
		var l = ContentUtils.getLocation(pageInfo),
				toc, course;


		if (l && l !== ContentUtils.NO_LOCATION) {
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
		}

		this.setPage(pageInfo.isPartOfCourse() && course && course.getAttribute('courseInfo'));
	}
});
