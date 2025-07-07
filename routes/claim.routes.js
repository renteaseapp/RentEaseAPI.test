<<<<<<< HEAD
import express from 'express';
import ClaimController from '../controllers/claim.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';
import validateRequest from '../middleware/validateRequest.js';
import { uploadMultipleFields } from '../middleware/fileUpload.js';
import { createClaimSchema, respondToClaimSchema } from '../DTOs/claim.dto.js';
import Joi from 'joi'; // For param validation

const router = express.Router();
router.use(authenticateJWT); // All claim routes require authentication

const claimParamSchema = Joi.object({
    claim_id_or_uid: Joi.alternatives().try(
        Joi.number().integer().positive(),
        Joi.string().guid({ version: 'uuidv4' })
    ).required()
});

// User (Owner) creates a new claim
router.post(
    '/',
    uploadMultipleFields([{ name: 'attachments[]', maxCount: 5 }]),
    validateRequest(createClaimSchema, 'body'),
    ClaimController.createClaim
);

// Get user's claims history (owner or renter)
router.get(
    '/my-claims', // Or just / if it's /api/users/me/claims
    // Add query param DTO if needed for filtering status, page, limit
    ClaimController.getMyClaims
);

// Get specific claim details (owner, renter, or admin)
router.get(
    '/:claim_id_or_uid',
    validateRequest(claimParamSchema, 'params'),
    ClaimController.getClaimDetails
);

// User (Renter) responds to a claim
router.post( // Using POST for response as it creates a "response" entity/update
    '/:claim_id_or_uid/respond',
    validateRequest(claimParamSchema, 'params'),
    uploadMultipleFields([{ name: 'attachments[]', maxCount: 5 }]),
    validateRequest(respondToClaimSchema, 'body'),
    ClaimController.respondToClaim
);

// Get claims where user is owner (reported_by_id)
router.get(
    '/as-owner',
    ClaimController.getOwnerClaims
);

// Get claims where user is renter (accused_id)
router.get(
    '/as-renter',
    ClaimController.getRenterClaims
);

// PUT /api/claims/{claim_id_or_uid} (Owner to update claim details before renter response, or Admin to resolve) - For later if needed

=======
import express from 'express';
import ClaimController from '../controllers/claim.controller.js';
import authenticateJWT from '../middleware/authenticateJWT.js';
import validateRequest from '../middleware/validateRequest.js';
import { uploadMultipleFields } from '../middleware/fileUpload.js';
import { createClaimSchema, respondToClaimSchema } from '../DTOs/claim.dto.js';
import Joi from 'joi'; // For param validation

const router = express.Router();
router.use(authenticateJWT); // All claim routes require authentication

const claimParamSchema = Joi.object({
    claim_id_or_uid: Joi.alternatives().try(
        Joi.number().integer().positive(),
        Joi.string().guid({ version: 'uuidv4' })
    ).required()
});

// User (Owner) creates a new claim
router.post(
    '/',
    uploadMultipleFields([{ name: 'attachments[]', maxCount: 5 }]),
    validateRequest(createClaimSchema, 'body'),
    ClaimController.createClaim
);

// Get user's claims history (owner or renter)
router.get(
    '/my-claims', // Or just / if it's /api/users/me/claims
    // Add query param DTO if needed for filtering status, page, limit
    ClaimController.getMyClaims
);

// Get specific claim details (owner, renter, or admin)
router.get(
    '/:claim_id_or_uid',
    validateRequest(claimParamSchema, 'params'),
    ClaimController.getClaimDetails
);

// User (Renter) responds to a claim
router.post( // Using POST for response as it creates a "response" entity/update
    '/:claim_id_or_uid/respond',
    validateRequest(claimParamSchema, 'params'),
    uploadMultipleFields([{ name: 'attachments[]', maxCount: 5 }]),
    validateRequest(respondToClaimSchema, 'body'),
    ClaimController.respondToClaim
);

// Get claims where user is owner (reported_by_id)
router.get(
    '/as-owner',
    ClaimController.getOwnerClaims
);

// Get claims where user is renter (accused_id)
router.get(
    '/as-renter',
    ClaimController.getRenterClaims
);

// PUT /api/claims/{claim_id_or_uid} (Owner to update claim details before renter response, or Admin to resolve) - For later if needed

>>>>>>> 55b0194c2d6ec825affe8c8a53a320b6496ad045
export default router; 