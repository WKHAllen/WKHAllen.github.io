async function populateExamples() {
  const examples = document.getElementsByClassName("example-code");

  for (const example of examples) {
    const exampleBody = example.getElementsByTagName("code")[0];
    const fileName = exampleBody.innerText;
    const fileData = await fetch(fileName);
    exampleBody.innerHTML = await fileData.text();
  }
}

function showImplementationIndices() {
  const table = document.getElementsByClassName("impl-table")[0];
  const rows = table.getElementsByTagName("tr");

  const indexHeading = document.createElement("th");
  indexHeading.innerText = "#";
  rows[0].insertBefore(indexHeading, rows[0].firstChild);

  for (let i = 1; i < rows.length; i++) {
    const indexData = document.createElement("td");
    indexData.innerText = rows[i].rowIndex;
    rows[i].insertBefore(indexData, rows[i].firstChild);
  }
}

window.addEventListener("load", async () => {
  await populateExamples();
  showImplementationIndices();
  hljs.highlightAll();
});
