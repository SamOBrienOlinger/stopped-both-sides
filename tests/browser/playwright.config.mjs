import {defineConfig} from '@playwright/test';
import {fileURLToPath} from 'node:url';

const liveURL=process.env.TEST_BASE_URL;
const repositoryRoot=fileURLToPath(new URL('../../',import.meta.url));
export default defineConfig({
 testDir:'.',testMatch:'*.spec.mjs',timeout:60000,expect:{timeout:10000},
 fullyParallel:false,workers:1,retries:0,forbidOnly:!!process.env.CI,
 outputDir:fileURLToPath(new URL('../../test-results/',import.meta.url)),
 reporter:[['list'],['html',{outputFolder:fileURLToPath(new URL('../../playwright-report/',import.meta.url)),open:'never'}]],
 use:{baseURL:liveURL||'http://127.0.0.1:4173/stopped-both-sides/',
  viewport:{width:1366,height:768},trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:['chromium','firefox','webkit'].map(browserName=>({name:browserName,use:{browserName}})),
 webServer:liveURL?undefined:{command:'node tests/browser/server.mjs',
  cwd:repositoryRoot,
  url:'http://127.0.0.1:4173/stopped-both-sides/',reuseExistingServer:!process.env.CI}
});
