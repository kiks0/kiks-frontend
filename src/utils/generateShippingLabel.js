import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

// Helper to generate a barcode image natively in the browser
function getBarcodeDataURL(text, displayValue = true, height = 40) {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, text, {
        format: "CODE128",
        displayValue: displayValue,
        fontSize: 12,
        margin: 2,
        height: height
    });
    return canvas.toDataURL("image/png");
}

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
            resolve(dataURL);
        };
        img.onerror = error => reject(error);
        img.src = imgUrl;
    });
};

export const generateShippingLabel = async (orderInput) => {
    try {
        const orders = Array.isArray(orderInput) ? orderInput : [orderInput];
        if (orders.length === 0) return;

        // 4x6 inches is ~100x150 mm for Thermal Printers
        const doc = new jsPDF({ format: [100, 150] });

        let base64Logo = null;
        try {
            // Attempt to load the logo once for all slips
            base64Logo = await getBase64ImageFromUrl('/logo.webp');
        } catch (e) {
            console.warn("Could not load logo image, using text fallback.");
        }

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            
            if (i > 0) doc.addPage();

            // Outer border
            doc.setLineWidth(0.3);
            doc.rect(2, 2, 96, 146);

            // Section 1: Top Header (Logo Only)
            if (base64Logo) {
                // Centered logo: (100 - 35) / 2 = 32.5
                doc.addImage(base64Logo, 'PNG', 32.5, 3, 35, 8);
            } else {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text("KIKS ULTRA LUXURY", 50, 8, { align: 'center' });
            }

            doc.line(2, 12, 98, 12);

            // Section 2: Scannable Main Order Barcode
            const orderIdStr = order?.id ? String(order.id).padStart(10, '0') : "0000000000";
            const awbNumber = `1533215${orderIdStr}`;
            const mainBarcode = getBarcodeDataURL(awbNumber, true, 40);

            // Center the main barcode layout
            doc.addImage(mainBarcode, 'PNG', 10, 14, 80, 20);

            doc.line(2, 39, 98, 39);

            // Section 3: Delivery Address & Order Identity
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.text("Address:", 4, 43);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.text(order?.customer_name || "Customer Name", 4, 48);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            const splitAddress = doc.splitTextToSize(order?.shipping_address || "Address Not Provided", 55);
            doc.text(splitAddress, 4, 52);

            doc.setFont("helvetica", "bold");
            if (order?.customer_phone) {
                doc.text(`Phone No: ${order.customer_phone}`, 4, 62);
            }

            // COD vs Prepaid & Date (Right Side)
            const totalNum = parseFloat(String(order?.total_amount || "0").replace(/[^0-9.]/g, '')) || 0;
            const pendingNum = parseFloat(String(order?.amount_pending || "0").replace(/[^0-9.]/g, '')) || 0;
            
            const isPartialCOD = order?.payment_method && order.payment_method.toLowerCase().includes('partial');
            const isPrepaid = !isPartialCOD; 
            
            // Amount collected on delivery (Use actual pending amount if available, otherwise 70%)
            const collectable = isPartialCOD ? (pendingNum > 0 ? pendingNum : Math.round(totalNum * 0.70)) : 0;
            const paymentText = isPartialCOD ? "PARTIAL COD" : "PREPAID";

            doc.setFontSize(10);
            doc.text(paymentText, 96, 44, { align: 'right' });
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.text(`Collectable: Rs. ${Math.round(collectable)}`, 96, 49, { align: 'right' });
            doc.setFont("helvetica", "normal");

            const orderDate = new Date(order?.created_at || Date.now());
            doc.text(`Date: ${orderDate.toLocaleDateString('en-IN')}`, 96, 52, { align: 'right' });
            doc.text(`Order ID: #${orderIdStr}`, 96, 56, { align: 'right' });

            const orderBarcode = getBarcodeDataURL(orderIdStr, false, 25);
            doc.addImage(orderBarcode, 'PNG', 70, 58, 26, 8);

            doc.line(2, 68, 98, 68);

            // Gifting Alert Box for Packers
            let alertOffset = 0;
            
            if (isPartialCOD) {
                doc.setFillColor(0, 0, 0);
                doc.rect(2, 68 + alertOffset, 96, 10, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.text(`PARTIAL COD: COLLECT EXACT RS. ${Math.round(collectable)} FROM CUSTOMER.`, 50, 74 + alertOffset, { align: 'center' });
                doc.setTextColor(0, 0, 0); // reset
                alertOffset += 10;
                doc.line(2, 68 + alertOffset, 98, 68 + alertOffset);
            }

            if (order?.is_gift) {
                doc.setFillColor(0, 0, 0);
                doc.rect(2, 68 + alertOffset, 96, 10, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.text("GIFT WRAP REQUESTED. NOTE INCLUDED.", 50, 74 + alertOffset, { align: 'center' });
                doc.setTextColor(0, 0, 0); // reset
                alertOffset += 10;
                doc.line(2, 68 + alertOffset, 98, 68 + alertOffset);
            }

            // Section 4: Items Table for the box
            const tableColumn = ["SKU Code", "Qty"];
            const tableRows = [];

            const items = order?.items || [];
            items.forEach((item) => {
                const qty = item.quantity ? parseInt(item.quantity) : 1;
                tableRows.push([
                    `${item.product_name || "Item"}\n(KIKS-${item.product_id || 'XXX'})`,
                    qty
                ]);
            });

            tableRows.push(["Total Items", items.reduce((acc, item) => acc + (item.quantity ? parseInt(item.quantity) : 1), 0)]);

            autoTable(doc, {
                startY: 68 + alertOffset + 1,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.2, lineColor: [0, 0, 0] },
                styles: { fontSize: 6, cellPadding: 1.5, textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] },
                columnStyles: {
                    1: { halign: 'center', minCellWidth: 15 }
                },
                margin: { left: 4, right: 4 }
            });

            let finalY = doc.lastAutoTable.finalY || 100;

            // Section 5: Shipped By (Return Address)
            doc.line(2, finalY + 2, 98, finalY + 2);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6);
            doc.text("Shipped By / Return Address:", 4, finalY + 5);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(5);
            doc.text("Kiks Ultra Luxury Warehouse", 4, finalY + 8);
            doc.text("69/A, ST: 5 , Sarita Society", 4, finalY + 11);
            doc.text("Bhavnagar, Gujarat, 364003 | 8401020339", 4, finalY + 14);

            // Section 6: Footer Details
            doc.line(2, finalY + 16, 98, finalY + 16);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(4);
            doc.text(`1. Visit official website for Terms. 2. Do not accept if tampered.`, 4, finalY + 19);
            doc.text(`Powered By KiksUltraLuxury. Delivery within 4 - 5 Business Days.`, 4, finalY + 22);
        }

        // Trigger Download
        const fileName = orders.length > 1 
            ? `Bulk_Thermal_Labels_${orders.length}_Orders.pdf` 
            : `Thermal_Label_KIKS_#${orders[0]?.id ? String(orders[0]?.id).padStart(10, '0') : "0000000000"}.pdf`;
            
        doc.save(fileName);
    } catch (error) {
        console.error("Error generating shipping label PDF:", error);
        alert("Failed to generate thermal shipping label PDF.");
    }
};
