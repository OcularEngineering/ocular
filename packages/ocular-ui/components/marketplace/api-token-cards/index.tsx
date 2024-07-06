import AsanaCard from './asana-card';
import BitBucketCard from './bitbucket-card';
import ConfluenceCard from './confluence-card';
import GithubCard from './github-card';
import JiraCard from './jira-card';
import NotionCard from './notion-card';
import SlackCard from './slack-card';
import { AppNameDefinitions } from '@/types/types';
import { Integration } from '@/types/types';

interface Props {
  integration: Integration;
  authorizeApp: (apiToken: string) => Promise<void>;
}

const ComponentMap: { [key: string]: (props: Props) => JSX.Element } = {
  [AppNameDefinitions.NOTION]: (props: Props) => <NotionCard {...props} />,
  [AppNameDefinitions.JIRA]: (props: Props) => <JiraCard {...props} />,
  [AppNameDefinitions.GITHUB]: (props: Props) => <GithubCard {...props} />,
  [AppNameDefinitions.SLACK]: (props: Props) => <SlackCard {...props} />,
  [AppNameDefinitions.ASANA]: (props: Props) => <AsanaCard {...props} />,
  [AppNameDefinitions.BITBUCKET]: (props: Props) => <BitBucketCard {...props} />,
  [AppNameDefinitions.CONFLUENCE]: (props: Props) => (
    <ConfluenceCard {...props} />
  ),
};

export default function ApiTokenCard({ integration, authorizeApp }: Props) {
  const Component = ComponentMap[integration.slug];
  return <Component integration={integration} authorizeApp={authorizeApp} />;
}
