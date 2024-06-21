import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
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
});

interface Props {
  integration: Integration;
  authorizeApp: (apiToken: string) => Promise<void>;
}

export default function GithubCard({ integration, authorizeApp }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiToken: '',
    },
  });

  async function formSubmit(values: z.infer<typeof formSchema>) {
    await authorizeApp(values.apiToken);
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
