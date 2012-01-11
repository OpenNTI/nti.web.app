Ext.define('NextThought.view.widgets.chat.OnDeck', {
	extend:'Ext.panel.Panel',
	alias: 'widget.on-deck-view',
	requires: [
	],

	cls: 'on-deck-view',
	border: true,
	defaults: {border: false},
	title: 'On Deck',

	items: [
		{html: 'this is the next thing in the script...  click me or something?'}
	],

	advanceNext: function() {
		this.fireEvent('advance-next', this.items.first());
		this.remove(this.items.first());

		this.add({html: 'another script piece - ' + new Date()});
	}
});
