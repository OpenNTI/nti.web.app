Ext.define('NextThought.app.forums.components.topic.parts.Pager', {
	extend: 'NextThought.app.course.assessment.components.admin.Pager',
	alias: 'widget.topic-comment-pager',


	MAX_VISIBLE: 5,

	PREV_NEXT: false,


	addNavigationPages: function(pages, count, current) {
		if (!this.PREV_NEXT) { return pages; }

		pages.unshift({
			html: 'Prev',
			isEllipse: false,
			index: 'prev',
			cls: current > 1 ? 'active' : 'not-active'
		});
		pages.push({
			html: 'Next',
			isEllipse: false,
			index: 'next',
			cls: current < count ? 'active' : 'not-active'
		});

		return pages;
	},


	getPageList: function(count, current) {
		var pageList = [], pages = [], spots, i;

		if (count < this.MAX_VISIBLE) {
			for (i = 1; i <= count; i++) {
				pageList.push(i);
			}
			return pageList;
		}

		// Number of spots on the left of current page
		spots = Math.min(Math.floor(this.MAX_VISIBLE / 2), Math.floor(count / 2));
		for (i = current - 1; i > 0 && spots > 0; i--) {
			pageList.unshift(i);
			spots--;
		}

		// Number of spots on the right of current page
		spots = Math.min(this.MAX_VISIBLE - pageList.length, count - pageList.length);
		for (i = current; i < (current + spots) && i <= count; i++) {
			pageList.push(i);
		}

		if (pageList.length < this.MAX_VISIBLE) {
			spots = this.MAX_VISIBLE - pageList.length;
			for (i = pageList[0] - 1; i > 0 && spots > 0; i--) {
				pageList.unshift(i);
				spots--;
			}
		}

		if (!Ext.Array.contains(pageList, 1)) {
			pageList.unshift('first');
		}

		if (!Ext.Array.contains(pageList, count)) {
			pageList.push('last');
		}

		return pageList;
	},


	getPages: function(count, current) {
		var pageList, pages = [];

		function addPages(list) {
			var i;
			for (i = 0; i <= list.length; i++) {
				if (pageList[i] === 'first' || pageList[i] === 'last') {
					pages.push({
						html: Ext.String.capitalize(pageList[i]),
						isEllipse: false,
						index: pageList[i],
						cls: 'not-active'
					});
				}
				else {
					pages.push({
						html: pageList[i],
						isEllipse: false,
						index: pageList[i],
						cls: pageList[i] === current ? 'active' : 'not-active'
					});
				}
			}
		}

		//if there is only one page don't show any
		if (count === 1) {
			return [];
		}

		pageList = this.getPageList(count, current);
		addPages(pageList);
		return pages;
	}
});
