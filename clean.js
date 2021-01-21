// Import modules used for the program.

const fs = require("fs"); // Used to read files
const readline = require("readline"); // Used to clear the display and handle user input

// Define critical variables

const filePath = process.argv[2]; // Reads file path passed through arguments
const sortingHeader = process.argv[3]; // Reads header to sort by passed through arguments
const ascDesc = process.argv[4]; // Defines whether we should use ascending or descending order through arguments
const reminderHandling = process.argv[5]; // Defines method of reminder handling through arguments
const number = process.argv[6]; // Amount of people per group passed through arguments
let studentData; // Mutable variable we'll use later
let headers; // Mutable variable we'll use later

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
}); // Creates a readline instance for us to use later on

function blankScreen() {
  // Function that we'll use to show simply a blank screen
  readline.cursorTo(process.stdout, 0, 0); // Moves the user cursor to 0,0
  readline.clearScreenDown(process.stdout); // Clears the screen and make it blank
}

function displayHomeHeader() {
  // Function that will print the header for the program
  blankScreen(); // Calls out blank screen function
  console.log("\n"); // Prints one new line for padding
  console.log(
    gradient("#338eda", "#5bc0de").multiline(
      // Creates a multiline gradient based on the string
      [
        "  ██████╗ ██████╗  ██████╗ ██╗   ██╗██████╗",
        " ██╔════╝ ██╔══██╗██╔═══██╗██║   ██║██╔══██╗   ",
        " ██║  ███╗██████╔╝██║   ██║██║   ██║██████╔╝  ",
        " ██║   ██║██╔══██╗██║   ██║██║   ██║██╔═══╝    ", // ASCII text used to make big text that stands out
        " ╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║        ",
        "  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝        ",
        "                                                ",
        " ██████╗██████╗ ███████╗ █████╗ ████████╗ ██████╗ ██████╗ ",
        "██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗",
        "██║     ██████╔╝█████╗  ███████║   ██║   ██║   ██║██████╔╝",
        "██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║   ██║██╔══██╗",
        "╚██████╗██║  ██║███████╗██║  ██║   ██║   ╚██████╔╝██║  ██║",
        " ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝",
      ].join("\n") // Joins this array of strings into one massive string
    )
  );
  console.log("\n"); // Prints one new line for padding
}

function convertCSV(path) {
  // A function that takes in the path to a CSV file and convert it to JSON
  let data = fs.readFileSync(path, "utf8"); // Uses the fs module to get the text data of the csv in the utf8 format

  let csvData = data.includes("\n") // Line that checks if the file uses \n for new lines
    ? data.replaceAll("\r", "").split("\n") // Some files use both. It replaces \r with nothing to fix this. It then splits by \n as in a CSV a new record is designated by a new line.
    : data.split("\r"); // Does the same as the above line, just for files that use \r

  let headers = csvData[0] // In a csv file the first record are the headers.
    .trim() // Remove any outer whitespace to clean up the final display
    .split(",") // Split by the comma which is used in a csv to designate separate fields
    .map((header) => header.trim()); // This then trims each field name to remove any outer whitespace that a field may have. (The above function only does the line in the file, this does each field)

  csvData.shift(); // Removes the first record in the array. Which is out headers that have now been separated.

  product = csvData.map((record) => {
    // This map function then goes through each record in the array and then modifies it based on the below code
    let jsonData = {}; // Creates an empty JSON object we'll be using below
    record
      .split(",") // Split by the comma which is used in a csv to designate separate fields
      .map((dataPoint, index) => (jsonData[headers[index]] = dataPoint.trim())); // Use map again but this time instead to run the code inside of it for each record of the array. Here it's using the index to find the appropriate header and then set that in the JSON object.
    return jsonData; // Return that new JSON data, that'll be what the record will now be
  });

  return [product, headers]; // Return an array with what we have just created
}

