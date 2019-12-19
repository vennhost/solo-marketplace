const express = require("express");
const multer = require("multer");
const {readFile, writeFile} = require("fs-extra");
const {join} = require("path");
const uuidv1 = require('uuid/v1');
const shortid = require('shortid');
const router = express.Router();

const reviewPath = join(__dirname, "reviews.json");

console.log(reviewPath)

router.get("/", async (req, res, next) => {

    const buffer = await readFile(reviewPath)
    const content = buffer.toString()
    const reviews = JSON.parse(content)

    res.send(reviews)
})

router.get("/:id", async (req, res, next) => {
    const buffer = await readFile(reviewPath)
    const content = buffer.toString()
    const reviews = JSON.parse(content)

    const productReview = reviews.find(review => review._id == req.params.id)

    if (productReview) {
        res.send(productReview)
    } else {
        res.status(404).send(`Review ${review._id} can not be found`)
    }
})

router.get("/products/:id", async (req, res, next) => {

    const buffer = await readFile(reviewPath)
    const content = buffer.toString()
    const reviews = JSON.parse(content)

    /* const elementId  = reviews.find(review => review.elementId) */

    const elementReviews = reviews.filter(review => review.elementId == req.params.id)

    if (elementReviews) {
        res.send(elementReviews)
    } else {
        res.send("This product has 0 reviews")
    }

    
})

router.post("/", async (req, res, next) => {
    const buffer = await readFile(reviewPath)
    const content = buffer.toString()
    const reviews = JSON.parse(content)
    
    const newReview = {
        _id: /* shortid.generate() */ new Date().valueOf(),
        ...req.body,
        elementId : uuidv1() /* req.params.id */,
        createdAt: new Date()
    }
    reviews.push(newReview)

    await writeFile(reviewPath, JSON.stringify(reviews))
    res.send("Review created Successfully!")
})

router.put("/:id", async (req, res, next) => {
    const buffer = await readFile(reviewPath)
    const content = buffer.toString()
    const reviews = JSON.parse(content) 

    const reviewToEdit = reviews.find(review => review._id == req.params.id)

    if (reviewToEdit) {
        const mergedReview = Object.assign(reviewToEdit, req.body)
        const position = reviews.indexOf(reviewToEdit)
        reviews[position] = mergedReview
        await writeFile(reviewPath, JSON.stringify(reviews))
        res.send(reviewToEdit)
    } else {
        res.send("Review Not Found")
    }
})

router.delete("/:id", async (req, res, next) => {
    const buffer = await readFile(reviewPath)
    const content = buffer.toString()
    const reviews = JSON.parse(content) 

    const remainReview = reviews.find(review => review._id != req.params.id)  

    if (remainReview.length < reviews.length) {
            await writeFile(reviewPath, JSON.stringify(remainReview))
            res.send("Deleted Successfully")
    } else {
        res.send("Review Not Found")
    }
})




module.exports = router;