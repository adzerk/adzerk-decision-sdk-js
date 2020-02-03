import "jest";
import { Response } from "node-fetch";
import { Client } from "../src";

let buildFetchMock = (response: any) =>
  jest.fn(async (url: string, opts: any) => {
    return Promise.resolve(
      new Response(JSON.stringify(response), {
        headers: { "content-type": "application/json" }
      })
    );
  });

let expected = {
  user: {
    key: "abc"
  },
  decisions: {
    div1: [
      {
        adId: 2104402,
        creativeId: 1773302,
        flightId: 2583477,
        campaignId: 502103,
        priorityId: 99645,
        clickUrl: "https://some-click-url",
        impressionUrl: "https://some-impression-url",
        contents: [
          {
            type: "html",
            data: {
              height: 250,
              width: 300,
              imageUrl: "https://some-image-url",
              title: "",
              fileName: "image.png"
            },
            body:
              '<a href="" rel="nofollow" target="_blank" title=""><img src="" title="" alt="" border="0" width="300" height="250"></a>',
            template: "image"
          }
        ],
        height: 250,
        width: 300,
        events: []
      }
    ]
  }
};

test("client obeys a protocol override", async () => {
  let fetch = buildFetchMock({});
  let client = new Client({
    networkId: 23,
    fetch: fetch as any,
    protocol: "http"
  });

  await client.Decisions.get({ placements: [] });

  expect(fetch.mock.calls.length).toBe(1);
  expect(fetch.mock.calls[0][0]).toBe("http://e-23.adzerk.net/api/v2");
});

test("client obeys a host override", async () => {
  let fetch = buildFetchMock({});
  let client = new Client({
    networkId: 23,
    fetch: fetch as any,
    host: "ads.some.com"
  });

  await client.Decisions.get({ placements: [] });

  expect(fetch.mock.calls.length).toBe(1);
  expect(fetch.mock.calls[0][0]).toBe("https://ads.some.com/api/v2");
});

test("client obeys a path override", async () => {
  let fetch = buildFetchMock({});
  let client = new Client({
    networkId: 23,
    fetch: fetch as any,
    path: "/some/crazy/proxy"
  });

  await client.Decisions.get({ placements: [] });

  expect(fetch.mock.calls.length).toBe(1);
  expect(fetch.mock.calls[0][0]).toBe(
    "https://e-23.adzerk.net/some/crazy/proxy"
  );
});

test("client allows a full url override", async () => {
  let fetch = buildFetchMock({});
  let client = new Client({
    networkId: 23,
    fetch: fetch as any,
    protocol: "http",
    host: "ads.some.com",
    path: "/some/crazy/proxy"
  });

  let result = await client.Decisions.get({ placements: [] });

  expect(fetch.mock.calls.length).toBe(1);
  expect(fetch.mock.calls[0][0]).toBe("http://ads.some.com/some/crazy/proxy");
});

test("client makes simple request and returns single winner response", async () => {
  let response = {
    user: {
      key: "abc"
    },
    decisions: {
      div1: {
        adId: 2104402,
        creativeId: 1773302,
        flightId: 2583477,
        campaignId: 502103,
        priorityId: 99645,
        clickUrl: "https://some-click-url",
        impressionUrl: "https://some-impression-url",
        contents: [
          {
            type: "html",
            data: {
              height: 250,
              width: 300,
              imageUrl: "https://some-image-url",
              title: "",
              fileName: "image.png"
            },
            body:
              '<a href="" rel="nofollow" target="_blank" title=""><img src="" title="" alt="" border="0" width="300" height="250"></a>',
            template: "image"
          }
        ],
        height: 250,
        width: 300,
        events: []
      }
    }
  };

  let fetch = buildFetchMock(response);
  let client = new Client({
    networkId: 23,
    fetch: fetch as any
  });

  let request = {
    placements: [
      {
        divName: "div1",
        networkId: 23,
        siteId: 1,
        adTypes: [5]
      }
    ],
    user: { key: "abc" }
  };

  let result = await client.Decisions.get(request);

  expect(fetch.mock.calls.length).toBe(1);
  expect(fetch.mock.calls[0][0]).toBe("https://e-23.adzerk.net/api/v2");

  let body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body).toEqual(request);

  expect(result).toEqual(expected);
});

test("client makes simple request and returns multi winner response", async () => {
  let response = {
    user: {
      key: "abc"
    },
    decisions: {
      div1: [
        {
          adId: 2104402,
          creativeId: 1773302,
          flightId: 2583477,
          campaignId: 502103,
          priorityId: 99645,
          clickUrl: "https://some-click-url",
          impressionUrl: "https://some-impression-url",
          contents: [
            {
              type: "html",
              data: {
                height: 250,
                width: 300,
                imageUrl: "https://some-image-url",
                title: "",
                fileName: "image.png"
              },
              body:
                '<a href="" rel="nofollow" target="_blank" title=""><img src="" title="" alt="" border="0" width="300" height="250"></a>',
              template: "image"
            }
          ],
          height: 250,
          width: 300,
          events: []
        }
      ]
    }
  };

  let fetch = buildFetchMock(response);
  let client = new Client({
    networkId: 23,
    fetch: fetch as any
  });

  let request = {
    placements: [
      {
        divName: "div1",
        networkId: 23,
        siteId: 1,
        adTypes: [5],
        count: 3
      }
    ],
    user: { key: "abc" }
  };

  let result = await client.Decisions.get(request);

  expect(fetch.mock.calls.length).toBe(1);
  expect(fetch.mock.calls[0][0]).toBe("https://e-23.adzerk.net/api/v2");

  let body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body).toEqual(request);

  expect(result).toEqual(expected);
});

test("client makes explanation request with proper headers", async () => {
  let response = {};
  let fetch = buildFetchMock(response);
  let client = new Client({
    networkId: 23,
    fetch: fetch as any
  });

  await client.Decisions.getWithExplanation({ placements: [] }, "abc123");

  expect(fetch.mock.calls.length).toBe(1);
  expect(fetch.mock.calls[0][1]["headers"]["x-adzerk-explain"]).toBe("abc123");
});

test("client makes subsequent decision requests after explanation", async () => {
  let response = {};
  let fetch = buildFetchMock(response);
  let client = new Client({
    networkId: 23,
    fetch: fetch as any
  });

  await client.Decisions.getWithExplanation({ placements: [] }, "abc123");
  await client.Decisions.get({ placements: [] });

  expect(fetch.mock.calls.length).toBe(2);
  expect(fetch.mock.calls[1][1]["headers"]["x-adzerk-explain"]).toBeUndefined();
});
