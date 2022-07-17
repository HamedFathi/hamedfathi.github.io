---
title: Using Puppeteer with Mocha/Jest and Aurelia 2
date: August 18 2020
category: aurelia
tags:
    - aurelia2
    - test
    - e2e
    - end-to-end
    - puppeteer
    - mocha
    - chai
    - jest
---

### What is Puppeteer? 

> [Puppeteer](https://github.com/puppeteer/puppeteer) is a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol. Puppeteer runs headless by default, but can be configured to run full (non-headless) Chrome or Chromium.

Most things that you can do manually in the browser can be done using Puppeteer! Here are a few examples to get you started:

* Generate screenshots and PDFs of pages.
* Crawl a SPA (Single-Page Application) and generate pre-rendered content (i.e. "SSR" (Server-Side Rendering)).
* Automate form submission, UI testing, keyboard input, etc.
* Create an up-to-date, automated testing environment. Run your tests directly in the latest version of Chrome using the latest JavaScript and browser features.
* Capture a timeline trace of your site to help diagnose performance issues.
* Test Chrome Extensions.

<!-- more -->

### What browsers are supported?

After version 3.0, Puppeteer supports `Firefox` in addition to the `Chrome` browser.

### Puppeteer, Mocha & Aurelia 2 (Typescript) integration

How to set it up is as follows:

1- Run the following command in your terminal

``` bash
npx makes aurelia
```

2- Make your `Custom Aurelia 2 App` with these options
* Typescript
* Mocha + Chai

**Don't** choose `Cypress` for e2e testing, we will set `Puppeteer` up soon!

3- Install the following Node packages

```bash
npm install puppeteer @types/puppeteer ts-node -D
```

4- Create the `ts_hook.js` file beside `tsconfig.json` in the root folder then copy the below snippet code into it.

```js
require("ts-node").register({
  // project: "./tsconfig-e2e.json",
  compilerOptions: {
    module: "commonjs",
  },
});
```
As you see, you can use `project` option to define a separated `tsconfig` just for using E2E test instead of defining `compilerOptions` but the most important thing to consider is set `module` to `commonjs` otherwise you will get an [Cannot use import statement outside a module](https://github.com/TypeStrong/ts-node/issues/922) error (Does not matter choose which one).

5- Create `my-app.e2e.ts` file inside `test` folder and copy the following code

```js
import { expect } from "chai";
import puppeteer from "puppeteer";

describe("Duck Duck Go search using basic Puppeteer", () => {
  let browser;
  let page;

  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("https://duckduckgo.com");
  });

  afterEach(async () => {
    await browser.close();
  });

  it("should have the correct page title", async () => {
    expect(await page.title()).to.eql("DuckDuckGo — Privacy, simplified.");
  });

  it("should show a list of results when searching actual word", async () => {
    await page.type("input[id=search_form_input_homepage]", "puppeteer");
    await page.click('input[type="submit"]');
    await page.waitForSelector("h2 a");
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("h2 a"));
    });
    expect(links.length).to.be.greaterThan(0);
  });
});
```

This code is a very simple and classic sample to start using Puppeteer. (Not related to Aurelia)

6- Open `package.json` and append the below script to `scripts` block.

```js
"test:e2e": "node ./node_modules/mocha/bin/mocha --require ./ts_hook.js --timeout=30000 test/**/*.e2e.ts"
```

As you see, we have filtered the files in `test` folder that ends with `.e2e.ts` for E2E testing and using Puppeteer.

7- To run tests, execute the below command.

```bash
npm run test:e2e
```

![](/images/using-puppeteer-with-mocha-or-jest-and-aurelia-2/1.png)

### Puppeteer, Jest & Aurelia 2 (Typescript) integration

SOON!


Congrats.