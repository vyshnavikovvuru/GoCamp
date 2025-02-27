const Campground = require('../models/campground');


const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

const {cloudinary} =require("../cloudinary")

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds })
}

module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    try {
        // 🗺️ Fetch geolocation data from MapTiler
        const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });

        if (!geoData.features || geoData.features.length === 0) {
            req.flash('error', 'Location not found! Try another location.');
            return res.redirect('/campgrounds/new');
        }

        const campground = new Campground(req.body.campground);

        // ✅ Store only the first coordinate (fixes multiple locations issue)
        campground.geometry = {
            type: "Point",
            coordinates: geoData.features[0].geometry.coordinates
        };

        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.author = req.user._id;

        await campground.save();
        console.log("✅ New Campground Created:", campground);

        req.flash('success', 'Successfully created a new campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (err) {
        console.error("❌ Error in createCampground:", err);
        req.flash('error', 'Something went wrong.');
        res.redirect('/campgrounds');
    }
};

module.exports.showCampground = async (req, res) => {
    try {
        const campground = await Campground.findById(req.params.id)
            .populate('reviews')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'author',
                    model: 'User'
                }
            })
            .populate('author');

        if (!campground) {
            req.flash('error', 'Cannot find that campground!');
            return res.redirect('/campgrounds');
        }

        // Debugging log
        console.log("Fetched Campground:", JSON.stringify(campground, null, 2));

        res.render('campgrounds/show', { campground, currentUser: req.user });

    } catch (error) {
        console.error("Error fetching campground:", error);
        req.flash('error', 'Something went wrong!');
        res.redirect('/campgrounds');
    }
};


module.exports.renderEditForm = async (req, res) => {
    try {
        // Find the campground by ID
        const { id } = req.params;
        const campground = await Campground.findById(id).populate('author');
        if (!campground) {
                req.flash('error', 'Cannot find that campground!');
                return res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit', { campground });
    } catch (err) {
        res.status(500).send('Something went wrong');
    }
}

module.exports.updateCampground = async (req, res) => {
    try {
        // Find the campground by ID and update it
       
        console.log(req.body);
        const campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground, { new: true });
        const imgs =  req.files.map(f => ({url : f.path, filename: f.filename }));
        campground.images.push(...imgs);
        const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
        if (!geoData || !geoData.features || geoData.features.length === 0) {
            return res.status(400).send("Invalid location data or failed to geocode location.");
        }
        campground.geometry = geoData.features[0].geometry;
        
campground.geometry = geoData.features[0].geometry;
        await campground.save();
        if(req.body.deleteImages){
            for(let filename of req.body.deleteImages){
                await cloudinary.uploader.destroy(filename);
            }
            await campground.updateOne({$pull: { images: {filename: {$in: req.body.deleteImages}}}})
            console.log(campground)
        }
        if (!campground) {
            return res.status(404).send('Campground not found');
        }
        // Redirect to the campground's details page
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (err) {
        res.status(500).send('Something went wrong');
    }
}

module.exports.deleteCampground = async(req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successully deleted campground!');
    res.redirect('/campgrounds');
}

