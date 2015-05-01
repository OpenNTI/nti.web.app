/**
* Use this mixin to truncate text and add ellipsis depending on its parent node or itself
*/
Ext.define('NextThought.mixins.EllipsisText', {

	truncateText: function(node, measure) {
		var box = node,
			textProperty = node.textContent !== null ? 'textContent' : 'innerText';

		if (measure === 'parent') {
			box = node.parentNode;
		}

		// NOTE: because of line-height, in different browsers, we might have a slight difference
		// between the box's scrollHeight and its offsetHeight. And since no line should be 5px tall, check against 5.
		while (box.scrollHeight - (box.clientHeight || box.offsetHeight) >= 5) {
			if (node[textProperty] === '...') {
				break;
			}

			node[textProperty] = node[textProperty].replace(/.(\.+)?$/, '...');
		}
	}

});