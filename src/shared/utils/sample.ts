export const SAMPLE_JSON = `{
  "name": "Tom",
  "age": 18,
  "skills": ["json", "typescript", "react"],
  "active": true
}`

export const SAMPLE_INVALID_JSON = `{
  "name": "Tom",
  "age": 18,
}`

export const SAMPLE_CSHARP_JSON = `{
  "user_id": 1001,
  "user_name": "Tom",
  "balance": 1520.75,
  "is_active": true,
  "created_at": "2025-03-01T10:20:30Z",
  "profile": {
    "display_name": "Tom Chen",
    "age": 18,
    "nickname": null
  },
  "roles": ["Admin", "Editor"],
  "orders": [
    {
      "order_id": 9000000001,
      "amount": 88.50,
      "remark": null
    }
  ]
}`

export const SAMPLE_SQL = `select u.id,u.name,o.order_no,o.amount
from users u
left join orders o on u.id=o.user_id
where u.status='active' and o.created_at>='2026-01-01'
order by o.created_at desc;`
