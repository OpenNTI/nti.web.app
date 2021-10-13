/* eslint-env jest */
import renderer, { act } from 'react-test-renderer';

import InviteName from '../InviteName';

describe('Site admin user table invite name column test', () => {
	test('Test admin invitation', () => {
		let colCmp;
		act(() => {
			colCmp = renderer.create(
				<InviteName
					item={{
						receiver: 'adminUser1',
						MimeType:
							'application/vnd.nextthought.siteadmininvitation',
					}}
				/>
			);
		});

		const tree = colCmp.toJSON();

		// should show "adminUser1" and "Administrator"
		expect(tree).toMatchSnapshot();
		colCmp.unmount();
	});

	test('Test learner invitation', () => {
		let colCmp;
		act(() => {
			colCmp = renderer.create(
				<InviteName
					item={{
						receiver: 'learnerUser1',
						MimeType: 'application/vnd.nextthought.siteinvitation',
					}}
				/>
			);
		});

		const tree = colCmp.toJSON();

		// should show "learnerUser1" and "Learner"
		expect(tree).toMatchSnapshot();
		colCmp.unmount();
	});
});
