const fs = require("fs");
const gradient = require("gradient-string");
const chalk = require("chalk");
const readline = require("readline");
const inquirer = require("inquirer");
const cliTable = require("cli-table");
const filePath = process.argv[2];
let studentData;

function blankScreen() {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
}

function displayHomeHeader() {
  blankScreen();
  console.log("\n");
  console.log(
    gradient("#338eda", "#5bc0de").multiline(
      [
        "  ██████╗ ██████╗  ██████╗ ██╗   ██╗██████╗",
        " ██╔════╝ ██╔══██╗██╔═══██╗██║   ██║██╔══██╗   ",
        " ██║  ███╗██████╔╝██║   ██║██║   ██║██████╔╝  ",
        " ██║   ██║██╔══██╗██║   ██║██║   ██║██╔═══╝    ",
        " ╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║        ",
        "  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝        ",
        "                                                ",
        " ██████╗██████╗ ███████╗ █████╗ ████████╗ ██████╗ ██████╗ ",
        "██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗",
        "██║     ██████╔╝█████╗  ███████║   ██║   ██║   ██║██████╔╝",
        "██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║   ██║██╔══██╗",
        "╚██████╗██║  ██║███████╗██║  ██║   ██║   ╚██████╔╝██║  ██║",
        " ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝",
      ].join("\n")
    )
  );
  console.log("\n");
}

function convertCSV(path) {
  let data = fs.readFileSync(path, "utf8");

  let csvData = data.includes("\n")
    ? data.replaceAll("\r", "").split("\n")
    : data.split("\r");

  let headers = csvData[0]
    .trim()
    .split(",")
    .map((header) => header.trim());

  csvData.shift();

  product = csvData.map((record) => {
    let jsonData = {};
    record
      .split(",")
      .map((dataPoint, index) => (jsonData[headers[index]] = dataPoint.trim()));
    return jsonData;
  });

  return [product, headers];
}

function sortData(data, header, order) {
  let sorted = [];
  let unsorted = data;

  for (i in unsorted) {
    unsorted[i].letters = [];
    for (x in unsorted[i][header]) {
      unsorted[i].letters.push(
        unsorted[i][header].toUpperCase().charCodeAt(x) > 64
          ? unsorted[i][header].toUpperCase().charCodeAt(x) - 64
          : parseFloat(unsorted[i][header])
      );
    }
  }

  let current;

  let currentIndex;

  while (unsorted.length > 0) {
    for (i in unsorted) {
      if (!current) {
        current = unsorted[i];
        currentIndex = i;
      } else {
        if (order == "asc") {
          for (x in unsorted[i].letters) {
            if (!current.letters[x]) {
              break;
            } else if (unsorted[i].letters[x] < current.letters[x]) {
              current = unsorted[i];
              currentIndex = i;
              break;
            } else if (unsorted[i].letters[x] > current.letters[x]) {
              break;
            }
          }
        } else if (order == "desc") {
          for (x in unsorted[i].letters) {
            if (!current.letters[x]) {
              break;
            } else if (unsorted[i].letters[x] > current.letters[x]) {
              current = unsorted[i];
              currentIndex = i;
              break;
            } else if (unsorted[i].letters[x] < current.letters[x]) {
              break;
            }
          }
        }
      }
    }
    delete current.letters;
    sorted.push(current);
    unsorted.splice(currentIndex, 1);
    current = null;
    currentIndex = null;
  }
  return sorted;
}

function createGroups(data, size, redistributeRemainder) {
  size = data.length > size ? size : data.length;
  const amountOfGroups = (data.length - (data.length % size)) / size;
  let remainderStudents = data.length > size ? data.length % size : 0;
  let offset = 0;
  let groups = [];
  if (redistributeRemainder && remainderStudents == amountOfGroups) {
    size += 1;
    remainderStudents = 0;
  }
  for (let x = 0; x < amountOfGroups; x++) {
    let group = [];
    for (let b = 0; b < size; b++) {
      group.push(data[b + offset]);
    }
    offset += size;
    groups.push(group);
  }
  if (!redistributeRemainder && remainderStudents != 0) {
    let group = [];
    for (let b = 0; b < remainderStudents; b++) {
      group.push(data[amountOfGroups * size + b]);
    }
    groups.push(group);
  } else if (redistributeRemainder && remainderStudents != 0) {
    console.log(remainderStudents);
    for (let b = 0; b < remainderStudents; b++) {
      groups[b].push(data[amountOfGroups * size + b]);
    }
  }
  return groups;
}

