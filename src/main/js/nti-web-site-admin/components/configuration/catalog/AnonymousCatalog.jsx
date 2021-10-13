
import { Input, Text } from '@nti/web-commons';
import { useChanges, useService } from '@nti/web-core';
import { scoped } from '@nti/lib-locale';

const t = scoped('nti-web-app.admin.config.AnonymousCatalog', {
	label: 'Allow guests to view course catalog',
	description:
		'This feature allows anyone to view the course catalog, even if they haven’t created an account yet.',
});

const Title = styled(Text.Base).attrs({ as: 'h1' })`
	font-size: 22px;
	font-weight: 300;
	line-height: 30px;
	margin: 0.25em 0;
	padding: 0;
`;

const Subtitle = styled(Text.Base).attrs({ as: 'div' })`
	font-size: 14px;
	letter-spacing: 0;
	line-height: 19px;
	color: var(--secondary-grey);
`;

const Tip = styled.div`
	font-size: 12px;
	letter-spacing: 0;
	line-height: 19px;
	color: var(--secondary-grey);
`;

const Header = styled.header`
	margin: 1rem 0;
	max-width: 50ch;
`;

const useCourseCatalog = () => {
	const s = useService();
	const collection = s.getCollection('Courses', 'Catalog');
	return collection.CourseCatalog;
};

export function AnonymousCatalog({ label }) {
	const courseCatalog = useCourseCatalog();
	useChanges(courseCatalog);

	const disabled = !courseCatalog?.canEdit?.();
	const { anonymouslyAccessible } = courseCatalog || {};
	const onChange = disabled
		? null
		: value => courseCatalog.setAnonymousAccess(value);

	return (
		<section>
			<Header>
				<Title>{t('label')}</Title>
				<Subtitle>{t('description')}</Subtitle>
			</Header>
			<Input.Label label={t('label')}>
				<Input.Toggle
					disabled={disabled}
					value={anonymouslyAccessible}
					onChange={onChange}
				/>
			</Input.Label>
			{anonymouslyAccessible && (
				<Tip>{`${global.location.origin}/login/catalog`}</Tip>
			)}
		</section>
	);
}
