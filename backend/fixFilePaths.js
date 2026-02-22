const mongoose = require("mongoose");
const ServiceProvider = require("./models/ServiceProvider");
require("dotenv").config();

// ---------------------------
// Connect to MongoDB
// ---------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
  console.log("✅ MongoDB connected. Starting migration...");

  try {
    const sps = await ServiceProvider.find();

    for (const sp of sps) {

      // 1️⃣ profilePhoto
      if (sp.profilePhoto && sp.profilePhoto.includes("D:\\")) {
        const fileName = sp.profilePhoto.split("\\").pop();
        sp.profilePhoto = `uploads/profile/${fileName}`;
      }

      // 2️⃣ cvDocument
      if (sp.cvDocument && sp.cvDocument.includes("D:\\")) {
        const fileName = sp.cvDocument.split("\\").pop();
        sp.cvDocument = `uploads/cv/${fileName}`;
      }

      // 3️⃣ extraCertificates (array)
      if (Array.isArray(sp.extraCertificates)) {
        sp.extraCertificates = sp.extraCertificates.map(f => {
          if (f.includes("D:\\")) {
            const fileName = f.split("\\").pop();
            return `uploads/certificates/${fileName}`;
          }
          return f;
        });
      }

      // 4️⃣ portfolio (array)
      if (Array.isArray(sp.portfolio)) {
        sp.portfolio = sp.portfolio.map(f => {
          if (f.includes("D:\\")) {
            const fileName = f.split("\\").pop();
            return `uploads/portfolio/${fileName}`;
          }
          return f;
        });
      }

      await sp.save();
      console.log("✅ Fixed SP:", sp._id);
    }

    console.log("🎉 Migration complete!");
    process.exit(0);

  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
});