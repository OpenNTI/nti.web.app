/* eslint-env jest */
import { create, act } from 'react-test-renderer';

import Pager from '../Pager';

describe('Site admin table pager test', () => {
	test('Test no pages', () => {
		let pagerCmp;
		act(() => {
			pagerCmp = create(<Pager loadPage={() => {}} numPages={0} />);
		});

		const tree = pagerCmp.toJSON();

		// 0 pages should result in nothing being rendered
		expect(tree).toMatchSnapshot();
		pagerCmp.unmount();
	});

	test('Test 1 page', () => {
		let pagerCmp;
		act(() => {
			pagerCmp = create(
				<Pager loadPage={() => {}} numPages={1} pageNumber={1} />
			);
		});

		const tree = pagerCmp.toJSON();

		// 1 page should also result in nothing being rendered since there is only one page option
		expect(tree).toMatchSnapshot();
		pagerCmp.unmount();
	});

	test('Test 2 pages', () => {
		let pagerCmp;
		act(() => {
			pagerCmp = create(
				<Pager loadPage={() => {}} numPages={2} pageNumber={1} />
			);
		});

		const tree = pagerCmp.toJSON();

		expect(tree).toMatchSnapshot();
		pagerCmp.unmount();
	});

	test('Test 10 pages, pageNumber=1', () => {
		let pagerCmp;
		act(() => {
			pagerCmp = create(
				<Pager loadPage={() => {}} numPages={10} pageNumber={1} />
			);
		});

		const tree = pagerCmp.toJSON();

		// will show the first pages available
		expect(tree).toMatchSnapshot();
		pagerCmp.unmount();
	});

	test('Test 10 pages, pageNumber=5', () => {
		let pagerCmp;
		act(() => {
			pagerCmp = create(
				<Pager loadPage={() => {}} numPages={10} pageNumber={5} />
			);
		});

		const tree = pagerCmp.toJSON();

		// will show several pages back and several pages forward
		expect(tree).toMatchSnapshot();
		pagerCmp.unmount();
	});
});
