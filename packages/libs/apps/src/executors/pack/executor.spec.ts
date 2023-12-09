import { PackExecutorSchema } from './schema';
import executor from './executor';

const options: PackExecutorSchema = {};

describe('Pack Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
