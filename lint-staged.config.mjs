// Runs only on files staged for the commit, so the hook stays fast as the repo grows.
const config = {
  "*.{ts,tsx,js,mjs,mts}": [
    "eslint --fix --max-warnings=0",
    "prettier --write",
  ],
  "*.{json,md,css,yml,yaml}": "prettier --write",
};

export default config;
