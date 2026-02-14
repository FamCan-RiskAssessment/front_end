# Search, Sort & Filter API Specification

All list endpoints now support optional **search**, **sort**, and **filter** query parameters. Omitting any parameter preserves the previous default behavior.

---

## Common Parameters

These parameters are shared across all list endpoints:

| Parameter   | Type   | Required | Default | Description                              |
|-------------|--------|----------|---------|------------------------------------------|
| `page`      | int    | No       | 1       | Page number (1-indexed)                  |
| `pageSize`  | int    | No       | 10      | Number of items per page                 |
| `sortBy`    | string | No       | `id`    | Column to sort by (see per-endpoint list)|
| `sortOrder` | string | No       | `asc`   | Sort direction: `asc` or `desc`          |
| `search`    | string | No       | —       | Case-insensitive partial-match search    |

### Search Behavior

- Matching is **case-insensitive** and **partial** (substring match).
- An empty string or omitted `search` parameter skips search entirely.
- The columns searched depend on the endpoint (documented below).

### Sort Behavior

- If `sortBy` is not one of the allowed values for the endpoint, it falls back to the default.
- `sortOrder` only accepts `asc` or `desc`. Any other value is treated as `asc`.

### Pagination

- The response envelope remains unchanged:
  ```json
  {
    "data": [...],
    "total": 42,
    "offset": 0,
    "limit": 10
  }
  ```
- `total` reflects the count **after** search and filters are applied (before pagination).

---

## 1. List Users

```
GET /admin/user
```

### Parameters

| Parameter   | Type   | Description                                    |
|-------------|--------|------------------------------------------------|
| `search`    | string | Searches the user's **phone number**           |
| `sortBy`    | string | One of: `id`, `phone`, `created_at`            |
| `sortOrder` | string | `asc` or `desc`                                |
| `roleId`    | uint   | Filter users who have been assigned this role   |

### Examples

```
GET /admin/user?page=1&pageSize=20&search=0912
GET /admin/user?sortBy=created_at&sortOrder=desc
GET /admin/user?roleId=3&sortBy=phone&sortOrder=asc
GET /admin/user?search=0912&roleId=2&sortBy=created_at&sortOrder=desc&page=1&pageSize=10
```

### Notes

- `roleId` is the numeric ID of the role (e.g., from the `/admin/role` endpoint).
- Searching `0912` will match any user whose phone contains `0912` (e.g., `09123456789`, `09129999999`).

---

## 2. List Forms (Supervisor View)

```
GET /admin/form
```

### Parameters

| Parameter          | Type   | Description                                        |
|--------------------|--------|----------------------------------------------------|
| `search`           | string | Searches the **phone number of the form's user**   |
| `sortBy`           | string | One of: `id`, `created_at`, `updated_at`, `status` |
| `sortOrder`        | string | `asc` or `desc`                                    |
| `formType`         | int    | Filter by form type                                |
| `status`           | uint   | Filter by form status                              |
| `gender`           | string | Filter by patient gender                           |
| `birthYear`        | uint   | Filter by patient birth year                       |
| `drinksAlcohol`    | bool   | Filter by alcohol consumption                      |
| `smokingNow`       | bool   | Filter by current smoking status                   |
| `cancer`           | bool   | Filter by cancer history                           |
| `filledByOperatorID` | uint | Filter by the operator who filled the form        |

### Examples

```
GET /admin/form?search=0912&sortBy=created_at&sortOrder=desc
GET /admin/form?status=2&sortBy=status&sortOrder=asc&page=1&pageSize=25
GET /admin/form?search=0917&gender=male&cancer=true&sortBy=updated_at&sortOrder=desc
```

### Notes

- `search` matches against the **user's phone number**, not the form content itself.
- All existing filter parameters (`formType`, `status`, `gender`, etc.) continue to work exactly as before.
- Filters and search combine with AND logic: a form must match **all** provided filters **and** the search query.

---

## 3. List Operator Forms

```
GET /admin/operator-form
```

### Parameters

