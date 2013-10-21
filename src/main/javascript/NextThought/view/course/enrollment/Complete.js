Ext.define('NextThought.view.course.enrollment.Complete', {
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
		var enroll = !Ext.isEmpty(this.record.getLink('enroll')),
			prefix = enroll ? 'enroll' : 'unenroll',
			preview = this.record.get('Preview') ? 'preview' : 'active', tplReplacment;
		this.callParent(arguments);

		tplReplacement = {
			headerHtml: getString('enrollment.'+prefix+'.'+preview+'.header', null, true) || getString('enrollment.'+prefix+'.header'),
			descriptionHtml: getString('enrollment.'+prefix+'.'+preview+'.description', null, true) || getString('enrollment.'+prefix+'.description')
		};

		Ext.Object.each(tplReplacement, function(key, val){
			this.renderTpl = this.renderTpl.replace('%'+key+'%', val);
		}, this);

		this.renderData = Ext.apply(this.renderData || {}, this.record.data);
	},


	afterRender: function() {
		var win;
		this.callParent(arguments);

		win = this.up('window');
		win.headerEl.select('.tab').addCls('visited locked');

		win.on('close', function(){
			//reload the store.
			Ext.getStore('Purchasable').load();

			//reload the library
			Library.getStore().load();
			//Refresh the user
			$AppConfig.userObject.refresh();
		}, this, {single: true})
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
