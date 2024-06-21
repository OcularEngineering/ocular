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
  apiToken: z
    .string()
    .min(1, { message: 'API Token is required' })
    .describe('The API token for Integration of APP in Ocular'),
  username: z
    .string()
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Username is required' })
    .describe('The username for Integration of APP in Ocular'),
  domain: z
    .string()
    .min(1, { message: 'Domain Name is required' })
    .describe('The domain anme for Jira cloud Integration'),
});

interface Props {
  integration: Integration;
  authorizeApp: (apiToken: string, metadata: any) => Promise<void>;
}

export default function JiraCard({ integration, authorizeApp }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiToken: '',
      username: '',
      domain: '',
    },
  });

  async function formSubmit(values: z.infer<typeof formSchema>) {
    const metadata = {
      username: values.username,
      domain: values.domain,
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
                  key="username"
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <div className="flex flex-col space-y-3">
                      <FormLabel>Username of Jira Cloud</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="user@ocular.com"
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
                          placeholder="Enter API token for Jira Cloud "
                          {...field}
                          className="placeholder-gray-500"
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  key="domain"
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <div className="flex flex-col space-y-3 pt-6">
                      <FormLabel>Domain Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your-domain.atlassian.net"
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