function sortData(data, header, order) {
  // This function will take an array of JSON data, a header to sort by and then the order to sort by
  let sorted = []; // Create an empty array
  let unsorted = data; // Set out unsorted array as the incoming data

  for (i in unsorted) {
    // Look through each record in the unsorted array. This block of code will help as with sorting by adding extra data to our array.
    unsorted[i].letters = []; // Create an empty array at letters in each JSON object
    for (x in unsorted[i][header]) {
      // Loop through every letter in the string attached to the JSON object for the specified header
      unsorted[i].letters.push(
        // Push to the array of letters we created
        unsorted[i][header].toUpperCase().charCodeAt(x) > 64 // This checks if the letter is a part of the alphabet or a number through ASCII codes.
          ? unsorted[i][header].toUpperCase().charCodeAt(x) - 64 // This turns a letter into it's alphabet position using it's ASCII code. For example A has a code of 065 and now becomes 1.
          : parseFloat(unsorted[i][header]) // To allow for sorting by custom headers this is a fallback for numbers
      );
    }
  }

  let current; // This variable will hold the JSON object of the current lowest / biggest

  let currentIndex; // This variable holds the index of the current lowest

  while (unsorted.length > 0) {
    // Loops until no more records are unsorted
    for (i in unsorted) {
      // Loops through each record in unsorted
      if (!current) {
        // Checks if there isn't currently a smallest / biggest
        current = unsorted[i]; // If there isn't make this record the smallest / biggest so far
        currentIndex = i;
      } else {
        if (order == "asc") {
          // Check if the order is ascending
          for (x in unsorted[i].letters) {
            // Loops through each objects letter code we stored
            if (!current.letters[x]) {
              // If current smallest doesn't have this letter break the for loop. This is because Sam comes before Samuel for example.
              break; // Breaks for loop.
            } else if (unsorted[i].letters[x] < current.letters[x]) {
              // If the number value of the unsorted record is smaller run the block
              current = unsorted[i]; // Switch smallest record so far
              currentIndex = i;
              break; // Breaks the for loop as we're now done.
            } else if (unsorted[i].letters[x] > current.letters[x]) {
              // If the number value of the current record is smaller run the block
              break; // Breaks the for loop as we're now done.
            }
          }
        } else if (order == "desc") {
          // Check if the order is descending
          for (x in unsorted[i].letters) {
            // Loops through each objects letter code we stored
            if (!current.letters[x]) {
              // If current biggest doesn't have this letter break the for loop. This is because Sam comes before Samuel for example.
              break; // Breaks for loop.
            } else if (unsorted[i].letters[x] > current.letters[x]) {
              // If the number value of the unsorted record is larger run the block
              current = unsorted[i]; // Switch biggest record so far
              currentIndex = i;
              break; // Breaks the for loop as we're now done.
            } else if (unsorted[i].letters[x] < current.letters[x]) {
              // If the number value of the current record is larger run the block
              break; // Breaks the for loop as we're now done.
            }
          }
        }
      }
    }
    delete current.letters; // Remove the letters from the smallest / biggest record identified for a clean out put
    sorted.push(current); // Place the smallest / biggest record in the sorted array
    unsorted.splice(currentIndex, 1); // Remove the smallest / biggest record from the unsorted array
    current = null; // Set these two as undefined to support the next run of this while loop
    currentIndex = null;
  }
  return sorted; // Return the final sorted array!
}

function createGroups(data, size, redistributeRemainder) {
  // Takes in the sorted JSON array, the group size and how to handle remaining students
  size = data.length > size ? size : data.length; // If the group size is greater then the amount of people provided, make one big group instead
  const amountOfGroups = (data.length - (data.length % size)) / size; // Calculate the amount of groups to be used.
  let remainderStudents = data.length > size ? data.length % size : 0; // Calculate the students remaining
  let offset = 0; // To be used as an offset below
  let groups = []; // An empty array to store our groups
  size += redistributeRemainder ? 1 : 0; // If the user wants us to redistribute the remaining students, make the groups bigger by one person. This acts as a potential size in the program.

  for (let x = 0; x < amountOfGroups; x++) {
    // Loop for each group that should be made
    let group = []; // Create an empty array for our group
    for (let b = 0; b < size && data[b + offset]; b++) {
      // Loop for each group member that should be added + whilst that group member is defined
      group.push(data[b + offset]); // Push the group member to the array
    }
    offset += group.length; // Increase our offset by the size of the group
    groups.push(group); // Add this group to the array of groups
  }
  if (!redistributeRemainder && remainderStudents != 0) {
    // If the user choose for us to create a separate group for remainder students + that there are reminder students, run this code
    let group = []; // Create an empty array for this group
    for (let b = 0; b < remainderStudents; b++) {
      // Loop through each remainder student
      group.push(data[amountOfGroups * size + b]); // Add these students to the group
    }
    groups.push(group); // Add this group to the array of groups
  }
  return groups; // Return an array of groups
}

