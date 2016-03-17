export default Ext.define('NextThought.model.preference.Root', {
	extend: 'NextThought.model.preference.Base',

	fields: [
		{name: 'href', type: 'String', persist: false},
		{name: 'ChatPresence', type: 'Future'},
		{name: 'PushNotifications', type: 'Future'},
		{name: 'WebApp', type: 'Future'},
		{name: 'Badges', type: 'Future'},
		{name: 'Gradebook', type: 'Future'}
	],
	//a list of sub preferences to we will get back when we request this from the server
	//so we can know to go ahead and them out.
	subPreferences: ['ChatPresence', 'WebApp', 'PushNotifications', 'Badges']
});
