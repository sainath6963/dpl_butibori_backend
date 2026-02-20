import { body, validationResult } from 'express-validator';
import ErrorHandler from './errorHandler.js';

// Validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return next(new ErrorHandler(errorMessages.join(', '), 400));
    }
    next();
};

// Registration validation
export const validateRegistration = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    
    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone('en-IN').withMessage('Please provide a valid 10-digit Indian phone number'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
    validateRequest
];

// Login validation
export const validateLogin = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    
    body('password')
        .notEmpty().withMessage('Password is required'),
    
    validateRequest
];

// Player registration validation
export const validatePlayerRegistration = [
    body('fullName')
        .notEmpty().withMessage('Full name is required'),
    
    body('dateOfBirth')
        .notEmpty().withMessage('Date of birth is required')
        .isISO8601().withMessage('Invalid date format'),
    
    body('gender')
        .notEmpty().withMessage('Gender is required')
        .isIn(['male', 'female', 'other']).withMessage('Invalid gender value'),
    
    body('battingStyle')
        .notEmpty().withMessage('Batting style is required')
        .isIn(['right-handed', 'left-handed']).withMessage('Invalid batting style'),
    
    body('playerRole')
        .notEmpty().withMessage('Player role is required')
        .isIn(['batsman', 'bowler', 'all-rounder', 'wicket-keeper']).withMessage('Invalid player role'),
    
    body('previousExperience')
        .notEmpty().withMessage('Previous experience is required')
        .isIn(['professional', 'club-level', 'district-level', 'beginner']).withMessage('Invalid experience level'),
    
    validateRequest
];