import prisma from "../db/prisma.js";

// CREATE TRIP:
export const createTrip = async (req, res) => {
  try {
    const { destination, country, dates, currency, fxRate, places, costs } =
      req.body;

    if (!destination || !dates || !costs || !places) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newTrip = await prisma.trip.create({
      data: {
        userId: req.userId,
        destination,
        country,
        startDate: new Date(dates.from),
        endDate: new Date(dates.to),
        currency,
        fxRate: parseFloat(fxRate || 1),
        flightCost: parseFloat(costs.flight || 0),
        lodgingCost: parseFloat(costs.lodging || 0),
        foodCost: parseFloat(costs.food || 0),
        activitiesCost: parseFloat(costs.activities || 0),
        totalCost: parseFloat(costs.total || 0),
        places: places,
      },
    });

    res
      .status(201)
      .json({ message: "Trip planned successfully!", trip: newTrip });
  } catch (error) {
    console.error("Create trip error:", error);

    res.status(500).json({
      message: "Internal server error.",
      errorName: error.name,
      errorMessage: error.message,
      prismaCode: error.code || null,
    });
  }
};

// GET ALL TRIPS:
export const getUserTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.userId },
      orderBy: { startDate: "asc" },
    });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Get trips error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// GET TRIP BY ID:
export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { id: id, userId: req.userId },
    });

    if (!trip) {
      return res
        .status(404)
        .json({ message: "Trip not found or unauthorized." });
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error("Get trip by ID error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// UPDATE TRIP:
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { destination, country, dates, currency, fxRate, places, costs } =
      req.body;

    const tripExists = await prisma.trip.findFirst({
      where: { id: id, userId: req.userId },
    });

    if (!tripExists) {
      return res
        .status(404)
        .json({ message: "Trip not found or unauthorized." });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: id },
      data: {
        destination: destination || tripExists.destination,
        country: country || tripExists.country,
        startDate: dates?.from ? new Date(dates.from) : tripExists.startDate,
        endDate: dates?.to ? new Date(dates.to) : tripExists.endDate,
        currency: currency || tripExists.currency,
        fxRate: fxRate !== undefined ? parseFloat(fxRate) : tripExists.fxRate,
        flightCost:
          costs?.flight !== undefined
            ? parseFloat(costs.flight)
            : tripExists.flightCost,
        lodgingCost:
          costs?.lodging !== undefined
            ? parseFloat(costs.lodging)
            : tripExists.lodgingCost,
        foodCost:
          costs?.food !== undefined
            ? parseFloat(costs.food)
            : tripExists.foodCost,
        activitiesCost:
          costs?.activities !== undefined
            ? parseFloat(costs.activities)
            : tripExists.activitiesCost,
        totalCost:
          costs?.total !== undefined
            ? parseFloat(costs.total)
            : tripExists.totalCost,
        places: places || tripExists.places,
      },
    });

    res
      .status(200)
      .json({ message: "Trip updated successfully!", trip: updatedTrip });
  } catch (error) {
    console.error("Update trip error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// DELETE TRIP:
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const tripExists = await prisma.trip.findFirst({
      where: { id: id, userId: req.userId },
    });

    if (!tripExists) {
      return res
        .status(404)
        .json({ message: "Trip not found or unauthorized." });
    }

    await prisma.trip.delete({
      where: { id: id },
    });

    res.status(200).json({ message: "Trip deleted successfully!" });
  } catch (error) {
    console.error("Delete trip error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
