import React from 'react';
import classnames from 'classnames/bind';
import { scoped } from '@nti/lib-locale';
import { AssetEditor } from '@nti/web-whiteboard';

import {
	Property,
	Text,
	AssetInput,
	AssetPreview,
	AssetEditorLauncher,
} from '../commons';

import Styles from './Assets.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-web-app.login.sections.Logo', {
	background: {
		title: 'Background',
		description:
			'Opportunity to represent your brand before users enter the site.',
		recommended: {
			title: 'Background',
			size: '1200px Wide by 720px Tall',
		},
	},
	feature: {
		title: 'Overlay',
		optional: 'Optional',
		description: 'Secondary image that overlaps the background.',
		notSetHeader: 'No Overlay Set',
		notSetLabel: 'Add an Overlay',
		recommended: {
			title: 'Overlay',
			size: '600px Wide by 400px Tall',
		},
	},
});

const featureHideFlag = 'login.noFeature';

const backgroundAspectRatio = 5 / 3;

export default function Assets() {
	return (
		<Property className={cx('asset-property')}>
			<Property.Description>
				<div className={cx('asset')}>
					<Text.Title>{t('background.title')}</Text.Title>
					<Text.Description>
						{t('background.description')}
					</Text.Description>
					<AssetEditorLauncher name="login_background">
						<AssetEditor.Image
							format={{
								crop: { aspectRatio: backgroundAspectRatio },
								blur: { radius: 50, minBlur: 0, maxBlur: 50 },
								darken: { color: '#000', opacity: 0.3 },
							}}
						/>
						<AssetEditor.SolidColor
							format={{ aspectRatio: backgroundAspectRatio }}
						/>
						<AssetEditor.LinearGradient
							format={{ aspectRatio: backgroundAspectRatio }}
						/>
					</AssetEditorLauncher>
				</div>
				<div className={cx('asset')}>
					<Text.Title>
						{t('feature.title')}{' '}
						<Text.Badge>{t('feature.optional')}</Text.Badge>
					</Text.Title>
					<Text.Description>
						{t('feature.description')}
					</Text.Description>
					<AssetInput
						name="login_featured_callout"
						notSet={t('feature.notSetLabel')}
						hideFlag={featureHideFlag}
					/>
				</div>
			</Property.Description>
			<Property.Preview>
				<div className={cx('assets-preview')}>
					<AssetPreview
						className={cx('background-preview')}
						name="login_background"
						noBorder
						maxHeight={280}
					/>
					<div className={cx('feature-overlay')}>
						<AssetPreview
							className={cx('featured-preview')}
							name="login_featured_callout"
							notSetHeader={t('feature.notSetHeader')}
							notSetLabel={t('feature.notSetLabel')}
							hideFlag={featureHideFlag}
							noBorder
							maxHeight={200}
						/>
					</div>
					<div className={cx('sizes')}>
						<div className={cx('size')}>
							<Text.Small>
								{t('background.recommended.title')}
							</Text.Small>
							<Text.Small>
								{t('background.recommended.size')}
							</Text.Small>
						</div>
						<div className={cx('size')}>
							<Text.Small>
								{t('feature.recommended.title')}
							</Text.Small>
							<Text.Small>
								{t('feature.recommended.size')}
							</Text.Small>
						</div>
					</div>
				</div>
			</Property.Preview>
		</Property>
	);
}
