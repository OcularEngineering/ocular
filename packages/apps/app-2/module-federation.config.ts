import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'app-2',

  exposes: {
    './Module': './src/remote-entry.ts',
  },
};

export default config;