function displayGroups(groups, query) {
  // This function will both display groups, but also tailor that display to any specific query provided.
  blankScreen(); // Print a blank screen
  console.log("\n"); // New line provided for padding
  console.log(
    [
      " ██████╗ ██████╗  ██████╗ ██╗   ██╗██████╗ ███████╗",
      "██╔════╝ ██╔══██╗██╔═══██╗██║   ██║██╔══██╗██╔════╝",
      "██║  ███╗██████╔╝██║   ██║██║   ██║██████╔╝███████╗",
      "██║   ██║██╔══██╗██║   ██║██║   ██║██╔═══╝ ╚════██║",
      "╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║     ███████║",
      " ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚══════╝",
    ].join("\n") // Joins this array of strings into one massive string
  );
  console.log("\n"); // Print a new line for padding
  if (
    !query || // if there is no query
    query == "CLEAR" || // or the query is to CLEAR previous query
    !(
      (parseInt(query) && groups[parseInt(query) - 1]) ||
      query.toUpperCase().charCodeAt(0) > 64
    ) // Or the query target can't be found
  ) {
    console.log(
      groups
        .map(
          (record, index) =>
            `Group ${index + 1}${Array(16 - `Group ${index + 1}`.length).join(
              // using the length of the string make sure all headers are uniform size
              " "
            )}` // for each group print out a column header
        )
        .join("") // join together all these strings for printing
    );

    for (i in groups[0]) {
      // loop through by the amount of members in group 1, which has to have the max amount
      let string = groups
        .map(
          (record, index) =>
            record[i]
              ? `${record[i].Name}${Array(16 - record[i].Name.length).join(
                  " "
                )}`
              : "" // add the person record of i, if it's not defined add a blank cell
        )
        .join(""); // join all the strings together
      console.log(string);
    }
  } else if (query.toUpperCase().charCodeAt(0) > 64) {
    // This checks if it's a query consisting of letters and therefore searching for a student
    for (i in groups) {
      // loop through each group
      for (x in groups[i]) {
        // loop through group member
        if (
          groups[i][x].Name.trim().toUpperCase() == query.trim().toUpperCase() // check if this group member is the one searched for
        ) {
          console.log(`${groups[i][x].Name} is in Group ${parseInt(i) + 1} \n`); // if so output which group they're in
        }
      }
    }
  } else if (parseInt(query) && groups[parseInt(query) - 1]) {
    // check if the query is a number and therefore looking for a group
    console.log(`Group ${query}:`);
    for (i in groups[parseInt(query) - 1]) {
      // loop through each member of that group
      console.log(groups[parseInt(query) - 1][i].Name); // print their name
    }
  }
  console.log("\n");
  rl.question("Search (type CLEAR to clear query): ", function (answer) {
    // allow user input of a search query
    displayGroups(groups, answer); // display groups based on the answer
  });
}

function beginSort() {
  if (
    !parseInt(number) ||
    !filePath ||
    !filePath.includes(".csv") ||
    !headers.includes(sortingHeader)
  ) {
    console.log(
      "\n Error! Invalid arguments. Let's start again. \n" // Check for invalid arguments and alert the user
    );
  } else {
    studentData = sortData(studentData, sortingHeader, ascDesc); // sort the data using our function
    let groups = createGroups(
      // create our groups using our function
      studentData,
      parseInt(number),
      reminderHandling == "redistribute" ? true : false
    );
    displayGroups(groups); // display our groups
  }
}

if (!process.argv[2] || !process.argv[2].includes(".csv")) {
  // Check the required argument has been provided
  console.log("No CSV file passed in arguments. Please pass a .csv file.");
} else {
  [studentData, headers] = convertCSV(filePath); // collect both student data and the headers used
  beginSort();
}
