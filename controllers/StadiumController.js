const Stadium = require("../models/Stadium");

module.exports.addStadium = async (req, res) => {
  try {
    let { name, contactNumber, contactName, location } = req.body;

    let stadium = new Stadium({
      name,
      contactName,
      contactNumber,
      location,
    });
    stadium.rate = 0;
    if (req.files) {
      let path = "";

      for (const file of req.files) {
        path = path + file.path + ",";
      }

      path = path.substring(0, path.lastIndexOf(","));
      path = path.split(",");
      stadium.photos = path;
    }

    let stadiums = await Stadium.find({});
    stadium.id = stadiums.length + 1;

    await stadium.save();
    res.send("saved");
  } catch (error) {
    res.status(500).send("Server Error..." + error.message);
  }
};
