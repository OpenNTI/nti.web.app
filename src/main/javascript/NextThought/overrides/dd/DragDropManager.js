Ext.define('NextThought.overrides.dd.DragDropManager', function() {
	var v = Ext.versions.extjs;
	if (v.major !== 4 || v.minor !== 2) {
		console.warn('Base version of ExtJS not expected');
		return {};
	}

	if (v.patch > 1) {
		console.warn('Is this override still needed??');
	}


	return {
		overide: 'Ext.dd.DragDropManager',

		startDrag: function(x, y) {
			var me = this,
					current = me.dragCurrent,
					dragEl;

			clearTimeout(me.clickTimeout);
			if (current) {
				current.b4StartDrag(x, y);
				current.startDrag(x, y);
				dragEl = current.getDragEl();

				//if (dragEl) {
				// svg elements have no css classes -- http://www.sencha.com/forum/showthread.php?261339-lt-SVGAnimatedString-gt-has-no-method-replace
				if (dragEl && dragEl.dom && dragEl.dom.className.replace) {
					Ext.fly(dragEl).addCls(me.dragCls);
				}
			}
			me.dragThreshMet = true;
		}
	};
});
