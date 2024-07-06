import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Integration } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  workspace: z
    .string()
    .min(1, { message: 'Workspace name is required' })
    .describe('The workspace name for Integration of bitbucket in Ocula'),
  apiToken: z
    .string()
    .min(1, { message: 'API Token is required' })
    .describe('The API token for Integration of APP in Ocular'),
  repository: z
    .string()
    .min(1, { message: 'Repository name is required' })
    .describe('The repository name for Integration of bitbucket in Ocula'),
});

interface Props {
  integration: Integration;
  authorizeApp: (apiToken: string, metadata: any) => Promise<void>;
}

export default function BitBucketCard({ integration, authorizeApp }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspace: '',
      repository: '',
      apiToken: ''
    },
  });

  async function formSubmit(values: z.infer<typeof formSchema>) {
    const metadata = {
      workspace: values.workspace,
      repository: values.repository,
    };
    await authorizeApp(values.apiToken, metadata);
  }

  return (
    <div className="flex justify-center items-center w-full h-full m-2 flex-1">
      <Card className="w-full max-w-3xl min-w-2xl p-4 border-0">
        <CardContent>
        <Form {...form}>
            <form
              onSubmit={form.handleSubmit(formSubmit)}
              className="flex flex-col items-center space-y-8"
            >
              <div className="w-full">
                <FormField
                  key="workspace"
                  control={form.control}
                  name="workspace"
                  render={({ field }) => (
                    <div className="flex flex-col space-y-3">
                      <FormLabel>Workspace name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Workspace name for Bitbucket"
                          {...field}
                          className="placeholder-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  key="repository"
                  control={form.control}
                  name="repository"
                  render={({ field }) => (
                    <div className="flex flex-col space-y-3 pt-6">
                      <FormLabel>Repository name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Repository name for Bitbucket"
                          {...field}
                          className="placeholder-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  key="apiToken"
                  control={form.control}
                  name="apiToken"
                  render={({ field }) => (
                    <div className="flex flex-col space-y-3 pt-6">
                      <FormLabel>API Token</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter API token for Bitbucket"
                          {...field}
                          className="placeholder-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
              </div>
              <Button type="submit" className="w-full mt-4">
                Add{' '}
                {integration.name.charAt(0).toUpperCase() +
                  integration.name.slice(1)}{' '}
                for Ocular
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
