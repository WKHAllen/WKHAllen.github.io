const implementations = {
  c: {
    name: "C",
    repo: "cdtp",
  },
  cpp: {
    name: "C++",
    repo: "cppdtp",
  },
  cs: {
    name: "C#",
    repo: "CSDTP",
  },
  java: {
    name: "Java",
    repo: "JDTP",
  },
  ts: {
    name: "JavaScript/TypeScript",
    repo: "dtp.js",
  },
  py: {
    name: "Python",
    repo: "dtppy",
  },
  go: {
    name: "Go",
    repo: "godtp",
  },
  rs: {
    name: "Rust",
    repo: "rustdtp",
  },
  nim: {
    name: "Nim",
    repo: "nimdtp",
  },
};

const implementationExamples = {};

function updateComparison(element, selected) {
  const sideIndex = element.id.includes("left") ? 0 : 1;
  const implServer =
    document.getElementsByClassName("impl-server")[0].children[sideIndex];
  const implClient =
    document.getElementsByClassName("impl-client")[0].children[sideIndex];
  const exampleServer = implServer.getElementsByTagName("code")[0];
  const exampleClient = implClient.getElementsByTagName("code")[0];
  const serverHeader = implServer.getElementsByTagName("h3")[0];
  const clientHeader = implClient.getElementsByTagName("h3")[0];
  const selectedName = implementations[selected].name;
  const serverCode = implementationExamples[selected].server
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  const clientCode = implementationExamples[selected].client
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  exampleServer.classList = "";
  exampleServer.classList.add("hljs", `language-${selected}`);
  exampleServer.removeAttribute("data-highlighted");
  exampleServer.innerHTML = serverCode;
  exampleClient.classList = "";
  exampleClient.classList.add("hljs", `language-${selected}`);
  exampleClient.removeAttribute("data-highlighted");
  exampleClient.innerHTML = clientCode;
  serverHeader.innerText = `${selectedName} server`;
  clientHeader.innerText = `${selectedName} client`;

  hljs.highlightAll();
}

async function populateExamples() {
  const examples = await Promise.all(
    Object.keys(implementations).map(async (impl) => {
      const repoName = implementations[impl].repo;
      const exampleReadme = await fetch(
        `https://raw.githubusercontent.com/WKHAllen/${repoName}/main/README.md`
      );
      const readmeText = await exampleReadme.text();

      if (
        readmeText.includes("## Creating a server") &&
        readmeText.includes("## Creating a client")
      ) {
        const serverSection = readmeText.split("## Creating a server")[1];
        const serverExampleWithLanguage = serverSection.split("```")[1];
        const serverExample = serverExampleWithLanguage
          .slice(serverExampleWithLanguage.indexOf("\n"))
          .trim();
        const clientSection = readmeText.split("## Creating a client")[1];
        const clientExampleWithLanguage = clientSection.split("```")[1];
        const clientExample = clientExampleWithLanguage
          .slice(clientExampleWithLanguage.indexOf("\n"))
          .trim();

        return {
          language: impl,
          server: serverExample,
          client: clientExample,
        };
      } else {
        return null;
      }
    })
  );

  for (const example of examples) {
    if (example !== null) {
      implementationExamples[example.language] = {
        server: example.server,
        client: example.client,
      };
    }
  }

  const implCompareLeft = document.getElementById("impl-compare-left");
  const implCompareRight = document.getElementById("impl-compare-right");

  for (const impl of Object.keys(implementationExamples)) {
    const implOptionLeft = document.createElement("option");
    implOptionLeft.setAttribute("value", impl);
    implOptionLeft.innerText = implementations[impl].name;
    const implOptionRight = document.createElement("option");
    implOptionRight.setAttribute("value", impl);
    implOptionRight.innerText = implementations[impl].name;
    implCompareLeft.appendChild(implOptionLeft);
    implCompareRight.appendChild(implOptionRight);
  }

  const leftSelectionIndex = Math.floor(
    Math.random() * Object.keys(implementationExamples).length
  );
  let rightSelectionIndex = leftSelectionIndex;

  while (rightSelectionIndex === leftSelectionIndex) {
    rightSelectionIndex = Math.floor(
      Math.random() * Object.keys(implementationExamples).length
    );
  }

  const leftSelection = Object.keys(implementationExamples)[leftSelectionIndex];
  const rightSelection = Object.keys(implementationExamples)[
    rightSelectionIndex
  ];
  implCompareLeft.value = leftSelection;
  implCompareRight.value = rightSelection;

  updateComparison(implCompareLeft, leftSelection);
  updateComparison(implCompareRight, rightSelection);
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
