import React, { useRef } from 'react';
import * as XLSX from 'xlsx';

const BulkUpload = ({ onBulkUpload }) => {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const formattedData = formatData(json);
        onBulkUpload(formattedData);
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsArrayBuffer(file);
  };

  // const formatData = (json) => {
  //   const headers = json[0];
  //   const data = json.slice(1);

  //   const pages_data = [];
  //   let pageIndex = 1;
  //   let questionCount = 0;

  //   pages_data[pageIndex - 1] = { page_no: pageIndex, no_of_questions: 0, question_list: [] };

  //   data.forEach((row) => {
  //     if (!pages_data[pageIndex - 1]) {
  //       pages_data[pageIndex - 1] = { page_no: pageIndex, no_of_questions: 0, question_list: [] };
  //     }

  //     const correctOptionText = row[headers.indexOf('RIGHT ANSWER')];
  //     console.log("correctOptionText :", correctOptionText);
  //     const correctAnswerIndex = [
  //       'OPTION1',
  //       'OPTION2',
  //       'OPTION3',
  //       'OPTION4'
  //     ].indexOf(correctOptionText);

  //     const question = {
  //       question_id: questionCount + 1,
  //       question_text: row[headers.indexOf('QUESTION TEXT')],
  //       options_list: [
  //         row[headers.indexOf('OPTION1')],
  //         row[headers.indexOf('OPTION2')],
  //         row[headers.indexOf('OPTION3')],
  //         row[headers.indexOf('OPTION4')]
  //       ],
  //       correct_answer: correctAnswerIndex !== -1 ? correctAnswerIndex + 1 : null, // Store the index of the correct option (1-based)
  //       explaination: row[headers.indexOf('EXPLAINATION')],
  //     };

  //     pages_data[pageIndex - 1].question_list.push(question);
  //     pages_data[pageIndex - 1].no_of_questions += 1;
  //     questionCount += 1;

  //     if (questionCount % 10 === 0) {
  //       pageIndex += 1;
  //       pages_data[pageIndex - 1] = { page_no: pageIndex, no_of_questions: 0, question_list: [] };
  //     }
  //   });
  //   console.log("pages_data :",pages_data);
  //   return {
  //     no_of_pages: pages_data.length,
  //     pages_data
  //   };
  // };

  const formatData = (json) => {
    const headers = json[0]; // First row contains headers
    const data = json.slice(1); // Remaining rows contain the data

    const pages_data = [];
    let pageIndex = 1;
    let questionCount = 0;

    pages_data[pageIndex - 1] = { page_no: pageIndex, no_of_questions: 0, question_list: [] };

    data.forEach((row) => {
      if (!pages_data[pageIndex - 1]) {
        pages_data[pageIndex - 1] = { page_no: pageIndex, no_of_questions: 0, question_list: [] };
      }

      const options = [
        row[headers.indexOf('OPTION1')],
        row[headers.indexOf('OPTION2')],
        row[headers.indexOf('OPTION3')],
        row[headers.indexOf('OPTION4')],
        row[headers.indexOf('OPTION5')],
        row[headers.indexOf('OPTION6')],
        row[headers.indexOf('OPTION7')],
        row[headers.indexOf('OPTION8')],
        row[headers.indexOf('OPTION9')],
        row[headers.indexOf('OPTION10')]
      ].filter(option => option !== null && option !== undefined && (typeof option === 'string' ? option.trim() !== '' : true));

      //   const processedOptions = options.map(option => {
      // console.log("option :",option, "optiontype :", typeof(option));
      //     if (typeof option === 'string') {
      //         const lowerOption = option.toLowerCase();
      //         if (lowerOption === 'true' || lowerOption === 'false') {
      //             return lowerOption; // Convert 'TRUE'/'FALSE' to 'true'/'false'
      //         }
      //     }
      //     return option;
      // });

      // const processedOptions = options.map(option => {
      //   console.log("option :",option, "optiontype :", typeof(option));
      //   return option !== null && option !== undefined ? String(option).trim() : option;
      // });

      const processedOptions = options.map(option => {
        if (typeof option === 'boolean') {
            return option ? 'TRUE' : 'FALSE'; // Convert booleans to uppercase strings
        }
        if (typeof option === 'number') {
            return String(option); // Convert numbers (integers) to strings
        }
        return option !== null && option !== undefined ? String(option).trim() : option; // Convert everything else to string
    });

      // Get the correct answer index from the sheet (1-based index)
      const correctOptionIndex = parseInt(row[headers.indexOf('RIGHT ANSWER')], 10) - 1; // Convert to 0-based index
      console.log("correctOptionIndex :", correctOptionIndex);
      let correctAnswer = processedOptions[correctOptionIndex];
      if (typeof correctAnswer === 'boolean') {
          correctAnswer = correctAnswer ? 'TRUE' : 'FALSE'; // Convert booleans to uppercase strings
      } else if (typeof correctAnswer === 'number') {
          correctAnswer = String(correctAnswer); // Convert numbers to strings
      }


      const question = {
        question_id: questionCount + 1,
        question_text: row[headers.indexOf('QUESTION TEXT')],
        options_list: processedOptions,
        correct_answer: correctAnswer || null, // Get the text of the correct answer
        explaination: row[headers.indexOf('EXPLANATION')] || '', // Default to an empty string if explanation is missing
      };
      console.log("question :", question);
      pages_data[pageIndex - 1].question_list.push(question);
      pages_data[pageIndex - 1].no_of_questions += 1;
      questionCount += 1;

      // Move to the next page after every 10 questions
      if (questionCount % 10 === 0) {
        pageIndex += 1;
        pages_data[pageIndex - 1] = { page_no: pageIndex, no_of_questions: 0, question_list: [] };
      }
    });

    return {
      no_of_pages: pages_data.length,
      pages_data
    };
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Import</button>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default BulkUpload;

