import { TwitterApi } from 'twitter-api-v2';

export function createClient() {
  const { API_KEY, API_SECRET_KEY, ACCESS_TOKEN, ACCESS_TOKEN_SECRET } = process.env;

  if (!API_KEY || !API_SECRET_KEY || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
    throw new Error('Missing Twitter API credentials. Set API_KEY, API_SECRET_KEY, ACCESS_TOKEN, ACCESS_TOKEN_SECRET.');
  }

  return new TwitterApi({
    appKey: API_KEY,
    appSecret: API_SECRET_KEY,
    accessToken: ACCESS_TOKEN,
    accessSecret: ACCESS_TOKEN_SECRET,
  });
}

const DELAY_MS = 2000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Post a thread (array of tweets).
 * Returns { postedIds: string[] }
 */
export async function postThread(client, tweets) {
  const postedIds = [];

  let lastTweetId = null;
  for (let i = 0; i < tweets.length; i++) {
    const payload = { text: tweets[i] };
    if (lastTweetId) {
      payload.reply = { in_reply_to_tweet_id: lastTweetId };
    }

    const result = await client.v2.tweet(payload);
    postedIds.push(result.data.id);
    lastTweetId = result.data.id;

    if (i < tweets.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  return { postedIds };
}

/**
 * Post a standalone tweet.
 * Returns { postedIds: string[] }
 */
export async function postStandalone(client, text) {
  const result = await client.v2.tweet({ text });
  return { postedIds: [result.data.id] };
}
