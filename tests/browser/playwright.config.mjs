import {defineConfig} from '@playwright/test';
import {fileURLToPath} from 'node:url';

const liveURL=process.env.TEST_BASE_URL;
export default defineConfig({
 testDir:'.',testMatch:'*.spec.mjs',timeout:60000,expect:{timeout:10000},
 fullyParallel:false,workers:1,retries:0,forbidOnly:!!process.env.CI,
 reporter:[['list'],['html',{outputFolder:'playwright-report',open:'never'}]],
 use:{baseURL:liveURL||'http://127.0.0.1:4173/stopped-both-sides/',
  viewport:{width:1366,height:768},trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:['chromium','firefox','webkit'].map(browserName=>({name:browserName,use:{browserName}})),
 webServer:liveURL?undefined:{command:'node tests/browser/server.mjs',
  cwd:fileURLToPath(new URL('../../',import.meta.url)),
  url:'http://127.0.0.1:4173/stopped-both-sides/',reuseExistingServer:!process.env.CI}
});
