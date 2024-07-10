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
import { Integration, AuthStrategy } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  apiToken: z
    .string()
    .min(1, { message: 'API Token is required' })
    .describe('The API token for Integration of github in Ocular'),
    orgName: z
    .string()
    .min(1, { message: 'The organisation is required ' }),
    repoName: z
    .string()
    .min(1, { message: 'The repo name is required ' })
    .describe('The repository to index pull requests and issues from'),});


interface Props {
  integration: Integration;
  authorizeApp: (apiToken: string, metadata: any) => Promise<void>;
}

export default function GithubCard({ integration, authorizeApp }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiToken: '',
      orgName: '',
      repoName: '',
    },
  });

  async function formSubmit(values: z.infer<typeof formSchema>) {

    const metadata = {
      organisation: values.orgName,
      repository: values.repoName,
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
                  control={form.control}
                  name="apiToken"
                  render={({ field }) => (
                    <div className="flex flex-col space-y-3">
                      <FormLabel>Github API token</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your integration API token"
                          {...field}
                          className="placeholder-gray-500"
                        />
                      </FormControl>

                      <FormMessage />
                    </div>
                  )}
                />

                   <FormField
                  key="orgName"
                  control={form.control}
                  name="orgName"
                  render={({ field }) => (
                    <div className="flex flex-col space-y-3 pt-6">
                      <FormLabel>Org Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Organisation Name"
                          {...field}
                          className="placeholder-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                   <FormField
                  key="repoName"
                  control={form.control}
                  name="repoName"
                  render={({ field }) => (
                    <div className="flex flex-col space-y-3 pt-6">
                      <FormLabel>Repo Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Repository Name"
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
                Add {integration.name} for Ocular
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
