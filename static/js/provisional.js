const branch = {
  Civil: "Civil Engineering",
  Computer: "Computer Engineering",
  ECE: "Electronics and Communication Engineering",
  Electrical: "Electrical Engineering",
  FAA: "Finance Audit and Accounting",
  FD: "Fashion Design",
  FT: "Fashion Technology",
  IC: "Instrumentation and Control",
  Mechanical: "Mechanical Engineering",
  "Med Eltx": "Medical Electronics",
  TD: "Textile Design",
  TP: "Textile Processing",
  TT: "Textile Technology",
};
const Semester = {
  "Semester : 1": 1,
  "Semester : 2": 2,
  "Semester : 3": 3,
  "Semester : 4": 4,
  "Semester : 5": 5,
  "Semester : 6": 6,
};
window.onload = async function () {
  const data = JSON.parse(localStorage.getItem("data"));
  console.log(data);
  await produce_provisional(data);
  await update_table(data[1]);
};

async function produce_provisional(params) {
  // console.log(params[5].split("-")[-1]);
  document.getElementsByClassName("roll-no")[0].textContent = params[0][0];
  document.getElementsByClassName("student-name")[0].textContent = params[0][1];
  document.getElementsByClassName("father-name")[0].textContent = params[0][2];
  document.getElementsByClassName("mother-name")[0].textContent = params[0][3];
  document.getElementsByClassName("branch-name")[0].textContent =
    branch[params[0][4]];
  document.getElementsByClassName("passing-year")[0].textContent = params[0][5];
  document.getElementsByClassName("start-year")[0].textContent = params[1]
    .at(-1)[5]
    .split("/")
    .at(-1);
  document.getElementsByClassName("end-year")[0].textContent = params[0][5]
    .split("-")
    .at(-1);
}
async function divsion_calculator(params) {
  if (params > 80) {
    return "First";
  } else if (params > 70) {
    return "Second";
  } else if (params > 65) {
    return "Third";
  }
}
async function update_table(params) {
  // console.log(params);
  const tbody = document.getElementsByClassName("details")[0].firstElementChild;
  const rows = tbody.children;
  // k = 0;
  let col = 6;
  let total_marks = 0;
  let max_marks = 0;
  for (let j = 0; j < params.length; j++) {
    // console.log(params[j][3]);
    if (Semester[params[j][6]] && params[j][3] != "Re-Appear") {
      const key = Number(Semester[params[j][6]]);
      total_marks += Number(params[j][3]);
      max_marks += Number(params[j].at(-1));
      console.log(key);
      if (rows[1].children[1].textContent == "LATERAL ENTRY") {
        console.log("YES");
        r1 = key - 1;
        r2 = key - 2;
        r3 = key - 2;
        c1 = col;
        c2 = col - 1;
        c3 = col + 1;
        c4 = col + 2;
        console.log(params[j][3]);
        console.log(rows[1].children[key]);
        // key =
      } else {
        r1 = key;
        r2 = key;
        r3 = key;
        c1 = col + 1;
        c2 = col + 1;
        c3 = col + 2;
        c4 = col + 3;
      }
      rows[1].children[r1].textContent = params[j][3];
      rows[2].children[r2].textContent = params[j].at(-1);
      rows[3].children[r3].textContent = params[j][5]
        .split("/")
        .slice(-2)
        .join("-");
    }
  }
  rows[1].children[c1].textContent = total_marks;
  rows[2].children[c2].textContent = max_marks;
  const percentage = ((total_marks / max_marks) * 100).toFixed(2);

  rows[1].children[c3].textContent = percentage;
  const div = await divsion_calculator(percentage);
  rows[1].children[c4].textContent = div;
  document.getElementsByClassName("obtained-marks")[0].textContent =
    total_marks;
  document.getElementsByClassName("total-marks")[0].textContent = max_marks;
  document.getElementsByClassName("division")[0].textContent = div;

  // console.log(total_marks, max_marks);
  // } elseif (i==2) {
  //   rows[i].children[j + 1].textContent = params[j];}

  // const element = rows[i][j];
  // console.log(rows[i].children[j].textContent);
}
// break;
