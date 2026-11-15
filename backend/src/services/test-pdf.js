import fs from "fs";
import pdf from "pdf-parse";

const dataBuffer = fs.readFileSync("./resume.pdf");

pdf(dataBuffer)
  .then((data) => {
    console.log("PDF extraction successful!");
    console.log("Pages:", data.numpages);
    console.log("Text length:", data.text.length);
  })
  .catch((error) => {
    console.error("PDF extraction failed:", error);
  });