import { Request, Response } from "express";
import { Discount } from "../models/discount";

export const createDiscount = async (req: Request, res: Response): Promise<any> => {
    try {
        const { summa, procent } = req.body;

        if (!summa || !procent) {
            return res.status(400).json({ message: "Summa and Procent are required." });
        }

        const newDiscount = new Discount({ summa, procent });
        await newDiscount.save();

        res.status(201).json({ message: "Discount created successfully", discount: newDiscount });
    } catch (error) {
        res.status(500).json({ message: "Error creating discount", error });
    }
};

export const getDiscounts = async (req: Request, res: Response): Promise<any> => {
    try {
        const discounts = await Discount.find();
        res.status(200).json({ discounts });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving discounts", error });
    }
};

export const updateDiscount = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { summa, procent } = req.body;

        const updatedDiscount = await Discount.findByIdAndUpdate(
            id,
            { summa, procent },
            { new: true, runValidators: true }
        );

        if (!updatedDiscount) {
            return res.status(404).json({ message: "Discount not found." });
        }

        res.status(200).json({ message: "Discount updated successfully", discount: updatedDiscount });
    } catch (error) {
        res.status(500).json({ message: "Error updating discount", error });
    }
};

export const deleteDiscount = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const deletedDiscount = await Discount.findByIdAndDelete(id);

        if (!deletedDiscount) {
            return res.status(404).json({ message: "Discount not found." });
        }

        res.status(200).json({ message: "Discount deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting discount", error });
    }
};
