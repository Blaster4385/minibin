import Express from "express";
import bin from "../controllers/bin.js";

const router = Express.Router();

bin.createBinTable();

router.get("/:id", bin.getBin);
router.post("/", bin.createBin);

export default router;
