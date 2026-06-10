import express from "express";
import {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} from "../controllers/tripController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createTrip); // CREATE TRIP
router.get("/my-trips", getUserTrips); // GET ALL TRIPS
router.get("/:id", getTripById); // GET TRIP BY ID
router.put("/:id", updateTrip); // UPDATE TRIP
router.delete("/:id", deleteTrip); // Delete TRIP

export default router;
