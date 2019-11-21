import React from 'react';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Theme} from '@nti/web-commons';

import {Property, Text, AssetInput, AssetPreview} from '../commons';

import Styles from './Assets.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-web-app.login.sections.Logo', {
	background: {
		title: 'Background',
		description: 'Opportunity to represent your brand before users enter the site.',
		recommended: {
			title: 'Background',
			size: '1200 x 720px'
		}
	},
	feature: {
		title: 'Overlay',
		optional: 'Optional',
		description: 'Secondary image that overlaps the background.',
		notSet: 'Add an Overlay',
		recommended: {
			title: 'Overlay',
			size: '600 x 400px'
		}
	}
});

export default function Assets () {
	const background = Theme.useThemeProperty('assets.login_background');
	const feature = Theme.useThemeProperty('assets.login_featured_callout');

	return (
		<Property>
			<Property.Description>
				<div className={cx('asset')}>
					<Text.Title>{t('background.title')}</Text.Title>
					<Text.Description>{t('background.description')}</Text.Description>
					<AssetInput asset={background} name="login_background" />
				</div>
				<div className={cx('asset')}>
					<Text.Title>{t('feature.title')} <Text.Badge>{t('feature.optional')}</Text.Badge></Text.Title>
					<Text.Description>{t('feature.description')}</Text.Description>
					<AssetInput asset={feature} name="login_featured_callout" notSet={t('feature.notSet')}/>
				</div>
			</Property.Description>
			<Property.Preview>
				<div className={cx('assets-preview')}>
					<AssetPreview className={cx('background-preview')} property={background} noBorder maxHeight={280} />
					<div className={cx('feature-overlay')}>
						<AssetPreview className={cx('featured-preview')} property={feature} noBorder maxHeight={200} />
					</div>
					<div className={cx('sizes')}>
						<div className={cx('size')}>
							<Text.Small>{t('background.recommended.title')}</Text.Small>
							<Text.Small>{t('background.recommended.size')}</Text.Small>
						</div>
						<div className={cx('size')}>
							<Text.Small>{t('feature.recommended.title')}</Text.Small>
							<Text.Small>{t('feature.recommended.size')}</Text.Small>
						</div>
					</div>
				</div>
			</Property.Preview>
		</Property>
	);
} 