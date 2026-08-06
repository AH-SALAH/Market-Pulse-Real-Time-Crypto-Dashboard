# BIGQUERY.md — GA4 → BigQuery Export

Raw GA4 event data can be exported to BigQuery for free (within BigQuery's free-tier storage/quota). No code runs in this repo for it — the pipeline is configured entirely in the Google Cloud console.

## Prerequisites

- A GA4 property (id in `NEXT_PUBLIC_GA4_ID`)
- A Google Cloud project with BigQuery enabled (billing account attached; BigQuery has a per-month free tier, but an active billing account is required to enable exports)

## Steps

1. **Google Cloud Console** → create or select a project. Enable the BigQuery API.
2. **GA4 Admin** → Property → *Product links* → *BigQuery links* → **Link**.
3. Choose the Cloud project, set a data location (pick nearest region; this is permanent for the dataset).
4. Enable **Streaming exports** so events land in near-real-time, and mark **Include advertising identifiers** / **Include user-provided data** only if consent permits (this project's Consent Mode v2 defaults both to denied).
5. Configure **Daily export** (raw tables `events_YYYYMMDD`) plus **Streaming export** (`events_intraday_YYYYMMDD`).
6. Click **Link**. First daily table appears within 24h; streaming events appear within minutes.

## Dataset Layout

Exports land in a dataset named `analytics_<PROPERTY_ID>`. Two table types per day:

- `events_20260806` — daily rollup
- `events_intraday_20260806` — streaming (short retention)

Key nested fields: `event_date`, `event_timestamp`, `event_name`, `event_params`, `user_pseudo_id`, `items` (nested).

## Sample SQL

```sql
-- Sessions per marketing source for a week (requires advertising identifiers consent)
SELECT
  event_date,
  COUNT(DISTINCT user_pseudo_id) AS users
FROM `project.dataset.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN '20260801' AND '20260807'
GROUP BY event_date
ORDER BY event_date;

-- Most-viewed coins this month (virtual_pageview + coin_selected)
SELECT
  event_name,
  COUNT(*) AS occurrences,
  COUNT(DISTINCT user_pseudo_id) AS users
FROM `project.dataset.events_*`
WHERE event_name IN ('virtual_pageview', 'coin_selected')
GROUP BY event_name
ORDER BY occurrences DESC;

-- Coin detail engagement: pageviews vs coin_selected, per coin
SELECT
  (SELECT value.string_value
     FROM UNNEST(event_params) WHERE key = 'coin_id') AS coin_id,
  COUNTIF(event_name = 'coin_selected') AS selections,
  COUNTIF(event_name = 'virtual_pageview') AS pageviews
FROM `project.dataset.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260801' AND '20260831'
GROUP BY coin_id
HAVING coin_id IS NOT NULL
ORDER BY selections DESC
LIMIT 20;
```

Note: `event_params` is an array of `{key, value}` records; use `UNNEST` + `COUNTIF` to filter by event-specific params. `user_pseudo_id` is GA4's anonymous identifier — no PII (this project redacts email/phone before push, so none should appear regardless).
