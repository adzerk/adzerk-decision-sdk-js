import "jest";
import { Response } from "node-fetch";
import Client from "../src";

let fetch = jest.fn(async (url: string, opts: any) => {
  return Promise.resolve(
    new Response("{}", { headers: { "content-type": "application/json" } })
  );
});

test("addition", async () => {
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
});