| Parameter       | Type   | Description                                        |
|-----------------|--------|----------------------------------------------------|
| `search`        | string | Searches the **phone number of the form's user**   |
| `sortBy`        | string | One of: `id`, `created_at`, `updated_at`, `status` |
| `sortOrder`     | string | `asc` or `desc`                                    |
| `formType`      | int    | Filter by form type                                |
| `status`        | uint   | Filter by form status                              |
| `gender`        | string | Filter by patient gender                           |
| `birthYear`     | uint   | Filter by patient birth year                       |
| `drinksAlcohol` | bool   | Filter by alcohol consumption                      |
| `smokingNow`    | bool   | Filter by current smoking status                   |
| `cancer`        | bool   | Filter by cancer history                           |

### Examples

```
GET /admin/operator-form?search=0912&sortBy=updated_at&sortOrder=desc
GET /admin/operator-form?status=1&formType=2&page=2&pageSize=10
```

### Notes

- This endpoint automatically scopes results to the authenticated operator. No `operatorId` parameter is needed.
- Behavior is identical to `/admin/form` except there is no `filledByOperatorID` filter.

---

## 4. List Action Logs

```
GET /admin/log
```

### Parameters

| Parameter   | Type   | Description                                         |
|-------------|--------|-----------------------------------------------------|
| `search`    | string | Searches **details** and **resource** fields         |
| `sortBy`    | string | One of: `id`, `created_at`, `action`                |
| `sortOrder` | string | `asc` or `desc` (default: `desc` for this endpoint) |
| `action`    | uint   | Filter by action type ID                            |
| `actorId`   | uint   | Filter by the user who performed the action          |
| `dateFrom`  | string | Filter logs created on or after this date            |
| `dateTo`    | string | Filter logs created on or before this date           |

### Date Format

`dateFrom` and `dateTo` use **`YYYY-MM-DD`** format (e.g., `2025-06-15`).

### Examples

```
GET /admin/log?search=form&sortBy=created_at&sortOrder=desc
GET /admin/log?action=1&actorId=5&page=1&pageSize=50
GET /admin/log?dateFrom=2025-01-01&dateTo=2025-06-30
GET /admin/log?search=user&action=3&dateFrom=2025-03-01&sortBy=action&sortOrder=asc
```

### Notes

- To get the list of valid `action` IDs and their names, call `GET /admin/log/types`.
- Default sort for this endpoint is `created_at` descending (most recent first).
- `dateFrom` and `dateTo` can be used independently — you do not need to provide both.
- All filters combine with AND logic.

---

## Quick Reference

| Endpoint              | Search Columns            | Sortable Columns                         | Filters                                                              |
|-----------------------|---------------------------|------------------------------------------|----------------------------------------------------------------------|
| `GET /admin/user`     | phone                     | `id`, `phone`, `created_at`              | `roleId`                                                             |
| `GET /admin/form`     | user phone                | `id`, `created_at`, `updated_at`, `status` | `formType`, `status`, `gender`, `birthYear`, `drinksAlcohol`, `smokingNow`, `cancer`, `filledByOperatorID` |
| `GET /admin/operator-form` | user phone           | `id`, `created_at`, `updated_at`, `status` | `formType`, `status`, `gender`, `birthYear`, `drinksAlcohol`, `smokingNow`, `cancer` |
| `GET /admin/log`      | details, resource         | `id`, `created_at`, `action`             | `action`, `actorId`, `dateFrom`, `dateTo`                            |

---

## Error Handling

No new error types are introduced. Invalid or unrecognized parameter values are handled gracefully:

| Scenario                           | Behavior                              |
|------------------------------------|---------------------------------------|
| Unknown `sortBy` value             | Falls back to default sort column     |
| Unknown `sortOrder` value          | Falls back to `asc`                   |
| Empty `search` string              | Search is skipped entirely            |
| Invalid filter value (wrong type)  | Standard 400 validation error         |
| `dateFrom` after `dateTo`          | Returns empty results (not an error)  |
