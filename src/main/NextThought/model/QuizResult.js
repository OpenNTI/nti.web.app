Ext.data.Types.QUIZ_RESPONSE_LIST = {
    type: 'QuizResponseList',
    convert: function(v) {
        var u = [];

        Ext.each(v, function(o){
            u.push(ParseUtils.parseItems([o])[0]);
        });

        return u;
    },
    sortType: function(v) {
        console.log('sort by QuizResponseList:',arguments);
        return '';
    }
};

Ext.define('NextThought.model.QuizResult', {
    extend: 'NextThought.model.Base',
    requires: [
    		'NextThought.proxy.Rest',
            'NextThought.model.QuizQuestionResponse'
    		],
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'OID', type: 'string' },
        { name: 'Class', type: 'string' },
        { name: 'QuizID', type: 'string' },
        { name: 'ContainerId', type: 'string' },
        { name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
        { name: 'Creator', type: 'string' },
        { name: 'Items', type: Ext.data.Types.QUIZ_RESPONSE_LIST }
    ],
    proxy: {
        type: 'nti',
        collectionName: 'quizresults',
        model: 'NextThought.model.QuizResult'
    },
    getModelName: function() {
        return 'QuizResult';
    }
});