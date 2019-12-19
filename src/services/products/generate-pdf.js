const express = require("express")
const doc = require("pdfmake")
const fs = require("fs-extra")
const path = require("path")

const printPDF = newProduct => 
    new Promise((resolve, reject) => {

        const fonts = {
            Roboto: {
              normal: "Helvetica",
              bold: "Helvetica-Bold",
              italics: "Helvetica-Oblique",
              bolditalics: "Helvetica-BoldOblique"
            }
          };

        const docPrinter = new doc(fonts)

        const detailsTable = {
            body: [],
            width: [300, 400]
        }

        detailsTable.body.push(["Product ID:", `${newProduct._id}`]["Brand:", `${newProduct.brand}`])
        detailsTable.body.push(["Product Name:", `${newProduct.name}`]["Category:", `${newProduct.category}`])
        detailsTable.body.push(["Price:", `$${newProduct.price}`])

        const docDefinition = {
            content: [
                { text: "Product Details", style: "header" },
                { table: detailsTable }
              ]
        }
        const fileName = `${newProduct._id} +.pdf`
        const pdfDocStream = docPrinter.createPdfKitDocument(docDefinition, {}); 
        pdfDocStream.pipe(
          fs.createWriteStream(path.join(__dirname, fileName))
        ); 
        pdfDocStream.end();
        resolve(); 

    })


module.exports = printPDF;
