# Adzerk Decision JavaScript SDK

JavaScript SDK for Adzerk Decision & UserDB APIs

Usable client or server-side as TypeScript or JavaScript!

## Installation

### Server-Side via NPM

Requires [Node.js v10](https://nodejs.org/en/about/releases/) or higher.

```shell
npm install @adzerk/decision-sdk
```

Or in your package.json file:

```javascript
"dependencies": {
  "@adzerk/decision-sdk": "^1.0.0-alpha.1"
}
```

### Client-Side via CDN

Always fetches the latest version:

```html
<script src="https://unpkg.com/@adzerk/decision-sdk/dist/adzerk-decision-sdk.js"></script>
```

Using a fixed version:

```html
<script src="https://unpkg.com/@adzerk/decision-sdk@1.0.0-alpha.1/dist/adzerk-decision-sdk.js"></script>
```

## Examples

### API Credentials & Required IDs

- Network ID: Log into [Adzerk UI](https://app.adzerk.com/) & use the "circle-i" help menu in upper right corner to find Network ID. Required for all SDK operations.
- Site ID: Go to [Manage Sites page](https://app.adzerk.com/#!/sites/) to find site IDs. Required when fetching an ad decision.
- Ad Type ID: Go to [Ad Sizes page](https://app.adzerk.com/#!/ad-sizes/) to find Ad Type IDs. Required when fetching an ad decision.
- API Key: Go to [API Keys page](https://app.adzerk.com/#!/api-keys/) find active API keys. Required when writing to UserDB.
- User Key: UserDB IDs are [specified or generated for each user](https://dev.adzerk.com/reference/userdb#passing-the-userkey).

### Fetching an Ad Decision

```javascript
import { Client } from "@adzerk/decision-sdk";

// Demo network, site, and ad type IDs; find your own via the Adzerk UI!
let client = new Client({ networkId: 23, siteId: 667480 });

let request = {
  placements: [{ adTypes: [5] }],
  user: { key: "abc" },
  keywords: ["keyword1", "keyword2"]
};

client.decisions.get(request).then(response => {
  console.dir(response, { depth: null });
});
```

### UserDB: Reading User Record

```javascript
import { Client } from "@adzerk/decision-sdk";

// Demo network ID; find your own via the Adzerk UI!
let client = new Client({ networkId: 23 });
client.userDb.read("abc").then(response => console.log(response));
```

### UserDB: Setting Custom Properties

```javascript
import { Client } from "@adzerk/decision-sdk";

// Requires setting API key in "$ADZERK_API_KEY" environ variable
const API_KEY = process.env.ADZERK_API_KEY;

// Demo network ID; find your own via the Adzerk UI!
let client = new Client({ networkId: 23, apiKey: API_KEY });

let props = {
  favoriteColor: "blue",
  favoriteNumber: 42,
  favoriteFoods: ["strawberries", "chocolate"]
};

client.userDb.setCustomProperties("abc", props);
```

<!-- ### Logging Example

TBD: ....... -->

## Documentation

- [Adzerk API Documentation](https://dev.adzerk.com/reference)
- [Adzerk User & Developer Documentation](https://dev.adzerk.com/docs)

## Contributing

### Reporting Issues

- For bug fixes and improvements to this SDK please use Github to [open an issue](https://github.com/adzerk/adzerk-decision-sdk-js/issues) or send us a [pull request](https://github.com/adzerk/adzerk-decision-sdk-js/pulls).
- For questions or issues regarding Adzerk functionality, please [contact Adzerk support](https://adzerk.com/help/).

### Building / Running Tests

To install dependencies and run the builds associated with this SDK, please use:

```
npm install
npm run build
npm run test
```
