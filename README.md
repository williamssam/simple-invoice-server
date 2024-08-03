https://devmaesters.com/blog/31

<!-- todo -->

<!-- points -->
- Decided to store money as pennies to avoid floating point issues.
- decided against storing totals in DB, preferring calculating them on the fly. That way its faster and i don't have to update the total(s) every time the user update something (https://www.sitepoint.com/community/t/db-best-practice-store-calculated-field-or-calculate-on-the-fly/5962/2)
- you can generate either of the two keys with <code>openssl genrsa -out ./private.key 4096</code>. Make sure to use different key for refresh and access token.
