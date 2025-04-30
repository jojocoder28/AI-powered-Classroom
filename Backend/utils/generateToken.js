const generateToken = (user, token, message, statusCode, res) => {
    // Determine the cookie name based on the user's role
    let cookieName;
    if (user.role === 'Admin') {
      cookieName = 'adminToken';
    } else if (user.role === 'Teacher') {
      cookieName = 'teacherToken';
    } else if (user.role === 'Student') {
      cookieName = 'studentToken';
    } else {
        // For any other role, throw an error or handle as a generic user if applicable
        // Assuming only these three roles are expected to receive tokens via this function:
        throw new Error(`Unhandled user role for token generation: ${user.role}`);
    }
  
    res
      .status(statusCode)
      .cookie(cookieName, token, {
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
      })
      .json({
        success: true,
        message,
        user,
        token,
      });
  };

  module.exports = generateToken;