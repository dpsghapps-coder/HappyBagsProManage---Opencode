// import { jsPDF } from 'jspdf';
// import html2canvas from 'html2canvas';

interface OrderItem {
    product_name: string;
    qty: number;
    unit_price: number;
    line_total: number;
}

interface Client {
    client_name: string;
    mobile_no1: string;
    delivery_address: string;
}

interface Order {
    id: number;
    order_id: string;
    client?: Client;
    items: OrderItem[];
    subtotal: number;
    total: number;
    is_vat: boolean;
    delivery_date: string | null;
    created_at: string;
}

declare const route: (name: string, params?: any) => string;

// Preview functions (opens print dialog)
export function generateInvoice(order: Order): void {
    const previewWindow = window.open(route('orders.preview-invoice', order.id), '_blank');
    if (previewWindow) {
        previewWindow.onload = () => {
            previewWindow.print();
            previewWindow.onafterprint = () => previewWindow.close();
        };
    }
}

export function generateProforma(order: Order): void {
    const previewWindow = window.open(route('orders.preview-proforma', order.id), '_blank');
    if (previewWindow) {
        previewWindow.onload = () => {
            previewWindow.print();
            previewWindow.onafterprint = () => previewWindow.close();
        };
    }
}

export function generateEstimate(order: Order): void {
    const previewWindow = window.open(route('orders.preview-estimate', order.id), '_blank');
    if (previewWindow) {
        previewWindow.onload = () => {
            previewWindow.print();
            previewWindow.onafterprint = () => previewWindow.close();
        };
    }
}

export function generateReceipt(order: Order, amountPaid: number): void {
    const url = route('orders.preview-receipt', order.id);
    const fullUrl = `${url}?amount_paid=${encodeURIComponent(amountPaid.toString())}`;
    const previewWindow = window.open(fullUrl, '_blank');
    if (previewWindow) {
        previewWindow.onload = () => {
            previewWindow.print();
            previewWindow.onafterprint = () => previewWindow.close();
        };
    }
}

/*
================================================================================
FUTURE: Auto-download PDF using jsPDF + html2canvas
================================================================================

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

async function downloadPdfFromPreview(url: string, filename: string): Promise<void> {
    const previewWindow = window.open(url, '_blank');
    if (!previewWindow) {
        alert('Please allow popups to download PDF');
        return;
    }

    previewWindow.onload = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const pageElement = previewWindow.document.querySelector('.page') as HTMLElement;
            if (!pageElement) {
                console.error('Page element not found');
                previewWindow.close();
                return;
            }

            const canvas = await html2canvas(pageElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height) * 2;
            const imgWidth = canvas.width * ratio / 2;
            const imgHeight = canvas.height * ratio / 2;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(filename);
            previewWindow.close();
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
            previewWindow.close();
        }
    };
}

================================================================================
*/
