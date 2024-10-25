async function getDirectory(dirname,roll) {
  let response = await fetch(dirname);
  let str = await response.text();
  let el = document.createElement('html');
  el.innerHTML = str;
  let list = el.getElementsByTagName("ul")[0].getElementsByTagName("a");
  let arr = [];
  for (i = 0; i < list.length; i++) {
    arr[i] = list[i].href;
  }
  arr.shift(); // get rid of first result which is the "../" directory reference
  // console.log(arr); // this is your list of files (or directories ending in "/")
  for (const file of arr) {
    const roll_no = roll
    await getItems(file, roll_no);
  }
}
async function getItems(src, roll_no) {
  const doc = await pdfjsLib.getDocument(src).promise
  let cand_marks = {};
  let main_header = {};
  let sem = [];
  let pages = [];
  for (page_num = 1; page_num <= doc.numPages; page_num++) {
    const page = await doc.getPage(page_num)
    const content = await page.getTextContent()
    const items = content.items
    // console.log(items)
    if (items.length < 10) {
      continue
    }
    let single_page_Arr = []; // single page content
    var initial_value = '';
    var final_value = '';
    for (var i = 0; i < items.length - 1; i++) {
      if (isBlank(items[i].str)) {
        continue
      } else if (items[i + 2].str == 'R') {
        single_page_Arr.push(items[i].str + items[i + 2].str);
        i = i + 2;
      }
      else if (items[i + 1].str == 'R') {
        single_page_Arr.push(items[i].str + items[i + 1].str)
        i++;
      } else {
        single_page_Arr.push(items[i].str)
      }
    }
    initial_value = '';
    final_value = '';
    // console.log(single_page_Arr)
    var k = 0;
    var final_mark_header = [];

    for (var i = 0; i < single_page_Arr.length; i++) {
      if (parseFloat(single_page_Arr[i]) && isEmpty(final_mark_header)) {
        if (parseFloat(single_page_Arr[i + 1])) {
          continue;
        } else {
          console.log('helno')
          final_mark_header.push(single_page_Arr[i + 1]);
          final_mark_header.push(single_page_Arr[i + 2]);
          final_mark_header.push(single_page_Arr[i + 3]);
        }
      }
      if (isEmpty(sem) && i == 9) {
        sem.push(single_page_Arr[i])
      }
      if ((single_page_Arr[i] == 'Theory Internal' || single_page_Arr[i] == 'Theory External') && isBlank(initial_value)) {
        initial_value = i;
      }
      if (single_page_Arr[i] == 'S.No.' || single_page_Arr[i] == 'N.') {
        k = i;
      }
      if (single_page_Arr[i] == 'Total') {
        final_value = i;
      }
      if (isNumber(single_page_Arr[i]) && single_page_Arr[i].length == 12) {
        var single_cand = []; // single candidate data storage
        if (isEmpty(main_header)) {
          let head = [];
          for (var ind = k; ind < final_value; ind++) {
            head.push(single_page_Arr[ind])
          }
          main_header["head"] = head;
          head = [];
          for (var header = 0; header <= (final_value - initial_value); header++) {
            head.push(single_page_Arr[initial_value + header])
          }
          main_header["Title"] = head;
        }
        if (single_page_Arr[i] == roll_no) {
          pages.push(page_num);
          for (var data_push = 1; data_push <= (7 + final_value - initial_value); data_push++) {
            single_cand.push(single_page_Arr[i + data_push])
          }
          cand_marks[single_page_Arr[i]] = single_cand;
          cand_marks[main_header["head"][1]] = main_header["head"].slice(2, 5).concat(main_header["Title"], final_mark_header);
          // console.log(main_header["head"].slice(2,5).concat(main_header["Title"]))
          // break;
        }
      }
    }

    // console.log(initial_value)
    // console.log(final_value - initial_value)
    // console.log(typeof (roll_no));
    // if (roll_no in cand_marks) {
    //   console.log((roll_no));
    //   console.log(cand_marks[roll_no])
    // }
    // console.log(single_page_Arr[final_value])
    // break;
  }
  console.log(pages)
  const viewer = document.getElementById('pdf-viewer');
  for (const page_num of pages){
    canvas = document.createElement("canvas");
    canvas.className = 'pdf-page-canvas';
    viewer.appendChild(canvas);
    renderPage(page_num, canvas);
  }
  console.log(cand_marks)
  console.log(main_header)
  // console.log(sem)
  // console.log(final_mark_header);
  const scale = 1;
  
  function renderPage(num, canvas) {
    doc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderCtx = {
        canvasContext: canvas.getContext('2d'),
        viewport
      }
      page.render(renderCtx);
    });
  }
  function isBlank(str) {
    return (!str || /^\s*$/.test(str));
  }
  function isNumber(str) {
    return !isNaN(Number(str));
  }
  function isEmpty(obj) {
    return (Object.keys(obj).length === 0);
  }
  return [main_header, cand_marks, sem[0]]
}
function read_file(){
  document.querySelector(".popup").style.display = "block";
}
function onlyNumberkey(evt) {
  var ass = (evt.which) ? evt.which : evt.keyCode
  if (ass > 31 && (ass < 48 || ass > 57))
      return false;
  return true;
}
function showresult(evt) {
  const rollno = evt.target.previousElementSibling;
  if (rollno.value == "" || rollno.value.length < 12) {
      rollno.focus();
  }else{
    delete_child();
    getDirectory('/Files/',rollno.value);
  }
}
function delete_child(){
  const div = document.getElementById("pdf-viewer");
  while(div.childElementCount>0) {
      div.removeChild(div.lastChild);
  }
}
// getItems("http://127.0.0.1:5500/Files/1st%202018.pdf")
// getItems("/Files/1st 2018.pdf")