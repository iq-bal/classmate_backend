function checkIfTeacher(req, res, next) {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Access denied. Teachers only." });
    }
    next();
}

export default checkIfTeacher;