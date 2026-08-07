"use strict";

const https = require("https");

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  header() {
    return [...this.cookies].map(([key, value]) => `${key}=${value}`).join("; ");
  }

  absorb(headers) {
    for (const cookie of headers["set-cookie"] || []) {
      const [pair] = cookie.split(";");
      const index = pair.indexOf("=");
      if (index > 0) this.cookies.set(pair.slice(0, index), pair.slice(index + 1));
    }
  }
}

class SaneagoHttpClient {
  constructor({ baseUrl = "https://prod.saneago.com.br" } = {}) {
    this.baseUrl = String(baseUrl).replace(/\/+$/, "");
    this.jar = new CookieJar();
    this.zkSid = 1;
  }

  url(path) {
    return path.startsWith("http") ? path : `${this.baseUrl}${path}`;
  }

  request(path, { method = "GET", headers = {}, body = "" } = {}) {
    return this._send(path, { method, headers, body, binary: false });
  }

  requestBuffer(path, { method = "GET", headers = {}, body = "" } = {}) {
    return this._send(path, { method, headers, body, binary: true });
  }

  _send(path, { method, headers, body, binary }) {
    const url = this.url(path);
    const requestHeaders = {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      accept: "*/*",
      ...headers,
    };
    const cookie = this.jar.header();
    if (cookie) requestHeaders.cookie = cookie;

    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        method,
        rejectUnauthorized: false,
        headers: requestHeaders,
      }, (res) => {
        this.jar.absorb(res.headers);
        if (binary) {
          const chunks = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => resolve({
            status: res.statusCode,
            headers: res.headers,
            buffer: Buffer.concat(chunks),
          }));
        } else {
          let text = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => { text += chunk; });
          res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, text }));
        }
      });
      req.on("error", reject);
      if (body) req.write(body);
      req.end();
    });
  }

  zkau(dtid, events, referer) {
    const body = new URLSearchParams();
    body.set("dtid", dtid);
    events.forEach((event, index) => {
      body.set(`cmd_${index}`, event.cmd);
      body.set(`uuid_${index}`, event.uuid);
      if (event.data !== undefined) body.set(`data_${index}`, JSON.stringify(event.data));
      if (event.opt !== undefined) body.set(`opt_${index}`, event.opt);
    });

    return this.request("/prt/zkau", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        referer,
        "zk-sid": String(this.zkSid++),
      },
      body: body.toString(),
    });
  }
}

module.exports = {
  CookieJar,
  SaneagoHttpClient,
};
