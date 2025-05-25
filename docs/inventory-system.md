# Inventory Management System Documentation

## Overview

This comprehensive inventory management system provides full tracking and management capabilities for physical merchandise in your NestJS application.

## Features

### 1. Inventory Tracking
- **Real-time stock levels**: Track current, minimum, maximum, and reorder points
- **SKU management**: Unique product identification
- **Category organization**: Group products by category
- **Multi-unit support**: Handle different units of measurement
- **Status tracking**: Active, discontinued, out-of-stock statuses

### 2. Supplier Management
- **Supplier profiles**: Complete supplier information and contact details
- **Performance tracking**: Delivery times, on-time delivery rates
- **Rating system**: Supplier quality ratings
- **Active/inactive status**: Manage supplier relationships

### 3. Batch and Lot Tracking
- **FIFO allocation**: First-in, first-out inventory allocation
- **Expiry date management**: Track product expiration dates
- **Batch status tracking**: Active, expired, recalled, sold-out
- **Manufacturing date tracking**: Complete product lifecycle tracking

### 4. Purchase Order Management
- **Order lifecycle**: Draft → Pending → Approved → Ordered → Received
- **Multi-item orders**: Support for complex purchase orders
- **Delivery tracking**: Expected vs actual delivery dates
- **Partial receiving**: Handle partial deliveries

### 5. Inventory Forecasting
- **Demand prediction**: AI-powered demand forecasting
- **Stock optimization**: Recommended stock levels
- **Confidence levels**: Forecast accuracy indicators
- **Historical analysis**: Based on sales patterns

### 6. Automated Alerts
- **Low stock alerts**: Automatic notifications when stock is low
- **Expiry warnings**: Alerts for products nearing expiration
- **Reorder suggestions**: Automated reorder recommendations
- **Scheduled reports**: Daily, weekly, and monthly reports

### 7. Audit Trail
- **Complete tracking**: All inventory movements tracked
- **Reason codes**: Stock in, out, adjustments, transfers, damage
- **User attribution**: Track who performed each action
- **Reference linking**: Link to orders, transfers, etc.

## API Endpoints

