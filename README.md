# Multi-Outlet Business Management System for Electronics Businesses  

## Overview  
The **Multi-Outlet Business Management System** is a full-stack application designed to manage the operations of an electronics business with multiple outlets. Built with modern technologies, it provides features such as centralized inventory management, sales tracking, and employee coordination. This system ensures seamless management of multiple outlets through a robust backend and a user-friendly frontend.  

[**Demo Video**](https://drive.google.com/file/d/17cVOS-g3pTg8EZ0x6XXC0KRgNvCKUxtb/view?usp=sharing)

---

## Key Features  

### **1. Inventory Management**  
   - Centralized control of inventory for all outlets.  
   - Real-time stock updates and tracking.  
   - Low-stock notifications and automated restocking suggestions.  
   - Product categorization (e.g., phones, laptops, accessories).  

### **2. Sales Tracking**  
   - Track sales across multiple outlets.  
   - Generate detailed sales reports (daily, weekly, monthly).  
   - Support for POS integration and receipt generation.  
   - Manage discounts, offers, and loyalty programs.  

### **3. Multi-Outlet Support**  
   - Centralized dashboard for managing all outlets.  
   - Compare performance metrics across branches.  
   - Facilitate inter-branch stock transfers with ease.  

### **4. Employee Management**  
   - Role-based access control (Admin, Manager, Seller).  
   - Assign tasks and monitor employee activity.  
   - Attendance tracking and performance evaluation.  

### **5. Reporting and Analytics**  
   - Generate comprehensive reports for inventory, sales, and expenses.  
   - Visualize trends through graphs and charts.  
   - Export reports in PDF and CSV formats.  

### **6. Finance and Accounting**  
   - Monitor expenses, profits, and losses for each outlet.  
   - Generate invoices and receipts.  
   - Manage accounts payable and receivable.  

---

## Tech Stack  

### **Backend**  
- **Framework**: Express.js  
- **Database**: MongoDB  
- **Authentication**: Cookie-based Authentication  

### **Frontend**  
- **Framework**: React.ts  
- **State Management**: Context API  
- **Styling**: Tailwind CSS

---

## Installation and Setup  

### Prerequisites  
- Node.js and npm installed.  
- MongoDB installed locally or access to a MongoDB Atlas cluster.  

### Steps  

1. **Clone the Repository**  
   ```bash  
   git clone https://github.com/kc-allan/merchants-portal.git  
   cd merchants-portal  
   ```  

2. **Backend Setup**  
   ```bash  
   cd backend  
   npm install  
   ```  
   - Rename a `.env.example` to `.env` in the `backend` directory and fill in the environment varibale as per your credentials 
   - Start the backend server:  
     ```bash  
     npm run start  
     ```  

3. **Frontend Setup**  
   ```bash  
   cd ../client  
   npm install  
   ```  
   - Start the React development server:  
     ```bash  
     npm run dev  
     ```  

4. **Access the Application**  
   - Frontend: `http://localhost:4422`  
   - Backend API: `http://localhost:3000`  

---

## Future Enhancements  
- Integration with e-commerce platforms for online sales.  
- AI-driven analytics for sales and stock predictions.  
- Notifications for customers via email/SMS for repairs and warranties.  

---

## Contributing  
We welcome contributions! To contribute:  
1. Fork the repository.  
2. Create a new branch for your feature.  
3. Submit a pull request with a detailed description.  

---

## License  
This project is licensed under the [MIT License](LICENSE).  

For any inquiries or support, contact [Allan Kirui] at [kiruiallan401@gmail.com].  
