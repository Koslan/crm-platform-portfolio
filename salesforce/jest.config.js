/**
 * sfdx-lwc-jest configuration for the employmentHistory LWC's Jest tests.
 *
 * Deliberately NOT wired into the root crm-portfolio-site package.json — this site's
 * own test suite (npm test) is Playwright against the built dist/index.html and has
 * nothing to do with the Salesforce source tree. Adding @salesforce/sfdx-lwc-jest as a
 * devDependency there would pull Lightning tooling into a static-site build for no
 * reason. Run these tests from the salesforce/ folder instead:
 *
 *   cd salesforce
 *   npm install --no-save @salesforce/sfdx-lwc-jest
 *   npx sfdx-lwc-jest
 *
 * or, without installing anything locally, npx directly:
 *
 *   npx --package @salesforce/sfdx-lwc-jest sfdx-lwc-jest --config salesforce/jest.config.js
 */
const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
    ...jestConfig,
    rootDir: 'force-app/main/default/lwc',
    moduleNameMapper: {},
    coveragePathIgnorePatterns: [...(jestConfig.coveragePathIgnorePatterns || [])]
};
