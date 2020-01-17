const express = require('express');
const listRoutes = require('express-list-endpoints');
const bodyParser = require('body-parser');
const reviewRouter = require("./src/services/reviews/");
const productRoutes = require('./src/services/products');
const dotenv = require("dotenv");
dotenv.config();
const cors = require('cors');
const { join } = require('path');
const port = 3003;
const server = express();

server.use('/image', express.static(join(__dirname, '../Backend/public/imgs')));
server.use(cors());
server.use(bodyParser.json());

server.use("/reviews", reviewRouter)
server.use('/products', productRoutes);

console.log(listRoutes(server));

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});

