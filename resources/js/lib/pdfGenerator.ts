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
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;
    
    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - Happy Bags</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .brand {
                    font-size: 28px;
                    font-weight: bold;
                    color: #1e3a5f;
                }
                .title {
                    font-size: 24px;
                    color: #16a34a;
                    margin: 20px 0;
                }
                .info {
                    margin: 20px 0;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }
                .amount {
                    font-size: 32px;
                    color: #16a34a;
                    text-align: center;
                    margin: 40px 0;
                    font-weight: bold;
                }
                .status {
                    text-align: center;
                    color: #16a34a;
                    font-size: 18px;
                }
                .footer {
                    text-align: center;
                    margin-top: 60px;
                    color: #999;
                    font-size: 12px;
                }
                @media print {
                    body { padding: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="brand">HAPPY BAGS</div>
                <div class="title">RECEIPT</div>
            </div>
            
            <div class="info">
                <div class="info-row">
                    <span>Receipt No:</span>
                    <span>RCP-${order.order_id}</span>
                </div>
                <div class="info-row">
                    <span>Date:</span>
                    <span>${new Date().toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                    <span>Order Ref:</span>
                    <span>${order.order_id}</span>
                </div>
                <div class="info-row">
                    <span>Client:</span>
                    <span>${order.client?.client_name || 'N/A'}</span>
                </div>
            </div>
            
            <div class="amount">GHC ${amountPaid.toFixed(2)}</div>
            <div class="status">Payment Status: PAID</div>
            
            <div class="footer">
                Thank you for your payment!<br>
                Happy Bags - Paper Bag Manufacturers
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `);
    receiptWindow.document.close();
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
