Ext.define('NextThought.view.content.Pager', {
	extend: 'Ext.Component',
	alias: 'widget.content-pager',
	ui: 'content-pager',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'prev' },
		{ cls: 'next' }
	]),

	renderSelectors: {
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


	updateState: function(ntiid) {
		var info = ntiid && ContentUtils.getNavigationInfo(ntiid),
			next = this.nextEl,
			prev = this.prevEl,
			nextTitle = info && info.next && ContentUtils.findTitle(info.next, null),
			prevTitle = info && info.previous && ContentUtils.findTitle(info.previous, null);


		next.set({title: nextTitle ? ('Go forward to "' + nextTitle + '"') : undefined});
		prev.set({title: prevTitle ? ('Go back to "' + prevTitle + '"') : undefined});

		this[info && info.next ? 'enableButton' : 'disableButton'](next);
		next.set({'data-ntiid': (info && info.next) || undefined});


		this[info && info.previous ? 'enableButton' : 'disableButton'](prev);
		prev.set({'data-ntiid': (info && info.previous) || undefined});
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
			this.fireEvent('set-location', ntiid);
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
