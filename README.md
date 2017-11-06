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

**This code is not meant to be well done, but meant to be refactored**. This way, you can refactor progressively fixing the main mistakes of the code.

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
>
> The tests were run successfully with Chrome v62

### `npm run test:dev`

Executes end-to-end tests on watch mode. Tests will be reexecuted every time.

### `npm reset`

Safely reinstalls the project.


## Refactor phases

### 1. Operators And Closures

[![branch-icon] refactor/operators-closures](https://github.com/we-learn-js/js-training-practice/tree/refactor/operators-closures)

* Change scopes of variables from global scope to local scope.
* Declare variables with `let`, `const` or `var`.
* Use destructuring when possible.
* Use operator expressions for conditionals and value assignment.

### 2. Strings

[![branch-icon] refactor/strings](https://github.com/we-learn-js/js-training-practice/tree/refactor/strings)

* Convert strings to template strings.

[branch-icon]: ./.github/images/git-branch.png
