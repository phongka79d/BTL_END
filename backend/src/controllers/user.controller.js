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

const VALID_ROLES = ['customer', 'admin'];

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
    const { keyword, page, limit } = req.query;
    const result = await userModel.findAll({ keyword, page, limit });
    const safeUsers = result.items.map(user => serializeUser(user));

    return successResponse(res, 200, 'Users retrieved successfully', {
      items: safeUsers,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role for admin
 * PUT /api/admin/users/:id/role
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!VALID_ROLES.includes(role)) {
      return errorResponse(res, 400, 'Role must be customer or admin');
    }

    if (req.user?.id === id && role === 'customer') {
      return errorResponse(res, 400, 'You cannot demote your own admin account');
    }

    const user = await userModel.updateRole(id, role);

    return successResponse(res, 200, 'User role updated successfully', {
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  updateUserRole
};
