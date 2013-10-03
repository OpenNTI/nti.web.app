Ext.define('NextThought.view.menus.search.More', {
  extend: 'Ext.Component',
  alias: 'widget.search-more',
  cls: 'search-more search-result',
  renderTpl: [
    '<div class="see-all"><a href="#">Show more...</a></div>'
  ],

  initComponent: function() {
    this.callParent(arguments);
    this.enableBubble(['more-clicked']);
  },

  afterRender: function() {
    this.callParent(arguments);
    this.getEl().on({
      scope: this,
      animationend: this.animationEnd,
      webkitAnimationEnd: this.animationEnd,
      click: this.clicked
    });
  },


  animationEnd: function() {
    this.getEl().removeCls('pulse');
  },

  clicked: function() {
    this.getEl().addCls('pulse');
    this.fireEvent('more-clicked', this);
  }

});
