const userModel = require('../models/user.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Helper to remove passwordHash from user object
 * @param {Object} user 
 * @returns {Object|null}
 */
const serializeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

/**
 * Get current user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, 401, 'User not authenticated');
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'User profile retrieved successfully', {
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, 401, 'User not authenticated');
    }

    const { username, fullName, phone, address } = req.body;
    const updateData = {};

    // Validate and limit updates to Plan 1 fields
    if (username !== undefined) {
      if (username === null || String(username).trim() === '') {
        return errorResponse(res, 400, 'Username cannot be empty');
      }
      updateData.username = username;
    }
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    // Check if there is anything to update
    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, 400, 'No fields provided for update');
    }

    const updatedUser = await userModel.update(req.user.id, updateData);

    return successResponse(res, 200, 'User profile updated successfully', {
      user: serializeUser(updatedUser)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users for admin
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await userModel.findAll();
    const safeUsers = users.map(user => serializeUser(user));

    return successResponse(res, 200, 'Users retrieved successfully', {
      users: safeUsers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers
};
