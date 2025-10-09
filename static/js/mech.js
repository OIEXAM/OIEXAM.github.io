let csvData = [];
let dataLoaded = false;
window.onload = async function () {
  await loadCSVData();
  // console.log(csvData);
};

// function to loadcsv data
async function loadCSVData(forceReload = false) {
  const fil = document.querySelector(".selected").innerText;
  const url = "./Results/" + fil + "/index.json";
  const response = await fetch(url);
  // console.log(response.ok);
  if (!response.ok) {
    throw new Error("File not found");
  }
  const file_list = await response.json();
  // console.log(file_list.Files);
  if (dataLoaded && !forceReload) {
    return csvData;
  }

  console.log("Loading Csv...");
  const promises = file_list.Files.map(
    (file) =>
      new Promise((resolve, reject) => {
        Papa.parse(file, {
          download: true,
          header: false, // Since your file has irregular/multi-line headers
          skipEmptyLines: true,
          complete: (result) => {
            dataLoaded = true;
            console.log("CSV loaded: ");
            resolve(result.data);
          },
          error: (err) => {
            console.error("Error Loading CSV");
            reject(err);
          },
        });
      })
  );
  const allResults = await Promise.all(promises);
  csvData = allResults.flat();
}

// function to select the branch
async function branch_select(e) {
  console.log(e);
  e.preventDefault;
  const selected = document.querySelector(".selected");
  const dropdown = document.getElementsByClassName("dropdown")[0];
  selected.innerText = e.textContent;
  dropdown.classList.toggle("clicked");
  dropdown.querySelector("ul").scrollTop = 0;
  await loadCSVData(true);
  console.log("Branch Selected", e.textContent);
  console.log(csvData);
}
const dropdown = document.getElementsByClassName("dropdown")[0];
dropdown.addEventListener("mouseleave", () => {
  if (dropdown.classList.contains("clicked")) {
    dropdown.classList.remove("clicked");
  }
});

function showresult(evt) {
  delete_table();
  // console.log(evt);
  const rollno = evt.target.previousElementSibling;
  if (rollno.value.length < 7) {
    rollno.focus();
  } else {
    create_data(rollno.value);
  }
}

function create_data(value) {
  let final_result = [];
  // console.log(value);
  // console.log(data_file);
  if (csvData.length > 0) {
    csvData.forEach((row) => {
      // console.log(csvData.indexOf(row));
      for (const cell of row) {
        if (cell.includes("Notification No.")) {
          Not_No = cell;
          indx = csvData.indexOf(row);
          // console.log("Branch cell", cell);
        }
        if (cell.includes("Semester")) {
          semester = cell;
          // console.log(csvData.indexOf(row));
        }
        if (cell === value) {
          // console.log("Inside the cell");
          // console.log("Inside roll No", indx);
          // console.log(csvData.indexOf(row));
          const f = row.slice(1, 3).concat(row.slice(-3));
          f.push(Not_No, semester);
          final_result.push(f);
          // console.log(row);
          return;
        }
      }
    });
  }
  // console.log(final_result);
  // delete_table();
  final_result.sort((a, b) => {
    const dateA = parseNotificationDate(a[5]);
    const dateB = parseNotificationDate(b[5]);
    return dateB - dateA; // ascending order
  });
  header = [
    "Roll No",
    "Name Father Name Mother Name",
    "Sessional Marks",
    "Total Marks",
    "Result",
    "Exam Year",
    "Semester",
  ];
  final_result.unshift(header);
  for (const j of final_result) {
    if (final_result.length > 1) {
      create_table(j);
    }
  }
}
function parseNotificationDate(notificationStr) {
  const match = notificationStr.match(/(\w{3})\/(\d{4})/); // e.g. "Dec/2024"
  if (!match) return new Date(0); // fallback
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthIndex = monthNames.indexOf(match[1]);
  const year = parseInt(match[2]);
  return new Date(year, monthIndex);
}
// function to create the table of a student for the input roll no
function create_table(obj) {
  // console.log(obj);
  const tbl =
    document.getElementsByClassName("table_container")[0].lastElementChild;
  const p_ele =
    document.getElementsByClassName("table_container")[0].firstElementChild;

  // check if body is present in table
  if (tbl.childElementCount == 2) {
    if (tbl.classList.contains("hide")) {
      tbl.classList.toggle("hide");
    }
    // select body of table if present
    tbd = tbl.children[1];
  } else {
    // create body of table if not there
    tbd = document.createElement("tbody");
    tbl.classList.toggle("hide");
  }
  if (tbd.childElementCount == 0) {
    p_ele.innerHTML = "Final Result";
  } else {
    p_ele.innerHTML = "Final Results";
  }
  const tr = document.createElement("tr");
  // loop to create cells in row of table
  for (let j of obj) {
    const td = document.createElement("td");
    td.appendChild(document.createTextNode(j));
    tr.appendChild(td);
  }
  // appendrow to tbody
  tbd.appendChild(tr);
  // appendbody to table
  tbl.appendChild(tbd);
}

// function to delete table data if there
function delete_table() {
  const tbl =
    document.getElementsByClassName("table_container")[0].lastElementChild;
  const p_ele =
    document.getElementsByClassName("table_container")[0].firstElementChild;
  if (tbl.childElementCount >= 2) {
    tr = tbl.children[1];
    while (tr.hasChildNodes()) {
      tr.removeChild(tr.firstChild);
    }
    p_ele.innerHTML = "No result Found";
  }
  if (tbl.previousElementSibling.classList.contains("hide")) {
    tbl.previousElementSibling.classList.remove("hide");
    tbl.classList.add("hide");
  }
}

// show resutls function
