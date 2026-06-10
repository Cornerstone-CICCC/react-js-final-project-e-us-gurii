import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "dwiqjuwdhdowpkqodijwqudhiwdkwqod";

// REGISTER NEW USER:
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // STRONG PASSWORD REQUIREMENTS === (Minimum 8 characters, 1 uppercase letter, 1 special character)
    const strongPasswordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message:
          "The password must be at least 8 characters long and include at least one uppercase letter and one special character.",
      });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "This email address is already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // SAVE USER - NEON DB
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res
      .status(201)
      .json({ message: "User successfully registered!", userId: newUser.id });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error! Try again later." });
  }
};

// USER LOGIN:
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // FIND BY EMAIL:
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // COMPARE PASSWORD:
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // JWT (24 HOURS):
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error! Try again later." });
  }
};
