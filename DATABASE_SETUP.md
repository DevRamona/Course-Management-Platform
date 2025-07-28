# Database Setup Guide

## 🔧 **Quick Fix for MySQL Connection Error**

The error you're seeing is because the application can't connect to your MySQL database. Here's how to fix it:

### **Step 1: Create a `.env` file**

Create a file named `.env` in your project root with your MySQL credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=course_management_db
DB_USER=root
DB_PASSWORD=your_actual_mysql_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

### **Step 2: Find Your MySQL Password**

**If you don't remember your MySQL password:**

1. **Open MySQL Command Line:**
   ```bash
   mysql -u root -p
   ```
   (Press Enter if no password)

2. **Or check if you can connect without password:**
   ```bash
   mysql -u root
   ```

3. **If you can't connect, you might need to reset your MySQL password.**

### **Step 3: Create the Database**

Once you can connect to MySQL, create the database:

```sql
CREATE DATABASE course_management_db;
```

### **Step 4: Test the Connection**

Run the application again:
```bash
npm run dev
```

## 🔍 **Troubleshooting Common Issues**

### **Issue 1: "Access denied for user 'root'@'localhost'"**

**Solutions:**
1. **Check if MySQL is running:**
   ```bash
   # Windows
   net start mysql
   
   # macOS/Linux
   sudo service mysql start
   ```

2. **Try connecting without password:**
   - Set `DB_PASSWORD=` (empty) in your `.env` file

3. **Reset MySQL root password:**
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
   FLUSH PRIVILEGES;
   ```

### **Issue 2: "Can't connect to MySQL server"**

**Solutions:**
1. **Check if MySQL is installed and running**
2. **Verify the port (default is 3306)**
3. **Check firewall settings**

### **Issue 3: "Unknown database"**

**Solution:**
Create the database manually:
```sql
CREATE DATABASE course_management_db;
```

## 🚀 **Quick Start Commands**

```bash
# 1. Create .env file with your credentials
# 2. Start the server
npm run dev

# 3. Seed the database (in a new terminal)
node -e "require('./seeders/seedData').seedData().then(() => process.exit())"
```

## 📋 **Common MySQL Credentials**

| Setup Type | Username | Password |
|------------|----------|----------|
| XAMPP | `root` | `` (empty) |
| WAMP | `root` | `` (empty) |
| MAMP | `root` | `root` |
| Local MySQL | `root` | Your password |
| Docker MySQL | `root` | `password` |

## ✅ **Test Your Setup**

After creating the `.env` file, run:
```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully.
✅ Database models synchronized.
🚀 Server is running on port 3000
```

If you still get errors, please share the exact error message and I'll help you troubleshoot further! 