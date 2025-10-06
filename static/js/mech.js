window.onload = function () {
  console.log("laoded");
  fetch_file();
};
// Select the branch on click
let data_file = [];

// function to select the branch
function branch_select(e) {
  console.log(e);
  e.preventDefault;
  const selected = document.querySelector(".selected");
  selected.innerText = e.textContent;
  fetch_file();
}

// function to create the table of a student for the input roll no
function create_table(obj) {
  console.log(obj);
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
    console.log(j);
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
  if (tbl.childElementCount == 2) {
    tr = tbl.children[1];
    console.log(tr);
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

function create_data(value) {
  let final_result = [];
  console.log(value);
  console.log(data_file);
  if (data_file.length > 0) {
    data_file.forEach((element) => {
      let f = read_data(element, value);
      if (f.length > 0) {
        if (final_result.length == 0) {
          final_result.push(f); // store if not empty
        } else if (f.length > 1) {
          // console.log(f);
          // console.log(f.slice(1));
          final_result.push(f.slice(1));
        }
      }
      // break;                 // stop loop if you want first match
    });
  }
  console.log(final_result);
  if (final_result.length > 1) {
    for (const result of final_result) {
      console.log(result);
      create_table(result[0]);
    }
  }
}

// show resutls function
function showresult(evt) {
  delete_table();
  const rollno = evt.target.previousElementSibling;
  if (rollno.value == "" || rollno.value.length < 12) {
    rollno.focus();
  } else {
    create_data(rollno.value);
  }
}

// file fetch function
function fetch_file() {
  const fil = document.querySelector(".selected").innerText;
  const url = "./Results/" + fil;
  fetch(url + "/index.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error("File not found");
      }
      return res.json();
    })
    .then((file) => {
      console.log(file.Files);
      read_file(file.Files);
    })
    .catch((error) => {
      console.error("Error Fetching", error);
    });
}

// file read function
function read_file(input) {
  for (const input_file of input) {
    Papa.parse(input_file, {
      header: false, // Since your file has irregular/multi-line headers
      download: true,
      skipEmptyLines: true,
      // newline: "\n", // Let PapaParse auto-detect newlines
      complete: function (results) {
        data_file.push(results.data);
      },
      error: function (error) {
        console.error("Error parsing CSV:", error);
      },
    });
  }
}

// function to read data for specific roll no.
function read_data(data, value) {
  let dat = [];
  data.forEach((element) => {
    let count = 0;
    console.log(element);
    for (let row of element) {
      console.log(row);
      if (row == "S.No.") {
        const val = element.slice(0, 3).concat(element.slice(-3));
        val.unshift("Exam_Year");
        // console.log(val);
        dat.push(val);
        console.log(element.slice(0, 3).concat(element.slice(-3)));
        break;
      } else if (row === value) {
        const val = element.slice(0, 3).concat(element.slice(-3));
        const year = data[1][0].split(":");
        val.unshift(year[1]);
        // console.log(val);
        dat.push(val);
        console.log(dat);
        break;
      } else if (count === 5) {
        break;
      } else {
        count = count + 1;
      }
    }
  });
  return dat;
}
