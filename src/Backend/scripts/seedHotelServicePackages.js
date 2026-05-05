import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import HotelServicePackage from "../models/HotelServicePackage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const EIGHT_HOUR_TIME_SLOTS = [
  "Daytime: 6:00 AM - 2:00 PM",
  "Daytime: 7:00 AM - 3:00 PM",
  "Daytime: 8:00 AM - 4:00 PM",
  "Daytime: 9:00 AM - 5:00 PM",
  "Daytime: 10:00 AM - 6:00 PM",
  "Daytime: 11:00 AM - 7:00 PM",
  "Daytime: 12:00 PM - 8:00 PM",
  "Nighttime: 3:00 PM - 11:00 PM",
  "Nighttime: 4:00 PM - 12:00 AM",
  "Nighttime: 5:00 PM - 1:00 AM next day",
  "Nighttime: 6:00 PM - 2:00 AM next day",
  "Nighttime: 7:00 PM - 3:00 AM next day",
  "Nighttime: 8:00 PM - 4:00 AM next day",
  "Nighttime: 9:00 PM - 5:00 AM next day",
];

const TWELVE_HOUR_TIME_SLOTS = [
  "7:00 AM - 7:00 PM",
  "8:00 AM - 8:00 PM",
  "9:00 AM - 9:00 PM",
  "10:00 AM - 10:00 PM",
  "11:00 AM - 11:00 PM",
  "12:00 PM - 12:00 AM",
  "1:00 PM - 1:00 AM next day",
  "2:00 PM - 2:00 AM next day",
  "3:00 PM - 3:00 AM next day",
  "4:00 PM - 4:00 AM next day",
  "5:00 PM - 5:00 AM next day",
];

const TWENTY_TWO_HOUR_TIME_SLOTS = [
  "6:00 AM - 4:00 AM next day",
  "7:00 AM - 5:00 AM next day",
  "8:00 AM - 6:00 AM next day",
];

