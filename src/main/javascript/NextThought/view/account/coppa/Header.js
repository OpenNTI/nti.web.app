Ext.define('NextThought.view.coppa.Header',{
    extend: 'Ext.Component',
    alias: 'widget.coppa-header-view',
    requires: [
    ],

    renderTpl: Ext.DomHelper.markup([
    {
        cls: 'coppa-header-view',
        cn:[
            {cls: 'avatar', cn:[
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

        this.renderData = Ext.apply(this.renderData||{},{
            img: $AppConfig.userObject.get('avatarURL'),
            title: 'Congratulations!',
            detail: 'We received concent for you to use social features on our site. Please provide the following information to update your account.'
        });
    }

});