## 1. Project Overview

The **Paper Bag Business Manager** is a centralized administrative tool designed for small-scale paper bag manufacturers. It streamlines operations from client onboarding and product cataloging to production tracking and financial document generation (Invoices, Proformas, Receipts).

**Company Name:** Happy Bags

**Logo:** HAPPY BAGS 4X4IN.jpeg(In the root folder)


## 2. Target Users



* **Business Owner/Manager(manager):** Full access to all modules, financial reporting, and user management.
* **Sales Representative(sales_rep):** Access to clients, products, and order creation.
* **Client(client):** Access to its own orders, invoices and receipts


## 3. Functional Modules


### 3.1 User Management



* **Purpose: **Role-Based Access Control (RBAC)
* **Roles:** manager, sales_rep, client(linked to client_id)
* **Authentication:** Secure login/logout with session management and persisting user login.
* **Profile Management:** Basic details for staff identification and password change.
* **Data Fields:** \
userId: Unique identifier. \
userName: Display name. \
hashPassword: Encrypted credentials. \
role: role of user.


### 3.2 Product Management



* **Purpose:** Manage various bag types (e.g., SOS bags, Flat-handle, Twisted-handle).
* **Data Fields:** \
productId: Unique ID(auto increment primary key). \
productName: e.g., "Premium Paper Bag" \
unitPrice: Current selling price. \
category: e.g., Tote, Box, Paper Bag. \
dimension: Length x Breadth x Height \
otherDetails: Type of Handle


### 3.3 Client Management



* **Purpose:** Store client contact info, delivery addresses etc
* **Data Fields:**
* clientId: Unique ID(auto increment primary key). \
clientName: Business or Individual name. \
mobileNo1 \
mobileNo2: Primary and secondary contact. \
deliveryAddress: Physical address or delivery zone.
* **Order History:** View all past interactions and financial standings per client.


### 3.4 Orders & Workflow



* **Data Fields:**
* orderId: Format HPBG-YYYY-XXXX. \
clientId: Reference to Client ID. \
items: Array of {productId, qty, lineTotal}. \
subtotal & total: Calculated values. \
status: Quote, Invoice Created, Payment Received, Work In Progress, Work Completed, or Delivered. \
deliveryDate: Promise Date \
orderCreatedAt: order date. \
OrderUpdatedAt: Date of updates
* **Order Entry:** Select client,  products, quantities, and apply custom discount.
* **Workflow Stages:** - *Default Status: Quote/Proforma* -> *Invoice Issued* -> *Payment Received* -> *Production* -> Delivered -> *Completed*.
* **Taxes:** Check box to select VAT/NON-VAT. VAT executes an automated calculation of VAT(20%) on total cost.


### 3.5 Dashboard



* **Live Status Tracking:** Real-time updates from "Processing" to "Shipped."
* **Data Visualization:** Interactive charts for sales trends and regional demand.
* **Alert System:** Instant notifications for low stock or bottlenecked orders.
* **One-Click Actions:** Quick access to edit, cancel, or refund orders directly from the view.


### 3.6 Financial Document Generation (PDF)



* **Proforma Invoices:** Pre-payment estimates for clients.
* **Invoices:** Official legal documents for payment and accounting.
* **Receipts:** Proof of payment after transaction completion.
* **Templates:** Professional layouts including business logo, terms and conditions, and automated totals.


## 4. Technical Requirements



* **Frontend:** \
Responsive web interface (Mobile friendly for phone users staff). \
React 19 + TypeScript + Vite. \
UI: Tailwind CSS v4 + Shadcn/ui \
Use a professional glassmorphic aesthetic suitable for an official environment. Make use of space.
* **Left Section:** Shows a company logo and name.
* **Right Section:** A notification bell with an active badge, a 'Help' icon, and a user profile section showing a rounded avatar/display and the user's name and a logout link
* **Middle Section:** Search Bar
* **Mobile Support:** Show just a simple logo and a hamburger menu trigger.
* **Navigation** \
Use Sidebar For Desktop Screensand on screens smaller than 768px, the sidebar must reflow into a bottom navigation bar with icons for easy thumb access.
* **Login Page** \
A streamlined, **frictionless gateway** designed to get users into their workflow as fast as possible. Featuring a clean, responsive layout, the page supports 'Remember Me' functionality and a self-service password recovery system, ensuring that technical hurdles never slow down the fulfillment process."
* **Persistent Branding:** Your company logo for immediate recognition.
* **Show/Hide Password:** A small eye icon to reduce typing errors and frustration.
* **Validation Alerts:** Clear, non-scary messages for "Incorrect password" or "Account locked."
* **Backend:** \
Laravel 12 (PHP 8.4), Inertia.js, Laravel Breeze \
PDF Engine: Client-side or server-side library (e.g., jspdf or react-pdf) to generate high-quality documents.
* **Database:** \
MySQL Sqlite as Backup \
**Migration:** create all tables based on the models above