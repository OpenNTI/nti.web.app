Ext.define('NextThought.view.courseware.info.Panel', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-panel',
	cls: 'course-info-panel scrollable',
	ui: 'course',
	layout: 'auto',

	requires: [
		'NextThought.proxy.JSONP',
		'NextThought.view.courseware.info.parts.*'
	],


	setContent: function(content, status) {
		this.removeAll(true);

		var toAdd = [];

		if (!Ext.isObject(content)) {
			if (Ext.isString(content)) {
				Service.getPageInfo(
						content,
						this.loadPage,
						this.loadPageFailed,
						this);
			}
			return;
		}

		if (this.up('course-info').infoOnly) {
			toAdd.push({
				xtype: 'course-info-not-started',
				info: content,
				enrollmentStatus: status
			});
		}

		toAdd.push({
			xtype: 'course-info-title',
			title: content.get('Title'),
			videoUrl: content.get('Video')
		},{
			xtype: 'course-info-description',
			info: content,
			enrollmentStatus: status
		},{
			xtype: 'course-info-instructors',
			info: content
		},{
			xtype: 'course-info-support'
		},{
			xtype: 'box',
			ui: 'course-info',
			cls: 'gutter'
		});


		this.add(toAdd);
	},


	//<editor-fold desc="Fallback Code">
	fillInPage: function(html) {
		var bodyTag = html.match(/<body.*?>(.*)<\/body>/i),
			parent = this.up('course-info');

		if (bodyTag.length > 1) {
			parent.addCls('make-white');
			this.add({
				xtype: 'box',
				cls: 'course-info-panel-legacy',
				html: bodyTag[1],
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
		this.activeRequest = pageInfo.getId();
		ContentProxy.request({
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


	loadedPage: function(r, req) {
		if (this.activeRequest !== req.pageInfo.getId()) {
			return;
		}

		this.fillInPage(r.responseText);
		delete this.activeRequest;
	}
	//</editor-fold>


});
