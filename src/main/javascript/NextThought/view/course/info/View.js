Ext.define('NextThought.view.course.info.View',{
	extend: 'Ext.Component',
	alias: 'widget.course-info',
	cls: 'make-white',

	setPage: function(ntiid){
		this.hasInfo = !!ntiid;

		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setPage,this,[ntiid]),this,{single:true});
			return;
		}

		this.update('');

		Ext.getBody().mask('Loading...','navigation');

		$AppConfig.service.getPageInfo(ntiid, this.loadPage, this.failedToLoad, this);
	},

	fillInPage: function(html){
		var dF = document.createDocumentFragment(),
			root = document.createElement('html'),
			body;

		root.innerHTML = html;

		body = root.getElementsByTagName('body')[0];
		Ext.getBody().unmask();
		this.update(body && body.innerHTML);
	},	

	loadPage: function(pageInfo){
		var me = this,
			proxy = ($AppConfig.server.jsonp) ? JSONP : Ext.Ajax;

		proxy.request({
			pageInfo: pageInfo,
			ntiid: pageInfo.getId(),
			jsonpUrl: pageInfo.getLink('jsonp_content'),
			url: pageInfo.getLink('content'),
			expectedContentType: 'text/html',
			scope: this,
			success: function(r){
				me.fillInPage(r.responseText);
			},
			failure: function(r) {
				console.error('server-side failure with status code ' + r.status+'. Message: '+ r.responseText);
			}
		});
	},

	failedToLoad: function(){
		console.error('Failed to load course info', arguments);
	},

	onCourseChanged: function(pageInfo){
		var l = ContentUtils.getLocation(pageInfo),
			toc, course;


		if( l && l !== ContentUtils.NO_LOCATION ){
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
		}
		
		this.setPage(pageInfo.isPartOfCourse() && course && course.getAttribute('courseInfo'));
	}
});
