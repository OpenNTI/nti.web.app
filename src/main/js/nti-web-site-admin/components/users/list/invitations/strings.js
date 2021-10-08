import { scoped } from '@nti/lib-locale';
export default scoped('nti-web-site-admin.components.users.list.InvitePeople', {
	people: 'People',
	title: 'Invite People',
	importFile: 'Upload CSV File',
	role: 'Role',
	button: 'Invite People',
	invalidEmails: {
		message: {
			one: 'There is an invalid email: ',
			other: 'There are invalid emails: ',
		},
	},

	instructions: 'Bulk invite people with a comma or tab separated csv file.',
	downloadSample: 'Download Sample CSV',
	details: 'Details',
	fieldsHeading: 'Columns',
	fieldDescriptions: {
		email: 'an email address of people you wish to invite.',
		'…': '…all other columns are ignored',
	},
	required: '',
});
