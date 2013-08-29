Ext.define('NextThought.view.course.enrollment.Complete', {
	extend: 'Ext.Component',
	alias:  'widget.enrollment-complete',

	ui: 'purchasecomplete-panel',

	renderTpl: Ext.DomHelper.markup([
										{ tag: 'tpl', 'if': 'enroll', cn: [
											{ tag: 'h3', cls: 'gap', html: 'Congratulations!'},
											{ html: 'Your enrollment was successful. This course is open, and you can start participating right away. Visit My Courses to access your materials and get started today.'},
											{ cls: 'gap', cn: [
												{ tag: 'a', href: '#', html: 'View your content now!' }
											]}
										]},
										{ tag: 'tpl', 'if': '!enroll', cn: [
											{ tag: 'h3', cls: 'gap', html: 'Goodbye!'},
											{ html: 'You are no longer enrolled in this course.'}
										]}
									]),


	renderSelectors: {
		linkEl: 'a[href]'
	},


	ordinal:          2,
	confirmLabel:     'Close',
	omitCancel:       true,
	closeWithoutWarn: true,

	onConfirm: function () {
		this.fireEvent('close', this);
	},


	beforeRender: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			enroll: !Ext.isEmpty(this.record.getLink('enroll'))
		});
	},


	afterRender: function () {
		var win;
		this.callParent(arguments);

		if (this.linkEl) {
			//Hide it until we can do this well.
			this.linkEl.hide();
			this.mon(this.linkEl, 'click', 'onNavigateToNewlyEnrolledContentClicked', this);
		}

		win = this.up('window');
		win.headerEl.select('.tab').addCls('visited locked');

		//reload the store.
		Ext.getStore('Purchasable').load();

		//reload the library
		Library.getStore().load();
		//Refresh the user
		$AppConfig.userObject.refresh();
	},


	onNavigateToNewlyEnrolledContentClicked: function (e) {
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
