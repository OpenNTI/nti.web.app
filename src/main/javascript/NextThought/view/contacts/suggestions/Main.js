Ext.define('NextThought.view.contacts.suggestions.Main',{
    extend: 'Ext.view.View',
    alias: "widget.suggest-contacts-view",

    cls: 'suggest-contacts',
    overItemCls: 'over',
    itemSelector: '.contact-card',

    tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
        {
            cls: 'contact-card',
            cn: [
                {
                    cls: 'avatar', style: {backgroundImage: 'url({avatarURL});'}
                },
                {
                    cls: 'meta',
                    cn: [
                        { cls: 'name', html: '{displayName}', 'data-field': 'name'},
                        { tag: 'tpl', 'if': '!hideProfile && email', cn: [
                            { cls: 'email', html: '{email}', 'data-field': 'email' }
                        ]},

                        { tag: 'tpl', 'if': '!hideProfile && (role || affiliation)', cn: [
                            { cls: 'composite-line', cn: [
                                { tag: 'tpl', 'if': 'role', cn: [
                                    { tag: 'span', html: '{role}', 'data-field': 'role'}
                                ]},
                                { tag: 'tpl', 'if': 'role && affiliation', cn: [
                                    {tag: 'span', cls: 'separator', html: ' {{{NextThought.view.contacts.Card.at}}} '}
                                ]},
                                { tag: 'tpl', 'if': 'affiliation', cn: [
                                    { tag: 'span', html: '{affiliation}', 'data-field': 'affiliation' }
                                ]
                                }
                            ]
                            }
                        ]
                        },
                        { tag: 'tpl', 'if': '!hideProfile && location', cn: [
                            { cls: 'location', html: '{location}', 'data-field': 'location' }
                        ]}
                    ]
                },
                {
                    cls: 'add-to-contacts', html: '{{{NextThought.view.contacts.Card.add}}}'
                }
            ]
        }
    ]}),


    hideProfile: false,


    beforeRender: function(){
        this.callParent(arguments);
    },


    initComponent: function(){
        this.callParent(arguments);

        this.buildStore();
    },


    buildStore: function(){
         Promise.all(this.loadSuggestedContacts())
                .then(this.__fillIn.bind(this));
    },


    loadSuggestedContacts: function(){
        var courses = Ext.getStore('courseware.EnrolledCourses'),
            links = [], course, toLoad = [], p;

        courses.each(function(entry){
            course = entry.get('CourseInstance');
            if(course && course.hasLink('Classmates')){
                links.push(course.getLink('Classmates'));
            }
        });

        Ext.each(links, function(link){
            p = new Promise(function(fulfill, reject){
                Service.request({
                        url: link,
                        method: 'GET'
                    })
                    .fail(function(){
                        console.error('Failed to retrieve classmates');
                        reject('Request Failed');
                    })
                    .done(function(responseText){
                        var o = Ext.JSON.decode(responseText, true),
                            items = o && o.Items;

                        fulfill(items);
                    });
            });

            toLoad.push(p);
        });

        return toLoad;
    },


    __fillIn: function(courseClassmates){
        var peersObj = {}, peers = [];

        Ext.each(courseClassmates, function(m){
            for(var k in m){
                // A dict will eliminate duplicate.
                if(m.hasOwnProperty(k)){
                    peersObj[k] = m[k];
                }
            }
        });

        for(var o in peersObj){
            if(peersObj.hasOwnProperty(o)){
                peers.push(peersObj[o]);
            }
        }

        this.store = new Ext.data.Store({
            model: NextThought.model.User,
            proxy: 'memory',
            data: peers
        });

        this.bindStore(this.store);
    }



});