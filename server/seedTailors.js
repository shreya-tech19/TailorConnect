const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const Tailor = require("./models/Tailor");

dotenv.config();

const tailors = [
  // =========================
  // THANE - 6
  // =========================
  {
    shopName: "Royal Stitch Studio",
    ownerName: "Rahul Sharma",
    email: "rahul.royal@tailorconnect.demo",
    phone: "9000000001",
    city: "Thane",
    address: "Ghodbunder Road, Thane West, Maharashtra",
    specialization: "Men's Wear",
    experience: 12,
    priceRange: "₹500 - ₹3000",
    description:
      "Specializes in men's shirts, trousers, suits and wedding wear.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Elegant Threads",
    ownerName: "Priya Deshmukh",
    email: "priya.elegant@tailorconnect.demo",
    phone: "9000000002",
    city: "Thane",
    address: "Manpada, Thane West, Maharashtra",
    specialization: "Women's Wear",
    experience: 9,
    priceRange: "₹600 - ₹3500",
    description:
      "Custom blouse, kurti, saree and ethnic wear stitching.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Perfect Fit Tailors",
    ownerName: "Amit Patil",
    email: "amit.perfectfit@tailorconnect.demo",
    phone: "9000000003",
    city: "Thane",
    address: "Naupada, Thane West, Maharashtra",
    specialization: "Formal Wear",
    experience: 15,
    priceRange: "₹700 - ₹4000",
    description:
      "Known for precise fitting in formal shirts, trousers and blazers.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Sakhi Boutique Tailors",
    ownerName: "Neha Kulkarni",
    email: "neha.sakhi@tailorconnect.demo",
    phone: "9000000004",
    city: "Thane",
    address: "Vartak Nagar, Thane West, Maharashtra",
    specialization: "Ethnic Wear",
    experience: 8,
    priceRange: "₹500 - ₹2800",
    description:
      "Custom ethnic outfits with detailed finishing and fitting.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Classic Cut Tailoring",
    ownerName: "Suresh Jadhav",
    email: "suresh.classiccut@tailorconnect.demo",
    phone: "9000000005",
    city: "Thane",
    address: "Khopat, Thane West, Maharashtra",
    specialization: "Men's Wear",
    experience: 18,
    priceRange: "₹450 - ₹3200",
    description:
      "Experienced tailor for traditional and modern men's clothing.",
    isAvailable: false,
    availabilityMessage: "Currently not accepting new orders",
    isVerified: true,
  },

  {
    shopName: "Needle & Thread",
    ownerName: "Anjali More",
    email: "anjali.needlethread@tailorconnect.demo",
    phone: "9000000006",
    city: "Thane",
    address: "Majiwada, Thane West, Maharashtra",
    specialization: "Blouse & Kurti",
    experience: 11,
    priceRange: "₹400 - ₹2500",
    description:
      "Specialized in customized blouse, kurti and festive outfits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  // =========================
  // MUMBAI - 10
  // =========================
  {
    shopName: "Mumbai Stitch House",
    ownerName: "Vikas Mehta",
    email: "vikas.mumbaistitch@tailorconnect.demo",
    phone: "9000000007",
    city: "Mumbai",
    address: "Dadar West, Mumbai, Maharashtra",
    specialization: "Men's Wear",
    experience: 14,
    priceRange: "₹600 - ₹3500",
    description:
      "Custom men's clothing with focus on smart fitting and finishing.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Aarohi Designs",
    ownerName: "Aarohi Joshi",
    email: "aarohi.designs@tailorconnect.demo",
    phone: "9000000008",
    city: "Mumbai",
    address: "Andheri West, Mumbai, Maharashtra",
    specialization: "Women's Wear",
    experience: 10,
    priceRange: "₹700 - ₹4500",
    description:
      "Designer blouses, dresses, kurtis and custom ethnic outfits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Fine Fit Tailors",
    ownerName: "Rohit Kapoor",
    email: "rohit.finefit@tailorconnect.demo",
    phone: "9000000009",
    city: "Mumbai",
    address: "Bandra West, Mumbai, Maharashtra",
    specialization: "Formal Wear",
    experience: 16,
    priceRange: "₹900 - ₹5000",
    description:
      "Premium formal shirts, trousers, blazers and suits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Kajal Couture",
    ownerName: "Kajal Shah",
    email: "kajal.couture@tailorconnect.demo",
    phone: "9000000010",
    city: "Mumbai",
    address: "Borivali West, Mumbai, Maharashtra",
    specialization: "Bridal Wear",
    experience: 13,
    priceRange: "₹1200 - ₹7000",
    description:
      "Bridal blouses, lehengas and customized wedding outfits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Classic Men's Studio",
    ownerName: "Manish Yadav",
    email: "manish.classic@tailorconnect.demo",
    phone: "9000000011",
    city: "Mumbai",
    address: "Goregaon West, Mumbai, Maharashtra",
    specialization: "Men's Wear",
    experience: 11,
    priceRange: "₹500 - ₹3000",
    description:
      "Everyday and occasion wear tailored to individual measurements.",
    isAvailable: false,
    availabilityMessage: "Currently not accepting new orders",
    isVerified: true,
  },

  {
    shopName: "StyleCraft Tailors",
    ownerName: "Sneha Nair",
    email: "sneha.stylecraft@tailorconnect.demo",
    phone: "9000000012",
    city: "Mumbai",
    address: "Powai, Mumbai, Maharashtra",
    specialization: "Western Wear",
    experience: 7,
    priceRange: "₹700 - ₹4000",
    description:
      "Custom dresses, skirts, tops and modern western outfits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Heritage Stitching",
    ownerName: "Mahesh Patil",
    email: "mahesh.heritage@tailorconnect.demo",
    phone: "9000000013",
    city: "Mumbai",
    address: "Kurla West, Mumbai, Maharashtra",
    specialization: "Traditional Wear",
    experience: 20,
    priceRange: "₹500 - ₹3500",
    description:
      "Traditional Maharashtrian and Indian ethnic wear stitching.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Perfect Blouse Studio",
    ownerName: "Pooja Verma",
    email: "pooja.perfectblouse@tailorconnect.demo",
    phone: "9000000014",
    city: "Mumbai",
    address: "Mulund West, Mumbai, Maharashtra",
    specialization: "Blouse & Saree Wear",
    experience: 9,
    priceRange: "₹450 - ₹2800",
    description:
      "Customized blouse designs with fitting and neckline options.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Urban Needle",
    ownerName: "Arjun Singh",
    email: "arjun.urbanneedle@tailorconnect.demo",
    phone: "9000000015",
    city: "Mumbai",
    address: "Vile Parle West, Mumbai, Maharashtra",
    specialization: "Casual Wear",
    experience: 8,
    priceRange: "₹500 - ₹2500",
    description:
      "Comfortable custom casual wear for everyday use.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Signature Tailors",
    ownerName: "Meera Iyer",
    email: "meera.signature@tailorconnect.demo",
    phone: "9000000016",
    city: "Mumbai",
    address: "Chembur East, Mumbai, Maharashtra",
    specialization: "Ethnic & Festive Wear",
    experience: 12,
    priceRange: "₹800 - ₹4500",
    description:
      "Festive outfits with custom fitting and premium finishing.",
    isAvailable: false,
    availabilityMessage: "Currently not accepting new orders",
    isVerified: true,
  },

  // =========================
  // NAVI MUMBAI - 5
  // =========================
  {
    shopName: "Navi Fashion Tailors",
    ownerName: "Kunal Desai",
    email: "kunal.navifashion@tailorconnect.demo",
    phone: "9000000017",
    city: "Navi Mumbai",
    address: "Vashi, Navi Mumbai, Maharashtra",
    specialization: "Men's Wear",
    experience: 13,
    priceRange: "₹500 - ₹3200",
    description:
      "Modern men's tailoring with customized measurements.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Threadline Boutique",
    ownerName: "Riya Malhotra",
    email: "riya.threadline@tailorconnect.demo",
    phone: "9000000018",
    city: "Navi Mumbai",
    address: "Nerul, Navi Mumbai, Maharashtra",
    specialization: "Women's Wear",
    experience: 9,
    priceRange: "₹600 - ₹3500",
    description:
      "Custom kurtis, blouses, dresses and ethnic outfits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Fine Needle Studio",
    ownerName: "Sanjay Kulkarni",
    email: "sanjay.fineneedle@tailorconnect.demo",
    phone: "9000000019",
    city: "Navi Mumbai",
    address: "Kharghar, Navi Mumbai, Maharashtra",
    specialization: "Formal Wear",
    experience: 17,
    priceRange: "₹800 - ₹4500",
    description:
      "Precision tailoring for office and formal clothing.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Mitali Creations",
    ownerName: "Mitali Pawar",
    email: "mitali.creations@tailorconnect.demo",
    phone: "9000000020",
    city: "Navi Mumbai",
    address: "Airoli, Navi Mumbai, Maharashtra",
    specialization: "Ethnic Wear",
    experience: 10,
    priceRange: "₹550 - ₹3500",
    description:
      "Festive and traditional clothing tailored to customer requirements.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Urban Fit Tailors",
    ownerName: "Nikhil Joshi",
    email: "nikhil.urbanfit@tailorconnect.demo",
    phone: "9000000021",
    city: "Navi Mumbai",
    address: "Panvel, Navi Mumbai, Maharashtra",
    specialization: "Casual & Formal Wear",
    experience: 8,
    priceRange: "₹450 - ₹3000",
    description:
      "Custom casual and formal clothing with reliable fitting.",
    isAvailable: false,
    availabilityMessage: "Currently not accepting new orders",
    isVerified: true,
  },

  // =========================
  // PUNE - 7
  // =========================
  {
    shopName: "Pune Perfect Fit",
    ownerName: "Aditya Bhosale",
    email: "aditya.punefit@tailorconnect.demo",
    phone: "9000000022",
    city: "Pune",
    address: "Kothrud, Pune, Maharashtra",
    specialization: "Men's Wear",
    experience: 14,
    priceRange: "₹500 - ₹3500",
    description:
      "Men's shirts, trousers, jackets and traditional wear.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Aditi Boutique",
    ownerName: "Aditi Joshi",
    email: "aditi.boutique@tailorconnect.demo",
    phone: "9000000023",
    city: "Pune",
    address: "Baner, Pune, Maharashtra",
    specialization: "Women's Wear",
    experience: 11,
    priceRange: "₹700 - ₹4500",
    description:
      "Designer blouses, dresses and customized ethnic wear.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Stitch Point Pune",
    ownerName: "Prakash Shinde",
    email: "prakash.stitchpoint@tailorconnect.demo",
    phone: "9000000024",
    city: "Pune",
    address: "Hadapsar, Pune, Maharashtra",
    specialization: "Traditional Wear",
    experience: 19,
    priceRange: "₹500 - ₹3500",
    description:
      "Traditional kurta, sherwani and ethnic outfit stitching.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Thread & Style",
    ownerName: "Kavita Patil",
    email: "kavita.threadstyle@tailorconnect.demo",
    phone: "9000000025",
    city: "Pune",
    address: "Wakad, Pune, Maharashtra",
    specialization: "Women's Ethnic Wear",
    experience: 8,
    priceRange: "₹550 - ₹3200",
    description:
      "Custom kurtis, saree blouses and festive outfits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Sharp Cut Studio",
    ownerName: "Vivek More",
    email: "vivek.sharpcut@tailorconnect.demo",
    phone: "9000000026",
    city: "Pune",
    address: "Viman Nagar, Pune, Maharashtra",
    specialization: "Formal Wear",
    experience: 12,
    priceRange: "₹700 - ₹4200",
    description:
      "Formal shirts, trousers, suits and office wear.",
    isAvailable: false,
    availabilityMessage: "Currently not accepting new orders",
    isVerified: true,
  },

  {
    shopName: "Rangoli Creations",
    ownerName: "Swati Deshpande",
    email: "swati.rangoli@tailorconnect.demo",
    phone: "9000000027",
    city: "Pune",
    address: "Aundh, Pune, Maharashtra",
    specialization: "Bridal & Festive Wear",
    experience: 15,
    priceRange: "₹1000 - ₹6500",
    description:
      "Customized bridal blouses and festive outfits with detailed finishing.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Classic Stitch Pune",
    ownerName: "Harshad Pawar",
    email: "harshad.classicstitch@tailorconnect.demo",
    phone: "9000000028",
    city: "Pune",
    address: "Pimpri, Pune, Maharashtra",
    specialization: "Men's & Kids Wear",
    experience: 10,
    priceRange: "₹400 - ₹2800",
    description:
      "Family tailoring for men's, women's and children's garments.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  // =========================
  // NASHIK - 4
  // =========================
  {
    shopName: "Nashik Stitch Hub",
    ownerName: "Amol Wagh",
    email: "amol.stitchhub@tailorconnect.demo",
    phone: "9000000029",
    city: "Nashik",
    address: "College Road, Nashik, Maharashtra",
    specialization: "Men's Wear",
    experience: 13,
    priceRange: "₹500 - ₹3000",
    description:
      "Custom shirts, trousers, kurtas and wedding outfits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Suhana Boutique",
    ownerName: "Suhana Kulkarni",
    email: "suhana.boutique@tailorconnect.demo",
    phone: "9000000030",
    city: "Nashik",
    address: "Gangapur Road, Nashik, Maharashtra",
    specialization: "Women's Wear",
    experience: 9,
    priceRange: "₹600 - ₹3500",
    description:
      "Blouses, kurtis, dresses and custom ethnic clothing.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Heritage Tailors Nashik",
    ownerName: "Dinesh Pawar",
    email: "dinesh.heritage@tailorconnect.demo",
    phone: "9000000031",
    city: "Nashik",
    address: "Panchavati, Nashik, Maharashtra",
    specialization: "Traditional Wear",
    experience: 21,
    priceRange: "₹500 - ₹3800",
    description:
      "Traditional Maharashtrian and Indian clothing specialist.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Needle Art Studio",
    ownerName: "Rutuja More",
    email: "rutuja.needleart@tailorconnect.demo",
    phone: "9000000032",
    city: "Nashik",
    address: "Indira Nagar, Nashik, Maharashtra",
    specialization: "Blouse & Ethnic Wear",
    experience: 7,
    priceRange: "₹450 - ₹2800",
    description:
      "Detailed blouse stitching and ethnic wear customization.",
    isAvailable: false,
    availabilityMessage: "Currently not accepting new orders",
    isVerified: true,
  },

  // =========================
  // NAGPUR - 4
  // =========================
  {
    shopName: "Nagpur Fine Stitch",
    ownerName: "Rajesh Tiwari",
    email: "rajesh.finestitch@tailorconnect.demo",
    phone: "9000000033",
    city: "Nagpur",
    address: "Dharampeth, Nagpur, Maharashtra",
    specialization: "Men's Wear",
    experience: 16,
    priceRange: "₹500 - ₹3500",
    description:
      "Experienced in men's formal, casual and wedding clothing.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Meera Fashion Studio",
    ownerName: "Meera Soni",
    email: "meera.fashionstudio@tailorconnect.demo",
    phone: "9000000034",
    city: "Nagpur",
    address: "Manish Nagar, Nagpur, Maharashtra",
    specialization: "Women's Wear",
    experience: 12,
    priceRange: "₹650 - ₹4000",
    description:
      "Custom dresses, blouses, kurtis and festive outfits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Royal Needle Nagpur",
    ownerName: "Sandeep Joshi",
    email: "sandeep.royalneedle@tailorconnect.demo",
    phone: "9000000035",
    city: "Nagpur",
    address: "Sadar, Nagpur, Maharashtra",
    specialization: "Formal & Traditional Wear",
    experience: 18,
    priceRange: "₹700 - ₹4500",
    description:
      "Formal suits, sherwanis and traditional outfits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Fashion Thread Studio",
    ownerName: "Pallavi Deshmukh",
    email: "pallavi.fashionthread@tailorconnect.demo",
    phone: "9000000036",
    city: "Nagpur",
    address: "Trimurti Nagar, Nagpur, Maharashtra",
    specialization: "Ethnic Wear",
    experience: 10,
    priceRange: "₹550 - ₹3500",
    description:
      "Customized ethnic and festive clothing for special occasions.",
    isAvailable: false,
    availabilityMessage: "Currently not accepting new orders",
    isVerified: true,
  },

  // =========================
  // KOLHAPUR - 3
  // =========================
  {
    shopName: "Kolhapur Classic Tailors",
    ownerName: "Nitin Patil",
    email: "nitin.kolhapurclassic@tailorconnect.demo",
    phone: "9000000037",
    city: "Kolhapur",
    address: "Rajarampuri, Kolhapur, Maharashtra",
    specialization: "Men's Wear",
    experience: 17,
    priceRange: "₹450 - ₹3200",
    description:
      "Traditional and modern men's tailoring with precise fitting.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Vaibhavi Creations",
    ownerName: "Vaibhavi Shinde",
    email: "vaibhavi.creations@tailorconnect.demo",
    phone: "9000000038",
    city: "Kolhapur",
    address: "Shahupuri, Kolhapur, Maharashtra",
    specialization: "Women's Ethnic Wear",
    experience: 11,
    priceRange: "₹500 - ₹3500",
    description:
      "Saree blouses, kurtis and festive ethnic wear.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Royal Fit Kolhapur",
    ownerName: "Sachin Jadhav",
    email: "sachin.royalfit@tailorconnect.demo",
    phone: "9000000039",
    city: "Kolhapur",
    address: "Tarabai Park, Kolhapur, Maharashtra",
    specialization: "Wedding Wear",
    experience: 14,
    priceRange: "₹800 - ₹5000",
    description:
      "Wedding suits, sherwanis and customized occasion wear.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  // =========================
  // CHHATRAPATI SAMBHAJINAGAR - 2
  // =========================
  {
    shopName: "Aurangabad Stitch Studio",
    ownerName: "Imran Shaikh",
    email: "imran.stitchstudio@tailorconnect.demo",
    phone: "9000000040",
    city: "Chhatrapati Sambhajinagar",
    address:
      "CIDCO, Chhatrapati Sambhajinagar, Maharashtra",
    specialization: "Men's & Traditional Wear",
    experience: 15,
    priceRange: "₹500 - ₹3500",
    description:
      "Men's traditional and occasion wear with custom fitting.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Zoya Boutique",
    ownerName: "Zoya Khan",
    email: "zoya.boutique@tailorconnect.demo",
    phone: "9000000041",
    city: "Chhatrapati Sambhajinagar",
    address:
      "Garkheda, Chhatrapati Sambhajinagar, Maharashtra",
    specialization: "Women's Wear",
    experience: 9,
    priceRange: "₹600 - ₹4000",
    description:
      "Customized dresses, blouses, kurtis and festive outfits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  // =========================
  // SOLAPUR - 2
  // =========================
  {
    shopName: "Solapur Smart Stitch",
    ownerName: "Ganesh Mane",
    email: "ganesh.smartstitch@tailorconnect.demo",
    phone: "9000000042",
    city: "Solapur",
    address: "Sadar Bazar, Solapur, Maharashtra",
    specialization: "Men's Wear",
    experience: 12,
    priceRange: "₹400 - ₹2800",
    description:
      "Affordable custom tailoring for shirts, trousers and kurtas.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Madhuri Tailoring House",
    ownerName: "Madhuri Pawar",
    email: "madhuri.tailoring@tailorconnect.demo",
    phone: "9000000043",
    city: "Solapur",
    address: "Hotgi Road, Solapur, Maharashtra",
    specialization: "Women's Wear",
    experience: 10,
    priceRange: "₹450 - ₹3000",
    description:
      "Blouses, kurtis, saree alterations and custom ethnic wear.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  // =========================
  // SATARA - 2
  // =========================
  {
    shopName: "Satara Stitch Point",
    ownerName: "Ramesh Chavan",
    email: "ramesh.satarastitch@tailorconnect.demo",
    phone: "9000000044",
    city: "Satara",
    address: "Powai Naka, Satara, Maharashtra",
    specialization: "Men's Wear",
    experience: 16,
    priceRange: "₹450 - ₹3000",
    description:
      "Custom men's clothing and traditional Maharashtrian outfits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Swarali Boutique",
    ownerName: "Swarali Patil",
    email: "swarali.boutique@tailorconnect.demo",
    phone: "9000000045",
    city: "Satara",
    address: "Rajwada, Satara, Maharashtra",
    specialization: "Ethnic & Festive Wear",
    experience: 8,
    priceRange: "₹500 - ₹3200",
    description:
      "Custom ethnic outfits and festive blouse designs.",
    isAvailable: false,
    availabilityMessage: "Currently not accepting new orders",
    isVerified: true,
  },

  // =========================
  // SANGLI - 2
  // =========================
  {
    shopName: "Sangli Fine Tailors",
    ownerName: "Pravin Kadam",
    email: "pravin.sanglifine@tailorconnect.demo",
    phone: "9000000046",
    city: "Sangli",
    address: "Vishrambag, Sangli, Maharashtra",
    specialization: "Formal Wear",
    experience: 14,
    priceRange: "₹600 - ₹3500",
    description:
      "Formal shirts, trousers, suits and professional clothing.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Sakhi Stitch Studio",
    ownerName: "Manisha Patil",
    email: "manisha.sakhi@tailorconnect.demo",
    phone: "9000000047",
    city: "Sangli",
    address: "Madhavnagar, Sangli, Maharashtra",
    specialization: "Women's Wear",
    experience: 11,
    priceRange: "₹500 - ₹3500",
    description:
      "Customized women's clothing with detailed fitting.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  // =========================
  // AMRAVATI - 1
  // =========================
  {
    shopName: "Amravati Style House",
    ownerName: "Akash Deshmukh",
    email: "akash.stylehouse@tailorconnect.demo",
    phone: "9000000048",
    city: "Amravati",
    address: "Rajapeth, Amravati, Maharashtra",
    specialization: "Men's & Casual Wear",
    experience: 10,
    priceRange: "₹450 - ₹3000",
    description:
      "Custom casual and occasion wear for men with personalized fitting.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  // =========================
  // RATNAGIRI - 2
  // =========================
  {
    shopName: "Konkan Stitch Works",
    ownerName: "Tejas Sawant",
    email: "tejas.konkan@tailorconnect.demo",
    phone: "9000000049",
    city: "Ratnagiri",
    address:
      "Maruti Mandir Road, Ratnagiri, Maharashtra",
    specialization: "Men's & Traditional Wear",
    experience: 13,
    priceRange: "₹450 - ₹3200",
    description:
      "Custom traditional and modern clothing with careful finishing.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },

  {
    shopName: "Konkan Elegance",
    ownerName: "Snehal Sawant",
    email: "snehal.konkan@tailorconnect.demo",
    phone: "9000000050",
    city: "Ratnagiri",
    address:
      "Mirjole Road, Ratnagiri, Maharashtra",
    specialization: "Women's Ethnic Wear",
    experience: 9,
    priceRange: "₹500 - ₹3300",
    description:
      "Custom blouses, kurtis and traditional festive outfits.",
    isAvailable: true,
    availabilityMessage: "Available for new orders",
    isVerified: true,
  },
];

const profileImages = [
  "https://images.pexels.com/photos/6461160/pexels-photo-6461160.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/9850835/pexels-photo-9850835.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/11125919/pexels-photo-11125919.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/5830661/pexels-photo-5830661.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/6461091/pexels-photo-6461091.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/6461254/pexels-photo-6461254.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/11125919/pexels-photo-11125919.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/4622203/pexels-photo-4622203.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/37471995/pexels-photo-37471995.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/5894218/pexels-photo-5894218.jpeg?auto=compress&cs=tinysrgb&w=900"
];
// =====================================================
// ASSIGN PROFILE IMAGES TO ALL 50 DEMO TAILORS
// =====================================================

tailors.forEach((tailor, index) => {
  tailor.profileImage = profileImages[index % profileImages.length];
});

// =====================================================
// SEED DATABASE
// =====================================================

const seedTailors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");

    const hashedPassword = await bcrypt.hash(
      "Tailor@123",
      10
    );

    const operations = tailors.map((tailor) => ({
      updateOne: {
        filter: {
          email: tailor.email,
        },

        update: {
          $set: {
            ...tailor,
            password: hashedPassword,
          },

          $unset: {
            googleId: "",
          },
        },

        upsert: true,
      },
    }));

    const result = await Tailor.bulkWrite(
      operations
    );

    console.log("\n=================================");
    console.log("TAILOR SEEDING COMPLETED");
    console.log("=================================");

    console.log(
      `Total demo tailors: ${tailors.length}`
    );

    console.log(
      `Inserted: ${result.upsertedCount}`
    );

    console.log(
      `Updated: ${result.modifiedCount}`
    );

    console.log("\nDemo password for all tailors:");
    console.log("Tailor@123");

    console.log("=================================\n");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("❌ SEEDING ERROR:");
    console.error(error);

    process.exit(1);
  }
};

seedTailors();