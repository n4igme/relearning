const express = require('express');
const {
  generateCertificate,
  getMyCertificates,
  getCertificate,
  verifyCertificate,
  getAllCertificates,
  revokeCertificate,
  getCertificatesByStudent
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route for certificate verification
router.route('/verify/:number')
  .get(verifyCertificate);

// Student routes
router.use(protect);

router.route('/my-certificates')
  .get(getMyCertificates);

router.route('/')
  .post(generateCertificate);

router.route('/:id')
  .get(getCertificate);

// Admin routes
router.use(authorize('admin'));

router.route('/')
  .get(getAllCertificates);

router.route('/student/:studentId')
  .get(getCertificatesByStudent);

router.route('/:id/revoke')
  .put(revokeCertificate);

module.exports = router;