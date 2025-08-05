export const checkRole = (requiredRole) => {
    return async (user) => {
        if (!user) {
            throw new Error('Not authenticated');
        }

        if (user.role !== requiredRole) {
            throw new Error(`Access denied. Required role: ${requiredRole}`);
        }
        
        return true;
    };
};