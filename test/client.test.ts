import "jest";
import { Response } from "node-fetch";
import Client from "../src";
import { isDecisionMultiWinner } from "../src/models";

let buildFetchMock = (response: any) =>
  jest.fn(async (url: string, opts: any) => {
    return Promise.resolve(
      new Response(JSON.stringify(response), {
        headers: { "content-type": "application/json" }
      })
    );
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

  let result = await client.getDecisions(request);

  expect(fetch.mock.calls.length).toBe(1);
  expect(fetch.mock.calls[0][0]).toBe("https://e-23.adzerk.net/api/v2");

  let body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body).toEqual(request);

  expect(result).toEqual(response);

  expect(isDecisionMultiWinner(result.decisions)).toBeFalsy();
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

  let result = await client.getDecisions(request);

  expect(fetch.mock.calls.length).toBe(1);
  expect(fetch.mock.calls[0][0]).toBe("https://e-23.adzerk.net/api/v2");

  let body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body).toEqual(request);

  expect(result).toEqual(response);

  expect(isDecisionMultiWinner(result.decisions)).toBeTruthy();
});
