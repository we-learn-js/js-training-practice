# JS Training: The Quiz Project


## What is it ?

The quiz is a simple quiz built on client from a [json file](https://github.com/we-learn-js/js-training-practice/blob/master/src/data/quiz.json).

The has a simple schema:

| Property | Definition |
| -- | -- |
| `title:String` | Title of the quiz |
| `questions:Array<Object>` | Config of questions |
| `questions[]:Object` | |
| `questions[].problem:String` | Question's title|
| `questions[].input:Object` | Field to display |
| `questions[].input.type:String` | 'radio', 'checkbox', 'inputs' or 'input' (default) |
| `questions[].input.options:Array` | labels of the options (only for 'radio', 'checkbox' or 'inputs') |

## Why?

It's a project to practice acquired knowledge in [JS Training Course](https://github.com/we-learn-js/js-training) refactoring this code.

**This code is damned bad**, but it was meant to be. This way, you can refactor progressively fixing the main mistakes of the code.

## How?

Please read the [contributing guidelines](./CONTRIBUTING.md)

## Commands

### `npm run dev`

Runs the project on watch mode.

### `npm run test`

Executes end-to-end tests on the app to check your change haven't broken anything.

> :warning: **Caution!** :warning:
>
> Tests are run with selenium and require to have Java JDK installed: http://www.oracle.com/technetwork/java/javase/downloads/index.html.

### `npm run test:dev`

Executes end-to-end tests on watch mode. Tests will be reexecuted every time.

### `npm reset`

Safely reinstalls the project.


**Once you're done, create a pull request**

Assign [davidbarna](https://github.com/davidbarna)

on push tests will be automatically executed