### Inventory Items
\`\`\`
GET    /inventory                    # List all inventory items
POST   /inventory                    # Create new inventory item
GET    /inventory/:id                # Get specific item
PATCH  /inventory/:id                # Update inventory item
DELETE /inventory/:id                # Delete inventory item
GET    /inventory/low-stock          # Get low stock items
GET    /inventory/stock-value        # Get total stock value
POST   /inventory/adjust-stock       # Adjust stock levels
GET    /inventory/:id/turnover       # Get inventory turnover rate
\`\`\`

### Suppliers
\`\`\`
GET    /suppliers                    # List all suppliers
POST   /suppliers                    # Create new supplier
GET    /suppliers/:id                # Get specific supplier
PATCH  /suppliers/:id                # Update supplier
DELETE /suppliers/:id                # Delete supplier
GET    /suppliers/:id/performance    # Get supplier performance metrics
\`\`\`

### Batches
\`\`\`
GET    /batches                      # List all batches
POST   /batches                      # Create new batch
GET    /batches/:id                  # Get specific batch
PATCH  /batches/:id/status           # Update batch status
GET    /batches/expiring             # Get expiring batches
POST   /batches/allocate             # Allocate stock from batches
POST   /batches/:id/confirm-allocation # Confirm allocation
\`\`\`

### Purchase Orders
\`\`\`
GET    /purchase-orders              # List all purchase orders
POST   /purchase-orders              # Create new purchase order
GET    /purchase-orders/:id          # Get specific order
PATCH  /purchase-orders/:id/status   # Update order status
POST   /purchase-orders/:id/receive  # Receive order items
GET    /purchase-orders/reorder-suggestions # Get reorder suggestions
\`\`\`

### Forecasting
\`\`\`
POST   /forecasts/:itemId/generate   # Generate forecast for item
GET    /forecasts/:itemId            # Get forecasts for item
POST   /forecasts/generate-all       # Generate forecasts for all items
GET    /forecasts/optimization/suggestions # Get optimization suggestions
\`\`\`

## Database Schema

### Core Tables
- `suppliers` - Supplier information
- `inventory_items` - Product catalog and stock levels
- `inventory_batches` - Batch/lot tracking
- `inventory_audits` - Complete audit trail
- `purchase_orders` - Purchase order headers
- `purchase_order_items` - Purchase order line items
- `inventory_forecasts` - Demand forecasting data

## Configuration

### Environment Variables
\`\`\`env
# Database configuration
DATABASE_URL=postgresql://user:password@localhost:5432/database

# Alert configuration
INVENTORY_WEBHOOK_URL=https://your-webhook-url.com/alerts
INVENTORY_EMAIL_NOTIFICATIONS=true

# Scheduling
ENABLE_INVENTORY_ALERTS=true
ENABLE_AUTOMATED_REPORTS=true
\`\`\`

### Module Integration
\`\`\`typescript
// app.module.ts
import { MerchandiseModule } from './modules/merchandise/merchandise.module';

@Module({
  imports: [
    // ... other modules
    MerchandiseModule,
  ],
})
export class AppModule {}
\`\`\`

## Usage Examples

### Creating an Inventory Item
\`\`\`typescript
const newItem = await inventoryService.create({
  sku: 'TSHIRT-001',
  name: 'Band T-Shirt',
  description: 'Official band merchandise t-shirt',
  category: 'Apparel',
  unitPrice: 25.00,
  costPrice: 12.50,
  currentStock: 100,
  minimumStock: 20,
  maximumStock: 200,
  reorderPoint: 30,
  reorderQuantity: 100,
  unit: 'pieces',
  supplierId: 'supplier-uuid'
});
\`\`\`

### Adjusting Stock
\`\`\`typescript
await inventoryService.adjustStock({
  inventoryItemId: 'item-uuid',
  quantityChanged: -5, // Negative for stock out
  type: AuditType.STOCK_OUT,
  reason: 'Sale',
  reference: 'order-123',
  performedBy: 'user-uuid'
});
\`\`\`

### Creating a Purchase Order
\`\`\`typescript
const purchaseOrder = await purchaseOrderService.create({
  orderNumber: 'PO-2024-001',
  supplierId: 'supplier-uuid',
  expectedDeliveryDate: '2024-02-15',
  createdBy: 'user-uuid',
  items: [
    {
      inventoryItemId: 'item-uuid',
      quantityOrdered: 100,
      unitPrice: 12.50
    }
  ]
});
\`\`\`

## Automated Features

### Scheduled Tasks
- **Daily 9 AM**: Low stock alert check
- **Daily 10 AM**: Expiry warning check
- **Weekly Monday 8 AM**: Reorder suggestions
- **Monthly 1st**: Inventory movement report
- **Weekly Sunday**: Stock level report

### Alert Types
1. **Low Stock**: When current stock ≤ reorder point
2. **Expiry Warning**: Products expiring within 30 days
3. **Reorder Suggestions**: Based on consumption patterns
4. **Overstock**: When stock > maximum level

## Best Practices

### Stock Management
1. Set appropriate reorder points based on lead times
2. Use FIFO allocation for perishable items
3. Regular cycle counting for accuracy
4. Monitor turnover rates for optimization

### Supplier Management
1. Maintain multiple suppliers for critical items
2. Track supplier performance metrics
3. Regular supplier reviews and ratings
4. Negotiate better terms based on performance

### Forecasting
1. Use at least 90 days of historical data
2. Consider seasonality and trends
3. Adjust safety stock based on demand variability
4. Regular forecast accuracy reviews

## Troubleshooting

### Common Issues
1. **Negative Stock**: Check audit trail for discrepancies
2. **Allocation Failures**: Verify available batch quantities
3. **Forecast Inaccuracy**: Review historical data quality
4. **Alert Overload**: Adjust threshold settings

### Performance Optimization
1. Use database indexes on frequently queried fields
2. Implement pagination for large datasets
3. Cache frequently accessed data
4. Regular database maintenance

## Security Considerations

1. **Access Control**: Implement role-based permissions
2. **Audit Trail**: Maintain complete transaction history
3. **Data Validation**: Validate all input data
4. **Backup Strategy**: Regular database backups
5. **Encryption**: Encrypt sensitive supplier data

## Future Enhancements

1. **Barcode Integration**: QR/barcode scanning support
2. **Mobile App**: Mobile inventory management
3. **IoT Integration**: Automated stock counting
4. **Advanced Analytics**: Machine learning forecasting
5. **Multi-location**: Support for multiple warehouses
