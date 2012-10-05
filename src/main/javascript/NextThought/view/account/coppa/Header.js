Ext.define('NextThought.view.account.coppa.Header',{
    extend: 'Ext.Component',
    alias: 'widget.coppa-header-view',
    requires: [
    ],

    renderTpl: Ext.DomHelper.markup([
    {
        cls: 'coppa-header-view',
        cn:[
            {cls: 'avatar', tag:'span', cn:[
                {tag: 'img', src: '{img}'}
            ]},
            {cls: 'text', cn:[
                {cls: 'title', html:'{title}'},
                {cls: 'detail', html:'{detail}'}
            ]}
        ]
    }]),


    renderSelectors: {
        img: '.coppa-header-view .avatar img',
        title: '.text .title',
        detail: '.text .detail'
    },

    initComponent: function(){
        this.callParent(arguments);

        var iconURL;
         /*
        if (this.icon === 'alert'){
            iconURL = Ext.BLANK_IMAGE_URL;
        }
        */
        this.renderData = Ext.apply(this.renderData||{},{
            img: iconURL || $AppConfig.userObject.get('avatarURL'),
            title: this.title || 'Congratulations!',
            detail: this.detail || 'We received consent for you to use social features on our site. Please provide the following information to update your account.'
        });
    },


    afterRender: function(){
        this.callParent(arguments);
        /*
        if (this.icon === 'alert') {
            this.el.down('.avatar').addCls('alert');
            this.el.down('.avatar img').remove();
        }
        */
    }

});