function highlightText(text) {
  return chalk.inverse.bold(` ${text} `);
}

function displayGroups(groups, query) {
  blankScreen();
  console.log("\n");
  console.log(
    gradient("#338eda", "#5bc0de").multiline(
      [
        " ██████╗ ██████╗  ██████╗ ██╗   ██╗██████╗ ███████╗",
        "██╔════╝ ██╔══██╗██╔═══██╗██║   ██║██╔══██╗██╔════╝",
        "██║  ███╗██████╔╝██║   ██║██║   ██║██████╔╝███████╗",
        "██║   ██║██╔══██╗██║   ██║██║   ██║██╔═══╝ ╚════██║",
        "╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║     ███████║",
        " ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚══════╝",
      ].join("\n")
    )
  );
  console.log("\n");
  if (
    !query ||
    query == "CLEAR" ||
    !(
      (parseInt(query) && groups[parseInt(query) - 1]) ||
      query.toUpperCase().charCodeAt(0) > 64
    )
  ) {
    const table = new cliTable({
      head: groups.map((record, index) => `Group ${index + 1}`),
    });
    for (i in groups[0]) {
      table.push(
        groups.map((record, index) => (record[i] ? record[i].Name : ""))
      );
    }
    console.log(table.toString());
  } else if (query.toUpperCase().charCodeAt(0) > 64) {
    for (i in groups) {
      for (x in groups[i]) {
        if (
          groups[i][x].Name.trim().toUpperCase() == query.trim().toUpperCase()
        ) {
          console.log(`${groups[i][x].Name} is in Group ${parseInt(i) + 1} \n`);
        }
      }
    }
    const table = new cliTable({
      head: groups.map((record, index) => `Group ${index + 1}`),
    });
    for (i in groups[0]) {
      table.push(
        groups.map((record, index) =>
          record[i]
            ? record[i].Name.trim().toUpperCase() == query.trim().toUpperCase()
              ? `${highlightText(`${record[i].Name}`)}`
              : record[i].Name
            : ""
        )
      );
    }
    console.log(table.toString());
  } else if (parseInt(query) && groups[parseInt(query) - 1]) {
    const table = new cliTable({
      head: [highlightText(`Group ${query}`)].concat(
        groups.map((record, index) => `Group ${index + 1}`)
      ),
    });
    for (i in groups[0]) {
      table.push(
        [
          groups[parseInt(query) - 1][i]
            ? highlightText(groups[parseInt(query) - 1][i].Name)
            : "",
        ].concat(
          groups.map((record, index) => (record[i] ? record[i].Name : ""))
        )
      );
    }
    console.log(table.toString());
  }
  console.log("\n");
  inquirer
    .prompt([
      {
        name: "query",
        message: "Search (type CLEAR to clear query):",
      },
    ])
    .then((answers) => {
      displayGroups(groups, answers.query);
    });
}

function askIntroQuestions() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "sortingHeader",
        message: `Thank you for importing ${highlightText(
          filePath
        )}, what would you like to do? \n`,
        choices: headers,
      },
      {
        type: "list",
        name: "reminderHandling",
        message: `What would you like me to do with the reminder? \n`,
        choices: ["Redistribute them", "Make a separate group"],
      },
      {
        name: "number",
        message: "How many students would you like per group?",
      },
    ])
    .then((answers) => {
      studentData = sortData(studentData, answers.sortingHeader, "asc");
      if (!parseInt(answers.number)) {
        console.log("\n Error! We couldn't recognize that number. Let's start again. \n")
        askIntroQuestions()
      } else {
        let groups = createGroups(
          studentData,
          parseInt(answers.number),
          answers.reminderHandling == "Redistribute them" ? true : false
        );
        displayGroups(groups);
      }
    });
}

[studentData, headers] = convertCSV(filePath);
displayHomeHeader();
askIntroQuestions();