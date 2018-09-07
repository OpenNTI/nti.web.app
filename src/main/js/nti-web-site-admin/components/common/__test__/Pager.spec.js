/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import Pager from '../Pager';

describe('Site admin table pager test', () => {
	test('Test no pages', () => {
		const pagerCmp = renderer.create(<Pager loadPage={()=>{}} numPages={0} />);

		const tree = pagerCmp.toJSON();

		// 0 pages should result in nothing being rendered
		expect(tree).toMatchSnapshot();
	});

	test('Test 1 page', () => {
		const pagerCmp = renderer.create(<Pager loadPage={()=>{}} numPages={1} pageNumber={1} />);

		const tree = pagerCmp.toJSON();

		// 1 page should also result in nothing being rendered since there is only one page option
		expect(tree).toMatchSnapshot();
	});

	test('Test 2 pages', () => {
		const pagerCmp = renderer.create(<Pager loadPage={()=>{}} numPages={2} pageNumber={1} />);

		const tree = pagerCmp.toJSON();

		expect(tree).toMatchSnapshot();
	});

	test('Test 10 pages, pageNumber=1', () => {
		const pagerCmp = renderer.create(<Pager loadPage={()=>{}} numPages={10} pageNumber={1} />);

		const tree = pagerCmp.toJSON();

		// will show the first pages available
		expect(tree).toMatchSnapshot();
	});

	test('Test 10 pages, pageNumber=5', () => {
		const pagerCmp = renderer.create(<Pager loadPage={()=>{}} numPages={10} pageNumber={5} />);

		const tree = pagerCmp.toJSON();

		// will show several pages back and several pages forward
		expect(tree).toMatchSnapshot();
	});
});
