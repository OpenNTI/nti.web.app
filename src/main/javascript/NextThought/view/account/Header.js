Ext.define('NextThought.view.account.Header',{
    extend: 'Ext.Component',
    alias: 'widget.account-header-view',
    requires: [
    ],

    renderTpl: Ext.DomHelper.markup([
    {
        cls: 'account-header-view',
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
        img: '.account-header-view .avatar img',
        title: '.text .title',
        detail: '.text .detail'
    },

	updateRenderData: function(){
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

    initComponent: function(){
        this.callParent(arguments);

		this.updateRenderData();
    },

	updateHeaderText: function(t, d){
		this.title.dom.innerHTML=t;
		this.detail.dom.innerHTML=d;
	},

	updateTitle: function(t){
		this.title.dom.innerHTML = t;
	},

    afterRender: function(){
        this.callParent(arguments);

        if(this.noIcon) {
            this.el.down('.avatar').remove();
            this.el.down('.text').addCls('full-width');
            this.updateLayout();
        }

        /*
        if (this.icon === 'alert') {
            this.el.down('.avatar').addCls('alert');
            this.el.down('.avatar img').remove();
        }
        */
    }

});
