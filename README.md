# Adzerk JavaScript/Typescript Decision SDK

JavaScript Software Development Kit for Adzerk Decision & UserDB APIs

Usable client or server-side as TypeScript or JavaScript!

## Installation

[NPM Package](https://www.npmjs.com/package/@adzerk/decision-sdk)

### Server-Side via NPM

Requires [Node.js v10](https://nodejs.org/en/about/releases/) or higher.

```shell
npm install --save @adzerk/decision-sdk
```

### Client-Side via CDN

Always fetches the latest version:

```html
<script src="https://unpkg.com/@adzerk/decision-sdk/dist/adzerk-decision-sdk.js"></script>
```

Using a fixed version:

```html
<script src="https://unpkg.com/@adzerk/decision-sdk@1.0.0-beta.2/dist/adzerk-decision-sdk.js"></script>
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

### Recording Impression & Clicks

Use with the fetch ad example above.

```javascript
// Impression pixel; fire when user sees the ad
client.pixels.fire({ url: decision.impressionUrl });

// Click pixel; fire when user clicks on the ad
// status: HTTP status code
// location: click target URL
client.pixels.fire({ url: decision.clickUrl }).then(r => {
  console.log(`status ${r["status"]}; location: ${r["location"]}`);
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

// Demo network ID; find your own via the Adzerk UI!
let client = new Client({ networkId: 23 });

let props = {
  favoriteColor: "blue",
  favoriteNumber: 42,
  favoriteFoods: ["strawberries", "chocolate"]
};

client.userDb.setCustomProperties("abc", props);
```

### UserDB: Forgetting User Record

```javascript
import { Client } from "@adzerk/decision-sdk";

// Demo network ID and API key; find your own via the Adzerk UI!
let client = new Client({ networkId: 23, apiKey: "YOUR-API-KEY" });
client.userDb.forget("abc");
```

### Decision Explainer

The Decision Explainer is a feature that returns information on a Decision API request explaining why each candidate ad was or was not chosen.

```javascript
import { Client } from "@adzerk/decision-sdk";

// Demo network, site, and ad type IDs; find your own via the Adzerk UI!
let client = new Client({ networkId: 23, siteId: 667480 });

let request = {
  placements: [{adTypes: [5]}],
  user: {key: "abc"},
  keywords: ["keyword1", "keyword2"]
};

const options = {
  includeExplanation: true
  apiKey: "YOUR-API-KEY"
};

client.decisions.get(request, options).then(response => {
  console.dir(response, {depth: null})
});
```

The response returns a decision object with placement, buckets, rtb logs, and result information.

```json
{
  "div0": {
    "placement": {},
    "buckets": [],
    "rtb_log": [],
    "results": []
  }
}
```

The "placement" object represents a decision in which an ad may be served. A Explainer Request can have multiple placements in the request.
The "buckets" array contains channel and priority information.
The "rtb_logs" array contains information about Real Time Bidding.
The "results" array contains the list of candidate ads that did and did not serve, along with a brief explanation. |

### Logging

Our logging implementation is meant to be flexible enough to fit into any common NodeJS logging framework.

When constructing a client instance, the logger is passed in as an anonymous function with three parameters:

- `level`: Any one of `debug`, `info`, `warn`, or `error`
- `message`: The message to log
- `metadata`: Any additional metadata related to the logging call

If no `logger` is provided as an argument, the [debug](https://github.com/visionmedia/debug#readme) library will be used by default.

The easiest way to integrate is to write a function that handles translating the data from the Adzerk SDK Logger into whatever logging framework you're using in the rest of your application:

```js
import { Client } from "@adzerk/decision-sdk";

const logger = (lvl, msg, meta) =>
  console.log(`[${lvl}] ${msg} [${JSON.stringify(meta)}]\n`);

let client = new Client({ logger });
```

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
