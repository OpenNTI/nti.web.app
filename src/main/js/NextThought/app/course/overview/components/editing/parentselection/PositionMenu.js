Ext.define('NextThought.app.course.overview.components.editing.parentselection.PositionMenu', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-parentselection-position-menu',

	cls: 'overview-editing-parentselection-position-menu',

	autoEl: 'ul',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'li', 'data-index': '{index}', html: '{display}'
	})),

	afterRender: function() {
		this.callParent(arguments);

		if (this.totalPositions !== undefined) {
			this.setTotalPositions(this.totalPositions);
		}

		if (this.selectedPosition) {
			this.selectPosition(position);
		}

		this.mon(this.el, 'click', this.onClick.bind(this));
	},


	onClick: function(e) {
		var item = e.getTarget('li'),
			index = item && item.getAttribute('data-index');

		if (index !== undefined && this.doSelectPosition) {
			this.doSelectPosition(parseInt(index, 10));
		}
	},


	getItem: function(index) {
		if (!this.rendered) { return; }

		return this.el.dom.querySelector('[data-index="' + index + '"]');
	},


	setTotalPositions: function(total, currentIndex) {
		this.totalPositions = total;

		if (!this.rendered) {
			return;
		}

		var i;

		if (currentIndex === undefined || currentIndex < 0) {
			total += 1;
		}

		this.el.dom.innerHTML = '';

		for (i = 0; i < total; i++) {
			this.itemTpl.append(this.el, {
				index: i,
				display: i + 1
			});
		}

		if (currentIndex !== undefined) {
			this.setCurrentPosition(currentIndex);
		}
	},


	setCurrentPosition: function(index) {
		var item = this.getItem(index);

		if (item) {
			item.classList.add('current');
		}
	},


	selectPosition: function(position) {
		if (position === undefined || position < 0) {
			position = this.totalPositions;
		}

		if (!this.rendered) {
			this.selectedPosition = position;
			return 0;
		}

		var item = this.getItem(position),
			currentSelection = this.el.dom.querySelector('li.selected');

		if (item) {
			item.classList.add('selected');

			if (currentSelection) {
				currentSelection.classList.remove('selected');
			}
		}

		this.close();

		return item ? item.textContent : currentSelection ? currentSelection.textContent : '-1';
	},


	getCurrentPosition: function() {
		var item = this.el.dom.querySelector('li.selected'),
			index = item && item.getAttribute('data-index');

		if (!index) {
			index = this.totalPositions;
		} else {
			index = parseInt(index, 10);
		}

		return index;
	}
});
