const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const db = require("../../../db")
const uuidv4 = require('uuid/v4');
const router = express.Router();
const multer = require('multer');
const printPDF = require("./generate-pdf")
const { Transform } = require("json2csv")

const filePath = path.join(__dirname, "../../products.json")

const loadFromDisk = async () => {

  const buffer = await fs.readFile(filePath)
  return JSON.parse(buffer.toString())
  
}
/* router.post('/pdf', async (req, res) => {

  try {
    const products = await loadFromDisk()
  
    const newProduct = {
      _id: uuidv4(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      imageUrl: ""
  
    }
  
    products.push(newProduct)
    await fs.writeFile(filePath, JSON.stringify(products))
    await printPDF(newProduct)
    res.send("Created Successfully")
  }
  catch (error) {
    console.log(error)
  }
  res.send('Ok')
}) */
/* 
router.get("/pdf", async (req, res) => {
  try {
  const products = await loadFromDisk()

  const newProduct = {
    _id: uuidv4(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: ""

  }

  products.push(newProduct)
  await fs.writeFile(filePath, JSON.stringify(products))
  await printPDF(newProduct)
  res.send("Created Successfully")
}
catch (error) {
  console.log(error)
}
}) */


router.get("/csv", async (req, res) => {
  const userFiles = await loadFromDisk()
  const fields = ["_id", "name", "brand", "category", "price"]
  const opts = { fields }

  const json2csv = new Transform(opts)

  await fs.createReadStream(filePath).pipe(json2csv).pipe(res)
})



router.post('/', async (req, res) => {
  var allProducts = await loadFromDisk();
  var addNewProduct = req.body;
  addNewProduct._id = uuidv4();
  addNewProduct.createdAt = new Date();
  addNewProduct.updatedAt = new Date();
  addNewProduct.imageUrl = '';
  allProducts.push(addNewProduct);
  await fs.writeFile(filePath, JSON.stringify(allProducts));
  await printPDF(addNewProduct)
  res.send('New product add to marketplace');
});

router.get('/', async (req, res) => {
  const products = await db.query("SELECT * products")
  res.send(products.rows)

  /* const allProducts = await loadFromDisk();
  res.send(allProducts.length > 0 ? allProducts : 'There are no products'); */
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  var allProducts = loadFromDisk();
  var filteredByID = allProducts.find(item => item._id.toString() === id);
  var indexToChange = allProducts.findIndex(item => item._id.toString() === id);
  if (indexToChange != -1) {
    var creationDate = filteredByID.createdAt;
    var myID = filteredByID._id;
    var imageUrl = filteredByID.imageUrl;
    var { name, brand, price, category, description } = req.body;
    allProducts[indexToChange] = {
      _id: myID,
      name,
      brand,
      price,
      category,
      description,
      imageUrl: imageUrl,
      createdAt: creationDate,
      updatedAt: new Date()
    };
    fs.writeFileSync(path.join(__dirname, '../../products.json'), JSON.stringify(allProducts));
    res.send(`Item ${id} updated at ${new Date()}`);
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const allProducts = loadFromDisk();
  var filteredByID = allProducts.find(item => item._id.toString() === id);
  if (filteredByID) {
    var invariantItems = allProducts.filter(item => item._id.toString() !== id);
    fs.writeFileSync(path.join(__dirname, '../../products.json'), JSON.stringify(invariantItems));
    res.send(`Item ${id} deleted`);
  } else res.status(404).send('Not Found');
});

//FILE UPLOAD
const imgFolder = path.join(__dirname, '../../public/imgs');
const upload = multer({
  limits: {
    fileSize: 20000000
  }
});

router.post('/upload/:id', upload.single('prod_picture'), (req, res) => {
  var fullUrl = req.protocol + '://' + req.get('host') + '/image/';
  var ext = req.file.originalname.split('.').reverse()[0];
  if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') {
    res.status(400).send('only images allowed');
  } else {
    var fileName = req.params.id + '.' + ext;
    var path = './public/imgs/' + fileName;
    fs.writeFile(path, req.file.buffer, err => {
      if (err) throw err;
    });
    //modify the products
    var allProducts = loadFromDisk();
    var productToUpdate = allProducts.find(prod => prod._id === req.params.id);
    var allProducts = allProducts.filter(prod => prod._id !== req.params.id);
    productToUpdate.imageUrl = fullUrl + fileName;
    allProducts.push(productToUpdate);
    console.log(__dirname);
    fs.writeFileSync('./src/products.json', JSON.stringify(allProducts));
    res.send('Uploaded');
  }
});

module.exports = router;
