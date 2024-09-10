import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'nx run ng-web:serve:development',
        production: 'nx run ng-web:serve:production',
      },
      ciWebServerCommand: 'nx run ng-web:serve-static',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
