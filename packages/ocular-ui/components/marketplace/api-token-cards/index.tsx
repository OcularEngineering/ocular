import JiraCard from './jira-card';
import NotionCard from './notion-card';
import { AppNameDefinitions } from '@/types/types';
import { Integration } from '@/types/types';

interface Props {
  integration: Integration;
  authorizeApp: (apiToken: string) => Promise<void>;
}

const ComponentMap: { [key: string]: (props: Props) => JSX.Element } = {
  [AppNameDefinitions.NOTION]: (props: Props) => <NotionCard {...props} />,
  [AppNameDefinitions.JIRA]: (props: Props) => <JiraCard {...props} />,
};

export default function ApiTokenCard({ integration, authorizeApp }: Props) {
  const Component = ComponentMap[integration.slug];
  return <Component integration={integration} authorizeApp={authorizeApp} />;
}
