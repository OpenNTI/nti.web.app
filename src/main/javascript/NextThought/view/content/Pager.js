/*globals getFormattedString: false*/
Ext.define('NextThought.view.content.Pager', {
	extend: 'Ext.Component',
	alias: 'widget.content-pager',
	ui: 'content-pager',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'page', style: 'display: none', cn: [
			{ tag: 'span', cls: 'current'}, ' of ', {tag: 'span', cls: 'total'}
		] },
		{ cls: 'prev' },
		{ cls: 'next' }
	]),

	renderSelectors: {
		page: '.page',
		currentPage: '.page .current',
		totalPages: '.page .total',
		nextEl: '.next',
		prevEl: '.prev'
	},


	listeners: {
		afterrender: 'hideControls',
		click: {
			element: 'el',
			fn: 'click'
		}
	},


	hideControls: function() { this.el.hide(); },
	showControls: function() { this.el.show(); },


	updateState: function(ntiid, rootId, bundle) {
		var me = this,
			next = this.nextEl,
			prev = this.prevEl;

		this.page.setVisibilityMode(Ext.Element.DISPLAY);

		this.currentBundle = bundle;

		if (!ntiid) {
			this.disableButton(next);
			next.set({'data-ntiid': undefined});
			this.disableButton(prev);
			prev.set({'data-ntiid': undefined});
		}

		ContentUtils.getNavigationInfo(ntiid, rootId)
			.then(function(info) {
				var nextTitle = info && info.next && ContentUtils.findTitle(info.next, null),
					prevTitle = info && info.previous && ContentUtils.findTitle(info.previous, null);

				if (info.totalNodes) {
					me.currentPage.update((info.currentIndex + 1) || '0');
					me.totalPages.update(info.totalNodes || '0');
					me.page.show();
				} else {
					me.page.hide();
				}
				me.updateLayout();

				next.set({title: nextTitle ? getFormattedString('NextThought.view.content.Pager.next', {title: nextTitle}) : undefined});
				prev.set({title: prevTitle ? getFormattedString('NextThought.view.content.Pager.prev', {title: prevTitle}) : undefined});

				me[info && info.next ? 'enableButton' : 'disableButton'](next);
				next.set({'data-ntiid': (info && info.next) || undefined});


				me[info && info.previous ? 'enableButton' : 'disableButton'](prev);
				prev.set({'data-ntiid': (info && info.previous) || undefined});
			})
			.fail(function(reason) {
				console.error('Failed to get navigation info for', ntiid, rootId, reason);

				me.disableButton(next);
				me.disableButton(prev);
			});
	},


	goPrev: function() {
		this.go('prev');
	},

	goNext: function() {
		this.go('next');
	},


	go: function(name) {
		var e = this[name + 'El'];
		if (!e.is('[data-ntiid]')) {e = null;}
		this.click({getTarget: function() {return e;}});
	},


	click: function(e) {

		var btn = e.getTarget('[data-ntiid]'),
			ntiid = btn && btn.getAttribute('data-ntiid');

		if (ntiid) {
			this.fireEvent('set-location', ntiid, null, null, this.currentBundle);
		}
		else {
			console.debug('no ntiid');
		}
	},


	enableButton: function(el) {
		el.removeCls('disabled');
	},


	disableButton: function(el) {
		el.addCls('disabled');
	}
});
