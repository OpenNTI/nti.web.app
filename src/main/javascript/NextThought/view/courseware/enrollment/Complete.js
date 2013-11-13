Ext.define('NextThought.view.courseware.enrollment.Complete', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-complete',

	ui: 'purchasecomplete-panel',

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'h3', cls: 'gap', html: '%headerHtml%'},
		{ html: '%descriptionHtml%'}
	]),


	renderSelectors: {
	},


	ordinal: 2,
	confirmLabel: 'Close',
	omitCancel: true,
	closeWithoutWarn: true,

	onConfirm: function() {
		var win = this.up('window') || {};
		this.fireEvent('close', this);
		Ext.callback(win.callback, win);
	},


	beforeRender: function() {
		var rec = this.record,
			enroll = !Ext.isEmpty(this.record.getLink('enroll')),
			prefix = enroll ? 'enroll' : 'unenroll',
			preview = this.record.get('Preview') ? 'preview' : 'active',
			tplReplacment, win;

		this.callParent(arguments);

		tplReplacement = {
			headerHtml: getString('enrollment.'+prefix+'.'+preview+'.header', null, true) || getString('enrollment.'+prefix+'.header'),
			descriptionHtml: getString('enrollment.'+prefix+'.'+preview+'.description', null, true) || getString('enrollment.'+prefix+'.description')
		};

		Ext.Object.each(tplReplacement, function(key, val){
			this.renderTpl = this.renderTpl.replace('%'+key+'%', val);
		}, this);

		this.renderData = Ext.apply(this.renderData || {}, this.record.data);

		win = this.up('window');
		win.headerEl.select('.tab').addCls('visited locked');
		win.on({
			single: true,
			close: function(){
				win.fireEvent(Ext.String.format('enrollment-{0}ed-complete',enroll?'enroll':'dropp'),win, rec);
			}
		});
	},


	onNavigateToNewlyEnrolledContentClicked: function(e) {
		var items = this.record.get('Items') || [];
		e.stopEvent();

		//Again with these damn assumptions
		if (items.length > 1) {
			console.warn('More than one item for this purchasable.  Content roulette', items);
		}

		items = items.first();
		if (items) {
			this.fireEvent('set-location', items);
			this.up('window').close();
		}

		return false;
	}
});
