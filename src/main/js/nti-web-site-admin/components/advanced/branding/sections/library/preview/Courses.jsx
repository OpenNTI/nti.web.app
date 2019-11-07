import React from 'react';
import {Presentation, Text} from '@nti/web-commons';
import classnames from 'classnames/bind';

import Collection from './Collection';
import styles from './Courses.css';

const cx = classnames.bind(styles);

const courses = [
	{
		title: 'Town Square',
	},
	{
		title: 'Town Square',
	},
	{
		title: 'Town Square',
	},
];

export default function Courses () {
	return (
		<Collection title="Courses">
			<ul className={cx('items')}>
				{courses.map(item => (
					<li key={item.title}>
						<div className={cx('course-item')}>
							<Presentation.Asset item={item} propName="src" type="landing">
								<img src=""/>
							</Presentation.Asset>		
							<Text.Condensed>
								<span className={cx('item-title')}>{item.title}</span>
							</Text.Condensed>
						</div>
					</li>
				))}
			</ul>
		</Collection>
	);
}
