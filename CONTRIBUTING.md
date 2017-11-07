# Contributing to the repo

The following is a set of guidelines to submit your changes to the repo.

## Prepare your environment

### Install Node and NPM

> We recommend NVM as a node installer: https://github.com/creationix/nvm

Find below the default versions this repo was built with:
* Node: `v8.6.0`
* NPM: `v3.10.10`
* Chrome: `v62`

### Install the project

```sh
$ cd path/to/your/projects
$ git clone git@github.com:we-learn-js/js-training-practice.git
$ cd js-training-practice
$ npm install
```

## Submit a PR


### Checkout the destination branch

Every week, a new branch will be created as destination branch for your changes.

```sh
$ git checkout -b {destination-branch}
$ git checkout -b refactor/functions
```

### Create a branch

```sh
$ git checkout -b {destination-branch}-{gh-username}
$ git checkout -b refactor/functions-davidbarna
```

### Make your changes

```sh
$ npm run dev
```

A browser opens with the project, and will be reloaded on every change of the `/src` folder.

### Execute the tests to verify integrity of the app

`npm run test` will execute end-to-end tests will the following ouput:

```
Quiz
  when it's displayed
    ✓ should display the title from config (64ms)
    ✓ should SET progress bar (42ms)
    ✓ should only the display the first question (133ms)
    ✓ should display description of the question (44ms)
  when a question is not answered
    ✓ should display an alert and maintain question
  when a question is answered
    ✓ should display the next question (44ms)
    ✓ should update progress bar
  when the page is refeshed and a question has been answered
    ✓ should display the last non answered question (61ms)
  when reset is pressed
    ✓ should return to first question (60ms)
```

If some test fails, we can work on the fix with the `npm run test:dev` command.

### Push your changes

```sh
$ git push origin HEAD
```
:warning: The tests will be executed automatically before any push to the repo.

### Submit a pull request

Make sure you set {destination-branch} as destination branch of your PR.
