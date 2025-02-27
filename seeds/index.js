// const express = require('express');
// const path = require('path');
const mongoose = require('mongoose');
const Campground = require('../models/campground');  // Ensure the model is correctly defined
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => console.log('MongoDB Connected!'))
    .catch(err => console.error('MongoDB connection error:', err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async() => {
    await Campground.deleteMany({});
   for(let i =0; i < 200; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
       const camp = new Campground({
        author: '5f5c330c2cd79d538f2c66d9',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'sjfs fsgfvsfywsv fsvhfg bvfhsb',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude,
              ]
            },
            images: [
                {
                  url: "https://res.cloudinary.com/dzjqy2wbn/image/upload/v1739030858/YelpCamp/h8up7hkjpmdhiwjvh2lp.jpg",
                  filename: "YelpCamp/h8up7hkjpmdhiwjvh2lp",
                
                },
                {
                  url: "https://res.cloudinary.com/dzjqy2wbn/image/upload/v1739030860/YelpCamp/tuq3m302zuokrcaamvai.png",
                  filename: "YelpCamp/tuq3m302zuokrcaamvai",
                  
                }
              ],

        })
        await camp.save();
   }
}
seedDB().then(() => {
    mongoose.connection.close();
})