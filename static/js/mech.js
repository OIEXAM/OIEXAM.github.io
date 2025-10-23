let csvData = [];
let dataLoaded = false;
let prov_data;
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

  console.log("Loading data...");
  const promises = file_list.Files.map(
    (file) =>
      new Promise((resolve, reject) => {
        Papa.parse(file, {
          download: true,
          header: false, // Since your file has irregular/multi-line headers
          skipEmptyLines: true,
          complete: (result) => {
            dataLoaded = true;
            // console.log("Data loaded: ");
            resolve(result.data);
          },
          error: (err) => {
            console.error("Error Loading data");
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
  // console.log(e);
  e.preventDefault;
  const selected = document.querySelector(".selected");
  const dropdown = document.getElementsByClassName("dropdown")[0];
  selected.innerText = e.textContent;
  dropdown.classList.toggle("clicked");
  dropdown.querySelector("ul").scrollTop = 0;
  await loadCSVData(true);
  // console.log("Branch Selected", e.textContent);
  // console.log(csvData);
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
  // console.log(csvData);
  // console.log(data_file);
  if (csvData.length > 0) {
    csvData.forEach((row) => {
      // console.log(csvData.indexOf(row));
      for (const cell of row) {
        if (cell.includes("Max Marks")) {
          Max_marks = row.at(-2);
          // console.log(row);
          // console.log(csvData.indexOf(row));
        }
        if (cell.includes("Notification No.")) {
          Not_No = cell;
          // console.log("Branch cell", cell);
        }
        if (cell.includes("Semester")) {
          semester = cell;
          // console.log(csvData.indexOf(row));
        }
        if (cell === value) {
          const f = row.slice(1, 3).concat(row.slice(-3));
          if (f[3].split("/").length > 1) {
            Max_marks = f[3].split("/")[1];
          }
          // console.log(f[3].split("/"));
          f.push(Not_No, semester, Max_marks);
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
  prov_data = [...final_result].filter((rows) => {
    return !rows.includes("Re-Appear");
  });
  header = [
    "Roll No",
    "Name Father Name Mother Name",
    "Sessional Marks",
    "Total Marks",
    "Result",
    "Exam Year",
    "Semester",
    "Max_marks",
  ];

  // console.log(Number(prov_data[0][4]));
  final_result.unshift(header);
  console.log([...final_result], "yes");
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
function hide_provisional_window(e) {
  const close_btn_label = document
    .querySelectorAll(".close_btn")[0]
    .querySelectorAll('input[type="checkbox');
  close_btn_label.forEach((btn) => {
    if (btn.checked) {
      btn.checked = false;
    }
    if (btn.disabled) {
      btn.disabled = false;
    }
  });
  e.preventDefault;
  const popup = document.getElementsByClassName("provisional_input")[0];
  if (!popup.classList.contains("hide")) {
    popup.classList.add("hide");
  }
  // console.log(e);
}
function prov_input(params) {
  const popup = document.getElementsByClassName("provisional_input")[0];
  if (popup.classList.contains("hide")) {
    popup.classList.remove("hide");
  }
  delete_inputs();
  const names = document.querySelectorAll(".name");
  names.forEach((name) => {
    for (let i = 0; i < params.length; i++) {
      const element = document.getElementsByClassName("provisional_input")[0];
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.setAttribute("name", params[i]);
      input.value = params[i] + i;
      label.appendChild(input);
      label.appendChild(document.createTextNode(params[i]));
      name.appendChild(label);
    }
  });
}
function delete_inputs() {
  const names = document.querySelectorAll(".name");
  names.forEach((name) => {
    // console.log(name.childElementCount);
    if (name.childElementCount > 1) {
      while (name.childElementCount > 1) {
        name.removeChild(name.children[1]);
      }
    }
  });
}
function open_popup(e) {
  e.preventDefault;
  if (prov_data) {
    prov_input(prov_data[0][1].split(" "));
  }
}
// toggle names in popup window
function name_changer(param1, param2) {
  param2.forEach((label) => {
    // console.log(label);
    if (label.value === param1.target.value) {
      if (label.checked) {
        label.checked = false;
        // console.log(param1);
      }
      label.disabled = param1.target.checked;
    }
  });
}
const close_btn_label = document
  .querySelectorAll(".close_btn")[0]
  .querySelectorAll('input[type="checkbox');
close_btn_label[0].addEventListener("change", (event) => {
  close_btn_label[1].disabled = event.target.checked;
});
close_btn_label[1].addEventListener("change", (event) => {
  close_btn_label[0].disabled = event.target.checked;
});
const names = document.querySelectorAll(".name");
names[0].addEventListener("change", (event) => {
  // console.log(event.target.checked);
  const labels2 = names[1].querySelectorAll('input[type="checkbox');
  const labels3 = names[2].querySelectorAll('input[type="checkbox');
  name_changer(event, labels2);
  name_changer(event, labels3);
});
names[1].addEventListener("change", (event) => {
  const labels3 = names[2].querySelectorAll('input[type="checkbox');
  name_changer(event, labels3);
});
// names.forEach((name) => {
//   name.addEventListener("change", (event) => {
//     console.log(event.target);
//   });
// });
function openNewpage() {
  const names = document.querySelectorAll(".name");
  const close_btn_label = document
    .querySelectorAll(".close_btn")[0]
    .querySelectorAll('input[type="checkbox');
  close_btn_label.forEach((btn) => {
    if (btn.checked) {
      course = btn.name;
    }
  });
  let data = [];
  data.push(prov_data[0][0]);
  names.forEach((name) => {
    const labels = name.querySelectorAll('input[type="checkbox');
    let namee = "";
    labels.forEach((label) => {
      if (label.checked) {
        namee += label.name + " ";
      }
    });
    data.push(namee.trim());
    // console.log(namee);
  });
  const fil = document.querySelector(".selected").innerText;
  const last_pass_year = prov_data[0][5].split("/").slice(-2);
  data.push(fil, last_pass_year.join("-"));
  localStorage.setItem("data", JSON.stringify([data, prov_data]));
  if (course == "DET") {
    if (prov_data.length == 6) {
      window.open("/static/pages/Det_provisional.html", "_blank");
    }
  } else {
    if (prov_data.length == 4) {
      window.open("/static/pages/Detl_provisional.html", "_blank");
    }
  }
}
// show resutls function
