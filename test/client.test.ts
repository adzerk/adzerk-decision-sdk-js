import "jest";
// import fetch from 'isomorphic-unfetch';
import { Response } from "node-fetch";
// import fetch, { Response } from 'node-fetch';
import Client from "../src";

//jest.mock('node-fetch');

// let fetchMock = (fetch as any);

// beforeEach(() => {
//   fetchMock.mockReset();
// });

let fetch = jest.fn(async (url: string, opts: any) => {
  return Promise.resolve(
    new Response("{}", { headers: { "content-type": "application/json" } })
  );
});

test("addition", async () => {
  // let r = new Response('');
  // r.clone();
  // fetchMock.mockResolvedValue(new Response('{}'));

  let client = new Client({
    networkId: 23,
    fetch: fetch as any
  });

  let result = await client.getDecisions({
    placements: [
      {
        divName: "div1",
        networkId: 23,
        siteId: 1,
        adTypes: [5]
      }
    ],
    user: { key: "abc" }
  });

  console.log(fetch.mock.calls.length);
  // console.log(fetchMock.mock.calls.length);

  expect(1 + 1).toBe(2);
});
