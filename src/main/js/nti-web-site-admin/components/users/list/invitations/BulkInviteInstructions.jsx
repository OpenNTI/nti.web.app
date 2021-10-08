import { List } from '@nti/web-commons';
import { rawContent } from '@nti/lib-commons';
import { Typography } from '@nti/web-core';

import SAMPLE from './assets/sample.csv?for-download';
import t from './strings';

//#region paint
const Container = styled(Typography).attrs({ as: 'div' })`
	font-size: 0.875rem;
	background: var(--panel-background);
	border-radius: 5px;
	padding: 8px;
	margin: 5px 0 10px;
	box-shadow: 0 0 3px -1px black;
	transform: translate3d(0, 0, 0);
	position: relative;

	&::after {
		content: '';
		top: -5px;
		right: 15%;
		background: var(--panel-background);
		position: absolute;
		width: 10px;
		height: 10px;
		box-shadow: 1px 0 3px -1px black;
		transform: rotate(45deg);
		clip-path: polygon(-3px -3px, 0 100%, 100% 0);
	}
`;

const Instructions = styled.div`
	margin-bottom: 5px;
`;

const Link = styled.a`
	font-size: 0.875rem;
	text-decoration: none;
	color: var(--primary-blue);
	margin-bottom: 1rem;
`;

const Heading = styled.h3`
	color: var(--tertiary-grey);
	text-transform: uppercase;
	font-size: 0.625rem;
	font-weight: bold;
	margin: 0.625rem 0 0.5rem;
`;

const FieldList = styled(List.Unadorned)`
	line-height: 1.5;
`;

const Field = styled.li`
	display: flex;
`;

const FieldName = styled.span`
	flex: 0 0 150px;
	padding-right: 0.5em;
`;

const FieldDescription = styled.span`
	flex: 1 1 auto;
`;
//#endregion

export function BulkInviteInstructions(props) {
	return (
		<Container {...props}>
			<Instructions>{t('instructions')}</Instructions>
			<Link
				className="download-sample"
				href={SAMPLE}
				download="sample.csv"
			>
				{t('downloadSample')}
			</Link>

			<details>
				<summary>{t('details')}</summary>
				<Heading>{t('fieldsHeading')}</Heading>
				<FieldList>
					{Object.keys(t('fieldDescriptions')).map(field => (
						<Field key={field}>
							<FieldName>{field}</FieldName>
							<FieldDescription
								{...rawContent(t(['fieldDescriptions', field]))}
							/>
						</Field>
					))}
				</FieldList>
			</details>
		</Container>
	);
}
