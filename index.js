const textract = require("textract");
const fs = require("fs");
const fromFilePath = "./from.doc";
const resultFilePath = "./result.json";

textract.fromFileWithPath(fromFilePath, function (error, text) {
  let questions = [];
  // step 1: get ids
  const idPattern = /[0-9].[0-9].[0-9].[0-9]+/g;
  const ids = text.match(idPattern);
  // step 2: get questions
  ids.forEach((_id) => {
    let question, answer;
    const splitById = text.split(_id)[1];
    const nextIdPattern = /[0-9].[0-9].[0-9].[0-9]+/;
    let nextId = splitById.match(nextIdPattern);
    if (nextId) {
      nextId = nextId[0];
      const splitByAnswer = splitById.split(nextId)[0].split("Answer");
      question = splitByAnswer[0].trim();
      answer = splitByAnswer[1].match(/[A-Za-z]+/g)[0];
    } else {
      const splitByAnswer = splitById.split("Answer");
      question = splitByAnswer[0].trim();
      answer = splitByAnswer[1].match(/[A-Za-z]+/g)[0];
    }
    // split options
    const aPattern = /A\./;
    findA = question.match(aPattern);
    if (!findA) {
      const type = 1;
      questions = [...questions, { _id, type, question, answer }];
    } else {
      type = 2;
      if (_id !== "3.3.1.2") {
        const options = {};
        let temp = question.split("A.");
        question = temp[0].trim();
        temp = temp[1].split("B.");
        options.a = temp[0].trim();
        temp = temp[1].split("C.");
        options.b = temp[0].trim();
        temp = temp[1].split("D.");
        options.c = temp[0].trim();
        options.d = temp[1].trim();
        questions = [...questions, { _id, type, question, options, answer }];
      }
    }
  });
  questions = JSON.stringify(questions);
  const regex = /},{/g;
  questions = questions.replace(regex, "}{");
  fs.writeFile("result.json", questions, (err) => {
    if (err) throw err;
    console.log("Data written to file");
    return;
  });
});
