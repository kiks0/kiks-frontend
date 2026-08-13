import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Convert image from path to PNG base64 for jsPDF
const getBase64ImageFromUrl = async (imgUrl) => {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = () => {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/png");
            resolve({ dataURL, width: img.width, height: img.height });
        };
        img.onerror = error => reject(error);
        img.src = imgUrl;
    });
};

export const generateInvoice = async (orderInput) => {
    try {
        const orders = Array.isArray(orderInput) ? orderInput : [orderInput];
        if (orders.length === 0) return;

        const doc = new jsPDF();

        let base64Logo = null;
        let logoProps = null;
        try {
            const logoData = await getBase64ImageFromUrl('/logo-kiks.png');
            base64Logo = logoData.dataURL;
            logoProps = { w: logoData.width, h: logoData.height };
        } catch (e) {
            console.warn("Could not load logo image, using text fallback.");
        }

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            
            if (i > 0) doc.addPage();

            // Brand Header
            if (base64Logo && logoProps) {
                const targetHeight = 16;
                const targetWidth = (logoProps.w / logoProps.h) * targetHeight;
                const xPos = (210 - targetWidth) / 2; // A4 width is 210mm
                doc.addImage(base64Logo, 'PNG', xPos, 10, targetWidth, targetHeight);
            } else {
                doc.setFontSize(22);
                doc.setFont("times", "bold");
                doc.text("KIKS ULTRA LUXURY", 105, 20, { align: "center" });
            }

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Invoice / Bill of Supply", 105, 30, { align: "center" });

            doc.setLineWidth(0.2);
            doc.line(14, 32, 196, 32);

            // Company & GST Info
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("Sold By:", 14, 40);
            doc.setFont("helvetica", "normal");
            doc.text("Kiks Ultra Luxury Pvt. Ltd.", 14, 45);
            doc.text("69/A, ST: 5 , Sarita Society", 14, 50);
            doc.text("Bhavnagar, Gujarat, 364003", 14, 55);
            doc.text("Phone No: 8401020339", 14, 60);

            // Order info
            doc.setFont("helvetica", "bold");
            doc.text("Order ID:", 130, 40);
            doc.setFont("helvetica", "normal");
            // Depending on what format order.id is, safely toString it
            const orderIdStr = order?.id ? String(order.id).padStart(6, '0') : "N/A";
            doc.text(orderIdStr, 155, 40);

            doc.setFont("helvetica", "bold");
            doc.text("Invoice Date:", 130, 47);
            doc.setFont("helvetica", "normal");
            const orderDate = new Date(order?.created_at || Date.now());
            doc.text(orderDate.toLocaleDateString('en-IN'), 155, 47);

            doc.setFont("helvetica", "bold");
            doc.text("Payment Mode:", 130, 54);
            doc.setFont("helvetica", "normal");
            const pmText = order?.payment_method?.toUpperCase() || "PREPAID";
            const splitPm = doc.splitTextToSize(pmText, 45); // Wrap long text like UPI IDs
            doc.text(splitPm, 155, 54);

            // Address Section
            doc.setFont("helvetica", "bold");
            doc.text("Address:", 14, 72);
            doc.setFont("helvetica", "normal");
            doc.text(order?.customer_name || "Customer", 14, 78);
            const splitAddress = doc.splitTextToSize(order?.shipping_address || "Address Not Provided", 80);
            doc.text(splitAddress, 14, 83);

            // Helper to parse currency strings to raw numbers
            const parseCurrency = (str) => {
                if (!str) return 0;
                const num = String(str).replace(/[^0-9.]/g, '');
                return parseFloat(num) || 0;
            };

            // Table Structure
            const tableColumn = ["S.No", "Item Description", "HSN", "Qty", "Unit Price", "Total Amount"];
            const tableRows = [];

            let subtotalAgg = 0;

            const items = order?.items || [];

            items.forEach((item, index) => {
                const amountNumOrig = parseCurrency(item.price);
                const qty = item.quantity ? parseInt(item.quantity) : 1;
                
                const lineTotal = amountNumOrig * qty;
                subtotalAgg += lineTotal;

                tableRows.push([
                    index + 1,
                    item.product_name || "Luxury Item",
                    "3303", 
                    qty,
                    amountNumOrig.toFixed(2),
                    lineTotal.toFixed(2)
                ]);
            });

            // Verify grand total against order total_amount
            const grandTotalNum = parseCurrency(order?.total_amount);

            autoTable(doc, {
                startY: 100,
                head: [tableColumn],
                body: tableRows,
                foot: [
                    [{ content: 'Shipping & Insurance:', colSpan: 5, styles: { halign: 'right' } }, '0.00'],
                    [{ content: 'Grand Total:', colSpan: 5, styles: { halign: 'right', fillColor: [5, 5, 5], textColor: 255 } }, { content: grandTotalNum.toFixed(2), styles: { fillColor: [5, 5, 5], textColor: 255, fontStyle: 'bold' } }]
                ],
                theme: 'grid',
                headStyles: { fillColor: [5, 5, 5], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 4, textColor: [40, 40, 40] },
            });

            const finalY = doc.lastAutoTable.finalY + 15;

            // Auth Sign
            doc.setLineWidth(0.2);
            doc.line(140, finalY + 10, 190, finalY + 10);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text("Authorized Signatory", 145, finalY + 15);
            doc.text("Kiks Ultra Luxury", 148, finalY + 20);

            doc.setFontSize(8);
            doc.setTextColor(110);
            doc.text("This is a computer generated invoice and does not require a physical signature.", 14, finalY + 35);
        }

        // Trigger Download
        const fileName = orders.length > 1 
            ? `Bulk_GST_Invoices_${orders.length}_Orders.pdf` 
            : `GST_Invoice_KIKS_#${orders[0]?.id ? String(orders[0]?.id).padStart(6, '0') : "N/A"}.pdf`;
        doc.save(fileName);
    } catch (error) {
        console.error("Error generating invoice PDF:", error);
        alert("Failed to generate invoice PDF. Please try again or contact support.");
    }
};
