const express = require("express");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  uploadDocument,
  listDocuments,
  deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();

router.use(protect);

router.post("/", upload.single("file"), uploadDocument);
router.get("/", listDocuments);
router.delete("/:id", deleteDocument);

module.exports = router;
