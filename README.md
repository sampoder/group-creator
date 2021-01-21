# Group Creator

There are two files in here `index.js` & `clean.js`. 

`index.js` contains a program that uses a few external dependencies to make the displays. `cli-table` is used to create a table. `chalk` to display coloured text in the terminal. `inquirer` is used to handle user input. Lastly, `gradient-string` is used to display coloured gradients in the terminal.

Before running `index.js` please run `yarn` or `npm install` to install the dependencies.

It can then be ran by running `node index.js [FILEPATH]`

`clean.js` contains a program that uses no external dependencies. It only imports `fs` and `readline` which are built into Node.js.

It can then be ran by running `node clean.js [FILEPATH] [HEADER TO SORT BY] [ORDER TO SORT BY: asc/desc] [REMINDER HANDLING: redistribute/separate] [AMOUNT OF PEOPLE PER GROUP]`

---

Created by Sam Poder for the NLCS Scholarship Program's Computer Science test.