const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Tailor = require("./models/Tailor");

dotenv.config();

const updates = [
  {
    email: "royal@gmail.com",
    image:
      "https://images.pexels.com/photos/6461160/pexels-photo-6461160.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    email: "elegant@gmail.com",
    image:
      "https://images.pexels.com/photos/9850835/pexels-photo-9850835.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    email: "fashion@gmail.com",
    image:
      "https://images.pexels.com/photos/6461160/pexels-photo-6461160.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    email: "classic@gmail.com",
    image:
      "https://images.pexels.com/photos/5830661/pexels-photo-5830661.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    email: "designer@gmail.com",
    image:
      "https://images.pexels.com/photos/6461091/pexels-photo-6461091.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    email: "aadityayadav20504@gmail.com",
    image:
      "https://images.pexels.com/photos/6461254/pexels-photo-6461254.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    email: "shreyayadav11thsci@gmail.com",
    image:
      "https://images.pexels.com/photos/37471995/pexels-photo-37471995.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
];

const updateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    for (const item of updates) {
      const result = await Tailor.updateOne(
        { email: item.email },
        {
          $set: {
            profileImage: item.image,
          },
        }
      );

      if (result.matchedCount === 0) {
        console.log(`❌ Not found: ${item.email}`);
      } else {
        console.log(`✅ Updated: ${item.email}`);
      }
    }

    console.log("\n=================================");
    console.log("OLD TAILOR IMAGES UPDATED");
    console.log("=================================");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR:", error);
    process.exit(1);
  }
};

updateImages();