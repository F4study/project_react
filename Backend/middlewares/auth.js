const jwt = require("jsonwebtoken");

exports.auth = (...Roles) => {
  return (req, res, next) => {
    // Accept either `Authorization: Bearer <token>` or `bearer: <token>` headers
    const authHeader = req.headers['authorization'] || req.headers['bearer'];
    if (!authHeader) {
      return res.status(401).json({ status: false, message: 'ไม่มีสิทธิ์ (ไม่มี token)' });
    }
    const token = String(authHeader).startsWith('Bearer ') ? String(authHeader).split(' ')[1] : authHeader;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      const userRole = req.user.role_name ?? req.user.role;
      if (userRole === undefined || userRole === null) {
        return res
          .status(403)
          .json({ status: false, message: "ไม่ได้รับอนุญาต (ไม่มี role)" });
      }

      const hasRole = Roles.some((r) => {
        if (!isNaN(Number(userRole)) && !isNaN(Number(r))) {
          return Number(userRole) === Number(r);
        }
        return String(userRole).toLowerCase() === String(r).toLowerCase();
      });

      if (!hasRole) {
        return res
          .status(403)
          .json({ status: false, message: "ไม่ได้รับอนุญาต (role ไม่ตรง)" });
      }

      return next();
    } catch (err) {
      return res
        .status(401)
        .json({ status: false, message: "Token ไม่ถูกต้องหรือหมดอายุ" });
    }
  };
};

// exports.authorizeRoles = (...allowedRoles) => {
// 	return (req, res, next) => {
// 		if (!req.user) {
// 			return res.status(401).json({ status: false, message: "ไม่มีข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ" });
// 		}
//         console.log("User role:", req.user);
// 		const userRole = req.user.role_name ?? req.user.role;
// 		if (userRole === undefined || userRole === null) {
// 			return res.status(403).json({ status: false, message: "ไม่ได้รับอนุญาต (ไม่มี role)" });
// 		}

// 		const hasRole = allowedRoles.some((r) => {
// 			if (!isNaN(Number(userRole)) && !isNaN(Number(r))) {
// 				return Number(userRole) === Number(r);
// 			}
// 			return String(userRole).toLowerCase() === String(r).toLowerCase();
// 		});

// 		if (!hasRole) {
// 			return res.status(403).json({ status: false, message: "ไม่ได้รับอนุญาต (role ไม่ตรง)" });
// 		}

// 		const hasRole = allowedRoles.some((r) => {
// 			if (!isNaN(Number(userRole)) && !isNaN(Number(r))) {
// 				return Number(userRole) === Number(r);
// 			}
// 			return String(userRole).toLowerCase() === String(r).toLowerCase();
// 		});

// 		if (!hasRole) {
// 			return res.status(403).json({ status: false, message: "ไม่ได้รับอนุญาต (role ไม่ตรง)" });
// 		}

// 		return next();
// 	};
// };
