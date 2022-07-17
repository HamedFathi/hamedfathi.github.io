---
title: Write a custom plugin with Aurelia 2 and Lerna
date: November 09 2020
category: aurelia
tags:
    - aurelia2
    - plugin
    - lerna
    - bootstrap5
    - monorepository
---

In this article, We want to write a simple [Bootstrap 5](https://v5.getbootstrap.com/) plugin for `Aurelia 2` and manage our packages via [Lerna](https://lerna.js.org/).

<!-- more -->

With help of my friend, [Sayan](https://github.com/Sayan751), I want to discuss about writing a custom plugin. At the end, you will have a good knowledge to write your own plugins, so stay tuned.

### What is Bootstrap?

> Bootstrap is the most popular CSS Framework for developing responsive and mobile-first websites.

The main purpose of this article is to create a component of `Bootstrap 5` as a plugin for Aurelia 2.

### What is Lerna?

> A tool for managing JavaScript projects with multiple packages.
> Splitting up large codebases into separate independently versioned packages is extremely useful for code sharing. However, making changes across many repositories is messy and difficult to track, and testing across repositories becomes complicated very quickly.
> To solve these (and many other) problems, some projects will organize their codebases into multi-package repositories (sometimes called monorepos).

To achieve the ultimate goal of this article, we will create our project in the form of monorepos.

### What is a plugin?

> In computing, a plug-in (or plugin, add-in, addin, add-on, or addon) is a software component that adds a specific feature to an existing computer program. When a program supports plug-ins, it enables customization.

I want the user to be able to customize their requirements while using this plugin so in the following we will examine how to add config to our plugin.

### Aurelia 1 vs Aurelia 2

**Aurelia 1**

Writing a new Aurelia Plugin is not difficult but it requires a lot of work that you can read through [here](http://aurelia.io/docs/plugins/write-new-plugin). To be honest, it was not really straightforward!

```js
// src/main(.js|.ts)

export function configure(aurelia: Aurelia): void {

aurelia.use.plugin(PLATFORM.moduleName('bootstrap-v5'));
// OR
// aurelia.use.plugin(PLATFORM.moduleName('bootstrap-v5/button'));

  aurelia.start()
         .then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
```

**Aurelia 2**

In version 2, everything is straightforward, just introduce the items you export to the `register` method. In fact, everything is possible by the `register` method so we will see how it works.

```js
// main.ts

import Aurelia from 'aurelia';
import { App } from './app';
import * as BsComponents from 'bootstrap-v5';

Aurelia
  .register(
    BsComponents // This globalizes all the exports.
  )
  .app(App)
  .start();
```

### The structure

We want to separate our plugin in three packages.

* **bootstrap-v5-core**

We will add the Bootstrap 5 configurations in this package.

* **bootstrap-v5**

Our Bootstrap 5 components will define in this package. `bootstrap-v5` depends `bootstrap-v5-core` packages.

* **demo**

We will use our plugin in this package as a demo. `demo` depends on `bootstrap-v5-core` and `bootstrap-v5`.

![](/images/write-a-custom-plugin-with-aurelia-2-and-lerna/packages.png)

### Lerna configuration

To config your monorepos, you should do as following:

Install `Lerna` as a global tool.

```bash
npm i lerna -g
```

Go to a folder that you want to make project and run

```bash
lerna init
```

The result should contain

* `packages`: The folder you will create your repositories there.
* `lerna.json`: Lerna's configuration file.
* `package.json`: Node's configuration file.

Open your `packages` folder and install the projects inside it.

```bash
npx makes aurelia bootstrap-v5-core -s typescript
npx makes aurelia bootstrap-v5 -s typescript
npx makes aurelia demo -s typescript
```

After creating, delete all files inside `src` folders of `bootstrap-v5-core` and `bootstrap-v5`. We will add our files there.

To continue we need to config `Lerna`, Open your `lerna.json` and paste the followimg code:

```json
{
  "version": "0.1.0",
  "npmClient": "npm",
  "command": {
    "bootstrap": {
      "hoist": "**"
    }
  },
  "packages": ["packages/*"]
}
```

**version**: the current version of the repository.

**npmClient**: an option to specify a specific client to run commands with (this can also be specified on a per command basis). Change to "yarn" to run all commands with yarn. Defaults to "npm".

**command.bootstrap.hoist**: Common dependencies will be installed only to the top-level `node_modules`, and omitted from individual package `node_modules`.

**packages**: Array of globs to use as package locations.

## Dependencies

As described in the structure section defined packages depend on each other. So, we link them together and add the other prerequisites for each.

* **bootstrap-v5-core**

This package has no dependency.

* **bootstrap-v5**

Go to `package.json` and add the following dependencies:

```js
// bootstrap-v5/package.json
"dependencies": {	
    "aurelia": "dev",
    "bootstrap": "^5.0.0-alpha2",	
    "bootstrap-v5-core": "0.1.0"
},
```

* **demo**

Go to `package.json` and add the following dependencies

```js
// demo/package.json
"dependencies": {	
    "aurelia": "dev",	
    "bootstrap-v5-core": "0.1.0",
    "bootstrap-v5": "0.1.0"
},
```

**Note**: All created packages have `0.1.0` version so pay attention if the version changes, update it in other packages.

Finally, run the below command inside your root folder (where `lerna.json` is) to install packages.

```bash
lerna bootstrap
```

### Plugin configuration

Go to the `src` folder of `bootstrap-v5-core` package and create each of below files there.

**Size**

As I mentioned before, I want to write a configurable Bootstrap plugin so create `src/Size.ts` file.

```js
export enum Size {
    ExtraSmall = 'xs',
    Small = 'sm',
    Medium = 'md',
    Large = 'lg',
    ExtraLarge = 'xl',
}
```

I made a `Size` enum to handle all Bootstrap sizes. Next we can manage our components according to size value.

**Global Bootstrap 5 Options**

Create `src/IGlobalBootstrapV5Options.ts` file.

```js
import { Size } from "./Size";
export interface IGlobalBootstrapV5Options {
    defaultSize?: Size;
}
export const defaultOptions: IGlobalBootstrapV5Options = {
    defaultSize: Size.Medium
};
```

You need to define your configs via an interface With its default values as a constant.

**DI**

Create `src/BootstrapV5Configuration.ts` file.

```js
import { DI, IContainer, Registration } from "aurelia";
import { IGlobalBootstrapV5Options, defaultOptions } from './IGlobalBootstrapV5Options';

export const IBootstrapV5Options = DI.createInterface<IGlobalBootstrapV5Options>('IBootstrapV5Options').noDefault();

function createIBootstrapV5Configuration(optionsProvider: (options: IGlobalBootstrapV5Options) => void) {
    return {
        optionsProvider,
        register(container: IContainer) {
            optionsProvider(defaultOptions);
            return container.register(Registration.instance(IBootstrapV5Options, defaultOptions))
        },
        customize(cb?: (options: IGlobalBootstrapV5Options) => void) {
            return createIBootstrapV5Configuration(cb ?? optionsProvider);
        },
    };
}

export const BootstrapV5Configuration = createIBootstrapV5Configuration(() => {});
```

We can define our `IGlobalBootstrapV5Options` to DI container so this happened via `IBootstrapV5Options` constant.

`createIBootstrapV5Configuration` is the most important part of creating settings. 

* `register(container: IContainer)` helps us to introduce our default config to DI container.

* `customize(cb?: (options: IGlobalBootstrapV5Options) => void)` alse helps us to introduce our custom config to the DI container.

Finally, we should export our current configuration with default options via `BootstrapV5Configuration`.

**Exports**

Create `src/index.ts` file.

```js
export * from './BootstrapV5Configuration';
export * from './IGlobalBootstrapV5Options';
export * from './Size';
```

Create new `index.ts` file inside `bootstrap-v5-core` package.

```js
export * from './src';
```

### Plugin implementation

Go to the `src` folder of `bootstrap-v5` package, create a `button` folder then create each of below files there.

![](/images/write-a-custom-plugin-with-aurelia-2-and-lerna/button.png)

* **Resource**

Create `resource.d.ts` file.

```js
declare module '*.html' {
  import { IContainer } from '@aurelia/kernel';
  import { IBindableDescription } from '@aurelia/runtime';
  export const name: string;
  export const template: string;
  export default template;
  export const dependencies: string[];
  export const containerless: boolean | undefined;
  export const bindables: Record<string, IBindableDescription>;
  export const shadowOptions: { mode: 'open' | 'closed'} | undefined;
  export function register(container: IContainer);
}

declare module '*.css';
declare module '*.scss';
```

* **View**

Create `bs-button.html` file.

```html
<button class="btn btn-primary" ref="bsButtonTemplate">
    Primary Button
</button>
```

* **ViewModel**

Create `bs-button.ts` file.

```js
import { customElement, INode, containerless } from "aurelia";
import template from "./bs-button.html";
import { IBootstrapV5Options, IGlobalBootstrapV5Options, Size } from "bootstrap-v5-core";

@customElement({ name: "bs-button", template })
@containerless
export class BootstrapButton {
  private bsButtonTemplate: Element;
  constructor(
    @IBootstrapV5Options private options: IGlobalBootstrapV5Options
  ) {
  }

  afterAttach() {
    if (this.options.defaultSize) {
      switch (this.options.defaultSize) {
        case Size.ExtraSmall:
        case Size.Small:
          this.bsButtonTemplate.classList.add("btn-sm");
          break;
        case Size.Large:
        case Size.ExtraLarge:
          this.bsButtonTemplate.classList.add("btn-lg");
          break;
        default:
          this.bsButtonTemplate.classList.remove("btn-sm", "btn-lg");
      }
    }
  }
}
```

As you can see we are able to access to plugin options easy via `ctor` (DI) and react appropriately to its values.

In this example I get the size from the user and apply it to the button component.

* **Button Index**

Create `src/button/index.ts` file.

```js
export * from './bs-button';
```

* **Src Index**

Create `src/index.ts` file.

```js
export * from './button';
```

* **Global Index**

Create new `index.ts` file inside `bootstrap-v5` package.

```js
import 'bootstrap/dist/css/bootstrap.min.css';
export * from './src';
```

### Plugin usage

Open `demo` package and go to the `src` and update `main.ts`.

```js
import Aurelia from 'aurelia';
import { MyApp } from './my-app';

import { BootstrapV5Configuration, Size } from 'bootstrap-v5-core';
// import { BootstrapButton } from 'bootstrap-v5';
import * as BsComponents from 'bootstrap-v5';

Aurelia

  //.register(BootstrapButton)
  .register(BsComponents)

  //.register(BootstrapV5Configuration)
  .register(BootstrapV5Configuration.customize((options) => { options.defaultSize = Size.Small }))

  .app(MyApp)
  .start();
```

Importing is available for whole components

```js
import * as BsComponents from 'bootstrap-v5';
```

Or just a component

```js
import { BootstrapButton } from 'bootstrap-v5';
```

To register your components you should add them to `register` method. 

```js
.register(BsComponents) // For whole components
// Or
.register(BootstrapButton) // For a component
```

Proudly, we support configuration so we should introduce it to `register` method too.

```js
 // With default options
.register(BootstrapV5Configuration)
// Or with a custom option
.register(BootstrapV5Configuration.customize((options) => { options.defaultSize = Size.Small }))
```

Now, You are able to use your `bs-button` inside `src/my-app.html`.

```html
<div class="message">${message}</div>
<bs-button></bs-button>
```

To run the `demo` easily, go to the root folder (where `lerna.json` is) and add the following script to `package.json`.

```bash
"scripts": {
  "start": "lerna run start --stream --scope demo"
}
```

Then, call the command

```bash
npm start
```

![](/images/write-a-custom-plugin-with-aurelia-2-and-lerna/demo.png)

Enjoy!
