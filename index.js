let csvData = [];
let dataLoaded = false;
window.onload = async function () {
  await loadCSVData();
  console.log(csvData);
  disPlayTable
};

async function loadCSVData(forceReload = false) {
  const fil = "004_Resultsheet_Aug2021";
  const url = "./Results/" + fil + "/index.json";
  const response = await fetch(url);
  console.log(response);
  const file_list = await response.json();
  console.log(file_list.Files);
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
            console.log(result.data);
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
