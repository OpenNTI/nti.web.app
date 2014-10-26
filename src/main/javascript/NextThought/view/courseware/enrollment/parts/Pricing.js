Ext.define('NextThought.view.courseware.enrollment.parts.Pricing', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-pricing',

	base_top: 50,

	cls: 'enrollment-pricing',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'info', style: {backgroundImage: 'url({icon})'}, cn: [
			{cls: 'meta', cn: [
				{cls: 'number', html: '{number}'},
				{cls: 'title', html: '{title}'},
				{cls: 'author', html: 'By {author}'}
			]}
		]},
		{cls: 'details', cn: [
			{cls: 'detail type', cn: [
				{tag: 'span', cls: 'label', html: 'Enrollment Type'},
				{tag: 'span', html: '{enrollmentType}'}
			]},
			{cls: 'detail', cn: [
				{tag: 'span', cls: 'label', html: 'Credit Hours:'},
				{tag: 'span', html: '{credit}'}
			]},
			{cls: 'detail', cn: [
				{tag: 'span', cls: 'label', html: 'Begins:'},
				{tag: 'span', html: '{begins}'}
			]},
			{cls: 'detail', cn: [
				{tag: 'span', cls: 'label', html: 'Ends:'},
				{tag: 'span', html: '{ends}'}
			]},
			{cls: 'detail price', cn: [
				{tag: 'span', cls: 'label', html: 'Total'},
				{tag: 'span', cls: 'amount', html: '{price}'}
			]}
		]}
	]),


	renderSelectors: {
		priceEl: '.amount'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var course = this.course, hours,
			credit = this.course.get('Credit'),
			begins = this.course.get('StartDate'),
			ends = this.course.get('EndDate'),
			format = 'F j, Y';

		credit = credit && credit[0];

		hours = credit && credit.get('Hours');

		this.renderData = Ext.apply(this.renderData || {}, {
			icon: course.get('icon'),
			number: course.get('ProviderUniqueID'),
			title: course.get('title'),
			author: course.getAuthorLine(),
			enrollmentType: this.enrollmentOption.display,
			credit: hours && this.enrollmentOption.hasCredit ? Ext.util.Format.plural(hours, 'Credit Hour') : 'No College Credit',
			begins: Ext.Date.format(begins, format),
			ends: Ext.Date.format(ends, format),
			price: '$' + this.getPrice()
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.el.setTop(this.base_top);

		if (!this.scrollTarget) {
			console.error('No scroll target for pricing info');
		} else {
			this.mon(this.scrollTarget, 'scroll', 'onContainerScroll');
		}

		Ext.EventManager.onWindowResize(this.onContainerScroll.bind(this));
	},


	onContainerScroll: function() {
		if (!this.scrollTarget || !this.scrollTarget.dom) {
			return;
		}

		var containerTop = this.scrollTarget.getScrollTop(),
			containerHeight = this.scrollTarget.getHeight(),
			myHeight = this.getHeight(),
			difference = containerHeight - (myHeight + 15);

		if (difference > 0) {
			this.removeCls('stick_bottom');
			this.el.setTop(this.base_top);
			return;
		}

		if (containerTop > Math.abs(difference) + 15) {
			this.addCls('stick_bottom');
		} else {
			this.removeCls('stick_bottom');
			this.el.setTop(this.base_top - containerTop);
		}

	},


	getPrice: function(pricing) {
		pricing = pricing || this.enrollmentOption.pricing;

		var price;

		if (!pricing) {
			price = this.enrollmentOption.Price;
		} else {
			price = pricing.get('PurchasePrice') || pricing.get('Amount');
		}

		return (price || 0).toFixed(2);
	},


	update: function(pricing) {
		var price = this.getPrice(pricing);

		this.priceEl.update('$' + price);
	}
});
