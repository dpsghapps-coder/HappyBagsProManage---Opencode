# Code Review - Upgrade Notes

## Issues Found

### 1. Missing `user_id` in Order model fillable
**Location:** `app/Models/Order.php:13-24`

The `user_id` is used in `store()` (line 256) but not listed in `$fillable`.

**Fix:** Add `'user_id'` to the `$fillable` array.

---

### 2. Duplicate status logging logic
**Location:** `app/Http/Controllers/OrderController.php:267`

`OrderService::logOrderCreation($order)` creates a status log, but then `AuditService::logCreate` is also called - this duplicates audit trails.

**Fix:** Review audit flow to avoid duplicate logging.

---

### 3. N+1 Query Problem
**Location:** `OrderController.php:68-70, 134-137`

Product lookup happens in a loop for each item without eager loading.

**Fix:** Use eager loading or batch fetch products before the loop.

---

### 4. Hardcoded VAT rate
**Location:** `OrderController.php:249, 335`

20% VAT is hardcoded in two places; should be configurable.

**Fix:** Move to a config file or constants class.

---

### 5. PDF generation methods are duplicated
**Location:** `OrderController.php:470-612`

`generateEstimate`, `generateProforma`, `generateInvoice` all call the same view with identical logic.

**Fix:** Extract to a single method with document type parameter.

---

### 6. Missing transaction in Payment store
**Location:** `PaymentController.php:48-54`

Payment creation and potential order status update should be atomic.

**Fix:** Wrap in `DB::transaction()`.

---

### 7. Potential status auto-advance race condition
**Location:** `PaymentController.php:63-73`

Checking `isFullyPaid()` after creating payment without locking could cause issues under concurrent requests.

**Fix:** Use database locking or atomic operations.

---

### 8. Client model missing soft deletes
**Location:** `app/Models/Client.php`

Order uses SoftDeletes but Client does not - inconsistent.

**Fix:** Consider adding SoftDeletes to Client model.

---

### 9. Missing user authorization check in PaymentController
**Location:** `PaymentController.php:41`

No check if user has permission to add payments.

**Fix:** Add role/permission check before processing payment.

---

## Good Practices Observed

- Proper use of transactions in Order creation
- Audit logging service is well-structured
- Access control via role checks in OrderController
- Proper use of model relationships

## Recommendations

- Add `user_id` to Order `$fillable`
- Extract PDF generation to a service
- Use database transactions for payment + status updates
- Add authorization middleware to PaymentController