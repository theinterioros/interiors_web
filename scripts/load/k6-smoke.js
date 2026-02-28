/**
 * k6 smoke test — critical paths, light load.
 * Run: k6 run scripts/load/k6-smoke.js
 * Optionally: k6 run -e BASE_URL=https://staging.example.com scripts/load/k6-smoke.js
 */
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<3000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/`);
  check(res, { "home 200": (r) => r.status === 200 });
  sleep(0.5);

  const designers = http.get(`${BASE_URL}/designers`);
  check(designers, { "designers 200": (r) => r.status === 200 });
  sleep(0.5);

  const login = http.get(`${BASE_URL}/login`);
  check(login, { "login 200": (r) => r.status === 200 });
  sleep(0.5);

  const register = http.get(`${BASE_URL}/register`);
  check(register, { "register 200": (r) => r.status === 200 });
  sleep(0.5);
}
