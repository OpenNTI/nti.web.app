//A version of card layout that extends auto instead of fit
//take from http://docs.sencha.com/extjs/4.2.1/source/Card.html#Ext-layout-container-Card
Ext.define('NextThought.layout.container.AutoCard', {

	extend: 'Ext.layout.container.Container',

	alias: 'layout.auto-card',

	type: 'auto-card',

	hideInactive: true,

	deferredRender: false,

	calculate: Ext.emptyFn,


	getRenderTree: function() {
		var me = this,
			activeItem = me.getActiveItem();

		if (activeItem) {

			// If they veto the activate, we have no active item
			if (activeItem.hasListeners.beforeactivate && activeItem.fireEvent('beforeactivate', activeItem) === false) {

				// We must null our activeItem reference, AND the one in our owning Container.
				// Because upon layout invalidation, renderChildren will use this.getActiveItem which
				// uses this.activeItem || this.owner.activeItem
				activeItem = me.activeItem = me.owner.activeItem = null;
			}

			// Item is to be the active one. Fire event after it is first layed out
			else if (activeItem.hasListeners.activate) {
				activeItem.on({
					boxready: function() {
						activeItem.fireEvent('activate', activeItem);
					},
					single: true
				});
			}

			if (me.deferredRender) {
				if (activeItem) {
					return me.getItemsRenderTree([activeItem]);
				}
			} else {
				return me.callParent(arguments);
			}
		}
	},


	renderChildren: function() {
		var me = this,
			active = me.getActiveItem();

		if (!me.deferredRender) {
			me.callParent();
		} else if (active) {
			// ensure the active item is configured for the layout
			me.renderItems([active], me.getRenderTarget());
		}
	},


	isValidParent: function(item, target, position) {
		// Note: Card layout does not care about order within the target because only one is ever visible.
		// We only care whether the item is a direct child of the target.
		var itemEl = item.el ? item.el.dom : Ext.getDom(item);
		return (itemEl && itemEl.parentNode === (target.dom || target)) || false;
	},


	getActiveItem: function() {
		var me = this,
			// Ensure the calculated result references a Component
			result = me.parseActiveItem(me.activeItem || (me.owner && me.owner.activeItem));

		// Sanitize the result in case the active item is no longer there.
		if (result && me.owner.items.indexOf(result) != -1) {
			me.activeItem = result;
		} else {
			me.activeItem = null;
		}

		return me.activeItem;
	},


	// @private
	parseActiveItem: function(item) {
		if (item && item.isComponent) {
			return item;
		} else if (typeof item == 'number' || item === undefined) {
			return this.getLayoutItems()[item || 0];
		} else {
			return this.owner.getComponent(item);
		}
	},

	// @private. Called before both dynamic render, and bulk render.
	// Ensure that the active item starts visible, and inactive ones start invisible
	configureItem: function(item) {
		if (item === this.getActiveItem()) {
			item.hidden = false;
		} else {
			item.hidden = true;
		}
		this.callParent(arguments);
	},

	onRemove: function(component) {
		var me = this;

		if (component === me.activeItem) {
			me.activeItem = null;
		}
	},

	// @private
	getAnimation: function(newCard, owner) {
		var newAnim = (newCard || {}).cardSwitchAnimation;
		if (newAnim === false) {
			return false;
		}
		return newAnim || owner.cardSwitchAnimation;
	},


	getNext: function() {
		var wrap = arguments[0],
			items = this.getLayoutItems(),
			index = Ext.Array.indexOf(items, this.activeItem);

		return items[index + 1] || (wrap ? items[0] : false);
	},

	/**
	 * Sets the active (visible) component in the layout to the next card
	 * @return {Ext.Component} the activated component or false when nothing activated.
	 */
	next: function() {
		var anim = arguments[0],
			wrap = arguments[1];
		return this.setActiveItem(this.getNext(wrap), anim);
	},

	/**
	 * Return the active (visible) component in the layout to the previous card
	 * @return {Ext.Component} The previous component or false.
	 */
	getPrev: function() {
		var wrap = arguments[0],
			items = this.getLayoutItems(),
			index = Ext.Array.indexOf(items, this.activeItem);

		return items[index - 1] || (wrap ? items[items.length - 1] : false);
	},

	/**
	 * Sets the active (visible) component in the layout to the previous card
	 * @return {Ext.Component} the activated component or false when nothing activated.
	 */
	prev: function() {
		var anim = arguments[0],
			wrap = arguments[1];
		return this.setActiveItem(this.getPrev(wrap), anim);
	},

	/**
	 * Makes the given card active.
	 *
	 *     var card1 = Ext.create('Ext.panel.Panel', {itemId: 'card-1'});
	 *     var card2 = Ext.create('Ext.panel.Panel', {itemId: 'card-2'});
	 *     var panel = Ext.create('Ext.panel.Panel', {
	 *         layout: 'card',
	 *         activeItem: 0,
	 *         items: [card1, card2]
	 *     });
	 *     // These are all equivalent
	 *     panel.getLayout().setActiveItem(card2);
	 *     panel.getLayout().setActiveItem('card-2');
	 *     panel.getLayout().setActiveItem(1);
	 *
	 * @param {Ext.Component/Number/String} newCard  The component, component {@link Ext.Component#id id},
	 * {@link Ext.Component#itemId itemId}, or index of component.
	 * @return {Ext.Component} the activated component or false when nothing activated.
	 * False is returned also when trying to activate an already active card.
	 */
	setActiveItem: function(newCard) {
		var me = this,
			owner = me.owner,
			oldCard = me.activeItem,
			rendered = owner.rendered,
			newIndex;

		newCard = me.parseActiveItem(newCard);
		newIndex = owner.items.indexOf(newCard);

		// If the card is not a child of the owner, then add it.
		// Without doing a layout!
		if (newIndex == -1) {
			newIndex = owner.items.items.length;
			Ext.suspendLayouts();
			newCard = owner.add(newCard);
			Ext.resumeLayouts();
		}

		// Is this a valid, different card?
		if (newCard && oldCard != newCard) {
			// Fire the beforeactivate and beforedeactivate events on the cards
			if (newCard.fireEvent('beforeactivate', newCard, oldCard) === false) {
				return false;
			}
			if (oldCard && oldCard.fireEvent('beforedeactivate', oldCard, newCard) === false) {
				return false;
			}

			if (rendered) {
				Ext.suspendLayouts();

				// If the card has not been rendered yet, now is the time to do so.
				if (!newCard.rendered) {
					me.renderItem(newCard, me.getRenderTarget(), owner.items.length);
				}

				if (oldCard) {
					if (me.hideInactive) {
						oldCard.hide();
						oldCard.hiddenByLayout = true;
					}
					oldCard.fireEvent('deactivate', oldCard, newCard);
				}
				// Make sure the new card is shown
				if (newCard.hidden) {
					newCard.show();
				}

				// Layout needs activeItem to be correct, so set it if the show has not been vetoed
				if (!newCard.hidden) {
					me.activeItem = newCard;
				}
				Ext.resumeLayouts(true);
			} else {
				me.activeItem = newCard;
			}

			newCard.fireEvent('activate', newCard, oldCard);

			return me.activeItem;
		}
		return false;
	}
});
