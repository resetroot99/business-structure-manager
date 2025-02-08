import { EventEmitter } from 'events';

class BusinessEventEmitter extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20); // Increase max listeners if needed
    }

    emitFinancialUpdate(businessId, data) {
        this.emit('financial_update', { businessId, data });
    }

    emitComplianceUpdate(businessId, data) {
        this.emit('compliance_update', { businessId, data });
    }

    emitTaxUpdate(businessId, data) {
        this.emit('tax_update', { businessId, data });
    }

    emitDocumentUpdate(businessId, data) {
        this.emit('document_update', { businessId, data });
    }

    emitAlert(businessId, data) {
        this.emit('alert', { businessId, data });
    }
}

export { BusinessEventEmitter }; 