# Tests

Integration tests against a running contract node on `localhost:8081`.

```
cd src/Test
npm install
npm test
```

Set `CONTRACT_URL` (default `wss://localhost:8081`) to target another node. Each run uses a fresh client key, so the user starts with 0 points. Tests cover Health, the check-in lifecycle (status -> check-in -> duplicate rejection -> status) and unknown actions.