const RESORT_VENUE_PACKAGES = [
  {
    seedKey: "resort-venue-lorenzo-campsite",
    type: "resort_venue",
    title: "Lorenzo Campsite",
    subtitle: "Venue-only outdoor campsite with 4 bedrooms",
    description:
      "Lorenzo Campsite is a venue-only package good for intimate events and private gatherings.",
    duration: "12 Hours / 22 Hours",
    price: 15000,
    variants: [
      {
        label: "12 Hours",
        price: 15000,
        timeSlots: TWELVE_HOUR_TIME_SLOTS,
        displayOrder: 1,
        isActive: true,
      },
      {
        label: "22 Hours",
        price: 20000,
        timeSlots: TWENTY_TWO_HOUR_TIME_SLOTS,
        displayOrder: 2,
        isActive: true,
      },
    ],
    capacity: "Maximum Capacity: 30 guests",
    imageUrl: "",
    displayOrder: 1,
    isActive: true,
    inclusions: [
      "Total Pax: Maximum 30 guests",
      "Availability: 12 Hours / 22 Hours",
      "Price range: ₱15,000 for 12 hours / ₱20,000 for 22 hours",
      "Venue type: Venue Only",
      "Parking Capacity: 20 cars",
      "Includes: 4 bedrooms",
      "Event Time: 2 hours preparation, 4 hours event, 2 hours packout",
      "Corkage: ₱3,000 for outside caterers",
      "Corkage: ₱2,000 for sound and lights",
      "Refundable Security Deposit: ₱2,000",
      "Sound System: Starts at ₱5,000",
      "Address: Ecotrend Subdivision, San Nicolas 1, Bacoor, Cavite City",
      "Waze: Patio de Lorenzo",
      "Facebook: Patio de Lorenzo",
    ],
  },
  {
    seedKey: "resort-venue-lorenzo-veranda",
    type: "resort_venue",
    title: "Lorenzo Veranda",
    subtitle: "Venue-only veranda garden for medium-sized events",
    description:
      "Lorenzo Veranda is a venue-only package for celebrations, gatherings, and programs. The package includes 2 hours preparation, 4 hours event proper, and 2 hours packout.",
    duration: "8 Hours",
    price: 12000,
    variants: [
      {
        label: "8 Hours",
        price: 12000,
        timeSlots: EIGHT_HOUR_TIME_SLOTS,
        displayOrder: 1,
        isActive: true,
      },
    ],
    capacity: "Maximum Capacity: 100 guests",
    imageUrl: "",
    displayOrder: 2,
    isActive: true,
    inclusions: [
      "Total Pax: Maximum 100 guests",
      "Availability: 8 Hours",
      "Price range: ₱12,000",
      "Venue type: Venue Only",
      "Parking Capacity: 20 cars",
      "Includes: One-bedroom",
      "Includes: Air conditioning",
      "Includes: Guest room",
      "Event Time: 2 hours preparation, 4 hours event, 2 hours packout",
      "Corkage: ₱2,000 for outside caterers",
      "Corkage: ₱1,000 for sound and lights",
      "Refundable Security Deposit: ₱2,000",
      "Sound System: Starts at ₱5,000",
      "Address: Ecotrend Subdivision, San Nicolas 1, Bacoor, Cavite City",
      "Waze: Patio de Lorenzo",
      "Facebook: Lorenzo Veranda Garden",
    ],
  },
  {
    seedKey: "resort-venue-lorenzo-hall",
    type: "resort_venue",
    title: "Lorenzo Hall",
    subtitle: "Venue-only indoor hall for larger celebrations",
    description:
      "Lorenzo Hall is a venue-only package suitable for programs, celebrations, and private events. The package includes 2 hours preparation, 4 hours event proper, and 2 hours packout.",
    duration: "8 Hours",
    price: 15000,
    variants: [
      {
        label: "8 Hours",
        price: 15000,
        timeSlots: EIGHT_HOUR_TIME_SLOTS,
        displayOrder: 1,
        isActive: true,
      },
    ],
    capacity: "Maximum Capacity: 100 guests",
    imageUrl: "",
    displayOrder: 3,
    isActive: true,
    inclusions: [
      "Total Pax: Maximum 100 guests",
      "Availability: 8 Hours",
      "Price range: ₱15,000",
      "Venue type: Venue Only",
      "Parking Capacity: 20 cars",
      "Includes: One-bedroom",
      "Includes: Air conditioning",
      "Includes: One lounge room",
      "Event Time: 2 hours preparation, 4 hours event, 2 hours packout",
      "Corkage: ₱3,000 for outside caterers",
      "Corkage: ₱2,000 for sound and lights",
      "Refundable Security Deposit: ₱2,000",
      "Sound System: Starts at ₱5,000",
      "Address: Ecotrend Subdivision, San Nicolas 1, Bacoor, Cavite City",
      "Waze: Patio de Lorenzo",
      "Facebook: Patio de Lorenzo",
    ],
  },
  {
    seedKey: "resort-venue-lorenzo-cavanas",
    type: "resort_venue",
    title: "Lorenzo Cavanas",
    subtitle: "Entire private resort with pools, rooms, gazebo, and garden area",
    description:
      "Lorenzo Cavanas is an entire resort package for vacations, gatherings, and events. It includes pool access, fully air-conditioned rooms, kitchen use, gazebo areas, and secured parking.",
    duration: "12 Hours / 22 Hours",
    price: 15000,
    variants: [
      {
        label: "12 Hours",
        price: 15000,
        timeSlots: TWELVE_HOUR_TIME_SLOTS,
        displayOrder: 1,
        isActive: true,
      },
      {
        label: "22 Hours",
        price: 20000,
        timeSlots: TWENTY_TWO_HOUR_TIME_SLOTS,
        displayOrder: 2,
        isActive: true,
      },
    ],
    capacity: "Venue Capacity: 100 pax",
    imageUrl: "",
    displayOrder: 4,
    isActive: true,
    inclusions: [
      "Total Pax: Venue capacity 100 pax",
      "Availability: 12 Hours / 22 Hours",
      "Price range: ₱15,000 for 12 hours / ₱20,000 for 22 hours",
      "Additional: Use of stage starts at ₱5,000",
      "Includes: Entire Resort",
      "Includes: 3 fully air-conditioned rooms",
      "Includes: 4 toilet rooms with bidet",
      "Includes: Kiddie pool 3ft",
      "Includes: Adult pool 5ft",
      "Includes: 16 liters water",
      "Includes: Free air-conditioned videoke room",
      "Includes: Kitchen with stove and refrigerator",
      "Includes: Griller",
      "Includes: 2 spacious gazebo",
      "Includes: Garden area",
      "Includes: Secured parking",
      "Event Time with stage: 3 hours preparation, 4 hours proper event, 2 hours packout",
      "Noise Curfew: 10:00 PM",
      "Swimming Hours: 6:00 AM - 1:00 AM",
      "Visitors: Not allowed",
      "Nearby: Alfamart, Dali, Puremart convenience stores",
      "Nearby: 5 minutes drive to NOMO",
      "Nearby: 10 minutes drive to Zapote Kalinisan",
      "Location: Ecotrend Subdivision, San Nicolas 1, Bacoor, Cavite",
      "Contact: 09064191405 / 09338699988",
      "Facebook: Lorenzo Cavanas",
    ],
  },
];

async function seedHotelServicePackages() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in your Lumispire/.env file");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    await HotelServicePackage.deleteMany({
      seedKey: {
        $in: [
          "resort-venue-nature-room",
          "resort-venue-family-room",
          "resort-venue-pavilion",
        ],
      },
    });

    for (const item of RESORT_VENUE_PACKAGES) {
      await HotelServicePackage.findOneAndUpdate(
        { seedKey: item.seedKey },
        { $set: item },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`Seeded/updated: ${item.title}`);
    }

    console.log("Resort and venue packages seeded/updated successfully.");
    console.log(`Total resort packages checked: ${RESORT_VENUE_PACKAGES.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

seedHotelServicePackages();