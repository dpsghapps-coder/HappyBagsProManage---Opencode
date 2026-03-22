import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { FileText, Download, BarChart3, DollarSign, Package, Users, ShoppingCart, X, Eye } from 'lucide-react';

interface Props {
    auth: {
        user: {
            role: string;
        };
    };
}

interface ReportData {
    title?: string;
    date_from?: string;
    date_to?: string;
    generated_at?: string;
    total_orders?: number;
    total_revenue?: string;
    total_paid?: string;
    outstanding?: string;
    avg_order_value?: string;
    total_outstanding?: string;
    total_payments?: number;
    total_amount?: string;
    total_deliveries?: number;
    total_clients?: number;
    products?: any[];
    clients?: any[];
    reps?: any[];
    orders?: any[];
    payments?: any[];
    statuses?: any[];
    deliveries?: any[];
}

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportData: ReportData | null;
    reportName: string;
    dateFrom: string;
    dateTo: string;
    onDownload: (format: 'pdf' | 'excel') => void;
    downloading: boolean;
}

function PreviewModal({ isOpen, onClose, reportData, reportName, dateFrom, dateTo, onDownload, downloading }: PreviewModalProps) {
    if (!isOpen) return null;

    const getTableData = () => {
        if (!reportData) return { headers: [], rows: [] };

        switch (reportName) {
            case 'sales-summary':
                return {
                    headers: ['Metric', 'Value'],
                    rows: [
                        ['Total Orders', reportData.total_orders?.toString() || '0'],
                        ['Total Revenue', `GHC ${reportData.total_revenue || '0.00'}`],
                        ['Total Paid', `GHC ${reportData.total_paid || '0.00'}`],
                        ['Outstanding', `GHC ${reportData.outstanding || '0.00'}`],
                        ['Average Order Value', `GHC ${reportData.avg_order_value || '0.00'}`],
                    ],
                };
            case 'sales-by-product':
                return {
                    headers: ['Product Name', 'Quantity Sold', 'Total Revenue'],
                    rows: (reportData.products || []).map((p: any) => [
                        p.product_name,
                        p.quantity_sold.toString(),
                        `GHC ${Number(p.total_revenue).toFixed(2)}`,
                    ]),
                };
            case 'sales-by-client':
                return {
                    headers: ['Client Name', 'Order Count', 'Total Revenue'],
                    rows: (reportData.clients || []).map((c: any) => [
                        c.client_name,
                        c.order_count.toString(),
                        `GHC ${Number(c.total_revenue).toFixed(2)}`,
                    ]),
                };
            case 'sales-by-rep':
                return {
                    headers: ['Sales Rep', 'Order Count', 'Total Revenue'],
                    rows: (reportData.reps || []).map((r: any) => [
                        r.rep_name,
                        r.order_count.toString(),
                        `GHC ${Number(r.total_revenue).toFixed(2)}`,
                    ]),
                };
            case 'revenue':
                return {
                    headers: ['Order ID', 'Client', 'Amount', 'Type', 'Date'],
                    rows: (reportData.payments || []).map((p: any) => [
                        p.order_id,
                        p.client_name,
                        `GHC ${p.amount}`,
                        p.payment_type,
                        p.date,
                    ]),
                };
            case 'outstanding-payments':
                return {
                    headers: ['Order ID', 'Client', 'Total', 'Paid', 'Outstanding', 'Delivery Date'],
                    rows: (reportData.orders || []).map((o: any) => [
                        o.order_id,
                        o.client_name,
                        `GHC ${o.total}`,
                        `GHC ${o.paid}`,
                        `GHC ${o.outstanding}`,
                        o.delivery_date,
                    ]),
                };
            case 'payment-summary':
                return {
                    headers: ['Order ID', 'Client', 'Amount', 'Type', 'Recorded By', 'Date'],
                    rows: (reportData.payments || []).map((p: any) => [
                        p.order_id,
                        p.client_name,
                        `GHC ${p.amount}`,
                        p.payment_type,
                        p.recorded_by,
                        p.date,
                    ]),
                };
            case 'order-summary':
                return {
                    headers: ['Order ID', 'Client', 'Status', 'Subtotal', 'VAT', 'Total', 'Delivery Date', 'Created'],
                    rows: (reportData.orders || []).map((o: any) => [
                        o.order_id,
                        o.client_name,
                        o.status,
                        `GHC ${o.subtotal}`,
                        `GHC ${o.vat}`,
                        `GHC ${o.total}`,
                        o.delivery_date,
                        o.created_at,
                    ]),
                };
            case 'orders-by-status':
                return {
                    headers: ['Status', 'Order Count', 'Total Value'],
                    rows: (reportData.statuses || []).map((s: any) => [
                        s.status,
                        s.count.toString(),
                        `GHC ${Number(s.total).toFixed(2)}`,
                    ]),
                };
            case 'delivery-schedule':
                return {
                    headers: ['Order ID', 'Client', 'Address', 'Contact', 'Delivery Date', 'Status', 'Total'],
                    rows: (reportData.deliveries || []).map((d: any) => [
                        d.order_id,
                        d.client_name,
                        d.delivery_address,
                        d.contact,
                        d.delivery_date,
                        d.status,
                        `GHC ${d.total}`,
                    ]),
                };
            case 'client-directory':
                return {
                    headers: ['Client Name', 'Email', 'Mobile 1', 'Mobile 2', 'Address', 'Total Orders'],
                    rows: (reportData.clients || []).map((c: any) => [
                        c.client_name,
                        c.email,
                        c.mobile_no1,
                        c.mobile_no2,
                        c.delivery_address,
                        c.total_orders.toString(),
                    ]),
                };
            case 'top-selling-products':
                return {
                    headers: ['Rank', 'Product Name', 'Quantity Sold', 'Total Revenue'],
                    rows: (reportData.products || []).map((p: any, i: number) => [
                        (i + 1).toString(),
                        p.product_name,
                        p.quantity_sold.toString(),
                        `GHC ${Number(p.total_revenue).toFixed(2)}`,
                    ]),
                };
            case 'product-sales-summary':
                return {
                    headers: ['Product Name', 'Quantity Sold', 'Total Revenue', 'Order Count'],
                    rows: (reportData.products || []).map((p: any) => [
                        p.product_name,
                        p.quantity_sold.toString(),
                        `GHC ${Number(p.total_revenue).toFixed(2)}`,
                        p.order_count.toString(),
                    ]),
                };
            default:
                return { headers: [], rows: [] };
        }
    };

    const { headers, rows } = getTableData();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

                <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{reportData?.title || 'Report Preview'}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {reportData?.date_from} - {reportData?.date_to}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-auto flex-1">
                        {headers.length > 0 && rows.length > 0 ? (
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm">
                                    <thead className="bg-purple-100">
                                        <tr>
                                            {headers.map((header, i) => (
                                                <th key={i} className="px-4 py-3 text-left font-semibold text-purple-800">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, i) => (
                                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                {row.map((cell, j) => (
                                                    <td key={j} className="px-4 py-2 border-t">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No data available for the selected date range.</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            variant="outline"
                            className="border-purple-600 text-purple-600 hover:bg-purple-50"
                            onClick={() => onDownload('pdf')}
                            disabled={downloading}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => onDownload('excel')}
                            disabled={downloading}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Excel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const reportCategories = [
    {
        title: 'Sales Reports',
        icon: BarChart3,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        reports: [
            { id: 'sales-summary', name: 'Sales Summary', description: 'Total sales, orders count, average order value' },
            { id: 'sales-by-product', name: 'Sales by Product', description: 'Revenue & quantity sold per product' },
            { id: 'sales-by-client', name: 'Sales by Client', description: 'Revenue breakdown by client' },
            { id: 'sales-by-rep', name: 'Sales by Sales Rep', description: 'Orders & revenue per sales representative' },
        ],
    },
    {
        title: 'Financial Reports',
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        reports: [
            { id: 'revenue', name: 'Revenue Report', description: 'Total revenue, paid vs outstanding' },
            { id: 'outstanding-payments', name: 'Outstanding Payments', description: 'Pending payments by order' },
            { id: 'payment-summary', name: 'Payment Summary', description: 'All payments with details' },
        ],
    },
    {
        title: 'Order Reports',
        icon: ShoppingCart,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        reports: [
            { id: 'order-summary', name: 'Order Summary', description: 'All orders with items & totals' },
            { id: 'orders-by-status', name: 'Orders by Status', description: 'Orders grouped by workflow status' },
            { id: 'delivery-schedule', name: 'Delivery Schedule', description: 'Orders grouped by delivery date' },
        ],
    },
    {
        title: 'Client Reports',
        icon: Users,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        reports: [
            { id: 'client-directory', name: 'Client Directory', description: 'All clients with contact info' },
            { id: 'client-order-history', name: 'Client Order History', description: 'Orders per client' },
        ],
    },
    {
        title: 'Product Reports',
        icon: Package,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        reports: [
            { id: 'product-sales-summary', name: 'Product Sales Summary', description: 'Volume & revenue per product' },
            { id: 'top-selling-products', name: 'Top Selling Products', description: 'Products ranked by quantity sold' },
        ],
    },
];

export default function Reports({ auth }: Props) {
    const [dateFrom, setDateFrom] = useState(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return startOfWeek.toISOString().split('T')[0];
    });
    const [dateTo, setDateTo] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<ReportData | null>(null);
    const [previewReportId, setPreviewReportId] = useState<string>('');
    const [previewReportName, setPreviewReportName] = useState<string>('');
    const [downloading, setDownloading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);

    const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') || '' : '';
    };

    const handlePreview = async (reportId: string, reportName: string) => {
        setPreviewLoading(true);
        setPreviewReportId(reportId);
        setPreviewReportName(reportName);

        try {
            const response = await fetch('/reports/preview', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    report_type: reportId,
                    date_from: dateFrom,
                    date_to: dateTo,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setPreviewData(data.data);
                setPreviewOpen(true);
            } else {
                Swal.fire('Error', data.error || 'Failed to load report preview.', 'error');
            }
        } catch (error) {
            console.error('Error loading preview:', error);
            Swal.fire('Error', 'Failed to load report preview. Please try again.', 'error');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleDownload = async (format: 'pdf' | 'excel') => {
        setDownloading(true);

        try {
            const response = await fetch('/reports/generate', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    report_type: previewReportId,
                    format: format,
                    date_from: dateFrom,
                    date_to: dateTo,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const blob = await response.blob();
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `${previewReportId}_${dateFrom}_${dateTo}.${format}`;

            if (contentDisposition) {
                const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (matches && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            Swal.fire('Success', 'Report downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error downloading report:', error);
            Swal.fire('Error', 'Failed to download report. Please try again.', 'error');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reports" />

            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">Reports</h1>
                    <p className="text-gray-600">Generate and download reports for your business</p>
                </div>

                {/* Date Filter */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-end gap-4">
                            <div>
                                <Label htmlFor="dateFrom">From Date</Label>
                                <Input
                                    id="dateFrom"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <div>
                                <Label htmlFor="dateTo">To Date</Label>
                                <Input
                                    id="dateTo"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const today = new Date();
                                    const startOfWeek = new Date(today);
                                    startOfWeek.setDate(today.getDate() - today.getDay());
                                    setDateFrom(startOfWeek.toISOString().split('T')[0]);
                                    setDateTo(today.toISOString().split('T')[0]);
                                }}
                            >
                                This Week
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const today = new Date();
                                    setDateFrom(today.toISOString().split('T')[0]);
                                    setDateTo(today.toISOString().split('T')[0]);
                                }}
                            >
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const today = new Date();
                                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                    setDateFrom(firstDay.toISOString().split('T')[0]);
                                    setDateTo(today.toISOString().split('T')[0]);
                                }}
                            >
                                This Month
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Categories */}
                <div className="grid gap-8">
                    {reportCategories.map((category) => (
                        <div key={category.title}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${category.bgColor}`}>
                                    <category.icon className={`w-5 h-5 ${category.color}`} />
                                </div>
                                <h2 className="text-xl font-semibold">{category.title}</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {category.reports.map((report) => (
                                    <Card key={report.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">{report.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="w-full bg-purple-600 hover:bg-purple-700"
                                                onClick={() => handlePreview(report.id, report.name)}
                                                disabled={previewLoading && previewReportId === report.id}
                                            >
                                                {previewLoading && previewReportId === report.id ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Eye className="w-4 h-4 mr-2" />
                                                )}
                                                Preview Report
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview Modal */}
            <PreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                reportData={previewData}
                reportName={previewReportId}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDownload={handleDownload}
                downloading={downloading}
            />
        </AuthenticatedLayout>
    );
}
