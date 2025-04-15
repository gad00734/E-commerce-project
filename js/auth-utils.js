// Ensure default admin exists
function ensureDefaultAdmin() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const adminExists = users.some(user => user.role === "admin");
  
    if (!adminExists) {
      users.push({
        name: 'Admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      });
      localStorage.setItem('users', JSON.stringify(users));
    }
  }
  