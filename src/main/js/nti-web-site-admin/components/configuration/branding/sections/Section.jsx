import React from 'react';
import PropTypes from 'prop-types';
import { Text } from '@nti/web-commons';
import classnames from 'classnames/bind';

import style from './Section.css';

const cx = classnames.bind(style);

export default function Section({ text, className, children, ...props }) {
	const t =
		typeof text === 'function'
			? k => (text.isMissing(k) ? null : text(k))
			: k => props[k];

	const title = t('title');
	const description = t('description');

	return (
		<section className={cx('section-root', className)}>
			<header>
				{title && (
					<Text.Base className={cx('title')} as="h1">
						{title}
					</Text.Base>
				)}
				{description && (
					<Text.Base className={cx('description')}>
						{description}
					</Text.Base>
				)}
			</header>
			{children}
		</section>
	);
}

Section.propTypes = {
	title: PropTypes.string,
	description: PropTypes.string,
	text: PropTypes.func,
};
